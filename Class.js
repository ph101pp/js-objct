(function(undefined){
	"use strict";
	var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	var attachSuper = function(fn, _super) {
		return function() {
			var tmp = this._super;
			this._super = _super;
			var ret = fn.apply(this, arguments); 
			this._super = tmp;
			return ret;
		}
	}
	var Inheritance = function(child, _super, _abstract){
		var extending = [];
		var abstract = _abstract || false;
		var abstractMethods = [];
		var extend = function(child, _super) {
			var key;
			if(child._abstract) abstract = child._abstract();

			var classes = [_super, child];	
			for(var i=0; i<classes.length; i++) {
				if(typeof classes[i] === "object" || typeof classes[i] === "function"){
					if(typeof classes[i] === "function") {
						for(key in classes[i]) {
							if(["_build", "extend", "_abstract", "_instanceof"].indexOf(key) < 0) 
								Executable[key]= typeof Executable[key] === "function" ?
									attachSuper(classes[i][key], Executable[key]):
									classes[i][key];
							else if(''+classes[i] !== ''+Executable) 
								throw("Property names '_build', 'extend', '_instanceof' and '_abstract' are reserved on Class objects. (Sorry)");
						}
					}
					extending.push(classes[i]);
				}
			}
			return Executable;
		}
		var Executable = function(){
			if(!(this instanceof Executable)) 
				throw("Classes need to be initiated with the new operator.");
			if(abstract) 
				throw("Abstract class may not be constructed.");

			Array.prototype.unshift.call(arguments, null);
			var instance = Executable._build(undefined, arguments, abstractMethods);

			for(var i =0; i<abstractMethods.length; i++) 
				if(instance[abstractMethods[i]] === Function) 
					throw("Abstract method '"+abstractMethods[i]+"' needs to be defined.");

			// Add substitution for native instanceof operator
			if(typeof instance.instanceof === "undefined") 
				instance.instanceof = Executable._instanceof;
			else 
				instance._instanceof = Executable._instanceof;

			Array.prototype.shift.call(arguments);
			if(instance.construct) 
				var construct = instance.construct.apply(instance, arguments);
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
						return true
				}
				return false;
			};
			for(var i=0; i<extending.length; i++) {
				isFunction = typeof extending[i] === "function";
				if(isFunction && typeof extending[i]._build === "function") 
					Class=extending[i]._build(Class, args, abstractMethods);
				else {
					if(typeof Class === "undefined") {
						Class = isFunction ?
							new (Function.prototype.bind.apply(extending[i], args)):
							extending[i];
						if(abstract)
							for(var key in Class)
								if(Class[key] === Function)
									abstractMethods.push(key); 
						continue;
					}
					if(!isFunction) {
						proto = Class;
						Class = function(){};
						Class.prototype=proto;
						Class.prototype.constructor = Class;
						Class = new Class;
					}
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
						else Class[key] = proto[key] !== Class[key]  && typeof proto[key] === "function" && typeof Class[key] === "function" && fnTest.test(proto[key]) ?
							attachSuper(proto[key], Class[key]):
							proto[key];
					}
					
					if(isFunction) {
						extending[i].prototype = Class;
						extending[i].prototype.constructor = extending[i];
						instance = new (Function.prototype.bind.apply(extending[i], args));
						extending[i].prototype = proto;
						extending[i].prototype.constructor = extending[i];

						if(fnTest.test(extending[i]) || abstract) {
							keys = Object.getOwnPropertyNames(instance);
							for(var i=0; i<keys.length; i++){
								if(abstract && instance[keys[i]] === Function) {
									abstractMethods.push(keys[i]);
									if(Class[keys[i]] && Class[keys[i]] !== Function) 
										throw("Can't override '"+keys[i]+"' with abstract method.");
									continue;
								}
								else if(Class[keys[i]] !== instance[keys[i]]  && typeof instance[keys[i]] === "function" && typeof Class[keys[i]] === "function" && fnTest.test(instance[keys[i]])) 
									instance[keys[i]] = attachSuper(instance[keys[i]], Class[keys[i]]);
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
		Executable.extend = function(child){
			return new Inheritance(child, Executable);
		}		
		Executable.extend.abstract = function(child){
			return new Inheritance(child, Executable, true);
		}	
		return extend(child, _super);
	}
	var Class = function(child){
		return new Inheritance(child);
	}
	Class.abstract  = function(child){
		return new Inheritance(child, undefined, true);
	}	
	Class.extend = Class;
	if(typeof module === "object") module.exports = Class;
	else window.Class = Class;
})();