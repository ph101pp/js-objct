/*! 
 * objectfactory - v1.0.0 (https://github.com/greenish/js-objectfactory)
 * 
 * Copyright (c) 2013 Philipp Adrian (www.philippadrian.com)
 *
 * The MIT Licence (http://opensource.org/licenses/MIT)
 */
////////////////////////////////////////////////////////////////////////////////
(function(undefined){
"use strict";

////////////////////////////////////////////////////////////////////////////////
var superTest = /xyz/.test(function(){xyz;}) ? /\bthis\._super\b/ : /.*/;
var abstractTest = /xyz/.test(function(){xyz;}) ? /\bFunction\b/ : /.*/;
var instance = function(){};
var defaultOptions = {
	deep : false,
	abstract : false,
	super : false
}
////////////////////////////////////////////////////////////////////////////////
var attachSuper = function(fn, _super) {
	if(typeof fn !== "function" || !superTest.test(fn)) {
		return fn;
	}

	return function() {
		var tmp = this._super;
		this._super = _super;
		var ret = fn.apply(this, arguments); 
		this._super = tmp;
		return ret;
	}
}
////////////////////////////////////////////////////////////////////////////////
var checkAbstractMethods = function(instance, abstractMethods){
	var test, path, fn;
	for(var i=0; i<abstractMethods.length; i++){
		try{
			test = instance;
			path = abstractMethods[i].split(".");
			for(var k =0; k<path.length-1; k++) test = test[path[k]];
			fn = test[path[path.length-1]];
			if(typeof fn !== "function" || fn === Function) throw("");		
		} 
		catch(e){
			throw("Abstract method '"+abstractMethods[i]+"()' needs to be defined.");
		}
	}
}
////////////////////////////////////////////////////////////////////////////////
var extend = function(target, source, module, abstractMethods, keys, abstractPath) {
	module = module || defaultOptions;

	if(typeof keys === "object") {
		for(var k in keys) {
			extendProperty(target, source, keys[k], module, abstractMethods, abstractPath);
		}
	}
	else {
		for(var k in source) {
			extendProperty(target, source, k, module, abstractMethods, abstractPath);
		}
	}
	return target;
}
////////////////////////////////////////////////////////////////////////////////
var extendProperty = function(target, source, k, module, abstractMethods, abstractPath) {
	var nextTarget;
	abstractPath = abstractPath || "";
	if(module.deep && typeof source[k] === "object") {
		nextTarget = typeof target[k] === "object" ? 
			target[k] : {};
		target[k] = extend(nextTarget, source[k], module, abstractMethods, undefined, abstractPath+k+".");
	}
	// test if abstract method
	else if(module.abstract && source[k] === Function) {
		abstractMethods.push(abstractPath+k);
		if(typeof target[k] !== "function") target[k] = source[k];
	}
	// test if _super has to be attached
	else if(module.super && source[k] !== target[k])
		target[k] = attachSuper(source[k], target[k]);
	else
		target[k] = source[k];
}
////////////////////////////////////////////////////////////////////////////////
var instantiate = function(fn, args){
	var f;
	if(typeof fn === "function") {
		if(Factory.debug && typeof Function.prototype.bind === "function") {
			// Slightly slower but keeps names intact for the inspector.
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
	else {
		instance.prototype = fn;
		f = new instance();
	}
	return f;	
}
////////////////////////////////////////////////////////////////////////////////
var instantiateFunction = function(Class, module, args, abstractMethods){
	var proto = module.obj.prototype;
	var _super = module.super && superTest.test(module.obj);
	var abstract = module.abstract && abstractTest.test(module.obj);
	var instance, keys;

	Class = extend(Class, proto, module, abstractMethods);

	if(!Factory.debug && !_super && !abstract && !module.deep) {
		module.obj.apply(Class, args);
		return Class;
	}

	module.obj.prototype = Class;
	module.obj.prototype.constructor = module.obj;
	instance = instantiate(module.obj, args);
	module.obj.prototype = proto;
	module.obj.prototype.constructor = module.obj;

	if(_super || abstract || module.deep) {
		if(Factory.debug) Class = instantiate(Class);
		keys = typeof Object.getOwnPropertyNames === "function" ?
			Object.getOwnPropertyNames(instance):
			undefined;
		instance = extend(Class, instance, module, abstractMethods, keys);
	}
	return instance;
}
////////////////////////////////////////////////////////////////////////////////
var build = function(Class, modules, args, abstractMethods){
	var isFunction, module;

	for(var i=0; i<modules.length; i++) {
		module = modules[i];
		isFunction = typeof module.obj === "function";
		if(isFunction && module.strObj === strExecutable) {
			Class=module.obj.call(Factory, Class, args, abstractMethods, module);
		}
		else {
			if(Factory.debug) Class = instantiate(Class);
			Class = isFunction ? 
				instantiateFunction(Class, module, args, abstractMethods):
				extend(Class, module.obj, module, abstractMethods);
		}
	}
	return Class;
}
////////////////////////////////////////////////////////////////////////////////
var Factory = function(){
	var options = extend({}, Factory.options);
	var modules = [];

	////////////////////////////////////////////////////////////////////////////
	var Executable = function Executable(Class, args, abstractMethods, module){

		// If we're in the building process
		if(this === Factory) {
			// Define instanceof function for every Executable that gets build.
			module.instanceof = _instanceof;
			return build(Class, modules, args, abstractMethods);
		} 

		// Start building process
		abstractMethods = [];
		var newClass = {instanceof : _instanceof};
		var instance = build(newClass, modules, arguments, abstractMethods);
		var construct, returnType, obj, name;

		// Check if all abstract Methods are implemented
		checkAbstractMethods(instance, abstractMethods);

		// Call construct if available
		if(instance.construct) 
			construct = instance.construct.apply(instance, arguments);

		returnType = typeof construct;

		// return instance or if construct() returned function or object, return that. (standard instantiation behavior in JS)
		return returnType === "object" || returnType === "function" ?
			construct : instance;
	}
	////////////////////////////////////////////////////////////////////////////
	var _instanceof = function(fn){
		if(typeof fn === "function" && this instanceof fn) return true;
		if(Executable === fn) return true;

		for(var i=0; i<modules.length; i++) {
			if(modules[i].strObj === strExecutable && modules[i].instanceof(fn)) 
				return true;
			else if(modules[i].obj === fn) 
				return true;
		}
		return false;
	}
	////////////////////////////////////////////////////////////////////////////
	var type, isArray, module;


	for(var i=0; i < arguments.length; i++) {
		type = typeof arguments[i];
		
		if(type === "object" || type === "function") {
			isArray = Object.prototype.toString.call(arguments[i]);
			if(type === "function" || isArray !== "[object Array]") {

				modules.push(extend(extend({}, options), { 
					obj : arguments[i],
					strObj : type === "function" ? ""+arguments[i] : "",
					instanceof : instance
				}));

				if(type === "function") {
					extend(Executable, arguments[i], {
						deep:options.deep,
						super:options.super,
						abstract : false
					});
				}

			}
			else if(i === 0) {
				options = extend({}, defaultOptions);

				for(var k=0; k < arguments[i].length; k++) {
					if(typeof arguments[i][k] === "string") {
						if(typeof options[arguments[i][k]] === "boolean") {
							options[arguments[i][k]] = true;
						}
					}
					else throw("Unexpected 'array'! Arrays are only allowed as first parameter to set options and must only contain strings. ['deep', 'super', 'abstract']");
				}
			}
			else throw("Unexpected 'array'! Arrays are only allowed as first parameter to set options and must only contain strings. ['deep', 'super', 'abstract']");
		} 
		else throw("Unexpected '"+typeof arguments[i]+"'! Only 'functions' and 'objects' can be used with the objectfactory.");
	}	

	return Executable;
}
////////////////////////////////////////////////////////////////////////////////

Factory.options = extend({}, defaultOptions);
Factory.debug = true;

var strExecutable = ""+Factory();

if(typeof module === "object") module.exports = Factory;
else window.objectfactory = Factory;

////////////////////////////////////////////////////////////////////////////////
})();