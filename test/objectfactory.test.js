var runTests = function(name, options, debug){
	options = options || [];

	QUnit.test( name, function( assert ) {
		objectfactory.debug = debug;

  		basics(assert, options);
		constructors(assert, options);	
		instancesof(assert, options);
		deeps(assert, options);
		abstracts(assert, options);

		objectfactory.debug = false;	
	});
}

var abstracts = function(assert, options) {
	var prefix;
	var a = {
	    a : "A",
	    b : "B",   
	    x : {
	        x1 : Function,
	        x2 : "B",
	        x3 : "C"
	    }
	}

	////////////////////////////////////////////////////////////

	var b = {
	    b : Function,    
	    x : {
	        x1 : "A",
	        x2 : "B",
	        x3 : "C"
	    }
	}

	////////////////////////////////////////////////////////////

	var c = {
		b: function(){},
	}

	////////////////////////////////////////////////////////////

	var d = {
		x: {
			x1 :function(){}
		}
	}

	////////////////////////////////////////////////////////////

	var e = {
		e : ["a", function(){}]
	}

	////////////////////////////////////////////////////////////

	var f = {
		e : ["x", Function]
	}

	var fAB = objectfactory(options, a, b);
	var fBA = objectfactory(options, b, a);
	
	var fAC = objectfactory(options, a, c);
	var fAD = objectfactory(options, a, d);

	var fBC = objectfactory(options, b, c);
	var fCB = objectfactory(options, b, c);

	var fCF = objectfactory(options, c, f);
	var fEF = objectfactory(options, e, f);


	if(options.indexOf("abstract") >= 0) {
		prefix ="+Abstract: ";

		assert.throws( function(){
			fAB();
		}, /Abstract method/, prefix+"i(a, b) threw: Abstract method not defined" );

		assert.throws( function(){
			fBA();
		}, /Abstract method/, prefix+"i(b, a) threw: Abstract method not defined" );
		
		assert.ok(fBC(), prefix+"i(b, c) ok.");
		assert.ok(fCB(), prefix+"i(c, b) ok.");


		if(options.indexOf("deep") >= 0) {
			prefix ="+Abstract +Deep: ";
			
			assert.throws( function(){
				fAC();
			}, /Abstract method/, prefix+"i(a, c) threw: Abstract method not defined" );
		
			assert.ok(fAD(), prefix+"i(a, d) ok.");			

			assert.throws( function(){
				fCF();
			}, /Abstract method/, prefix+"i(c, f) threw: Abstract method not defined" );

			//assert.ok(fEF(), prefix+"i(e, f) ok."); // Should be true! but is'nt.. Array handling needs to be implemented properly.
		}
		else {
			prefix ="+Abstract -Deep: ";

			assert.ok(fAC(), prefix+"i(a, c) ok.");			
			assert.ok(fCF(), prefix+"i(c, f) ok.");
		}

	}
	else {
		prefix ="-Abstract: ";
		
		assert.ok(fAB(), prefix+"i(a, b) ok." );
		assert.ok(fBA(), prefix+"i(b, a) ok." );
	}

	



}

////////////////////////////////////////////////////////////////

var deeps = function(assert, options){
	var prefix = "Deep: ";

	var a = function(){
		this.x = {
    		x0 : ["Da", "Ea", "Fa"],
    		x1 : "Aa",
     		x2 : "Ba",
			x3 : "Ca"
		};
		this.y = [
			{
				y0 : "Da",
				y1 : "Ea",
				y2 : "Fa"				
			},
			"Aa",
			"Ba",
			"Ca"
		];
	}

	var b = {
		x : { 
    		x0 : ["Db", "Eb", "Fb"],
    		x1 : "Ab",
     		x2 : "Bb",
			x3 : "Cb"
		},
		y : [
			{
				y0 : "Db",
				y1 : "Eb",
				y2 : "Fb"				
			},
			"Ab",
			"Bb",
			"Cb"
		],
	}


	var fAB = objectfactory(options, a, b);

	var i1AB = fAB();
	var i2AB = fAB();

	assert.deepEqual(i1AB.x, b.x, prefix+"i1(a,b).x === b.x");
	assert.deepEqual(i1AB.y, b.y, prefix+"i1(a,b).y === b.y");

	i1AB.x.x1="XX";
	i1AB.x.x0.push("XX");
	i1AB.y.push("XX");
	i1AB.y[0].y1="XX";

	assert.strictEqual(i1AB.x.x1, "XX", prefix+"i1(a,b).x.x1 === 'XX'");
	assert.ok(i1AB.x.x0.indexOf("XX") >= 0, prefix+"'XX' in i1(a,b).x.x0");
	assert.strictEqual(i1AB.y[0].y1, "XX", prefix+"i1(a,b).y.y1 === 'XX'");
	assert.ok(i1AB.y.indexOf("XX") >= 0, prefix+"'XX' in i1(a,b).y");

	if(options.indexOf("deep") < 0) { // Not deep.
		prefix = "-Deep: ";

		assert.strictEqual(i2AB.x.x1, "XX", prefix+"i2(a,b).x.x1 === 'XX'");
		assert.ok(i2AB.x.x0.indexOf("XX") >= 0, prefix+"'XX' in i2(a,b).x.x0");
		assert.ok(i2AB.y.indexOf("XX") >= 0, prefix+"'XX' in i2(a,b).y");
		assert.strictEqual(i2AB.y[0].y1, "XX", prefix+"i2(a,b).y.y1 === 'XX'");
	}
	else { // deep.
		prefix = "+Deep: ";

		assert.strictEqual(i2AB.x.x1, "Ab", prefix+"i2(a,b).x.x1 === 'Ab'");
		assert.ok(i2AB.x.x0.indexOf("XX") < 0, prefix+"'XX' NOT in i2(a,b).x.x0");
		assert.ok(i2AB.y.indexOf("XX") < 0, prefix+"'XX' NOT in i2(a,b).y");
		assert.strictEqual(i2AB.y[0].y1, "Eb", prefix+"i2(a,b).y.y1 === 'Eb'");
	}
}

////////////////////////////////////////////////////////////////

var instancesof = function(assert, options) {
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
runTests('Options: ["abstract"]', ["abstract"]);
runTests('Options: ["deep", "super", "abstract"]',["deep", "super", "abstract"]);
runTests("Options: [], debug: true", [], true);
