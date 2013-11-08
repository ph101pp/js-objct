/*! 
 * objectfactory - v1.0.0 (https://github.com/greenish/js-objectfactory)
 * 
 * Copyright (c) 2013 Philipp Adrian (www.philippadrian.com)
 *
 * The MIT Licence (http://opensource.org/licenses/MIT)
 *   
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions: 
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(undefined){
	"use strict";
	var superTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	var abstractTest = /xyz/.test(function(){xyz;}) ? /\bFunction\b/ : /.*/;
	var empty = function(){};
	var reserved = ["_build", "extend", "_abstract", "_instanceof"]; // Reserved as "static" methods
	var attachSuper = function(fn, _super) {
		var attach = function() {
			var tmp = this._super;
			this._super = _super;
			var ret = fn.apply(this, arguments); 
			this._super = tmp;
			return ret;
		}
		//prevent infinite recursion on _super() call in "last" super method.
		if(typeof _super === "function" && _super != attach) 
			_super=attachSuper(_super, undefined);
		return attach;
	}
	var instantiate = function(fn, args){
		var f;
		if(typeof fn === "function") {
			empty.prototype = fn.prototype;
			empty.prototype.constructor = fn;
			f = new empty();
			fn.apply(f, args);
		}
		if(typeof fn === "object") {
			empty.prototype = fn;
			empty.prototype.constructor = empty;
			f = new empty();
		}
		return f;	
	}
	var Inheritance = function(children, _abstract){
		var extending = [];
		var abstract = _abstract || false;
		var abstractMethods = [];
		var result = undefined;
		var extend = function(child) {
			var key,type;
			if(!_abstract) abstract = typeof child._abstract === "function" ? child._abstract():false;
			type=typeof child;
			if(type === "object" || type === "function"){
				if(type === "function") {
					for(key in child) {
						if(reserved.indexOf(key) < 0) 
							Executable[key]= typeof Executable[key] === "function" ?
								attachSuper(child[key], Executable[key]):
								child[key];
						else if(''+child !== ''+Executable) 
							throw("Property names '_build', 'extend', '_instanceof' and '_abstract' are reserved and can't be set as static properties. (Sorry)");
					}
				}
				extending.push(child);
			}
		}
		var Executable = function(){
			if(abstract) 
				throw("Abstract class may not be constructed.");
 	
			// Create new Instance
			var instance = Executable._build(undefined, arguments, abstractMethods);

			// Check if all abstract Methods are implemented
			for(var i =0; i<abstractMethods.length; i++) 
				if(instance[abstractMethods[i]] === Function) 
					throw("Abstract method '"+abstractMethods[i]+"' needs to be defined.");

			// Add substitution for native instanceof operator
			if(typeof instance.instanceof === "undefined" || ""+instance.instanceof === ""+Executable._instanceof) 
				instance.instanceof = Executable._instanceof;
			else 
				instance._instanceof = Executable._instanceof;

			// Call consruct if available
			if(instance.construct) 
				var construct = instance.construct.apply(instance, arguments);
			// return instance or if construct() returned function or object, return that. (standart instanication behavior in JS)
			return typeof construct === "object" || typeof construct === "function" ?
				construct : instance;
		}
		Executable._build = function(Class, args, abstractMethods){
			var isFunction, proto, instance, keys;
			// Define _instanceof function for every Executable that gets build.
			Executable._instanceof = function(fn){
				if(this instanceof fn || Executable === fn) return true;
				for(var i=0; i<extending.length; i++) {
					if(typeof extending[i]._instanceof === "function" && extending[i]._instanceof(fn)) 
						return true;
					else if(extending[i] === fn) 
						return true;
				}
				return false;
			};
			for(var i=0; i<extending.length; i++) {
				isFunction = typeof extending[i] === "function";
				if(isFunction && typeof extending[i]._build === "function") {
					Class=extending[i]._build(Class, args, abstractMethods);
				}
				else {
					if(typeof Class === "undefined") {
						Class = isFunction ?
							instantiate(extending[i], args):
							Object.create(extending[i]); // Copy object
						if(abstract)
							for(var key in Class)
								if(Class[key] === Function)
									abstractMethods.push(key); 
						continue;
					}
					if(!isFunction) Class = instantiate(Class);
					
					proto = isFunction ?
						extending[i].prototype:
						extending[i];

					for(var key in proto) {
						
						if(abstract && proto[key] === Function) {
							abstractMethods.push(key);
							if(Class[key] && Class[key] !== Function) 
								throw("Can't override '"+key+"' with abstract method.");
							Class[key] = proto[key];
						}
						else Class[key] = proto[key] !== Class[key]  && typeof proto[key] === "function" && typeof Class[key] === "function" && superTest.test(proto[key]) ?
							attachSuper(proto[key], Class[key]):
							proto[key];
					}
					
					if(isFunction) {
						extending[i].prototype = Class;
						extending[i].prototype.constructor = extending[i];
						instance = instantiate(extending[i], args);
						extending[i].prototype = proto;
						extending[i].prototype.constructor = extending[i];

						if(superTest.test(extending[i]) || (abstract && abstractTest.test(extending[i]))) {
							keys = Object.getOwnPropertyNames(instance);
							for(var k=0; k<keys.length; k++){
								// test if abstract method
								if(abstract && instance[keys[k]] === Function) {
									abstractMethods.push(keys[k]);
									if(Class[keys[k]] && Class[keys[k]] !== Function) 
										throw("Can't override '"+keys[k]+"' with abstract method.");
									continue;
								}
								// test if _super has to be attached
								else if(Class[keys[k]] !== instance[keys[k]]  && typeof instance[keys[k]] === "function" && typeof Class[keys[k]] === "function" && superTest.test(instance[keys[k]])) 
									instance[keys[k]] = attachSuper(instance[keys[k]], Class[keys[k]]);
							}
						}
						Class = instance;
					}
				}
			}
			return Class;
		}
		Executable._abstract = function(){
			return abstract
		}
		Executable.extend = function(){
			Array.prototype.unshift.call(arguments, Executable);
			return new Inheritance(arguments);
		}		
		Executable.extend.abstract = function(){
			Array.prototype.unshift.call(arguments, Executable);
			return new Inheritance(arguments, true);
		}	
  		
  		for(var key in children)
  			if(typeof children[key] === "object" || typeof children[key] === "function")
				extend(children[key]);
			else 
				throw("Unexpected '"+typeof children[key]+"'! Only 'functions' and 'objects' can be used with the objectfactory.");

		return Executable;
	}
	var objectfactory = function(){
		return new Inheritance(arguments);
	}
	objectfactory.abstract  = function(){
		return new Inheritance(arguments,true);
	}	
	objectfactory.extend = objectfactory;
	if(typeof module === "object") module.exports = objectfactory;
	else window.objectfactory = objectfactory;
})();