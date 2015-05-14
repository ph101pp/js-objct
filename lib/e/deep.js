var objct = require("../lib/objct.e");

///////////////////////////////////////////////////////////////////////////////

module.exports = objct.decorator(function(data, obj){
  obj = objct.isObjct(obj) ? obj.apply(null, data.args): obj;

  for(var key in obj) {
    if(typeof this[key] === "object" && !isArray(this[key])){
      // console.log(key, this[key], obj[key]);
      obj[key] = new objct.e(this[key], deepCopy(obj[key]));
    }
  }
  return obj;
});
