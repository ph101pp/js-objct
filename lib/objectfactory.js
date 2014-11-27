/*! 
 * objectfactory - v2.x (https://github.com/greenish/js-objectfactory)
 * 
 * Copyright (c) 2013 Philipp Adrian (www.philippadrian.com)
 *
 * The MIT Licence (http://opensource.org/licenses/MIT)
 */
////////////////////////////////////////////////////////////////////////////////
(function(commonJSmodule, undefined){
"use strict";

////////////////////////////////////////////////////////////////////////////////
var Noop = function(){};
////////////////////////////////////////////////////////////////////////////////
// isArray fallback for ie<9
var strArray = Array.toString();
var isArray = Array.isArray || function (obj) {
	return (typeof obj == "object" 
		&& Object.prototype.toString.call(obj) === "[object Array]")
		|| ("constructor" in obj && String(obj.constructor) === strArray);
};
////////////////////////////////////////////////////////////////////////////////
var instantiate = function(fn, args){
	var f, isFunction = typeof fn === strFunction;
	Noop.prototype = isFunction ? fn.prototype : fn;
	f = new Noop();
	Noop.prototype = null;
	isFunction && fn.apply(f, args);
	return f;	
};
////////////////////////////////////////////////////////////////////////////////
var exception = function(type, value) {
	var exceptions = [
		"Unexpected '"+value+"'! Only 'functions' and 'objects' can be used with the objectfactory.",
		"Abstract method '"+value+"' needs to be defined."
	];
	throw("objectfactory: "+exceptions[type]);
};
////////////////////////////////////////////////////////////////////////////////
var property = function(target, source, k, data, path) {
	var newTarget, type = typeof source[k];
	if(data.options.deep && type === "object") {
		newTarget = isArray(source[k]) ? [] : {};
		target[k] = mixinObject(newTarget, source[k], data, undefined, path+k+".");
	}
	else if(type === strFunction) {
		target[k] = source[k];
	}
	else
		target[k] = source[k];
};
////////////////////////////////////////////////////////////////////////////////
var mixinObject = function(target, source, data, keys, path) {
	path = path || "";
	var k;

	if(isArray(source)) {
		for(k=0; k<source.length; k++) {
			property(target, source, k, data, path);
		}
	}		
	else if(typeof keys === "object") {
		for(k in keys) {
			property(target, source, keys[k], data, path);
		}
	}
	else {
		for(k in source) {
			property(target, source, k, data, path);
		}
	}
	return target;
};
////////////////////////////////////////////////////////////////////////////////
var mixinFunction = function(Class, fn, data){
	var proto = fn.prototype;
	var instance, keys;

	Class = mixinObject(Class, proto, data);

	if(true) {
		fn.apply(Class, data.args);
		return Class;
	}

	fn.prototype = Class;
	instance = instantiate(fn, data.args);
	fn.prototype = proto;

	keys = typeof Object.getOwnPropertyNames === strFunction ?
		Object.getOwnPropertyNames(instance):
		undefined;
	instance = mixinObject(Class, instance, data, keys);
	
	return instance;
};
////////////////////////////////////////////////////////////////////////////////
var build = function(Class, modules, data){
	var isFunction, module, i=0;

	// The very first module
	if(Class === undefined) {
		Class= typeof modules[0] === "object" && data.options.extend ?
			modules[0]:
			instantiate(modules[0]);
		i=1;
	}

	//mixin all other modules
	for(; i<modules.length; i++) {
		module = modules[i];

		Class = module.isFactory ?
			module.obj.call(Factory, Class, module, data):
			typeof module.obj === strFunction ?
				mixinFunction(Class, module.obj, data):
				mixinObject(Class, module.obj, data);
	}
	return Class;
};
////////////////////////////////////////////////////////////////////////////////
var Factory = function(){
	var Executable = function Executable(Class, module, data){

		// If we're in the building process
		if(this === Factory) {
			// Define instanceof function for every Executable that gets build.
			module.modules = thisData.modules;
			return build(Class, thisData.modules, data);
		} 
		//////////////////////////
		// Start building process
		//////////////////////////
		thisData.args = arguments;
		var instance = build(undefined, thisData.modules, thisData);
	
		return instance;
	};

	////////////////////////////////////////////////////////////////////////////
	var thisData = {
		args : [],
		modules : [],
		options : {
			extend : !(this instanceof Factory),
			deep : false
		}
	};
	var args = arguments;
	var i=0;

	//setup modules
	for(; i < args.length; i++) {
		type = typeof args[i];
		
		if((type !== "object" && type !== strFunction) || isArray(args[i]))
			exception(0, type==="object"?"array":type);

		modules.push({ 
			obj : args[i],
			isFactory : type === strFunction && ""+args[i] === strExecutable
		});

		if(type === strFunction) {
			mixinObject(Executable, args[i], data);
		}
	}	
	return Executable;
};
////////////////////////////////////////////////////////////////////////////////

var factory = new Factory();
var strExecutable = ""+factory;
var strFunction = "function";

// Connect to Environment 
commonJSmodule.exports = Factory;
if(typeof define === strFunction && define.amd) 
	define("objectfactory", function(){return Factory;});
else if(typeof window === "object")
	window.objectfactory = Factory;

////////////////////////////////////////////////////////////////////////////////
})(typeof module === "undefined"? {} : module);