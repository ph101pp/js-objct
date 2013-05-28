(function(undefined){
	var building = false;
	var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	var Class = function(child){
		var extending = [];
		var extend = function(child) {
			for(name in child) {
				if(["_build", "extend"].indexOf(name) < 0) 
					Executable[name]=child[name];
				else if(''+child !== ''+Executable) 
					throw("Method names '_build' and 'extend' are reserved on Class Objects (sorry)");
			}
			extending.push(child);
			return Executable;
		}
		var Executable = function(){
			if(!(this instanceof Executable)) throw("Classes need to be initiated with the new operator");

			var Class = Executable._build(function Class(){
				// All construction is actually done in the construct method
				if(building) return;
				if(this._abstract) throw("Abstract class may not be constructed");
				if(this.construct) return this.construct.apply(this, arguments);
			});

			// Add substitution for native instanceof operator
			Class.prototype.instanceof = function(child){
				if(Executable === child) return true;
				for(var i=extending.length-1; i>=0; i--) {
					if(extending[i] === child) return true;
					if(extending[i].isInstance && extending[i].isInstance(child)) return true;
				}
				return false;
			}
			
			// Initialize newly build Class with proper attributes
			Array.prototype.unshift.call(arguments, null);
			return new (Function.prototype.bind.apply(Class, arguments)); 	
		}
		Executable._build = function(Class){
			for(var i=0; i<extending.length; i++) {
				if(''+extending[i] === ''+Executable) Class=extending[i]._build(Class);
				else {
					building = true;
					Class.prototype = new Class();
					building = false;

					var properties = new extending[i]();
					for (var name in properties) {
						// Check if we have to wrap the function either because it has a _super function or because it needs its own private closure.
						var check=typeof properties[name] === "function" && (typeof extending[i].prototype[name] !== "function" || (typeof Class.prototype[name] === "function" && fnTest.test(properties[name])));
						Class.prototype[name] = check ?
							(function(fn, _super ,name) {
								return function() {
									//if(!fnTest.test(fn) || !_super) _super = undefined;
									
									var tmp = this._super;

									// Add a new ._super() method that is the same method
									// but on the super-class
									this._super = _super;
									
									// The method only needs to be bound temporarily, so we
									// remove it when we're done executing
									var ret = fn.apply(this, arguments); 
									this._super = tmp;
									return ret;
								}
							})(properties[name], Class.prototype[name], name) :
							properties[name];
					}
				}
			}
			// Enforce the constructor to be what we expect
			Class.prototype.constructor = Class;
			return Class;
		}
		Executable.extend = function(child){
			child.prototype._abstract = false;
			return extend(child);
		}		
		Executable.extend.abstract = function(child){
			child.prototype._abstract = true;
			return extend(child);
		}	
		return extend(child);
	}
	var Constructor = function(child){
		child.prototype._abstract = false;
		return new Class(child);
	}
	Constructor.abstract = function(child){
		child.prototype._abstract = true;
		return new Class(child);
	}
	module.exports = Constructor;
})();