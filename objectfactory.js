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
var defaultReserved = "__instanceof";
var instance = function(){};
var defaultOptions = {
	deep : false,
	abstract : false,
	super : false
}

var attachSuper = function(fn, _super) {
	if(typeof fn !== "function" || typeof _super !== "function" || !superTest.test(fn)) {
		return fn;
	}
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
				else if(module.super && proto[key] !== Class[key])
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
						else if(module.super && Class[keys[k]] !== instance[keys[k]]) { 
							instance[keys[k]] = attachSuper(instance[keys[k]], Class[keys[k]]);
						}
					}
				}
				Class = instance;
			}
		}
	}
	return Class;
}

var Factory = function(){
	var type, isArray, module, k;
	var options = Object.create(Factory.options);
	var modules = [];
	var abstractMethods = [];
	var reserved = Factory.reserved;  //save global reserved property name in local Factory

	var Executable = function Executable(Class, args, absMethods){
		// Define instanceof function for every Executable that gets build.
		Executable[reserved] = function(fn){
			if(typeof fn === "function" && this instanceof fn) return true;
			if(Executable === fn) return true;

			for(var i=0; i<modules.length; i++) {
				if(modules[i].objStr === strExecutable && modules[i].obj[reserved](fn)) 
					return true;
				else if(modules[i].obj === fn) 
					return true;
			}
			return false;
		};

		// If we're in the building process
		if(this === Factory) return build(Class, modules, args, absMethods);
	
		var instance = build(undefined, modules, arguments, abstractMethods);
		var construct, returnType;

		// Check if all abstract Methods are implemented
		for(var i =0; i<abstractMethods.length; i++) 
			if(instance[abstractMethods[i]] === Function) 
				throw("Abstract method '"+abstractMethods[i]+"' needs to be defined.");

		// Add substitution for native instanceof operator
		if(typeof instance === "undefined") instance = {};
		if(typeof instance.instanceof === "undefined" || (typeof instance.instanceof === "function" && ""+instance.instanceof === str__instanceof)) 
			instance.instanceof = Executable[reserved];
		else 
			instance._instanceof = Executable[reserved];

		// Call construct if available
		if(instance.construct) 
			construct = instance.construct.apply(instance, arguments);

		returnType = typeof construct;

		// return instance or if construct() returned function or object, return that. (standard instantiation behavior in JS)
		return returnType === "object" || returnType === "function" ?
			construct : instance;
	}
	
	for(var i=0; i < arguments.length; i++) {
		type = typeof arguments[i];
		
		if(type === "object" || type === "function") {
			isArray = Object.prototype.toString.call(arguments[i]);
			if(type === "function" || isArray !== "[object Array]") {
				module = { 
					obj : arguments[i],
					strObj : type === "function" ? ""+arguments[i] : "",
					deep : options.deep,
					super : options.super,
					abstract : options.abstract
				}

				if(typeof module.obj === "function") {
					if(typeof module.obj[reserved] !== "undefined") {
						if(module.strObj === strExecutable) 
							module.obj[reserved] = Executable[reserved];
						else 
							throw("The property name '"+reserved+"' is reserved and can't be set as static property. Change this by defining objectfactory.reserved = 'newReservedName'");
					}
					for(k in module.obj) {
						if(options.super) {
							Executable[k] = attachSuper(module.obj[k], Executable[k]);
						}
						else {
							Executable[k] = module.obj[k];
						}
					}
				}
				modules.push(module);
			}
			else if(i == 0) {
				options = Object.create(defaultOptions);

				for(var k=0; k < arguments[i].length; k++) {
					if(typeof arguments[i][k] === "string") {
						if(typeof options[arguments[i][k]] === "boolean") {
							options[arguments[i][k]] = true;
						}
					}
				}
			}
			else 
				throw("Unexpected 'Array'! Arrays are only allowed as first parameter to set options. [deep, super, abstract]");
		} 
		else 
			throw("Unexpected '"+typeof arguments[i]+"'! Only 'functions' and 'objects' can be used with the objectfactory.");
	}	

	return Executable;
}
Factory.options = Object.create(defaultOptions);
Factory.reserved = defaultReserved;

var factory = Factory();
var strExecutable = ""+factory;
var str__instanceof = ""+factory.__instanceof;


if(typeof module === "object") module.exports = Factory;
else window.objectfactory = Factory;
})();