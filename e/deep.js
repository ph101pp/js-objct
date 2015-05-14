var objct = require("../lib/objct.e");

////////////////////////////////////////////////////////////////////////////////
// isArray fallback for ie<9
var strArray = Array.toString();
var isArray = Array.isArray || function (obj) {
  return (typeof obj == strObject 
    && Object.prototype.toString.call(obj) === "[object Array]")
    || ("constructor" in obj && String(obj.constructor) === strArray);
};
///////////////////////////////////////////////////////////////////////////////

var deep = module.exports = objct.decorator(function(data, obj){
  obj = objct.isObjct(obj) ? obj.apply(null, data.args): obj;

  for(var key in obj) {
    if(typeof this[key] === "object" && !isArray(this[key])){
      // console.log(key, this[key], obj[key]);
      obj[key] = new objct.e(this[key], deep(obj[key]));
    }
  }
  return obj;
});
