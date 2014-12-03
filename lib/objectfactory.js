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
var Objct = function(){};
var NewObj = function(){return {};};
var hash = "jmuMMRs6AUUG29/3HXcs8Z0ofQlkG0hqiNAJlZq2hHYakB/QmyfnRuCsh2yf+c6m";
var strFunction = "function";
var strObject = "object";
////////////////////////////////////////////////////////////////////////////////
// isArray fallback for ie<9
var strArray = Array.toString();
var isArray = Array.isArray || function (obj) {
	return (typeof obj == strObject 
		&& Object.prototype.toString.call(obj) === "[object Array]")
		|| ("constructor" in obj && String(obj.constructor) === strArray);
};
////////////////////////////////////////////////////////////////////////////////
var checkType = function(value){
	var	type = typeof value;
	return type === strFunction || (type === strObject && !isArray(value));
};
////////////////////////////////////////////////////////////////////////////////
var instantiate = function(fn, args){
	var f, r, isFunction = typeof fn === strFunction;
	Objct.prototype = isFunction ? fn.prototype : fn;
	f = new Objct();
	Objct.prototype = null;
	if(isFunction) {
		r = fn.apply(f, args);
		if(checkType(r)) return r;
	}
	return f;	
};
//////////////////////////////////////////////////////////////////////////////
var callHooks = function(hooks, args, data){
	var type = typeof hooks;
	if(type === strFunction) 
		hooks.apply(data.instance, args);
	else if(type === strObject)
		for(var i =0; i<hooks.length; i++) callHooks(hooks[i], args, data);
};
////////////////////////////////////////////////////////////////////////////////
var decorated = function(target, source, k, data, path) {
	var value = target[k];
	
	target[k] = typeof source[k] === strFunction && source[k].hash === hash?
		source[k].call(undefined, target, k, path+k, data):
		source[k];

	callHooks(data.onChange[path+k], [data.instance, k, path+k, data.shared], data);
};
////////////////////////////////////////////////////////////////////////////////
var mixinObject = function(target, source, data, keys, path) {
	var k;
	path = path || "";

	if(typeof keys === strObject) 
		for(k in keys) {
			data.decorated ?
				decorated(target, source, keys[k], data, path):
				target[k]=source[k];
		}
	else 
		for(k in source) {
			data.decorated ?
				decorated(target, source, k, data, path):
				target[k]=source[k];
		}
};
////////////////////////////////////////////////////////////////////////////////
var mixinFunction = function(target, fn, data){
	var proto = fn.prototype;
	var instance, keys;

	mixinObject(target, proto, data);

	if(!data.decorated) {
		fn.apply(target, data.shared.args);
		return target;
	}

	fn.prototype = target;
	instance = instantiate(fn, data.shared.args);
	fn.prototype = proto;

	keys = typeof Object.getOwnPropertyNames === strFunction ?
		Object.getOwnPropertyNames(instance):
		undefined;
	
	mixinObject(target, instance, data, keys);
};
////////////////////////////////////////////////////////////////////////////////
var build = function(modules, data){
	var isFunction, obj, onChange, value, i=1;

	//First Module
	var instance = typeof modules[0].obj === strFunction ?
			instantiate(modules[0].obj, data.shared.args):
			modules[0].obj;

	data.instance = data.instance || instance;

	// call first modules decorators
	if(data.decorated)
		for(var key in instance)
			if(typeof instance[key] === strFunction && instance[key].hash === hash) 
				decorated(instance, instance, key, data, "");

	//mixin all other modules
	for(; i<modules.length; i++) {
		obj = modules[i].isFactory ?
			modules[i].obj.call(factory, modules[i], data):
			modules[i].obj;

		typeof obj === strFunction ?
			mixinFunction(instance, obj, data):
			mixinObject(instance, obj, data);
	}
	return instance;
};
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
var factory = function(){
	var i = typeof arguments[0] === "boolean" ? 1 : 0;
	var args = Array.prototype.splice.call(arguments, i, 0, NewObj);
	return factory.extend.apply(this, args);
};
//////////////////////////////////////////////////////////////////////////////
factory.extend = function(){
	////////////////////////////////////////////////////////////////////////
	var Executable = function Executable(module, data){

		// If we're in the building process
		if(this && this.hash === hash) {
			// pass up modules
			module.modules = thisData.shared.modules;
			return build(thisData.shared.modules, data);
		}
		//////////////////////////
		// Start building process
		//////////////////////////

		thisData.shared.args = arguments;
		var instance = build(thisData.shared.modules, thisData);

		// Call onConstruct Hooks
		if(thisData.decorated) {
			thisData.onConstructKeys.sort();
			for(var i=0; i<thisData.onConstructKeys.length; i++) 
				callHooks(thisData.onConstruct[i], [data.shared], data);
		}
		return instance;
	};
	////////////////////////////////////////////////////////////////////////
	var thisData = {
		shared : {
			args : [],
			modules : []
		},
		instance : false,
		decorated : factory.decorated,
		onConstruct : {},
		onConstructKeys : [],
		onChange : {}
	};
	var type, args = arguments;
	var instant = this instanceof factory || this instanceof factory.extend;

	// decorated?
	if(typeof args[0] === "boolean")
		thisData.decorated = Array.prototype.shift.call(args);

	//setup modules
	for(var i=0; i < args.length; i++) {
		type = typeof args[i];
		if(!checkType(args[i]))
			throw("objectfactory: Unexpected '"+(type===strObject?"array":type)+"'! Only 'functions' and 'objects' can be used with the objectfactory.");

		thisData.shared.modules.push({ 
			obj : args[i],
			isFactory : type === strFunction && ""+args[i] === strExecutable
		});

		if(!instant && type === strFunction)
			mixinObject(Executable, args[i], thisData);
	}	

	return instant ? new Executable() : Executable;
};
////////////////////////////////////////////////////////////////////////////////
factory.decorator = function(fn){
	return function(){
		var args = Array.prototype.slice.call(arguments);
		var f = function(target, k, path, data){
			return fn.apply(data.instance, [target, k, path, data.shared].concat(args));
		};
		f.hash=hash;
		return f;
	};
};
////////////////////////////////////////////////////////////////////////////////
factory.hash = hash;
factory.decorated = false;
var strExecutable = ""+factory();

// Connect to Environment 
commonJSmodule.exports = factory;
if(typeof define === strFunction && define.amd) 
	define(function(){return factory;});
else if(typeof window === strObject)
	window.objectfactory = factory;

////////////////////////////////////////////////////////////////////////////////
})(typeof module === "undefined"? {} : module);