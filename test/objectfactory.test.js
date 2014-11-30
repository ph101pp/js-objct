var runTests = function(name, options, debug){
	options = options || [];

	QUnit.test( name, function( assert ) {

  	news(assert, options);
  	extend(assert, options);

	});
}

////////////////////////////////////////////////////////////////
var extend = function(assert, options) {
	var prefix = "Basics Extend: ";
	var arg = "arg";
	var a = {
	    a : "A",                    
	    getA : function(){ return this.a },
	    getValue:function(){ 
	       	return this.a; 
	    }
	}

	////////////////////////////////////////////////////////////

	var b =  function(){
		this.getB = function(){ return this.b }	
	};
	b.prototype.b = "B";
	b.prototype.getValue = function(){ 
		return this.b 
	}

	b.static = function(){ return "B" }

	////////////////////////////////////////////////////////////

	var c = function (param){    
			assert.strictEqual( param, arg, prefix+" Arguments passed to constructor");
	    var c = "C";    // private property
	    this.getC = function(){ return c }  
	    this.getValue = function(){ return c}
	}

	c.static = function(){ return "C" }

	////////////////////////////////////////////////////////////

	var fABC = objectfactory(a, b, c);
	var i1ABC = fABC(arg);
	var i2ABC = fABC(arg);


	assert.strictEqual( typeof fABC , "function", prefix+"Factory f(a,b,c) is Function");
	assert.strictEqual( typeof i1ABC , "object", prefix+"Instance i(a,b,c) is Object");
	assert.strictEqual(i1ABC, a, prefix+"i(a,b,c) === a");

	assert.strictEqual(i1ABC.getA(), "A", prefix+"i(a,b,c).getA() === 'A'");
	assert.strictEqual(i1ABC.getB(), "B", prefix+"i(a,b,c).getB() === 'B'");
	assert.strictEqual(i1ABC.getC(), "C", prefix+"i(a,b,c).getC() === 'C'");

	assert.strictEqual(i1ABC.a, "A", prefix+"i(a,b,c).a === 'A'");
	assert.strictEqual(i1ABC.b, "B", prefix+"i(a,b,c).b === 'B'");
	assert.strictEqual(i1ABC.c, undefined, prefix+"i(a,b,c).c === undefined");

	assert.strictEqual(i1ABC.getValue(), "C", prefix+"i(a,b,c).getValue() === 'C'");

	assert.strictEqual(fABC.static(), "C", prefix+"f(a,b,c).static() === 'C'");


	i2ABC.a="X";
	assert.ok( i1ABC.a === "X" && i2ABC.a === "X" && a.a === "X", prefix+"i(a,b,c).a === i2(a,b,c).a === a.a");


	var a = {
    a : "A",                    
    getA : function(){ return this.a },
    getValue:function(){ 
       	return this.a; 
    }
	}

	var fCBA = objectfactory(function(){return c;}, b, a);
	var i1CBA = fCBA(arg);

	assert.strictEqual( typeof fCBA , "function", prefix+"Factory f(c, b, a) is Function");
	assert.strictEqual( typeof i1CBA , "function", prefix+"Instance i(c, b, a) is Function");
	assert.strictEqual(i1CBA, c, prefix+"i(c,b,a) === c");

	assert.strictEqual(fCBA.static(), "B", prefix+"f(c,b,a).static() === 'B'");
	assert.strictEqual(i1CBA.static(), "C", prefix+"i(c,b,a).static() === 'C'");

	assert.strictEqual(i1CBA.getA(), "A", prefix+"i(c,b,a).getA() === 'A'");
	assert.strictEqual(i1CBA.getB(), "B", prefix+"i(c,b,a).getB() === 'B'");
	assert.strictEqual(i1CBA.getC, undefined, prefix+"i(c,b,a).getC is undefined");

	assert.strictEqual(i1CBA.a, "A", prefix+"i(c,b,a).a === 'A'");
	assert.strictEqual(i1CBA.b, "B", prefix+"i(c,b,a).b === 'B'");

	assert.strictEqual(i1CBA.getValue(), "A", prefix+"i(c,b,a).getValue() === 'A'");

	var c = function (){    
    var c = "C";    // private property
    this.getC = function(){ return c }  
    this.getValue = function(){ return c}
	}

	c.static = function(){ return "C" }

	var d = function(param){
		assert.strictEqual( param, arg, prefix+" Arguments passed to constructor");
	}
	d.prototype.d = "D";
	d.prototype.getValue = function(){ return this.d }; 


	var fDACB = objectfactory(d, a, c, b);
	var i1DACB = fDACB(arg);
	var i2DACB = fDACB(arg);

	assert.ok(i1DACB instanceof d, prefix+" i(d,a,c,b) instanceof d");

	d.prototype.d = "X";

	// assert.ok( i1DACB.d === "X" && i2DACB.d === "X", prefix+"i(a,b,c).d === i2(a,b,c).d === 'X' -> prototype reference kept");


}

////////////////////////////////////////////////////////////////

var news = function(assert, options) {
	var prefix = "Basics New: ";
	var arg = "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arg, prefix+" Arguments passed to constructor");
    var c = "C";    // private property
    this.getC = function(){ return c }  
    this.getValue = function(){ return c}
	}

	c.static = function(){ return "C" }

	////////////////////////////////////////////////////////////

	var fABC = new objectfactory(a, b, c);
	var fAB = new objectfactory(a, b);
	var fcAB = new objectfactory(c, fAB);
	var fABc = new objectfactory(fAB, c);

	var fciAB = new objectfactory(c, fAB());
	var fiABc = new objectfactory(fAB(), c);

	var fCAB = new objectfactory(c, a, b);

	var i1ABC = fABC(arg);
	var i2ABC = fABC(arg);
	var i1CAB = fCAB(arg);
	var i1ABc = fABc(arg);
	var i1cAB = fcAB(arg);

	var i1iABc = fiABc(arg);
	var i1ciAB = fciAB(arg);

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
	
	assert.propEqual(i1ABC, i1cAB, prefix+"i(c, f(a,b)) === i(a,b,c)");
	assert.propEqual(i1ciAB, i1cAB, prefix+"i(c, i(a,b)) === i(a,b,c)");
}

////////////////////////////////////////////////////////////////

var inputs = function( assert ) {
	
	assert.ok(objectfactory({},function(){},{})(), "Ok: N Params - Objects and Functions" );
	assert.ok(new objectfactory(function(){},{})(), "Ok: First Params Function Return ommitted when !extend -> new");
	assert.ok(objectfactory(function(){return {}},{},function(){},{})(), "Ok: First Params Function Return - Object" );
	assert.ok(objectfactory(function(){return function(){}},{},function(){},{})(), "Ok: First Params Function Return - Function" );
	assert.ok(objectfactory(true), "Ok: 1st Param - Boolean" );

	assert.throws( function(){
		objectfactory([])()
	}, /Unexpected 'array'/, "Threw: 1st Param - Unexpected Array" );

	assert.throws( function(){
		objectfactory("")()
	}, /Unexpected 'string'/, "Threw: 1st Param - Unexpected String" );

	assert.throws( function(){
		objectfactory(1)()
	}, /Unexpected 'number'/, "Threw: 1st Param - Unexpected Number" );

	// assert.throws( function(){
	// 	objectfactory(false)()
	// }, /Unexpected 'boolean'/, "Threw: 1st Param - Unexpected Boolean" );

	assert.throws( function(){
		objectfactory(function(){},{}, [])()
	}, /Unexpected 'array'/, "Threw: Ntn Param - Unexpected Array" );

	assert.throws( function(){
		objectfactory(function(){},{}, "")()
	}, /Unexpected 'string'/, "Threw: Ntn Param - Unexpected String" );

	assert.throws( function(){
		objectfactory(function(){},{}, 1)()
	}, /Unexpected 'number'/, "Threw: Ntn Param - Unexpected Number" );	

	assert.throws( function(){
		objectfactory(function(){},{}, true)()
	}, /Unexpected 'boolean'/, "Threw: Ntn Param - Unexpected Boolean" );	

}


QUnit.test( "Input Type Handling", inputs);
QUnit.test( "Basics new: new f()", news);
QUnit.test( "Basics extend: f()", extend);

// runTests('Options: ["abstract"]', ["abstract"]);
// runTests('Options: ["super", "deep"]', ["super","deep"]);
// runTests('Options: ["super"]', ["super"]);
// runTests('Options: ["deep", "super", "abstract"]',["deep", "super", "abstract"]);
// runTests("Options: [], debug: true", [], true);
