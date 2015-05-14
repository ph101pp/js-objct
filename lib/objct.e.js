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
var numericSort = function(a,b){return a-b;};
var objctHash = "jmuMMRs6AUUG29";
var hash = objctHash+"3HXcs8Z0ofQlkG0hqiNAJlZq2hHYakBQmyfnRuCsh2yf+d7n";
var testExecutable = new RegExp("\\b"+objctHash+"\\b");
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
//////////////////////////////////////////////////////////////////////////////
var callHooks = function(names, args, data){
	for(var n = 0; n<names.length; n++) {
		var hooks = data.h[names[n]];
		var type, hook;
		if(typeof hooks === "undefined") continue;
		hooks.keys.sort(numericSort);

		for(var i=0; i<hooks.keys.length; i++) {
			hook = hooks.hooks[hooks.keys[i]];
			for(var k =0; k<hook.length; k++) 
				hook[k].apply(data.i, args);
		}
	}
};
//////////////////////////////////////////////////////////////////////////////
var bindHook = function(hooks, name, fn, zIndex){
	zIndex=typeof zIndex === "number"? zIndex:50;
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
	for(var i=0; i<hooks[name].keys.length; i++) {
		index = hooks[name].hooks[hooks[name].keys[i]].indexOf(fn);
		index >= 0 && hooks[name].hooks[hooks[name].keys[i]].splice(index,1);
	}
};
////////////////////////////////////////////////////////////////////////////////
var decoratedProperty = function(target, source, k, data) {
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

	hookData.value = target[k];
	callHooks(["onChange","onChange."+k], [hookData], data);
};
////////////////////////////////////////////////////////////////////////////////
var decoratedModule = function(module, data, instance) {
	return typeof module === strFunction && module.hash === hash ?
		module.call(instance, {
			args:data.a, 
			modules:data.m, 
		}):
		module;
}
////////////////////////////////////////////////////////////////////////////////
var mixinObject = function(target, source, data, keys) {
	var k;
	if(data.d && typeof keys === strObject) 
		for(k=0; k<keys.length; k++) {
			data.d ?
				decoratedProperty(target, source, keys[k], data):
				target[keys[k]]=source[keys[k]];
		}
	else 
		for(k in source) {
			data.d ?
				decoratedProperty(target, source, k, data):
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
	var isFunction, i=1;
	var instance;

	//FIRST MODULE
	// decorated?
	var obj = data.d ?
		decoratedModule(modules[0].obj, data, instance):
		modules[0].obj;

	// is it a function? -> call it
	instance = typeof obj === strFunction ?
			instantiate(obj, data.a):
			obj;

	data.i = data.i || instance;

	// call first modules decorators
	if(data.d)
		for(var key in instance)
			if(typeof instance[key] === strFunction && instance[key].hash === hash) 
				decoratedProperty(instance, instance, key, data);

	//OTHER MODULES
	for(; i<modules.length; i++) {

		//module decorated?
		obj = data.d ?
			decoratedModule(modules[i].obj, data, instance):
			modules[i].obj;

		//module is factory? -> call it
		obj = modules[i].isFactory ?
			obj.call({hash:hash}, modules[i], data):
			obj;

		// mixin function or object.
		typeof obj === strFunction ?
			mixinFunction(instance, obj, data):
			mixinObject(instance, obj, data);
	}
	return instance;
};
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
var factory = function(){
	Array.prototype.unshift.call(arguments, NewObj);
	return factory.extend.apply({
		hash:hash,
		i : this instanceof factory,
		d : false
	}, arguments);
};
//////////////////////////////////////////////////////////////////////////////
factory.e = function(){
	Array.prototype.unshift.call(arguments, NewObj);
	return factory.extend.apply({
		hash:hash,
		i : this instanceof factory.e,
		d : true
	}, arguments);
};
//////////////////////////////////////////////////////////////////////////////
factory.e.extend = function(){
	return factory.extend.apply({
		hash:hash,
		i : this instanceof factory.e.extend,
		d : true
	}, arguments);
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

		// Call onConstruct Hooks
		thisData.d && callHooks(["onConstruct"], [{
				args:thisData.a, 
				modules:thisData.m
			}], thisData);

		return instance;
	};
	////////////////////////////////////////////////////////////////////////
	var that = this || {};
	var thisData = {
		a : [], // args
		m : [], // modules
		i : false, // instance
		d : this.hash === hash ? that.d : false, // decorated
		h : {} // hooks
	};
	var type, args = arguments;
	var instant = this instanceof factory.extend || that.i;

	//setup modules
	for(var i=0; i < args.length; i++) {
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

		// if module is a function and not a decorator, copy static properties to Executable
		if(!instant && type === strFunction && args[i].hash !== hash)
			mixinObject(Executable, args[i], thisData);
	}	
	return instant ? new Executable() : Executable;
};
////////////////////////////////////////////////////////////////////////////////
factory.decorator = function(fn){
	var type = typeof fn;
	if(type !== strFunction) 
		throw("objct.decorator: Unexpected '"+type+"'! Objct.decorator only takes one function as argument.");
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
factory.isObjct = function(obj){
  return testExecutable.test(obj);
};

////////////////////////////////////////////////////////////////////////////////

// Connect to Environment 
commonJSmodule.exports = factory;
if(typeof define === strFunction && define.amd) 
	define(function(){return factory;});
else if(typeof window === strObject)
	window.objct = factory;

////////////////////////////////////////////////////////////////////////////////
})(typeof module === "undefined"? {} : module);