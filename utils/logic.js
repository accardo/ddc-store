import * as sysService from '../service/sys.service.js'
import utils from '../utils/util';
/*
* 处理数据逻辑
* */
export class StoreLogic {
	constructor() {
		this.pageIndex = wx.getStorageSync('pageindex');
	}
	/*
	 * Description: 整理数据 attrValues -> Array 转换为 String
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/7/2
	 */
	processData(data) {
		return utils.cacheDataDeal(data).map((item) => {
			item.goodsId = item.id;
			item.shopItemSkuVO = {
				attrValues: utils.attrValuesToString(item),
				id: item.id,
				item: item.item,
				skuId: item.skuId
			}
			return item
		})
	}
	/*
	 * Description: 保存 更新 请求处理
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Params: serviceUrl -> 不同保存请求不同URL; promdData -> 请求参数; isSave -> true 保存, false 更新;
	 * Date: 2018/7/20
	 */
	ajaxSaveUpdate(serviceUrl, promdData = null, isSave) {
		wx.showLoading({title: '提交中...', mask: true,});
		return new Promise((resolve) => {
			sysService[serviceUrl]({
				url: isSave === true ? 'save' : 'update',
				method: "post",
				data: promdData
			}).then((res) => {
				if (res.code == 0) {
					setTimeout(() => {
						resolve(res);
						wx.hideLoading();
					}, 1000);
				} else if(res.code == 401) {
					config.logOutAll();
					return
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			})
		})
	}
	/*
	 * Description: get 请求数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Params: serviceUrl -> 不同保存请求不同URL; getData -> 由于之前的封装接口分开的这里需要拆分
	 * Date: 2018/7/20
	 */
	ajaxGetData(serviceUrl, getData, navClassIndex = null) {
		let urlStr = serviceUrl.split('/');
		wx.showLoading({title: '加载中...', mask: true,});
		return new Promise((resolve) => {
			sysService[urlStr[0]]({
				url: urlStr[1],
				method: 'get',
				data: getData
			}).then((res) => {
				if (res.code == 0) {
					setTimeout(() => {
						console.log(null)
						if (navClassIndex !== null) {
							resolve(this.returnData(res, navClassIndex));
						} else {
							resolve(res);
						}
						wx.hideLoading();
					}, 500);
				} else if(res.code == 401) {
					config.logOutAll();
					return
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			})
		})
	}
	/*
	 * Description: 返回数据处理
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/20
	 */
	returnData(data, navClassIndex) {
		 data.page.list.map((item) => {
			item.attrValues = utils.attrValuesSplit(item);
			if (this.pageIndex == 0) { // 订货
				item.needNumber = 0;
			} else if(this.pageIndex == 1 || this.pageIndex == 2 || this.pageIndex == 7) { // 盘点
				item.unitValue = '';
				item.materialUnitValue = '';
			} else if (this.pageIndex == 3) { // 出库
				item.resultNumber = '';
			} else if (this.pageIndex == 4) { // 调拨
				item.outNumber = 0;
			}
			item.navClass = navClassIndex;
			return item;
		})
		console.log(data, 'returnData');
		return data;
	}
}

/*
 * Description: 复杂模块
 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
 * Date: 2018/7/20
 */
export class OrderLogic extends StoreLogic {
	constructor() {
		super();
	}
}
export default {
	StoreLogic,
	OrderLogic
}