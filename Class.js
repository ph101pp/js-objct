(function(undefined){
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
				if(classes[i]) {
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

			var Class = Executable._build(function Class(){
				// All construction is actually done in the construct method
				if(building) return;
				if(abstract) throw("Abstract class may not be constructed.");
				if(this.construct) return this.construct.apply(this, arguments);
			});

			// Add substitution for native instanceof operator
			if(typeof Class.prototype.instanceof !== "function") Class.prototype.instanceof = Executable._instanceof;
			else Class.prototype._instanceof = Executable._instanceof;
			
			// Initialize newly build Class with proper attributes
			Array.prototype.unshift.call(arguments, null);
			return new (Function.prototype.bind.apply(Class, arguments)); 	
		}
		Executable._build = function(Class){
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
				if(''+extending[i] === ''+Executable) Class=extending[i]._build(Class);
				else {
					building = true;
					Class.prototype = new Class();
					building = false;

					var properties = typeof extending[i] === "function" ?
						new extending[i]():
						extending[i];

					for (var name in properties) {
						// Check if we have to wrap the function either because it has a _super function or because it needs its own private closure.
						var check=typeof properties[name] === "function" && ((extending[i].prototype && typeof extending[i].prototype[name] !== "function") || (typeof Class.prototype[name] === "function" && fnTest.test(properties[name])));
						Class.prototype[name] = check ?
							attachSuper(properties[name], Class.prototype[name]) :
							properties[name];
					}
					// Enforce the constructor to be what we expect
					Class.prototype.constructor = Class;
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