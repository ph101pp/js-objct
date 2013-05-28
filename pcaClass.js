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
	var _extend = function(_super, child) {
		var prototype= {}

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		_super = new _super();
		child = new child();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in _super) {
			console.log("super", name, typeof _super[name] == "function")
			// Check if we're overwriting an existing function
			prototype[name] = _super[name];

			// typeof _super[name] == "function" && _super[name].toString()==wrap().toString()?
			// 	_super[name].rebind(_super) :
			// 	_super[name];
		}
		for (var name in child) {
			console.log("child", name)
			// Check if we're overwriting an existing function
			prototype[name] = typeof child[name] == "function" ?
				wrap(child, name, _super[name] && fnTest.test(child[name]) ? _super : undefined) :
				child[name];
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the construct method
			if( initializing ) return
		//	if( this._abstract ) throw("Abstract class may not be constructed");
			else if( this.construct ) {
				return this.construct.apply(this, arguments);
			}
		}

		console.log(prototype);
		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = extend.bind(Class);
		Class.extend.abstract = abstract.bind(Class);
 
		// console.log("pcaClass.prototype",Class.prototype);
		// console.log("pcaClass instance",new Class());
		console.log("////////////",Class);
		return Class;
	};
	var wrap = function(child, name, _super){
		var wrapper= function(closure) {
			if(_super) {
				var tmp = closure._super;

				// Add a new ._super() method that is the same method
				// but on the super-class
				closure._super = _super[name];
			}

			// The method only need to be bound temporarily, so we
			// remove it when we're done executing
			var ret = child[name].apply(closure, arguments); 
			if(_super) closure._super = tmp;
			return ret;
		}
		var ret = function(){
			return wrapper(this);
		}
		ret.rebind = function(closure) {
			return function() {
				debugger;
				//rebound
				return wrapper(closure);
			}
		}
		return ret;
	}

	var extend = function(newClass){
		this.prototype._abstract=false;
		return _extend(this,newClass);
	}
	var abstract = function(newClass){
		newClass.prototype._abstract= true;
		return _extend(this,newClass);
	}
	var pcaClass = function(newClass){
		return _extend(Class, newClass);
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