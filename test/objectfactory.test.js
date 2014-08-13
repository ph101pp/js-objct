

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

	c.prototype.notPrivileged = function(){return c};
	c.static = function(){ return "C" }

	////////////////////////////////////////////////////////////

	var fABC = objectfactory(options, a, b, c);
	var fAB = objectfactory(options, a, b);
	var fcAB = objectfactory(options, c, fAB);
	var fABc = objectfactory(options, fAB, c);

	var fCAB = objectfactory(options, c, a, b);

	var i1ABC = fABC();
	var i2ABC = fABC();
	var i1CAB = fCAB();
	var i1ABc = fABc();
	var i1cAB = fcAB();

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

	assert.propEqual(i1ABC, i1ABc, prefix+"i(i(a,b),c) === i(a,b,c)");
	assert.propEqual(i1ABC, i1cAB, prefix+"i(c, i(a,b)) === i(a,b,c)");
}



QUnit.test( "Setup", function( assert ) {
	assert.ok( typeof objectfactory === "function", "objectfactory exists" );
});

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

QUnit.test( "Options: []", function( assert ) {
	basics(assert, ["deep", "super", "abstract"]);	
});
QUnit.test( 'Options: ["deep", "super", "abstract"]', function( assert ) {
	basics(assert, ["deep", "super", "abstract"]);	
});

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