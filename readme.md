# Objct
A fast, modular oop-inheritance library for javascript. Minimal basics combined with powerfull decorators. 

[![npm version](https://badge.fury.io/js/objct.svg)](http://badge.fury.io/js/objct)

- [About](#about)
- [Features](#features)
- [objct](#objct)
  - [objct()](#objct--)
  - [objct.extend()](#objctextend--)
  - [new](#new)
- [objct.e](objct-e)
  - [objct.e()](#objct--)
  - [objct.e.extend()](#objctextend--)
  - [Decorators](#sdaf)
    - [Deep](#adsf)
    - [Modify](#adsf)
  - [Create Custom Decorators](#sdfa)
- [API](#api)
  - objct()
  - objct.extend()
  - objct.isObjct()
  - objct.isArray()
  - objct.e()
  - objct.e.extend()
  - objct.e.decorator()
- [License](#license)



## About
_Objct_ has originally been developed for visual programming in ThreeJS where independent instances of modules were essential to keep my molecules from interfering with each other. The task of creating, combining and instanciating modules/objects while preserving all necessary closures to keep them separate quickly became complex and tedious. I needed a solid and easy to use solution which was the birth of this library. Since then _Objct_ has proven to be invaluable in multiple projects and has constantly been improved and reduced to the max with each new usecase.


## Features

* Light weight and fast.
* No new syntax: Private, privileged and public method definitions work as usual.
* "Multiple inheritance". Objects can be modular assembled for each object.
* Objcts can be extended and used with _Objct_.
* Closures are preserved for each new instance.
* Easily extendable with powerfull decorators.



## objct()

`objct()` combines `functions`(A), `objects`(B) and `objcts`(C) into a new `objct`. 

`objcts` are factories that - when called - create a new, independent instance of the combined modules by instanciating all passed in `functions` before combining them with the `objects`.

__A) functions__

__B) objects__

__C) objcts__



### 1.	General	

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

