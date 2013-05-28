(function(undefined){
	var Class = function(child, abstract){
		if(!(this instanceof Class)) return new Class(child);
		var extending = [child];
		var building = false;
		var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
		var Executable = function(){
			// throw("Classes need to be initiated with the new operator");
			var Class = Executable.build(function(){
				// All construction is actually done in the construct method
				//if( this._abstract ) throw("Abstract class may not be constructed");
				if(building) return;
				//console.log(this);
				if(this.construct) 
					return this.construct.apply(this, arguments);
			});
			// Enforce the constructor to be what we expect
			Class.prototype.constructor = Class;

			Class.prototype.instanceof = function(child){
				if(Executable === child) return true;
				for(var i=extending.length-1; i>=0; i--) {
					if(extending[i] === child) return true;
					if(extending[i].isInstance && extending[i].isInstance(child)) return true;
				}
				return false;
			}
			
			//console.log("Class",Class)
			if(this instanceof Executable) {
				// Initialize newly build Class with proper attributes
				Array.prototype.unshift.call(arguments, null);
				return new (Function.prototype.bind.apply(Class, arguments)); 	
			}
			return Class;
		}
		Executable.build = function(Class){
			for(var i=extending.length-1; i>=0; i--) {
				if(extending[i].build) Class=extending[i].build(Class);
				else {
					// building = true;
					// Class = new Class();
					// Class.prototype = {}
					// building = false;
					var properties = new extending[i]();
					for (var name in properties) {
						// Check if we have to wrap the function
						var check=typeof properties[name] === "function" && (typeof extending[i].prototype[name] !== "function" || (typeof Class.prototype[name] === "function" && fnTest.test(properties[name])));
			//			console.log(name, check, properties)
						Class.prototype[name] = check ?
							(function(fn, _super ,name) {
								return function() {
									//if(!fnTest.test(fn) || !_super) _super = undefined;
									
									var tmp = this._super;

									// Add a new ._super() method that is the same method
									// but on the super-class
									this._super = _super;
									
									// The method only need to be bound temporarily, so we
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
			return Class;
		}
		Executable.extend = function(child){
//			child.prototype._abstract = false;
			extending.push(child);
			return this;
		}
		return Executable;
	}
	Class.abstract = function(child){
//		child.prototype._abstract = true;
		return new Class(child);
	}
	module.exports = Class;
})();