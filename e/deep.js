var objct = require("../lib/objct.e");

///////////////////////////////////////////////////////////////////////////////

var deep = module.exports = objct.decorator(function(data, obj){
  obj = objct.isObjct(obj) ? obj.apply(null, data.args): obj;

  for(var key in obj) {
    if(typeof this[key] === "object" && !objct.isArray(this[key])){
      // console.log(key, this[key], obj[key]);
      obj[key] = new objct.e(this[key], deep(obj[key]));
    }
  }
  return obj;
});