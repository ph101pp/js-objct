#JS objectfactory

A JavaScript modular inheritance class that works nicely with browserify, CommonJS or just vanilla JavaScript.

----------------

__Keyfeatures:__

* Functions and Objects can extend and be extended.
* Easy definable constructor function
* Overwritten methods can be accessed with the _super keyword.
* Objects can be modular assembled for each new class.
* Private, privileged and public methods. Closures are preserved and kept separated for each instance.
* Possibility to define abstract classes and methods
* "Static" object methods are preserved and passed along.

----------------

I developed the objectfactory for my bachelor thesis project [jnstrument](http://jnstrument.com), where I used a node server and browserify to serve the JavaScript.

Because this class turned out to be pretty valuable I decided to create this spin off project.

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

	
2. Extend Public Methods and Properties
----------------

``` javascript
var objectfactory = require("objectfactory");

///////////////////////////////////////////////////////////////////////////////

var standardCar = {					
	drive : function(){
		return "driving";
	}

}

///////////////////////////////////////////////////////////////////////////////

var FeatureAirConditioner =  function(){};

FeatureAirConditioner.prototype.hasAC = true;

///////////////////////////////////////////////////////////////////////////////

var FeatureNavi = function (){	

	this.hasNavi=function(){
		return true;
	}

}

///////////////////////////////////////////////////////////////////////////////

var Mini 		= objectfactory(standardCar, FeatureAirConditioner);
var Smart 		= objectfactory(standardCar).extend(FeatureNavi);
var Fiat 		= objectfactory(standardCar).extend(FeatureAirConditioner).extend(FeatureNavi);

var CustomSmart = Smart.extend(FeatureAirConditioner);

///////////////////////////////////////////////////////////////////////////////

var smart 		= Smart(); 				// Error: "Classes need to be initiated with the new operator."

var car 		= new standardCar();	// { drive:Function }
var smart 		= new Smart();			// { drive:Function, hasNavi:Function }
var mini 		= new Mini();			// { drive:Function, hasAC:true }
var fiat 		= new Fiat();			// { drive:Function, hasAC:true, hasNavi:Function }
var customSmart = new CustomSmart();	// { drive:Function, hasAC:true, hasNavi:Function }


car.hasNavi(); 									// undefined
car.hasAC; 										// undefined
car.drive();									// driving

smart.hasNavi(); 								// true
smart.hasAC; 									// undefined
smart.drive();									// driving

mini.hasNavi();									// undefined
mini.hasAC;										// true
mini.drive();									// driving

fiat.hasNavi();						 			// true
fiat.hasAC;										// true
fiat.drive();									// driving

customSmart.hasNavi(); 							// true
customSmart.hasAC;								// true
customSmart.drive();							// driving
```

2. Constructor
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


4. Private Methods and Properties
----------------

On Initiation each extended function is initiated seperately. 
So private methods and properties are kept private and separated of other instances.

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

