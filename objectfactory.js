/*! 
 * objectfactory - v1.0.0 (https://github.com/greenish/js-objectfactory)
 * 
 * Copyright (c) 2013 Philipp Adrian (www.philippadrian.com)
 *
 * The MIT Licence (http://opensource.org/licenses/MIT)
 */
(function(undefined){
"use strict";

var superTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
var abstractTest = /xyz/.test(function(){xyz;}) ? /\bFunction\b/ : /.*/;
var instance = function(){};
var defaultOptions = {
	deep : false,
	abstract : false,
	super : false
}

var attachSuper = function(fn, _super) {
	var attached = function() {
		var tmp = this._super;
		this._super = _super;
		var ret = fn.apply(this, arguments); 
		this._super = tmp;
		return ret;
	}
	//prevent infinite recursion on _super() call in "last" super method.
	if(typeof _super === "function" && _super != attached) 
		_super=attachSuper(_super, undefined);
	return attached;
}

var instantiate = function(fn, args){
	var f;
	if(typeof fn === "function") {
		if(typeof Function.prototype.bind === "function") {
			// Slightly slower but keeps Class names intact for the inspector.
            Array.prototype.unshift.call(args, null);
            f = new (Function.prototype.bind.apply(fn, args));
		}
		else {
			instance.prototype = fn.prototype;
			instance.prototype.constructor = fn;
			f = new instance();
			fn.apply(f, args);
		}
	}
	else if(typeof fn === "object") {
		instance.prototype = fn;
		f = new instance();
	}
	return f;	
}

var build = function(Class, modules, args, abstractMethods){
	var isFunction, proto, instance, keys, module;

	for(var i=0; i<modules.length; i++) {
		module = modules[i];
		isFunction = typeof module.obj === "function";
		if(isFunction && modules[i].strObj === strExecutable) {
			Class=module.obj.call(Factory, Class, args, abstractMethods);
		}
		else {
			if(typeof Class === "undefined") {
				Class = isFunction ?
					instantiate(module.obj, args):
					Object.create(module.obj); // Copy object
				if(module.abstract)
					for(var key in Class)
						if(Class[key] === Function)
							abstractMethods.push(key); 
				continue;
			}
			if(!isFunction) Class = instantiate(Class);

			proto = isFunction ?
				module.obj.prototype:
				module.obj;

			for(var key in proto) {
			
				if(module.abstract && proto[key] === Function && typeof Class[keys[k]] !== "function") {
					abstractMethods.push(key);
					Class[key] = proto[key];
				}
				else if(module.super && proto[key] !== Class[key]  && typeof proto[key] === "function" && typeof Class[key] === "function" && superTest.test(proto[key]))
					Class[key] = attachSuper(proto[key], Class[key]);
				else
					Class[key] = proto[key];
			}
				
			
			if(isFunction) {
				module.obj.prototype = Class;
				module.obj.prototype.constructor = module.obj;
				instance = instantiate(module.obj, args);
				module.obj.prototype = proto;
				module.obj.prototype.constructor = module.obj;

				if((module.super && superTest.test(module.obj)) || (module.abstract && abstractTest.test(module.obj))) {
					keys = Object.getOwnPropertyNames(instance);
					for(var k=0; k<keys.length; k++){
						// test if abstract method
						if(module.abstract && instance[keys[k]] === Function && typeof Class[keys[k]] !== "function") {
							abstractMethods.push(keys[k]);
						}
						// test if _super has to be attached
						else if(module.super && Class[keys[k]] !== instance[keys[k]]  && typeof instance[keys[k]] === "function" && typeof Class[keys[k]] === "function" && superTest.test(instance[keys[k]])) 
							instance[keys[k]] = attachSuper(instance[keys[k]], Class[keys[k]]);
					}
				}
				Class = instance;
			}
		}
	}
	return Class;
}

var addModule = function(modules, module) {
	var key;

	if(typeof module.obj === "function") {
		for(key in module.obj) {
			if(key === "__instanceof") {
				Executable[key]= typeof Executable[key] === "function" ?
					attachSuper(module.obj[key], Executable[key]):
					module.obj[key];
			}
			else if(module.strObj !== strExecutable) {
				throw("The property name '__instanceof' is reserved and can't be set as static property. (Sorry)");
			}
		}
	}
	modules.push(module);
}

var createModules = function(modules, args) {
	var type, isArray;
	var options = Object.create(Factory.options);

	for(var i=0; i < args.length; i++) {
		type = typeof args[i];

		
		if(type === "object" || type === "function") {
			isArray = Object.prototype.toString.call(args[i]);
			if(type === "function" || isArray !== "[object Array]") {
				addModule( modules, { 
					obj : args[i],
					strObj : type === "function" ? ""+args[i] : "",
					deep : options.deep,
					super : options.super,
					abstract : options.abstract
				});
			}
			else if(i == 0) {
				options = Object.create(defaultOptions);

				for(var k=0; k < args[i].length; k++) {
					if(typeof args[i][k] === "string") {
						if(typeof options[args[i][k]] === "boolean") {
							options[args[i][k]] = true;
						}
					}
				}
			}
			else 
				throw("Unexpected 'Array'! Arrays are only allowed as first parameter to set options.");
		} 
		else 
			throw("Unexpected '"+typeof args[i]+"'! Only 'functions' and 'objects' can be used with the objectfactory.");
	}
}

var Factory = function(){
	var modules = [];
	var abstractMethods = [];

	createModules(modules, arguments);

	return function Executable(Class, args, absMethods){
		// Define __instanceof function for every Executable that gets build.
		Executable.__instanceof = function(fn){
			if((typeof fn === "function" && this instanceof fn) || Executable === fn) return true;
			for(var i=0; i<modules.length; i++) {
				if(typeof modules[i].obj._instanceof === "function" && modules[i].obj._instanceof(fn)) 
					return true;
				else if(modules[i].obj === fn) 
					return true;
			}
			return false;
		};

		// If we're in the building process
		if(this === Factory) return build(Class, modules, args, absMethods);
	
		var instance = build(undefined, modules, arguments, abstractMethods);
		var construct;

		// Check if all abstract Methods are implemented
		for(var i =0; i<abstractMethods.length; i++) 
			if(instance[abstractMethods[i]] === Function) 
				throw("Abstract method '"+abstractMethods[i]+"' needs to be defined.");

		// Add substitution for native instanceof operator
		if(typeof instance.instanceof === "undefined" || (typeof instance.instanceof === "function" && ""+instance.instanceof === str__instanceof)) 
			instance.instanceof = Executable.__instanceof;
		else 
			instance._instanceof = Executable.__instanceof;

		// Call consruct if available
		if(instance.construct) 
			construct = instance.construct.apply(instance, arguments);

		// return instance or if construct() returned function or object, return that. (standard instantiation behavior in JS)
		return typeof construct === "object" || typeof construct === "function" ?
			construct : instance;
	}
}
Factory.options = Object.create(defaultOptions);

var strExecutable = ""+Factory();
var str__instanceof = ""+Factory().__instanceof;


if(typeof module === "object") module.exports = Factory;
else window.objectfactory = Factory;
})();