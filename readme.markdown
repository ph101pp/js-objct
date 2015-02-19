A modular oop-inheritance library for javascript that supports closures and abstract methods. Works nicely with browserify, CommonJS or just vanilla javascript.

----------------

__Keyfeatures:__

* Light weight and fast.
* "Multiple inheritance". Objects can be modular assembled for each object.
* Closures are preserved. Private, privileged and public method definitions work as usual.
* Factory objects can be extended and used with the objectfactory.
* Easily definable constructor method.
* instanceof substitution.
* Possibility to deep copy objects.
* Opt in support for "_super"-method to access overwritten functions.
* Opt in support for "abstract" methods.
* Debug mode for easier development.

----------------

## Documentation
### 1.	General	
Get the objectfactory from GitHub, via [bower](http://bower.io) or [npm](https://www.npmjs.org/package/objectfactory).

Include it into your project:

``` html
<script src="path/to/the/file/objectfactory.js"></script>
```
or when using a require.js:

``` javascript
var objectfactory = require("objectfactory");
```
And you're good to go!
### 2. Basic Modular Factories
Base objects for the following examples:

``` javascript
var a = {
	a : "A",					
	getA : function(){ return this.a },
	getValue:function(){ return this.a }
}

//////////////////////////////////////////////////////////////////////////////

var b =  function(){};
b.prototype.b = "B";
b.prototype.getB = function(){ return this.b }
b.prototype.getValue = function(){ return this.b }
b.static = function(){ return "B" }

//////////////////////////////////////////////////////////////////////////////

var c = function (){	
	var c = "C";	// private property
	this.getC = function(){	return c }	
	this.getValue = function(){ return c }
}
c.static = function(){ return "C" }
```
#### Create Factories
Create modular factories from objects or functions.
Object literals are handled like the prototype of functions resulting in public properties.
Closures are preserved. Privileged methods keep their privileges.
Factory objects can also be used with the objectfactory.

``` javascript
var factoryAB = objectfactory(a, b);
var factoryABC = objectfactory(factoryAB, c);	// same as objectfactory(a, b, c);

var instanceABC = factoryABC();

instanceABC.getA()			// -> "A"
instanceABC.getB()			// -> "B"
instanceABC.getC()			// -> "C" /Privileges to access private property preserved.

instanceABC.a 				// -> "A"
instanceABC.b 				// -> "B"
instanceABC.c 				// -> Undefined 

//////////////////////////////////////////////////////////////////////////////
var instanceABC2 = factoryABC();

instanceABC2.a 				// -> "A"
instanceABC2.a = "Z"

instanceABC2.a 				// -> "Z"
instanceABC.a 				// -> "A" / Instances are not references but separate entities
```
#### Overwriting Properties
Properties of later added objects override already existing properties.
Public properties can override privileged ones and vice versa.

``` javascript
var factoryAB = objectfactory(a, b);
var factoryBA = objectfactory(b, a);

var instanceAB = factoryAB();
var instanceBA = factoryBA();

instanceAB.getValue()		// -> "B"
instanceBA.getValue()		// -> "A"

```
#### "Static Properties"
Properties of the function object (not the prototype) are preserved as well and are accessible on the factory object.
The same overwrite rules apply.

``` javascript
var factoryAB = objectfactory(a, b);
var factoryBC = objectfactory(b, c);
var factoryCB = objectfactory(c, b);

factoryAB.static()			// -> "B"
factoryBC.static()			// -> "C"
factoryCB.static()			// -> "B"

var instanceAB = factoryAB();

instanceAB.static()			// -> Error: Undefined
```
### 3.  Deep Copying Modules.
When passing `true` as the first Parameter, modules will be deep copied.

``` javascript
var factoryEF = objectfactory(true, e, f);
``` 

Base objects for the following examples:

``` javascript
var e = {
	e : "E",	
	x : {
		x1 : "A",
		x2 : "B",
		x3 : "C"
	}
}

var f = {
	f : "F",	
	x : {
		x1 : "A",
		x2 : "B",
		x3 : "C"
	}
}
```

While modules that are passed to the objectfactory are always copied to separate the instances, module properties that are objects or arrays by default, are passed to the instance as reference.

``` javascript
var factoryEF = objectfactory(e, f);

var instance1 = factoryEF();
var isntance2 = factoryEF();

instance1.f 		// -> "F"
instance2.f 		// -> "F"
instance1.x.x1 		// -> "A"
instance2.x.x1 		// -> "A"

instance1.f = "dF"
instance1.x.x1 = "dA"

instance1.f 		// -> "dF"
instance2.f 		// -> "F"  / Modules are always copied so changing instanceEF1.f doesnt affect instanceEF2.f 
instance1.x.x1 		// -> "dA"
instance2.x.x1 		// -> "dA" / instanceEF1.x is a reference to an object. 
								 So changing the object (instanceEF1.x.x1) affects all instances.
f.x.x2 = "dB"				   / Also changing the original object affects all instances.

instance1.x.x2 	// -> "dB"
instance2.x.x2 	// -> "dB" 
```

To prevent module properties to be passed as references, but instead create a deep copy of the module, the first parameter of the objectfactory can be set to `true`.

``` javascript
var factoryEF = objectfactory(true, e, f);

var instance1 = factoryEF();
var isntance2 = factoryEF();

instance1.f 		// -> "F"
instance2.f 		// -> "F"
instance1.x.x1 	// -> "A"
instance2.x.x1 	// -> "A"

instance1.f = "dF"
instance1.x.x1 = "dA"

instance1.f 		// -> "dF"
instance2.f 		// -> "F" 
instance1.x.x1 		// -> "dA"
instance2.x.x1 		// -> "A" / Now changing instanceEF1.x wont affect instanceEF2.x

f.x.x2 = "dB"				  / Changing the original object wont affect anything.

instance1.x.x2 		// -> "B"
instance2.x.x2 		// -> "B" 
```
### 4. Constructor
A public construct() method will be used as constructor and called on instanciation of the class.
Arguments passed on instanciation are passed to the constructor.

If the return value of the constructor is a function or an object, this will be returned instead of the newly created object reference. All other return values get omitted.


``` javascript
///// A
var a = {
	a : "A",					
	getA : function(){ return this.a },
	getValue:function(){ return this.a }
}

///// D
var d = {
	construct : function(argument){
		console.log("construct");
		return argument;
	}
}

///////////////////////////////////////////////////////////////////////////////

var factoryAD = objectfactory(a, d);
var instanceAD1 = factoryAD("argument1"); 	// -> Return: instanceAD,	Log: "construct"
var instanceAD2 = factoryAD({x: "X"});		// -> Return: {x: "X"}, 	Log: "construct"
```
### 5. instanceof Method
The native instanceof operator does not work for factories. 
objectfactory provides a public `instanceof` method that works as expected with all extended objects and factories.
Any user defined `instanceof` method will overwrite this "native" objectfactory method.

``` javascript
///// A
var a = {
	a : "A"
}

///// B
var b =  function(){};
b.prototype.b = "B";

///// C
var c = function (){	
	var c = "C";
}

///// E 
var e = {
	instanceof: function(){
		return "overwritten";
	}
}

///////////////////////////////////////////////////////////////////////////////

var factoryBC = objectfactory(b, c);
var factoryABC = objectfactory(a, factoryBC);
var factoryBCE = objectfactory(factoryBC, e);

var instanceBC = factoryBC();
var instanceABC = factoryABC();
var instanceBCE = factoryBCE();

instanceBC.instanceof(a)			// -> false
instanceBC.instanceof(b)			// -> true
instanceBC.instanceof(factoryBC)	// -> true
instanceBC.instanceof(factoryBCE)	// -> false

instanceABC.instanceof(a)			// -> true
instanceABC.instanceof(b)			// -> true
instanceABC.instanceof(factoryBC)	// -> true
instanceABC.instanceof(factoryBCE)	// -> false

instanceBCE.instanceof(a)			// -> "overwritten"
instanceBCE.instanceof(b)			// -> "overwritten"
instanceBCE.instanceof(factoryBC)	// -> "overwritten"
instanceBCE.instanceof(factoryBCE)	// -> "overwritten"
```

### 6. Opt In Features

There are three features `"deep"`, `"abstract"` and `"super"` that are not enabled by default. This is due to the fact, that they provide additional functionality that is not needed (or liked) all the time (or at all) and also that enabling them comes with a slight performance cost. To optimize performance, enabling them only when needed is favorable.

Options can be passed as the first parameter to the objectfactory:
``` javascript

// Single options as string.
var factory = objectfactory("deep", x, y);		// equals: objectfactory(true, x, y);
var factory = objectfactory("abstract", x, y);
var factory = objectfactory("super", x, y);

// Or multiple options as array. All options are combinable.
var factory = objectfactory(["abstract", "super"], x, y);
var factory = objectfactory(["deep", "abstract"], x, y);
``` 

#### Deep (Copying)

``` javascript
var factory = objectfactory(["deep"], x, y);
// equals
var factory = objectfactory(true, x, y);
``` 
Passing `"deep"` initiates a deep copy of the modules. This is exactly the same as passing `true` as the first parameter and you can read about this in the chapter about Deep Copying Modules.

#### Super
``` javascript
var factory = objectfactory(["super"], x, y);
``` 
Passing `"super"` enables the possibility to access overwritten methods with `this._super()`.

``` javascript
var n = {
	n : function(){
		return "N"
	}
}

var m = function(){
	this.n = function(){
		var n = this._super();
		return n+"M"
	}
}

var o = function(){
	this.n = function(){
		var n = this._super();
		return n+"O"
	}
}

///////////////////////////////////////////////////////////////////////////////

var factoryNM = objectfactory(n, m);
var instanceNM = factoryNM();

instanceNM.n()		// Error: this._super() not defined.

var factoryNMs = objectfactory(["super"], n, m);
var instancsNMs = factoryNMs();

instanceNM.n()		// -> "NM"

///////////////////////////////////////////////////////////////////////////////

var factoryNOs = objectfactory(["super"], n, m);  // Only use it when its needed.
var factoryMNO = objectfactory(m, factoryNOs);

var instancsMNO = factoryMNO();

instanceMNO.n()		// -> "NO"
```

#### Abstract
``` javascript
var factory = objectfactory(["abstract"], x, y);
``` 
Passing `"abstract"` enables the possiblity to define abstract methods by defining a property as `Function`. This abstract method needs to be implemented by any other module before the factory can be instanciated. To keep the modularity, abstract methods do not overwrite existing methods.

``` javascript
var t = {
	t : function(){
		return "T"
	}
}

var u = {
	t : Function
}

var v = {
	v : {
		v1 : function(){
			return "V1";
		}
	}
}

var w = {
	v : {
		v1 : Function
	}
}

///////////////////////////////////////////////////////////////////////////////

var factoryUW = objectfactory(u, v);
var instanceUW = factoryUV();		// -> { t: Function, v: {v1 : Function} }

var factoryUW = objectfactory(["abstract"], u, v);
var instanceUW = factoryUW();					// Error: Abstract Method "t" needs to be defined

///////////////////////////////////////////////////////////////////////////////

var factoryUWT = objectfactory(factoryUWa, t);
var instanceUWT = factoryUWT();					// -> { t: function(){...}, v: {v1 : Function} }

var factoryTUW = objectfactory(t, factoryUWa);	// Abstract Methods do not overwrite existing Methods.
var instanceTUW = factoryTUW();					// -> { t: function(){...}, v: {v1 : Function} }

///////////////////////////////////////////////////////////////////////////////
// Options can be combined at will – works with deep.

var factoryTW = objectfactory(["abstract"], t, w);
var instanceTW = factoryTW();					// -> { t: function(){...}, v: {v1 : Function} }

var factoryTW = objectfactory(["abstract", "deep"], t, w);
var instanceTW = factoryTW();					// Error: Abstract Method "v.v1" needs to be defined

var factoryTWV = objectfactory(["deep"], factoryTW, v);
var instanceTWV = factoryTWV();					// -> { t: function(){...}, v: {v1 : function(){...}} }
``` 

### 7. Debug Mode
Debug mode can be enabled by defining:
``` javascript
objectfactory.debug = true;
``` 
In debug mode, the complete prototype chain is preserved and visible in the inspector.
This costs performance but can be valuable for debugging. 

Debug mode disabled:
![Console Screenshot](http://www.philippadrian.com/wp-content/uploads/2013/12/consoleNotDebugMode.gif)

Debug mode enabled:
![Console Screenshot](http://www.philippadrian.com/wp-content/uploads/2013/12/consoleDebugMode.gif)

