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
var numericSort = function(a,b){return a-b;};
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
var callHooks = function(names, args, data){
	for(var n = 0; n<names.length; n++) {
		var hooks = data.h[names[n]];
		var type, hook;
		if(typeof hooks === "undefined") return;
		hooks.keys.sort(numericSort);
		for(var i; i<hooks.keys; i++) {
			hook = hooks.hooks[hooks.keys[i]];
			for(var k =0; k<hook.length; k++) 
				hook[k].apply(data.i, args);
		}
	}
};
//////////////////////////////////////////////////////////////////////////////
var bindHook = function(hooks, name, fn, zIndex){
	zIndex=typeof zIndex === "number"||50;
	hooks[name] = hooks[name] || {
		keys:[], 
		hooks:{}
	};
	if(hooks[name].keys.indexOf(zIndex)<0) {
		hooks[name].keys.push(zIndex);
		hooks[name].hooks[zIndex] = [];
	}
	hooks[name].hooks[zIndex].push(fn);
};
//////////////////////////////////////////////////////////////////////////////
var unbindHook = function(hooks, name, fn){
	var index;
	for(var i; i<hooks[name].keys; i++) {
		index = hooks[name].hooks[hooks.keys[i]].indexOf(fn);
		index >= 0 && hooks[name].hooks[hooks.keys[i]].splice(index,1);
	}
};
////////////////////////////////////////////////////////////////////////////////
var decorated = function(target, source, k, data) {
	var hookData = {
		args:data.a, 
		modules:data.m, 
		target:target,
		key:k,
		old:target[k]
	};
	
	target[k] = typeof source[k] === strFunction && source[k].hash === hash?
		source[k].call(data.i, {
			args:data.a, 
			modules:data.m, 
			target:target,
			key:k,
			bind:function(name, fn, zIndex){ 
				bindHook(data.h, name, fn, zIndex);
			},
			unbind:function(name, fn){ 
				unbindHook(data.h, name, fn);
			}
		}):
		source[k];

	callHooks(["onChange","onChange."+k], [hookData], data);
};
////////////////////////////////////////////////////////////////////////////////
var mixinObject = function(target, source, data, keys) {
	var k;
	if(data.d && typeof keys === strObject) 
		for(k=0; k<keys.length; k++) {
			data.d ?
				decorated(target, source, keys[k], data):
				target[keys[k]]=source[keys[k]];
		}
	else 
		for(k in source) {
			data.d ?
				decorated(target, source, k, data):
				target[k]=source[k];
		}
};
////////////////////////////////////////////////////////////////////////////////
var mixinFunction = function(target, fn, data){
	var proto = fn.prototype;
	var instance, keys;

	mixinObject(target, proto, data);

	if(!data.d) {
		fn.apply(target, data.a);
		return target;
	}

	fn.prototype = target;
	instance = instantiate(fn, data.a);
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
			instantiate(modules[0].obj, data.a):
			modules[0].obj;

	data.i = data.i || instance;

	// call first modules decorators
	if(data.d)
		for(var key in instance)
			if(typeof instance[key] === strFunction && instance[key].hash === hash) 
				decorated(instance, instance, key, data);

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
	Array.prototype.splice.call(arguments, i, 0, NewObj);

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

		// Call onConstruct Hooks
		thisData.d && callHooks("onConstruct", [{
				args:thisData.a, 
				modules:thisData.m
			}], thisData);

		return instance;
	};
	////////////////////////////////////////////////////////////////////////
	var thisData = {
		a : [], // args
		m : [], // modules
		i : false, // instance
		d : factory.decorated, // decorated
		h : {} // hooks
	};
	var type, args = arguments;
	var instant = this instanceof factory || this instanceof factory.extend;

	// decorated?
	if(typeof args[0] === "boolean")
		thisData.d = Array.prototype.shift.call(args);

	//setup modules
	for(var i=0; i < args.length; i++) {
		type = typeof args[i];
		if(!checkType(args[i]))
			throw("objectfactory: Unexpected '"+(type===strObject?"array":type)+"'! Only 'functions' and 'objects' can be used with the objectfactory.");

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
factory.decorator = function(fn){
	return function(){
		var args = Array.prototype.slice.call(arguments);
		var f = function(decoratorData){
			return fn.apply(this, [decoratorData].concat(args));
		};
		f.hash=hash;
		return f;
	};
};
////////////////////////////////////////////////////////////////////////////////
factory.hash = hash;
factory.decorated = false;
var strExecutable = ""+factory.extend();

// Connect to Environment 
commonJSmodule.exports = factory;
if(typeof define === strFunction && define.amd) 
	define(function(){return factory;});
else if(typeof window === strObject)
	window.objectfactory = factory;

////////////////////////////////////////////////////////////////////////////////
})(typeof module === "undefined"? {} : module);