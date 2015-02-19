/*! 
 * objct - v0.x (https://github.com/greenish/js-objct)
 * 
 * Copyright (c) 2015 Philipp Adrian (www.philippadrian.com)
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
	if(isFunction) {
		r = fn.apply(f, args);
		if(checkType(r)) return r;
	}
	return f;	
};
////////////////////////////////////////////////////////////////////////////////
var mixinObject = function(target, source) {
	for(var k in source) {
		target[k]=source[k];
	}
};
////////////////////////////////////////////////////////////////////////////////
var build = function(modules, data){
	var isFunction, obj, value, i=1;

	//First Module
	var instance = typeof modules[0].obj === strFunction ?
			instantiate(modules[0].obj, data.a):
			modules[0].obj;

	data.i = data.i || instance;

	//mixin all other modules
	for(; i<modules.length; i++) {
		obj = modules[i].isFactory ?
			modules[i].obj.call(factory, modules[i], data):
			modules[i].obj;

		if(typeof obj === strFunction) {
			mixinObject(instance, obj.prototype);
			obj.apply(instance, data.a);
		}
		else {
			mixinObject(instance, obj);
		}
	}
	return instance;
};
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
var factory = function(){
	Array.prototype.splice.call(arguments, 0, 0, NewObj);
	return factory.extend.apply(this, arguments);
};
//////////////////////////////////////////////////////////////////////////////
factory.extend = function(){
	////////////////////////////////////////////////////////////////////////
	var Executable = function Executable(module, data){
		// If we're in the building process
		if(this && this.hash === hash) {
			// pass up modules
			module.m = thisData.m;
			return build(thisData.m, data);
		}
		//////////////////////////
		// Start building process
		//////////////////////////

		thisData.a = arguments;
		var instance = build(thisData.m, thisData);

		return instance;
	};
	////////////////////////////////////////////////////////////////////////
	var thisData = {
		a : [], // args
		m : [], // modules
		i : false, // instance
	};
	var type, args = arguments;
	var instant = this instanceof factory || this instanceof factory.extend;

	//setup modules
	for(var i=0; i < args.length; i++) {
		type = typeof args[i];
		if(!checkType(args[i]))
			throw("objct: Unexpected '"+(type===strObject?"array":type)+"'! Only 'functions' and 'objects' can be used with the objct.");

		thisData.m.push({ 
			obj : args[i],
			isFactory : type === strFunction && ""+args[i] === strExecutable
		});

		if(!instant && type === strFunction)
			mixinObject(Executable, args[i], thisData);
	}	
	return instant ? new Executable() : Executable;
};
////////////////////////////////////////////////////////////////////////////////
factory.hash = hash;
var strExecutable = ""+factory.extend();

// Connect to Environment 
commonJSmodule.exports = factory;
if(typeof define === strFunction && define.amd) 
	define(function(){return factory;});
else if(typeof window === strObject)
	window.objct = factory;

////////////////////////////////////////////////////////////////////////////////
})(typeof module === "undefined"? {} : module);