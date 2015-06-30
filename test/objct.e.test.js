
////////////////////////////////////////////////////////////////

QUnit.test( "Decorator – Basic function behavior", basic);
QUnit.test( "Decorator – Calls and Params from objct", calls);

////////////////////////////////////////////////////////////////

function calls(assert){
// assert.strictEqual( typeof fABC , "function", prefix+"Factory f(a,b,c) is Function");
// assert.ok( i1ABC.a === "X" && i2ABC.a === "X" && a.a === "X", prefix+"i(a,b,c).a === i2(a,b,c).a === a.a");
// assert.propEqual(i1ciAB, i1cAB, prefix+"i(c, i(a,b)) === i(a,b,c)");
// assert.throws( function(){}, /Unexpected 'array'/, "Threw: Ntn Param - Unexpected Array" );
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

  var args1 = {one:1};
  var args2 = [2];
  var args3 = function(){return 3};
  var args4 = 4;
  var args5 = "five"; 

  var reference = {};
  
  var decorateModule = function(param1, param2, param3, param4, param5){
    assert.strictEqual( typeof param1 , "object", "decorateModule 1st param === 'object'");
    assert.strictEqual( typeof param1.modules , "object", "decorateModule param1.modules === 'object'");
    assert.strictEqual( param1.modules[1].obj , a, "decorateModule param1.modules[0].obj === a");
    assert.strictEqual( typeof param1.args , "object", "decorateModule param1.args === 'object'");
    assert.strictEqual( param1.args[0] , args1, "decorateModule param1.args[0] === 1st argument passed to factory");
    assert.strictEqual( param1.target , undefined, "decorateModule param1.target === undefined");
    assert.strictEqual( param1.bind , undefined, "decorateModule param1.bind === undefined");
    assert.strictEqual( param1.key , undefined, "decorateModule param1.key === undefined");
    assert.strictEqual( param1.unbind , undefined, "decorateModule param1.unbind === undefined");
    assert.strictEqual( param3 , args1, "3rd param in decorate comes from newDecorator(2nd)");
    assert.strictEqual( param4 , args2, "4th param in decorate comes from newDecorator(3rd)");
    assert.strictEqual( param5 , args3, "5th param in decorate comes from newDecorator(4rd)");    
    return param2;
  }
  var decorateProperty1 = function(param1, param2, param3, param4, param5){
    assert.strictEqual( typeof param1 , "object", "decorateProperty 1st param === 'object'");
    assert.strictEqual( typeof param1.modules , "object", "decorateModule param1.modules === 'object'");
    assert.strictEqual( param1.modules[1].obj , a, "decorateModule param1.modules[0].obj === a");
    assert.strictEqual( typeof param1.args , "object", "decorateModule param1.args === 'object'");
    assert.strictEqual( param1.args[0] , args1, "decorateModule param1.args[0] === 1st argument passed to factory");
    assert.strictEqual( param1.target , this, "decorateModule param1.target === this");
    assert.strictEqual( typeof param1.bind , "function", "decorateModule param1.bind === function");
    assert.strictEqual( typeof param1.unbind , "function", "decorateModule param1.unbind === function");
    assert.strictEqual( param1.key , "prop1", "decorateModule param1.key === 'prop1'");
    assert.strictEqual( param2 , args1, "2nd param in decorate comes from newDecorator(1st)");
    assert.strictEqual( param3 , args2, "3rd param in decorate comes from newDecorator(2nd)");
    assert.strictEqual( param4 , args3, "4th param in decorate comes from newDecorator(3rd)");    
    return "decorateProperty1";
  }
  var decorateProperty2 = function(){
    assert.strictEqual(reference, this, "decorateProperty 'this' === instance");
    return "decorateProperty2";
  }    
  
  var newPropertyDecorator1 = objct.e.decorator(decorateProperty1);
  var newPropertyDecorator2 = objct.e.decorator(decorateProperty2);
  var newModuleDecorator = objct.e.decorator(decorateModule);

  var object = {
    prop1 : newPropertyDecorator1(args1, args2, args3),
    prop2 : "hello",
    prop3 : "test"
  };
 
  var factory1  = objct(a, object, b);
  var instance1 = factory1(args1);

  assert.strictEqual(instance1.prop1, object.prop1, "factory without enabling decorators: Decorator not executed");

  var factory2  = objct.e(a, object, b);
  var instance2 = factory2(args1);

  assert.strictEqual(instance2.prop1, "decorateProperty1", "factory with enabling decorators: Decorators executed, return value bound to property");

  var factory3  = objct.e(a, newModuleDecorator(b, args1, args2, args3));
  var instance3 = factory3(args1);
  var instance5  = new objct.e(a, b);
  
  assert.propEqual(instance5, instance3, "passing module through decorator unchanged");

  var instance4  = new objct.e.extend(reference, a, {
    prop : newPropertyDecorator2()
  }, b );
 

}

////////////////////////////////////////////////////////////////

function basic(assert){
// assert.strictEqual( typeof fABC , "function", prefix+"Factory f(a,b,c) is Function");
// assert.ok( i1ABC.a === "X" && i2ABC.a === "X" && a.a === "X", prefix+"i(a,b,c).a === i2(a,b,c).a === a.a");
// assert.propEqual(i1ciAB, i1cAB, prefix+"i(c, i(a,b)) === i(a,b,c)");
// assert.throws( function(){}, /Unexpected 'array'/, "Threw: Ntn Param - Unexpected Array" );

  var args1 = {one:1};
  var args2 = [2];
  var args3 = function(){return 3};
  var args4 = 4;
  var args5 = "five"; 

  var decorate = function(param1, param2, param3, param4, param5){
    assert.strictEqual( param1 , args4, "1st param in decorate comes from decorated(1st)");
    assert.notEqual( param2 , args5, "2nd param in decorate is not from decorated(2nd)");
    assert.strictEqual( param2 , args1, "2nd param in decorate comes from newDecorator(1st)");
    assert.strictEqual( param3 , args2, "3rd param in decorate comes from newDecorator(2nd)");
    assert.strictEqual( param4 , args3, "4th param in decorate comes from newDecorator(3rd)");
    assert.strictEqual( param5 , undefined, "5th param in decorate is undefined");
  }

  var newDecorator = objct.e.decorator(decorate);

  var decorated = newDecorator(args1, args2, args3);

  assert.strictEqual( typeof objct.e.decorator , "function", "objct.e.decorator is funciton");
  assert.strictEqual( typeof newDecorator , "function", "newDecorator = objct.e.decorator() is function");
  assert.strictEqual( typeof decorated , "function", "decorated = newDecorator() is function");
  assert.strictEqual( decorated.hash , "jmuMMRs6AUUG293HXcs8Z0ofQlkG0hqiNAJlZq2hHYakBQmyfnRuCsh2yf+d7n", "decorated has .hash property");

  assert.throws( function(){
    objct.e.decorator("string");
  }, /Unexpected 'string'/, "Threw: Unexpected Parameter -> needs function" );


  decorated(args4, args5);

}

