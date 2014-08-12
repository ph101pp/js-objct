QUnit.test( "Setup", function( assert ) {
	assert.ok( typeof objectfactory === "function", "objectfactory exists" );
});

QUnit.test( "Input Type Handling", function( assert ) {
	
	assert.ok(objectfactory(function(){},{}), "Ok: Objects and Functions as params" );
	assert.ok(objectfactory(true), "Ok: Boolean as first param" );
	assert.ok(objectfactory([]), "Ok: Empty Array as first param" );
	assert.ok(objectfactory(["deep", "abstract", "super"]), "Ok: Predefined Array as first param" );
	assert.ok(function(){
		objectfactory("deep");
		objectfactory("abstract");
		objectfactory("super");
		return true;
	}(), "Ok: Predefined String as first param" );

	assert.throws( function(){
		objectfactory(["deep","hallO"])
	}, /Unexpected 'array'/, "Threw: Unexpected Array" );

	assert.throws( function(){
		objectfactory(function(){},{}, [])
	}, /Unexpected 'array'/, "Threw: Unexpected Array" );

	assert.throws( function(){
		objectfactory("")
	}, /Unexpected 'string'/, "Threw: Unexpected String" );

	assert.throws( function(){
		objectfactory(function(){},{}, "")
	}, /Unexpected 'string'/, "Threw: Unexpected String" );

	assert.throws( function(){
		objectfactory(function(){},{}, 1)
	}, /Unexpected 'number'/, "Threw: Unexpected Number" );	

	assert.throws( function(){
		objectfactory(1)
	}, /Unexpected 'number'/, "Threw: Unexpected Number" );

	assert.throws( function(){
		objectfactory(function(){},{}, false)
	}, /Unexpected 'boolean'/, "Threw: Unexpected Boolean" );
});

// QUnit.test( "Wrong Type", function( assert ) {
// });