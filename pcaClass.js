(function(){
	// pcaClass Module by Philipp Adrian philippadrian.com
	// Based on:

	/* Simple JavaScript Inheritance
	 * By John Resig http://ejohn.org/
	 * MIT Licensed.
	 * 
	 * Inspired by base2 and Prototype
	 */
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;


	// The base Class implementation (does nothing)
	this.Class = function(){};
	// Create a new Class that inherits from this class
	Class._extend = function(extendingClass) {
		var prototype = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
//		var _super = new this();
		var closure = new extendingClass();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in closure) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof closure[name] == "function" && ((typeof prototype[name] == "function" && fnTest.test(closure[name])) || typeof extendingClass.prototype[name] != "function") ?
				(function(name, closure, _super){
					return function() {
						var tmp = closure._super;

						// Add a new ._super() method that is the same method
						// but on the super-class
						//if(_super) closure._super = _super;

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = closure[name].apply(closure, arguments);        
						closure._super = tmp;

						return ret;
					};
				})(name, closure, prototype[name]) :
				closure[name];
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the construct method
			if( initializing ) return
		//	if( this._abstract ) throw("Abstract class may not be constructed");
			else if( this.construct ) {
				var construct = this.construct.apply(this, arguments);
				if(["object", "function"].indexOf(typeof(construct)) >= 0) return construct;
			}
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class._extend = arguments.callee;
		Class.extend = extend.bind(Class);
		Class.extend.abstract = abstract.bind(Class);
 
		console.log("pcaClass.prototype",Class.prototype);
		console.log("pcaClass instance",new Class());
		return Class;
	};
	var extend = function(newClass){
		console.log("extend");
		this.prototype._abstract=false;
		return this._extend(newClass);		
	}
	var abstract = function(newClass){
		newClass.prototype._abstract= true;
		return this.extend(newClass);
	}
	var pcaClass = function(newClass){
		newClass = Class._extend(newClass);
		return newClass;
	}
	pcaClass.abstract = function(newClass) {
		newClass.prototype._abstract= true;
		return pcaClass(newClass);
	}
	pcaClass.extend = function(abstractClass, extendingClass) {
		return typeof(abstractClass.extend) === "function" ?
			abstractClass.extend(extendingClass):
			pcaClass(abstractClass).extend(extendingClass);
	}

	module.exports = pcaClass;
})();