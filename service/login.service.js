const baseService = require('./base.service.js');
function api({ url, method, params, data}){
  return baseService.service({url:url,method,params,data})
} 
module.exports = {
  api
}