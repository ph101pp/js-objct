(function(undefined){
	"use strict";
	var building = false;
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
		var extend = function(child, _super) {
			if(child._abstract) abstract = child._abstract();
			if(_super && !_super._abstract() && abstract) throw("Only abstract classes can be extended by abstract classes.");

			var classes = [_super, child];		
			for(var i=0; i<classes.length; i++)
				if(typeof classes[i] === "function") {
					for(name in classes[i]) {
						if(["_build", "extend", "_abstract", "_instanceof"].indexOf(name) < 0) 
							Executable[name]= typeof Executable[name] === "function" ?
								attachSuper(classes[i][name], Executable[name]):
								classes[i][name];
						else if(''+classes[i] !== ''+Executable) 
							throw("Property names '_build', 'extend', '_instanceof' and '_abstract' are reserved on Class objects. (Sorry)");
					}
					extending.push(classes[i]);
				}
			return Executable;
		}
		var Executable = function(){
			if(!(this instanceof Executable)) throw("Classes need to be initiated with the new operator.");
			if(abstract) throw("Abstract class may not be constructed.");

			Array.prototype.unshift.call(arguments, null);
			var Class = Executable._build(undefined, arguments);
			
			// Initialize newly build Class with proper attributes
			var instance = new (Function.prototype.bind.apply(Class, arguments)); 

			// Add substitution for native instanceof operator
			if(typeof instance.instanceof !== "function") instance.instanceof = Executable._instanceof;
			else instance._instanceof = Executable._instanceof;

			Array.prototype.shift.call(arguments);
			if(instance.construct) var construct = instance.construct.apply(instance, arguments);
			return ["object", "function"].indexOf(construct) < 0 ?
				instance : construct;
		}
		Executable._build = function(Class, args){
			// Define _instanceof function for every Executable that gets build.
			Executable._instanceof = function(child){
				if(Executable === child) return true;
				for(var i=0; i<extending.length; i++) {
					if(extending[i]._instanceof && extending[i]._instanceof(child)) return true;
					else if(extending[i] === child) return true
				} 
				return false;
			};
			for(var i=0; i<extending.length; i++) {
				if(typeof extending[i] === "function" && typeof extending[i]._build === "function") Class=extending[i]._build(Class,args);
				else {
					if(typeof Class === "undefined") {
						var Class= function(){};
						Class.prototype = extending[i].prototype.__proto__;
					}
					var prototype = new Class;
					
					var instance = typeof extending[i] === "function" ?
						new (Function.prototype.bind.apply(extending[i], args)):
						extending[i];

					//console.log(bla);
					for (var name in instance) {
					//	console.log(name);
						// Check if we have to wrap the function either because it has a _super function or because it needs its own private closure.
						prototype[name] = typeof instance[name] === "function" && instance[name] !== prototype[name] && typeof prototype[name] === "function" && fnTest.test(instance[name]) ?
							attachSuper(instance[name], prototype[name]) :
							instance[name];
					}
					// Enforce the constructor to be what we expect
					Class.prototype = prototype;
					Class.prototype.constructor = extending[i];
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