var runTests = function(name, options, debug){
	options = options || [];

	QUnit.test( name, function( assert ) {
		objectfactory.debug = debug;
		basics(assert, options);
		constructors(assert, options);	
		instancesof(assert, options);
		objectfactory.debug = false;	
	});
}

var instancesof = function(assert, options) {
	options = options || [];
	var prefix = "InstanceOf: ";
	var a = {
	    a : "A",                    
	}

	////////////////////////////////////////////////////////////

	var b =  function(){};
	b.prototype.b = "B";

	////////////////////////////////////////////////////////////

	var c = function (){    
	    var c = "C";    // private property
	}
	////////////////////////////////////////////////////////////

	var fBC = objectfactory(b, c);
	var iBC = fBC();
	
	var fABC = objectfactory(a, fBC);
	var iABC = fABC();

	var fiABC = objectfactory(a, iBC);
	var iiABC = fiABC();

	assert.strictEqual(iBC.instanceof(a), false, prefix+"i(b,c) !-> a");

	assert.strictEqual(iABC.instanceof(a), true, prefix+"i(a,f(b,c)) -> a");
	assert.strictEqual(iABC.instanceof(b), true, prefix+"i(a,f(b,c)) -> b");

	assert.strictEqual(iABC.instanceof(iABC), true, prefix+"i(a,f(b,c)) -> i(a,f(b,c))");
	assert.strictEqual(iABC.instanceof(fABC), true, prefix+"i(a,f(b,c)) -> f(a,f(b,c))");

	assert.strictEqual(iABC.instanceof(fBC), true, prefix+"i(a,f(b,c)) -> f(b,c))");

	assert.strictEqual(iiABC.instanceof(a), true, prefix+"i(a,i(b,c)) -> a");
	assert.strictEqual(iiABC.instanceof(b), true, prefix+"i(a,i(b,c)) -> b");

	assert.strictEqual(iiABC.instanceof(iiABC), true, prefix+"i(a,i(b,c)) -> i(a,i(b,c))");
	assert.strictEqual(iiABC.instanceof(fiABC), true, prefix+"i(a,i(b,c)) -> f(a,i(b,c))");

	assert.strictEqual(iiABC.instanceof(iBC), true, prefix+"i(a,i(b,c)) -> i(b,c))");
}

////////////////////////////////////////////////////////////////

var constructors = function(assert, options){
	options = options || [];
	var prefix = "Constructors: ";
	var ran = {
		a:false,
		b:false,
		c:false,
		construct:false,
	}
	var testParam = ["test", {},[]];
	var a = function(params){
		this.a = "A";
		ran.a = true;

		assert.strictEqual(this.a, "A", prefix+"i(a,b,c).a defined in a()");
		assert.strictEqual(this.b, undefined, prefix+"i(a,b,c).b not defined in a()");
		assert.strictEqual(this.c, undefined, prefix+"i(a,b,c).c not defined in a()");

		assert.strictEqual(params, testParam, prefix+"Params passed to a()");

		this.construct = function(params) {
			ran.construct = true;

			assert.strictEqual(this.a, "A", prefix+"i(a,b,c).a defined in a.construct()");
			assert.strictEqual(this.b, "B", prefix+"i(a,b,c).b defined in a.construct()");
			assert.strictEqual(this.c, "C", prefix+"i(a,b,c).c defined in a.construct()");
			assert.strictEqual(params, testParam, prefix+"Params passed to a.construct()");
			
		}
	}

	////////////////////////////////////////////////////////////

	var b = function(params){
		this.b = "B";
		ran.b = true;

		assert.strictEqual(this.a, "A", prefix+"i(a,b,c).a defined in b()");
		assert.strictEqual(this.b, "B", prefix+"i(a,b,c).b defined in b()");
		assert.strictEqual(this.c, undefined, prefix+"i(a,b,c).c not defined in b()");
		assert.strictEqual(params, testParam, prefix+"Params passed to b()");

	}

	////////////////////////////////////////////////////////////

	var c = function(params){
		this.c = "C";
		ran.c = true;

		assert.strictEqual(this.a, "A", prefix+"i(a,b,c).a defined in c()");
		assert.strictEqual(this.b, "B", prefix+"i(a,b,c).b defined in c()");
		assert.strictEqual(this.c, "C", prefix+"i(a,b,c).c defined in c()");
		assert.strictEqual(params, testParam, prefix+"Params passed to c()");
	}

	////////////////////////////////////////////////////////////

	var fABC = objectfactory(options, a, b, c);
	var i1ABC = fABC(testParam);

	assert.ok(ran.a, prefix+"i(a,b,c) ran a()");
	assert.ok(ran.b, prefix+"i(a,b,c) ran b()");
	assert.ok(ran.c, prefix+"i(a,b,c) ran c()");
	assert.ok(ran.construct, prefix+"i(a,b,c) ran a.construct()");

}

////////////////////////////////////////////////////////////////

var basics = function(assert, options) {
	options = options || [];
	var prefix = "Basics: ";
	var a = {
	    a : "A",                    
	    getA : function(){ return this.a },
	    getValue:function(){ 
	       	return this.a; 
	    }
	}

	////////////////////////////////////////////////////////////

	var b =  function(){};
	b.prototype.b = "B";
	b.prototype.getB = function(){ return this.b }
	b.prototype.getValue = function(){ 
		return this.b 
	}

	b.static = function(){ return "B" }

	////////////////////////////////////////////////////////////

	var c = function (){    
	    var c = "C";    // private property
	    this.getC = function(){ return c }  
	    this.getValue = function(){ return c}
	}

	c.static = function(){ return "C" }

	////////////////////////////////////////////////////////////

	var fABC = objectfactory(options, a, b, c);
	var fAB = objectfactory(options, a, b);
	var fcAB = objectfactory(options, c, fAB);
	var fABc = objectfactory(options, fAB, c);

	var fciAB = objectfactory(options, c, fAB());
	var fiABc = objectfactory(options, fAB(), c);

	var fCAB = objectfactory(options, c, a, b);

	var i1ABC = fABC();
	var i2ABC = fABC();
	var i1CAB = fCAB();
	var i1ABc = fABc();
	var i1cAB = fcAB();

	var i1iABc = fiABc();
	var i1ciAB = fciAB();

	assert.strictEqual( typeof fABC , "function", prefix+"Factory f(a,b,c) is Function");
	assert.strictEqual( typeof i1ABC , "object", prefix+"Instance i(a,b,c) is Object");
	assert.strictEqual(i1ABC.getA(), "A", prefix+"i(a,b,c).getA() === 'A'");
	assert.strictEqual(i1ABC.getB(), "B", prefix+"i(a,b,c).getB() === 'B'");
	assert.strictEqual(i1ABC.getC(), "C", prefix+"i(a,b,c).getC() === 'C'");

	assert.strictEqual(i1ABC.a, "A", prefix+"i(a,b,c).a === 'A'");
	assert.strictEqual(i1ABC.b, "B", prefix+"i(a,b,c).b === 'B'");
	assert.strictEqual(i1ABC.c, undefined, prefix+"i(a,b,c).c === undefined");

	assert.strictEqual(i1ABC.getValue(), "C", prefix+"i(a,b,c).getValue() === 'C'");
	assert.strictEqual(i1CAB.getValue(), "B", prefix+"i(c,a,b).getValue() === 'B'");


	assert.strictEqual(fABC.static(), "C", prefix+"f(a,b,c).static() === 'C'");
	assert.strictEqual(fCAB.static(), "B", prefix+"f(c,a,b).static() === 'B'");

	i2ABC.a="X";
	assert.ok( i1ABC.a === "A" && i2ABC.a === "X", prefix+"Instance i(a,b,c).a separate from i2(a,b,c).a");

	assert.propEqual(i1ABC, i1ABc, prefix+"i(f(a,b),c) === i(a,b,c)");
	assert.propEqual(i1iABc, i1ABc, prefix+"i(i(a,b),c) === i(a,b,c)");
	
	if(objectfactory.debug !== true) {
		assert.propEqual(i1ABC, i1cAB, prefix+"i(c, f(a,b)) === i(a,b,c)");
		assert.propEqual(i1ciAB, i1cAB, prefix+"i(c, i(a,b)) === i(a,b,c)");
	}
}

////////////////////////////////////////////////////////////////

QUnit.test( "Input Type Handling", function( assert ) {
	
	assert.ok(objectfactory(function(){},{},function(){},{}), "Ok: N Params - Objects and Functions" );
	assert.ok(objectfactory(true), "Ok: 1st Param - Boolean" );
	assert.ok(objectfactory([]), "Ok: 1st Param - Empty Array" );
	assert.ok(objectfactory(["deep", "abstract", "super", true]), "Ok: 1st Param - Predefined Array" );
	assert.ok(function(){
		objectfactory("deep");
		objectfactory("abstract");
		objectfactory("super");
		return true;
	}(), "Ok: 1st Param - Predefined String" );

	assert.throws( function(){
		objectfactory(["deep","hallO"])
	}, /Unexpected 'array'/, "Threw: 1st Param - Unexpected String in Array" );

	assert.throws( function(){
		objectfactory(["deep",false])
	}, /Unexpected 'array'/, "Threw: 1st Param - Unexpected Boolean in Array" );

	assert.throws( function(){
		objectfactory("")
	}, /Unexpected 'string'/, "Threw: 1st Param - Unexpected String" );

	assert.throws( function(){
		objectfactory(1)
	}, /Unexpected 'number'/, "Threw: 1st Param - Unexpected Number" );

	assert.throws( function(){
		objectfactory(function(){},{}, false)
	}, /Unexpected 'boolean'/, "Threw: 1st Param - Unexpected Boolean" );

	assert.throws( function(){
		objectfactory(function(){},{}, [])
	}, /Unexpected 'array'/, "Threw: Ntn Param - Unexpected Array" );

	assert.throws( function(){
		objectfactory(function(){},{}, "")
	}, /Unexpected 'string'/, "Threw: Ntn Param - Unexpected String" );

	assert.throws( function(){
		objectfactory(function(){},{}, 1)
	}, /Unexpected 'number'/, "Threw: Ntn Param - Unexpected Number" );	

	assert.throws( function(){
		objectfactory(function(){},{}, true)
	}, /Unexpected 'boolean'/, "Threw: Ntn Param - Unexpected Boolean" );	

});

runTests("Options: []");
runTests('Options: ["deep", "super", "abstract"]',["deep", "super", "abstract"]);
runTests("Options: [], debug: true", [], true);


////////////////////////////////////////////////////////////

var d = {
    construct : function(argument){
        console.log("construct "+argument);
        return argument;
    },

    instanceof : function(test){


    	return "hallo"+this._super(test);
    }
}

////////////////////////////////////////////////////////////

var e = {
    e : "E",    
    x : {
        x1 : Function,
        x2 : "B",
        x3 : "C"
    }
}
////////////////////////////////////////////////////////////

var f = {
    f : Function,    
    x : {
        x1 : "A",
        x2 : "B",
        x3 : "C"
    }
}

var g = {
	f: function(){},
	x : {
		x1:function(){}
	}
}

var h = {
	x: {
		x2 :function(){}
	}
}