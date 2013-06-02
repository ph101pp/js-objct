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
	var addSuperFunctions = function(obj, _super) {
		var key, properties = Object.getOwnPropertyNames(obj);
		for(var i=0; i<properties.length; i++){
			key = properties[i];
			//console.log(key);
			if(_super[key] !== obj[key]  && typeof obj[key] === "function" && typeof _super[key] === "function" && fnTest.test(obj[key])) 
				obj[key] = attachSuper(obj[key], _super[key]);
		}
		return obj;
	}
	var Inheritance = function(child, _super, _abstract){
		var extending = [];
		var abstract = _abstract || false;
		var extend = function(child, _super) {
			var key;
			if(child._abstract) abstract = child._abstract();
			if(_super && !_super._abstract() && abstract) throw("Only abstract classes can be extended by abstract classes.");

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
			if(!(this instanceof Executable)) throw("Classes need to be initiated with the new operator.");
			if(abstract) throw("Abstract class may not be constructed.");

			Array.prototype.unshift.call(arguments, null);
			var instance = Executable._build(undefined, arguments);

			// Add substitution for native instanceof operator
			if(typeof instance.instanceof === "undefined") instance.instanceof = Executable._instanceof;
			else instance._instanceof = Executable._instanceof;

			Array.prototype.shift.call(arguments);
			if(instance.construct) var construct = instance.construct.apply(instance, arguments);
			return typeof construct === "object" || typeof construct === "function" ?
				construct : instance;
		}
		Executable._build = function(Class, args){
			var isFunction, prototype, instance;
			// Define _instanceof function for every Executable that gets build.
			Executable._instanceof = function(fn){
				if(this instanceof fn || Executable === fn) return true;
				for(var i=0; i<extending.length; i++) {
					if(typeof extending[i]._instanceof === "function" && extending[i]._instanceof(fn)) return true;
					else if(extending[i] === fn) return true
				}
				return false;
			};
			for(var i=0; i<extending.length; i++) {
				isFunction = typeof extending[i] === "function";
				if(isFunction && typeof extending[i]._build === "function") Class=extending[i]._build(Class, args);
				else {
					if(typeof Class === "undefined") {
						Class = isFunction ?
							new (Function.prototype.bind.apply(extending[i], args)):
							extending[i];
						continue;
					}
					if(!isFunction) {
						prototype = Class;
						Class = function(){};
						Class.prototype=prototype;
						Class.prototype.constructor = Class;
						Class = new Class;
					}
					prototype = isFunction ?
						extending[i].prototype:
						extending[i];

					for(var key in prototype) 
						Class[key] = prototype[key] !== Class[key]  && typeof prototype[key] === "function" && typeof Class[key] === "function" && fnTest.test(prototype[key]) ?
							attachSuper(prototype[key], Class[key]):
							prototype[key];
					
					if(isFunction) {
						extending[i].prototype = Class;
						extending[i].prototype.constructor = extending[i];
						instance = new (Function.prototype.bind.apply(extending[i], args));
						extending[i].prototype = prototype;
						extending[i].prototype.constructor = extending[i];
						Class=addSuperFunctions(instance, Class);
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
	if(module) module.exports = Class;
	else window.Class = Class;
})();