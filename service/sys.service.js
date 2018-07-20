const baseService = require('./base.service.js');
export function api({ url, method, params, data }) {
  return baseService.service({ url: "sys/" + url, method, params, data })
}
/* 分类管理接口 */
export function category({ url, method, params, data }) {
  return baseService.service({ url: "sys/category/" + url, method, params, data })
}
/* 订货管理接口 */
export function purchase({ url, method, params, data }) {
  return baseService.service({ url: "sys/purchase/" + url, method, params, data })
}
/* 订货详情 */
export function purchasedetail({ url, method, params, data }) {
  return baseService.service({ url: "sys/purchasedetail/" + url, method, params, data })
}
/* 文件服务接口 */
export function oss({ url, method, params, data }) {
  return baseService.service({ url: "sys/oss/" + url, method, params, data })
}
/* 盘点列表接口 */
export function inventory({ url, method, params, data }) {
	return baseService.service({ url: "sys/inventory/" + url, method, params, data })
}
/* 盘点详情接口 */
export function inventorydetail({ url, method, params, data }) {
	return baseService.service({ url: "sys/inventorydetail/" + url, method, params, data })
}
/* 出库列表接口 */
export function delivery({ url, method, params, data }) {
	return baseService.service({ url: "sys/delivery/" + url, method, params, data })
}
/* 出库详情接口*/
export function deliverydetail({ url, method, params, data }) {
	return baseService.service({ url: "sys/deliverydetail/" + url, method, params, data })
}
/* 置换列表接口*/
export function displace({ url, method, params, data }) {
	return baseService.service({ url: "sys/displace/" + url, method, params, data })
}
/* 置换详情接口*/
export function displacedetail({ url, method, params, data }) {
	return baseService.service({ url: "sys/displacedetail/" + url, method, params, data })
}
/* 调拨列表接口 */
export function transfer({ url, method, params, data }) {
	return baseService.service({ url: "sys/transfer/" + url, method, params, data })
}
/* 调拨详情接口 */
export function transferdetail({ url, method, params, data }) {
	return baseService.service({ url: "sys/transferdetail/" + url, method, params, data })
}
/* 课程消列表接口 */
export function coursebill({ url, method, params, data }) {
	return baseService.service({ url: "sys/coursebill/" + url, method, params, data })
}
/* 课程消详情接口 */
export function coursebilldetail({ url, method, params, data }) {
	return baseService.service({ url: "sys/coursebilldetail/" + url, method, params, data })
}
// 二期新增
/* 收货列表接口*/
export function receipt({ url, method, params, data }) {
	return baseService.service({ url: "sys/receipt/" + url, method, params, data })
}
/* 收货详情列表接口*/
export function receiptdetail({ url, method, params, data }) {
	return baseService.service({ url: "sys/receiptdetail/" + url, method, params, data })
}
/* 申请退货列表接口*/
export function returnlist({ url, method, params, data }) {
	return baseService.service({ url: "sys/return/" + url, method, params, data })
}
/* 申请退货详情接口*/
export function returndetail({ url, method, params, data }) {
	return baseService.service({ url: "sys/returndetail/" + url, method, params, data })
}
/* 退货列表接口*/
export function invoice({ url, method, params, data }) {
	return baseService.service({ url: "sys/invoice/" + url, method, params, data })
}
/* 退货详情接口*/
export function invoicedetail({ url, method, params, data }) {
	return baseService.service({ url: "sys/invoicedetail/" + url, method, params, data })
}

export default {
  api,
  category,
  purchase,
  purchasedetail,
  oss,
	inventory,
	inventorydetail,
	delivery,
	deliverydetail,
	displace,
	displacedetail,
	transfer,
	transferdetail,
	coursebill,
	coursebilldetail,
	receipt,
	receiptdetail,
	returnlist,
	returndetail,
	invoice,
	invoicedetail,
}