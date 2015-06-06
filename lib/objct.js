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
var objctHash = "jmuMMRs6AUUG29";
var hash = objctHash+"3HXcs8Z0ofQlkG0hqiNAJlZq2hHYakBQmyfnRuCsh2yf+c6m";
var testExecutable = new RegExp("\\b"+objctHash+"\\b");
var strFunction = "function";
var strObject = "object";
var strArray = Array.toString();
var objectKeys = Object.keys || Objct;
////////////////////////////////////////////////////////////////////////////////
var checkType = function(value){
	var	type = typeof value;
	return type === strFunction || (type === strObject && !factory.isArray(value));
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
	var k =-1;
	var keys = objectKeys(source);
	if(typeof keys === strObject) {
		var length = keys.length;

		while(++k < length) {
			target[keys[k]]=source[keys[k]];
		}
	}
	else {
		for(k in source) {
			target[k]=source[k];
		}
	}
};
////////////////////////////////////////////////////////////////////////////////
var build = function(modules, data){
	var isFunction, obj, value, i=0, length = modules.length;

	//First Module
	var instance = typeof modules[0].obj === strFunction ?
			instantiate(modules[0].obj, data.a):
			modules[0].obj;

	data.i = data.i || instance;

	//mixin all other modules
	while(++i < length) {
		obj = modules[i].isFactory ?
			modules[i].obj.call({hash:hash}, modules[i], data):
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
	Array.prototype.unshift.call(arguments, NewObj);
	return factory.extend.apply(this, arguments);
};
//////////////////////////////////////////////////////////////////////////////
factory.extend = function(){
	////////////////////////////////////////////////////////////////////////
	var Executable = function Executable(module, data){
		"jmuMMRs6AUUG29";
		//////////////////////////
		// Continue building process
		//////////////////////////
		if(this && typeof this.hash === "string" && this.hash.search(objctHash) >= 0) {
			// pass up modules
			module.m = thisData.m;
			if(this.hash === hash) {
				return build(thisData.m, data);
			}
			else {
				thisData.a = data.a;
			}
		}
		//////////////////////////
		// Start building process
		//////////////////////////
		else {
			thisData.a = arguments;
		}

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
	var i=-1;
	//setup modules
	while(++i < args.length) {
		type = typeof args[i];
		if(!checkType(args[i])) {
			if(type !== strObject) {
				throw("objct: Unexpected '"+type+"'! Only 'functions' and 'objects' can be used with objct.");
			}
			else {
				Array.prototype.splice.apply(args, [i,1].concat(args[i]));
				i--;
				continue;
			}
		}

		thisData.m.push({ 
			obj : args[i],
			isFactory : type === strFunction && testExecutable.test(args[i])
		});

		if(!instant && type === strFunction)
			mixinObject(Executable, args[i], thisData);
	}	
	return instant ? new Executable() : Executable;
};
////////////////////////////////////////////////////////////////////////////////
factory.isObjct = function(obj){
  return testExecutable.test(obj);
};
////////////////////////////////////////////////////////////////////////////////
// isArray fallback for ie<9
factory.isArray = Array.isArray || function (obj) {
	return (typeof obj == strObject 
		&& Object.prototype.toString.call(obj) === "[object Array]")
		|| ("constructor" in obj && String(obj.constructor) === strArray);
};
////////////////////////////////////////////////////////////////////////////////

// Connect to Environment 
commonJSmodule.exports = factory;

////////////////////////////////////////////////////////////////////////////////
})(typeof module === "undefined"? {} : module);