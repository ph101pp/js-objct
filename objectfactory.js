/*! 
 * objectfactory - v1.0.0 (https://github.com/greenish/js-objectfactory)
 * 
 * Copyright (c) 2013 Philipp Adrian (www.philippadrian.com)
 *
 * The MIT Licence (http://opensource.org/licenses/MIT)
 */
(function(undefined){
"use strict";

var superTest = /xyz/.test(function(){xyz;}) ? /\bthis\._super\b/ : /.*/;
var abstractTest = /xyz/.test(function(){xyz;}) ? /\bFunction\b/ : /.*/;
var instance = function(){};
var defaultOptions = {
	deep : false,
	abstract : false,
	super : false
}
var defaultReserved = {
	_instanceof : "_instanceof",
	_super : "_super"
}

var attachSuper = function(fn, _super) {
	if(typeof fn !== "function" || !superTest.test(fn)) {
		return fn;
	}

	return function() {
		var tmp = this[Factory.reserved._super];
		this[Factory.reserved._super] = _super;
		var ret = fn.apply(this, arguments); 
		this[Factory.reserved._super] = tmp;
		return ret;
	}
}

var extend = function(target, source, module, abstractMethods) {
	var nextTarget;
	module = module || defaultOptions;

	for(var k in source) {
		if(module.deep && typeof source[k] === "object") {
			nextTarget = typeof target[k] === "object" ? 
				target[k] : {};
			target[k] = extend(nextTarget, source[k], module, abstractMethods);
		}
		// test if abstract method
		else if(module.abstract && source[k] === Function) {
			abstractMethods.push([target, k]);
			if(typeof target[k] !== "function") target[k] = source[k];
		}
		// test if _super has to be attached
		else if(module.super && source[k] !== target[k])
			target[k] = attachSuper(source[k], target[k]);
		else
			target[k] = source[k];
	}
	return target;
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
	else throw("Unexpected '"+(typeof fn)+"'! Can't Instatiate '"+(typeof fn)+"'");
	return f;	
}

// var instantiateObject = function(Class, module, abstractMethods){
// 	Class = instantiate(Class);
// 	extend(Class, module.obj, module, abstractMethods);
// 	return Class;
// }


var instantiateFunction = function(Class, module, args, abstractMethods){
	var proto = module.obj.prototype;
	var _super = module.super && superTest.test(module.obj);
	var abstract = module.abstract && abstractTest.test(module.obj);
	var instance, keys;

	extend(Class, proto, module, abstractMethods);

	module.obj.prototype = Class;
	module.obj.prototype.constructor = module.obj;
	instance = instantiate(module.obj, args);
	module.obj.prototype = proto;
	module.obj.prototype.constructor = module.obj;

	if(_super || abstract) {
		keys = Object.getOwnPropertyNames(instance);
		for(var k=0; k<keys.length; k++){
			// test if abstract method
			if(abstract && instance[keys[k]] === Function) {
				abstractMethods.push(keys[k]);
			}
			// test if _super has to be attached
			else if(_super && Class[keys[k]] !== instance[keys[k]]) { 
				instance[keys[k]] = attachSuper(instance[keys[k]], Class[keys[k]]);
			}
		}
	}
	return instance;
}

var build = function(Class, modules, args, abstractMethods){
	var isFunction, module;

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
					extend({}, module.obj, module, abstractMethods);
				continue;
			}
			Class = instantiate(Class);
			Class = isFunction ? 
				instantiateFunction(Class, module, args, abstractMethods):
				extend(Class, module.obj, module, abstractMethods);
		}
	}
	return Class;
}

var Factory = function(){
	var type, isArray, module, k;
	var options = extend({},Factory.options);
	var modules = [];
	var abstractMethods = [];
	var _instanceof = Factory.reserved._instanceof;

	var Executable = function Executable(Class, args, absMethods){
		// Define instanceof function for every Executable that gets build.
		Executable[_instanceof] = function(fn){
			if(typeof fn === "function" && this instanceof fn) return true;
			if(Executable === fn) return true;

			for(var i=0; i<modules.length; i++) {
				if(modules[i].strObj === strExecutable && modules[i].obj[_instanceof](fn)) 
					return true;
				else if(modules[i].obj === fn) 
					return true;
			}
			return false;
		};

		// If we're in the building process
		if(this === Factory) return build(Class, modules, args, absMethods);
	
		var instance = build(undefined, modules, arguments, abstractMethods);
		var construct, returnType, obj, name;

		// Check if all abstract Methods are implemented
		for(var i =0; i<abstractMethods.length; i++) {
			if(typeof abstractMethods[i] === "object") {
				obj = abstractMethods[i][0];
				name = abstractMethods[i][1];
			}
			else {
				obj = instance;
				name = abstractMethods[i];
			}
			if(typeof obj[name] !== "function") 
				throw("Abstract method '"+name+"' needs to be defined.");
		}

		// Add substitution for native instanceof operator
		if(typeof instance === "undefined") instance = {};
		if(typeof instance.instanceof === "undefined" || (typeof instance.instanceof === "function" && ""+instance.instanceof === strInstanceof)) 
			instance.instanceof = Executable[_instanceof];
		else 
			instance._instanceof = Executable[_instanceof];

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
					if(typeof module.obj[_instanceof] !== "undefined") {
						if(module.strObj === strExecutable) 
							module.obj[_instanceof] = Executable[_instanceof];
						else 
							throw("The property name '"+_instanceof+"' is reserved and can't be set as 'static' property. You may change this reserved name by defining objectfactory.reserved._instanceof = 'newReservedName' if you have to.");
					}
					extend(Executable, module.obj, {
						deep:Factory.options.deep,
						super:Factory.options.super,
						abstract : false
					});
				}
				modules.push(module);
			}
			else if(i == 0) {
				options = extend({}, defaultOptions);

				for(var k=0; k < arguments[i].length; k++) {
					if(typeof arguments[i][k] === "string") {
						if(typeof options[arguments[i][k]] === "boolean") {
							options[arguments[i][k]] = true;
						}
					}
					else 
						throw("Unexpected 'array'! Arrays are only allowed as first parameter to set options and must only contain strings. ['deep', 'super', 'abstract']");
				}
			}
			else 
				throw("Unexpected 'array'! Arrays are only allowed as first parameter to set options and must only contain strings. ['deep', 'super', 'abstract']");
		} 
		else 
			throw("Unexpected '"+typeof arguments[i]+"'! Only 'functions' and 'objects' can be used with the objectfactory.");
	}	

	return Executable;
}
Factory.options = extend({}, defaultOptions);
Factory.reserved = defaultReserved;

var factory = Factory();
var strExecutable = ""+factory;
var strInstanceof = ""+factory[Factory.reserved._instanceof];


if(typeof module === "object") module.exports = Factory;
else window.objectfactory = Factory;

})();