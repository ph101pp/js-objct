#JS objectfactory

A modular JavaScript inheritance library that works nicely with browserify, CommonJS or just vanilla JavaScript.

----------------

__Keyfeatures:__

* Multiple inheritance. Objects can be modular assembled for each new class.
* Private, privileged and public methods. Closures are preserved and kept separated for each instance.
* factory objects can be extended and used with the objectfactory.
* Easy definable constructor function
* Overwritten methods can be accessed with the _super keyword.
* Possibility to define abstract classes and methods
* "Static" object methods are preserved and passed along.
* Very light weight.

----------------

I developed the objectfactory for my bachelor thesis project [jnstrument](http://jnstrument.com), where I used a node server and browserify to serve the JavaScript.

I was originally looking at the [Simple JavaScript Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/) by John Resig, but found it to be to "public". I wanted to make use of closures and "private" methods. Also instances should be separated from eachother, so that changing one wouldn't affect the others. So I started to make changes on John Resigs script and soon ended up rewriting it completely. 

The outcome of this rewrite turned out to be a light weight library that was very valuable and awesome for my project. 
It also turned out that there are other people having similar ideas and are better in explaining why this is awesome: [Fluent JavaScript – Three Different Kinds Of Prototypal OO](http://ericleads.com/2013/02/fluent-javascript-three-different-kinds-of-prototypal-oo/) by Eric Elliott.

#Documentation

1.	General
----------------
	
Get the objectfactory from GitHub or via npm by running in your terminal:

```
$ npm install objectfactory
```

Include it into your node project by calling
``` javascript
var objectfactory = require("objectfactory");
```

or into your web project by adding
 
``` html
<script src="path/to/the/file/objectfactory.js"></script>
```

And you're good to go!

	
2. Create Modular Factories
----------------

``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

// A
var a = {
	a : "A",					
	getA : function(){
		return this.a;
	},
	getValue:function(){
		return this.a;
	}
}

// B
var b =  function(){};
b.prototype.b = "B";
b.prototype.getB = function(){
	return this.b
}
b.prototype.getValue = function(){
	return this.b
}

// C
var c = function (){	
	this.c = "C";
	this.getC = function(){
		return this.c;
	}	
	this.getValue = function(){
		return this.c;
	}
}

///////////////////////////////////////////////////////////////////////////////

var factoryABC 	= objectfactory(a, b, c);
var factoryB	= objectfactory(b);
var factoryBC 	= factoryB.extend(c);
var factoryCB 	= objectfactory(c).extend(factoryB);
	
///////////////////////////////////////////////////////////////////////////////

var instanceABC = factoryABC();	// is the same as: new factoryABC();
								// {a:"A", b:"B", c:"C", getA:function, getB:function, getC:function, getValue:function}

instanceABC.getA();				// A
instanceABC.getB();				// B
instanceABC.getC();				// C

///////////////////////////////////////////////////////////////////////////////

var instanceB 	= factoryB();
var instanceB2 	= factoryB();

instanceB.getB();				// B
instanceB2.getB();				// B

instanceB.b = "X";

instanceB.getB();				// X
instanceB2.getB();				// B -> instances are completely separated. Changing one doesn't affect the others.

///////////////////////////////////////////////////////////////////////////////

var instanceBC = factoryBC();
var instanceCB = factoryCB();

instanceBC.getValue();			// C
instanceCB.getVAlue();			// B -> extending methods overwrite existing methods.

```


3. Closures: Private and privileged methods.
----------------

Closures are preserved.

``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

// A
var a = {
	a : "A",					
	getA : function(){
		return this.a;
	},
	getValue:function(){
		return this.a;
	}
}

// B
var b = function (){	
	var b = "B";

	var getValue = function(){
		return b;
	}

	this.getB = function(){
		return getValue();
	}	

	this.setB = function(_b){
		b = _b;
	}

}

///////////////////////////////////////////////////////////////////////////////

var factoryAB 	= objectfactory(a, b);

var instanceAB = factoryAB();	
var instanceAB2 = factoryAB();	

instanceAB.getA();				// A
instanceAB.getB();				// B -> private method getValue is accessible from within the closure (privileged methods)
instanceAB.getValue();			// A -> private method getValue doesn't overwrite anything.

instanceAB2.getB();				// B
instanceAB2.setB("X");					
instanceAB2.getB();				// X -> private variable changed in instanceAB2

instanceAB.getB();				// B -> Private variable of instanceAB is untouched.

```

4. "static" function object properties
---------------

All "static" properties of the extending function objects are preserved and are available as "static" properties on the objectfactory object.

``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

// A
var a =  function(){};
a.prototype.a = "A";
a.prototype.getA = function(){
	return this.a
}
a.prototype.getValue = function(){
	return this.a
}

a.defaultA = "A";
a.getDefault = function(){ 	
	return "A";
}

// B
var b = function (){	
	var b = "B";

	var getValue = function(){
		return b;
	}

	this.getB = function(){
		return getValue();
	}	

	this.setB = function(_b){
		b = _b;
	}
}

b.defaultB = "B";
b.getDefault = function(){ 
	return "B";
}

///////////////////////////////////////////////////////////////////////////////

var factoryAB 	= objectfactory(a, b);

var instanceAB = factoryAB();	

factoryAB.defaultA 				// A
factoryAB.defaultB				// B
factoryAB.getDefault()			// B -> extending static methods overwrite existing static methods.

instanceAB.defaultA 			// undefined
instanceAB.defaultB				// undefined
instanceAB.getDefault()			// undefined


```

5. Constructor
----------------

A public construct() method will be used as constructor and called on instanciation of the class.

If the return value of the constructor is a function or an object, this will be returned instead of the newly created object reference. All other return values get omitted.


``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

var Car = objectfactory({

	brand:null,

	construct : function(brand){
		this.brand = brand;
		return "new car";						// omitted
	},

	drive : function(){
		return "driving";
	}

});

///////////////////////////////////////////////////////////////////////////////

var BrokenCar = Car.extend(function(){

	this.construct = function(brand){
		return { brand:brand };					// not omitted
	}

});

///////////////////////////////////////////////////////////////////////////////

var mini 			= new Car("Mini");			// { brand:"Mini", 	construct:Function,	drive:Function };
var smart 			= new Car("Smart");			// { brand:"Smart", construct:Function,	drive:Function };
var brokenFiat		= new BrokenCar("Fiat");	// { brand:"Fiat" };

mini.brand;										// "Mini"
mini.drive();									// driving

smart.brand;									// "Smart"
smart.drive();									// driving
	
brokenFiat.brand;								// "Fiat"
brokenFiat.drive();								// undefined
```

3. _super Keyword
----------------

Overwritten methods can be accessed by this._super().

``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

var Car = objectfactory(function(){

	this.getDescription = function(){
		return "Standard car";
	}

});

///////////////////////////////////////////////////////////////////////////////

var FeatureAirConditioner =  {

	getDescription : function(){
		return this._super()+" with AC";
	}

}

///////////////////////////////////////////////////////////////////////////////

var FeatureNavi = function (){

	this.getDescription = function(){
		return this._super()+" and navi";
	}

}

///////////////////////////////////////////////////////////////////////////////

var Mini 		= Car.extend(FeatureAirConditioner);
var Smart 		= Car.extend(FeatureNavi);
var Fiat 		= Car.extend(FeatureAirConditioner).extend(FeatureNavi);

///////////////////////////////////////////////////////////////////////////////

var mini 		= new Mini();	
var smart 		= new Smart();	
var fiat 		= new Fiat();		

mini.getDescription();			// "Standard car with AC"
smart.getDescription();			// "Standard car and navi"
fiat.getDescription();			// "Standard car with AC and navi"
```




``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

var Car = objectfactory(function(){

	var brand;

	this.construct = function(_brand){
		brand=_brand;
	}

	this.drive = function(){
		return brand+"driving";
	}

});

///////////////////////////////////////////////////////////////////////////////

var FeatureCargoArea =  function(){

	var cargo = [],

		areaSize;

	var checkCargo = function(){
		return cargo.length <= areaSize ? true : false;
	}

	this.construct = function(_brand, _areaSize){
		areaSize=_areaSize;
		this.super(_brand);
	}

	this.addCargo = function(_cargo){
		if( checkCargo() ) {
			cargo.push(_cargo);
			return _cargo+" loaded";
		}
		else return "Cargo area full";
	}

	this.getCargo = function(){
		return cargo.join(", ");
	}

}

///////////////////////////////////////////////////////////////////////////////

var Pickup 			= Car.extend(FeatureCargoArea);

///////////////////////////////////////////////////////////////////////////////

var mini 			= new Car("Mini");	
var smallPickup		= new Pickup("Ford", 1);	
var largerPickup	= new Pickup("Ford", 3);	

mini.drive();						// "Mini driving"

smallPickup.drive();				// "Ford driving"
smallPickup.addCargo("Surfboard");	// "Surfboard loaded"
smallPickup.addCargo("Grill");		// "Sorry, cargo area full"
smallPickup.getCargo();				// "Boat, Surfboard"
smallPickup.checkCargo();			// undefined


largerPickup.drive();				// "Ford driving"
largerPickup.addCargo("Surfboard");	// "Surfboard loaded"
largerPickup.addCargo("BBQ");		// "BBQ loaded"
largerPickup.addCargo("Beer");		// "Beer loaded"
largerPickup.addCargo("Scooter");	// "Sorry, cargo area full"
largerPickup.getCargo();			// "Boat, Surfboard, Grill, Meat, Beer"
largerPickup.checkCargo();			// undefined
```



5. Abstact classes and methods
----------------

It is possible to define a class/module abstract. This class can't be initiated itself but has to be extended.
In abstract classes, abstract methods can be defined by defining the method as the Function object.
Existing Methods can't be overwritten by abstract methods.

``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

var Car = objectfactory.abstract(function(){

	var brand;

	this.construct = function(_brand){
		brand=_brand
	}

	this.drive = Function;

	this.slowDown = function(){
		return "slowing down";
	}

});

///////////////////////////////////////////////////////////////////////////////

var Mini = Car.extend(function(){

	this.hasNavi = true;

}

///////////////////////////////////////////////////////////////////////////////

var Smart = Car.extend(function(){

	this.drive= function(){
		return "driving"
	}

}

///////////////////////////////////////////////////////////////////////////////

var Pickup = Car.extend.abstract(){

	this.hasCargoArea = true;

}

///////////////////////////////////////////////////////////////////////////////

var Ford = Pickup.extend(function(){	

	this.drive=function(){
		return "driving with 4x4";
	}		

});

///////////////////////////////////////////////////////////////////////////////

var CustomBreaks = Car.extend.abstract(function(){
	
	this.slowDown = Function;
	
}

///////////////////////////////////////////////////////////////////////////////

var Fiat = Car.extend.abstract(CustomBreaks).extend(function(){
	
	this.drive= function(){
		return "driving";
	}
	
});

///////////////////////////////////////////////////////////////////////////////


var Car 			= new Car();			// Error "Abstract class may not be constructed."
var mini 			= new Mini();			// Error "Abstract method 'drive' needs to be defined."
var smart 			= new Smart();		
var pickup 			= new Pickup();			// Error "Abstract class may not be constructed."
var ford  			= new Ford();	
var customBreaks	= new CustomBreaks(); 	// Error "Abstract class may not be constructed."
var fiat  			= new Fiat();			// Error "Can't override 'slowDown' with abstract method."


smart.drive()					// "driving"
smart.slowDown()				// "slowing down"

ford.drive()					// "driving with 4x4"
ford.slowDown()					// "slowing down"
ford.hasCargoArea;				// true
```


6. instanceof
---------------

The native instanceof operator works for the first child of the objectfactory. 
This allows the extension of native objects or third party libraries. So the extended object will pass any validation tests in the library etc.

For all other extended Classes, a public instanceof method is provided that works for all extended classes.

If there already is a public instanceof method the objectfactory instancof method will be called _instanceof instead.



``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

var Car = function(){

	this.drive = function(){
		return "driving"
	}

};

///////////////////////////////////////////////////////////////////////////////

var FeatureNavi = function (){	

	this.hasNavi=function(){
		return true;
	}

}

///////////////////////////////////////////////////////////////////////////////

var FeatureAC = function (){	

	this.hasAC=function(){
		return true;
	}

}

///////////////////////////////////////////////////////////////////////////////

var MyCar 	= objectfactory.extend(Car).extend(FeatureNavi).extend(FeatureAC);

///////////////////////////////////////////////////////////////////////////////

var car = new MyCar();


car instanceof Car 				// true
car instanceof featureNavi		// false
car instanceof featureAC 		// false
car instanceof MyCar 			// false


car.instanceof(Car) 			// true
car.instanceof(featureNavi)		// true
car.instanceof(featureAC) 		// true
car.instanceof(MyCar) 			// true
```

7. "static" function object properties
---------------

All "static" properties of the extending function objects are passed along and are available as "static" properties on the objectfactory object.
Here also overwritten functions are accessible via the this._super keyword.

``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

var Car = function(){

	this.drive = function(){
		return "driving"
	}

}

Car.push= function() {
	return "pushing car"
}

///////////////////////////////////////////////////////////////////////////////

var FeatureNavi = function (){	

	this.hasNavi=function(){
		return true;
	}

}

FeatureNavi.useMap = function(){
	return "using map";	
}


FeatureNavi.push= function() {
	return this._super()+" and navi"
}

///////////////////////////////////////////////////////////////////////////////

var MyCar 	= objectfactory.extend(Car).extend(FeatureNavi);

///////////////////////////////////////////////////////////////////////////////

var car = new MyCar();

MyCar.push();		// "pushing car and navi"
MyCar.useMap();		// "using map"

car.push();			// undefined
car.useMap();		// undefined
```

7. Nice display in inspector
---------------

``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

var Car = function(){

	this.drive = function(){
		return "driving"
	}

};

///////////////////////////////////////////////////////////////////////////////

var Truck = function (){	

	this.has4x4=function(){
		return true;
	}

}

///////////////////////////////////////////////////////////////////////////////

var Pickup = function (){	

	this.hasCargoArea=function(){
		return true;
	}

}

///////////////////////////////////////////////////////////////////////////////

var PickupTruck 	= objectfactory.extend(Car).extend(Truck).extend(Pickup);

///////////////////////////////////////////////////////////////////////////////

var myTruck = new PickupTruck();

console.log(myTruck);
```
![Console Screenshot](http://greenish.github.io/js-objectfactory/objectfactoryConsole.png)

