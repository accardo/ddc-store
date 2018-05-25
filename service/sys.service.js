const baseService = require('./base.service.js');
function api({ url, method, params, data }) {
  return baseService.service({ url: "sys/" + url, method, params, data })
}
/* 分类管理接口 */
function category({ url, method, params, data }) {
  return baseService.service({ url: "sys/category/" + url, method, params, data })
}
/* 订货管理接口 */
function purchase({ url, method, params, data }) {
  return baseService.service({ url: "sys/purchase/" + url, method, params, data })
}
/* 订货详情 */
function purchasedetail({ url, method, params, data }) {
  return baseService.service({ url: "sys/purchasedetail/" + url, method, params, data })
}
/* 文件服务接口 */
function oss({ url, method, params, data }) {
  return baseService.service({ url: "sys/oss/" + url, method, params, data })
}
/* 盘点列表接口 */
function inventory({ url, method, params, data }) {
	return baseService.service({ url: "sys/inventory/" + url, method, params, data })
}
module.exports = {
  api,
  category,
  purchase,
  purchasedetail,
  oss,
	inventory
}