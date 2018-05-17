const baseService = require('./base.service.js');
function api({ url, method, params, data }) {
  return baseService.service({ url: "service/shop/"+url, method, params, data })
}
module.exports = {
  api
}