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
	var options = {
		deep : false,
		abstract : false,
		super : false
	}
	var instance = function(){};
	var strExecutable;
	var reserved = ["_instanceof"]; // Reserved as "static" methods
	var attachSuper = function(fn, _super) {
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
	
	var Factory = function(children){
		var extending = [];
		var abstractMethods = [];
		var type, deep, _super, abstract;
		var extend = function(child) {
			var key;
		
			if(typeof child.obj === "function") {
				for(key in child.obj) {
					if(reserved.indexOf(key) < 0) {
						Executable[key]= typeof Executable[key] === "function" ?
							attachSuper(child.obj[key], Executable[key]):
							child.obj[key];
					}
					else if(child.strObj !== strExecutable) {
						throw("The property name '_instanceof' is reserved and can't be set as static property. (Sorry)");
					}
				}
			}
			extending.push(child);
		}
		var build = function(Class, extending, args, abstractMethods){
			var isFunction, proto, instance, keys, child;

			for(var i=0; i<extending.length; i++) {
				child = extending[i];
				isFunction = typeof child.obj === "function";
				if(isFunction && extending[i].strObj === strExecutable) {
					Class=child.obj.call(Factory, Class, args, abstractMethods);
				}
				else {
					if(typeof Class === "undefined") {
						Class = isFunction ?
							instantiate(child.obj, args):
							Object.create(child.obj); // Copy object
						if(child.abstract)
							for(var key in Class)
								if(Class[key] === Function)
									abstractMethods.push(key); 
						continue;
					}
					if(!isFunction) Class = instantiate(Class);

					proto = isFunction ?
						child.obj.prototype:
						child.obj;

					for(var key in proto) {
					
						if(child.abstract && proto[key] === Function && typeof Class[keys[k]] !== "function") {
							abstractMethods.push(key);
							Class[key] = proto[key];
						}
						else if(child.super && proto[key] !== Class[key]  && typeof proto[key] === "function" && typeof Class[key] === "function" && superTest.test(proto[key]))
							Class[key] = attachSuper(proto[key], Class[key]);
						else
							Class[key] = proto[key];
					}
						
					
					if(isFunction) {
						child.obj.prototype = Class;
						child.obj.prototype.constructor = child.obj;
						instance = instantiate(child.obj, args);
						child.obj.prototype = proto;
						child.obj.prototype.constructor = child.obj;

						if((child.super && superTest.test(child.obj)) || (child.abstract && abstractTest.test(child.obj))) {
							keys = Object.getOwnPropertyNames(instance);
							for(var k=0; k<keys.length; k++){
								// test if abstract method
								if(child.abstract && instance[keys[k]] === Function && typeof Class[keys[k]] !== "function") {
									abstractMethods.push(keys[k]);
								}
								// test if _super has to be attached
								else if(child.super && Class[keys[k]] !== instance[keys[k]]  && typeof instance[keys[k]] === "function" && typeof Class[keys[k]] === "function" && superTest.test(instance[keys[k]])) 
									instance[keys[k]] = attachSuper(instance[keys[k]], Class[keys[k]]);
							}
						}
						Class = instance;
					}
				}
			}
			return Class;
		}
		var Executable = function(Class, args, absMethods){
			// Define _instanceof function for every Executable that gets build.
			Executable._instanceof = function(fn){
				if((typeof fn === "function" && this instanceof fn) || Executable === fn) return true;
				for(var i=0; i<extending.length; i++) {
					if(typeof extending[i].obj._instanceof === "function" && extending[i].obj._instanceof(fn)) 
						return true;
					else if(extending[i].obj === fn) 
						return true;
				}
				return false;
			};

			// If we're in the building process
			if(this === Factory) return build(Class, extending, args, absMethods);
 	
			var instance = build(undefined, extending, arguments, abstractMethods);
			var construct;

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
				construct = instance.construct.apply(instance, arguments);

			// return instance or if construct() returned function or object, return that. (standard instanication behavior in JS)
			return typeof construct === "object" || typeof construct === "function" ?
				construct : instance;
		}
		strExecutable = ""+Executable;

  		for(var key in children) {
  			type = typeof children[key];
  			if(type === "object" || type === "function") {

  				if(Object.prototype.toString.call(children[key]) === "[object Array]") {
  				}
  				else {
  					deep = options.deep;
  					_super = options.super;
  					abstract = options.abstract;
  				}

				extend({ 
					obj : children[key],
					strObj : type === "function" ? ""+children[key] : "",
					deep : deep,
					super : _super,
					abstract : abstract
				});
			
			} 
			else 
				throw("Unexpected '"+typeof children[key]+"'! Only 'functions' and 'objects' can be used with the objectfactory.");
		}
		return Executable;
	}
	var objectfactory = function(){
		return new Factory(arguments);
	}

	if(typeof module === "object") module.exports = objectfactory;
	else window.objectfactory = objectfactory;
})();