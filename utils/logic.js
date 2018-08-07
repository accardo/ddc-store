import * as sysService from '../service/sys.service.js'
import config from '../config/config.js'
import utils from '../utils/util'
/*
* 处理数据逻辑
* */
export class StoreLogic {
	constructor() {
		StoreLogic.prototype.pageIndex = wx.getStorageSync('pageindex');
		StoreLogic.prototype.navlistLength = wx.getStorageSync('navlistLength');
		StoreLogic.prototype.os = wx.getStorageSync('optionStorage'); // 判断进入是哪个一个页面 1、订单结果页 2、搜索查询页
		StoreLogic.prototype.cacheData = wx.getStorageSync('cacheData'); // 读取分类中订货所有选中的数据
		StoreLogic.prototype.inventoryCacheData = wx.getStorageSync('inventoryCacheData'); // 读取分类中盘点所有选中的数据
		StoreLogic.prototype.outboundCacheData = wx.getStorageSync('outboundCacheData'); // 读取分类中出库所有选中的数据
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
	/**
	 * Description: 整理数据逻辑 o1 ->盘点缓存数据； o2 -> 原始数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/7/2
	 */
	subData(o1, o2) {
		let tempInventList = o1 ? o1 : o2;
		let isComplete = o1.filter((item) => { // 过滤 没有填写数据
			if (item.unitValue !== '' || item.materialUnitValue !== '') { // 提交数据整理
				item.goodsId = item.id;
				item.shopItemSkuVO = {
					attrValues: utils.attrValuesToString(item), //  array 转 string 提交数据
					id: item.id,
					item: item.item,
					skuId: item.skuId,
					stock: item.stock,
				}
				return item;
			}
		})
		return {
			inventListLenght: tempInventList.length,
			isComplete
		}
	}
	/*
	 * Description: 整理数据逻辑 申请退货更新数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/23
	 */
	subData1(originalData) {
		let	tempInventList = utils.ArrayDeepCopy(originalData);  // 深层拷贝防止子组件数据联动
		return tempInventList.filter((item) => {
			if (item.unitValue !== null && item.unitValue !== '') {
				item.shopItemSkuVO.attrValues = utils.attrValuesToString(item.shopItemSkuVO)
				return item;
			};
		})
	}
	/*
	 * Description: 部分收货 全部收货 数据整理
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/23
	 */
	subData2(originalData, receipt) {
		let	tempInventList = utils.ArrayDeepCopy(originalData);  // 深层拷贝防止子组件数据联动
				tempInventList = utils.attrValuesSkuToString(tempInventList); // array 转 string 提交数据
		return tempInventList.filter((item) => {
			item.goodsId = item.id;
			if (receipt == 3) { // 全部收货 过滤
				if (item.finalNumber == 0) {
					if (item.deliveryCount == '' || item.deliveryCount == null ) {
						return item;
					}
				}
			} else { // 部分收货 过滤
				if (item.deliveryCount !== null && item.deliveryCount !== '') {
					return item;
				};
			}
		})
	}
	/*
	 * Description: 订货 页面展示 数据处理 第一次见这烂的数据结构
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/24
	 */
	subData3(originalData) {
		return originalData.map((item) => {
			let shopTempObject = {};
			let tempObj = { // 原始数据 第一层循环数据 需要提炼出来 放到循环数组中，以便提交数据用  needNumber为 订货数量数据 循环时候需要用
				id: item.id,
				purchaseId: item.purchaseId,
				goodsId: item.goodsId,
				finalNumber: item.finalNumber,
				deliveryCount: item.deliveryCount,
			}
			item.shopItemSkuVO.attrValues = utils.attrValuesSplit(item.shopItemSkuVO); // attrValues string 转 array
			return Object.assign(shopTempObject, item.shopItemSkuVO, {needNumber: item.needNumber}, {tempObj:tempObj});
		})
	}

	/*
	 * Description: 订货 save update 处理数据 o1 -> cacheData 订货缓存; cacheDataDetial 订货详情缓存 o2 -> 原始数据 o_index -> 1 update 否则 save
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/24
	 */
	subData4(o1, o2, o_index) {
		if (o_index == '1') { // 1 为更新操作 处理原始数据，原始数据和后台传数据结构相差太大，很坑人的。
			o1 = o1 ? o1 : o2;
			return o1.map((item) => {
				let tempObj1 = utils.ArrayDeepCopy(item.tempObj);
				item.shopItemSkuVO = {
					id : item.id,
					attrValues: utils.attrValuesToString(item), // attrValues array 转 string ,
					skuId: item.skuId,
					item: item.item
				}
				item.shopItemSkuVO.item.unitValue = tempObj1.tempunitValue;
				Object.assign(item, tempObj1);
				return item
			})
		} else {
			return o1.map((item) => { // 过滤 没有填写数据
				item.goodsId = item.id;
				item.shopItemSkuVO = {
					attrValues: utils.attrValuesToString(item), // attrValues array 转 string
					id: item.id,
					skuId: item.skuId,
					item: item.item
				}
				return item;
			})
		}
	}

	/*
	 * Description: 置换 处理数据 o1 -> 要转换商品 数据 o2 -> 转化为商品 数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/24
	 */
	subData5(o1, o2) {
		return o1.map((item, index) => { // 提交数据整理
			item.needShopItemSkuVO = {
				attrValues: utils.attrValuesToString(item), // array 转 string 提交数据
				id: item.id,
				skuId: item.skuId,
				item: item.item
			}
			item.shopItemSkuVO = {
				attrValues: utils.attrValuesToString(o2[index]), // array 转 string 提交数据
				id: o2[index].id,
				skuId: o2[index].skuId,
				item: o2[index].item
			}
			item.id = null;
			return item;
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
	ajaxGetData(serviceUrl, getData = null, categoryId =null) {
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
						if (categoryId !== null) {
							resolve(this.returnData(res));
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
	returnData(data) {
		this.constructor();
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
			return item;
		})
		return data;
	}
	/**
	 * Description: 设置商品总数 只需要监听数据变化即可
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/27
	 */
	watchChange(data){
		let setShop = {};
		if (data) {
			setShop = utils.setTotalNumber(data);
		}
		console.log(setShop, '设置商品总数');
		return setShop
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
		this.plistArray = [];
		this.pl = {};
	}
	/**
	 * Description: 过滤数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/28
	 */
	filterData(data, num) {
		if (num == 1) {
			return data && data.filter((item) => { // 全部数据 返回没有输入值的数据
				return item.item.unitValue == 0 || item.item.unitValue == '0' || item.item.unitValue == ''
			});
		} else if(num == 2) {
			return data && data.filter((item) => { // 搜索查询  返回搜索的数据
				return item.needNumber != 0 || item.needNumber != '0';
			});
		} else if(num == 3) {
			return data && data.filter((item) => { // 盘点 搜索查询 返回搜索数据
				return item.unitValue != '' || item.materialUnitValue != '';
			})
		} else if (num == 4) {
			return data && data.filter((item) => { // 出库 返回没有输入值的数据
				return item.unitValue == '' && item.materialUnitValue == '';
			})
		} else if (num == 5) {
			return data && data.filter((item) => {
				return (item.unitValue !== null && item.unitValue !== '') || (item.materialUnitValue !== null && item.materialUnitValue !== '')
			})
		} else if (num == 6) {
			return data && data.filter((item) => {
				return item.inNumber !== ''
			})
		} else if (num == 7) {
			return data && data.filter((item) => { // 搜索查询  返回搜索的数据
				return item.outNumber != 0 || item.outNumber != '0';
			})
		} else if (num == 8) {
			return data && data.filter((item) => { // 搜索查询  返回搜索的数据
				return item.needNumber != '0';
			})
		} else if (num == 9) {
			return data && data.filter((item) => { // 搜索查询  返回搜索的数据
				return item.needNumber != '' || item.needNumber != null;
			})
		}
	}
	/**
	 * Description: 搜索结果对比 链接 去重
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/4
	 */
	forDataContrastSearch(data1, data2) {
		data1.push(...data2);
		// 去除重复skuId
		Array.prototype.distinct = function(){
			var arr = this, result = [], i, j, len = arr.length;
			for(i = 0; i < len; i++){
				for(j = i + 1; j < len; j++){
					if(arr[i].skuId === arr[j].skuId){
						j = ++i;
					}
				}
				result.push(arr[i]);
			}
			return result;
		}
		return data1.distinct().reverse();
	}
	/*
	 * Description: 订货 盘点 出库 退货 数据筛选逻辑 c_key -> 缓存key值；t_array -> 临时存储值； c_data -> 缓存数据； f_data -> 过滤数据； c_id -> 分类id； t_sh -> 搜索版面  search 搜索页面
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/8/7
	 */
	setfuncData(c_key, t_array, c_data, f_data, c_id, t_sh) {
		this.constructor();
		if (!c_data) {
			for (let i=0; i < super.navlistLength.voLenght; i++) {
				t_array[super.navlistLength.keyIndex[i]] = [];
			}
		}
		t_array[super.navlistLength.categoryId] = f_data //先添加 在进行过滤
		if (super.navlistLength.categoryId == 0) { // 全部分类
			let fCategory = this.allFilter(t_array[0], c_id);
			if (t_sh == 'search') {
				fCategory = this.forDataContrastSearch(c_data[c_id] || [], fCategory);
			}
			t_array[c_id] = fCategory;
			if(t_sh == 'search') {
				t_array[0] = this.mergeData(t_array);
			}
		} else { // 除全部分类 所有分类累加即使全部分类 在赋值到全部分类
			if (t_sh == 'search') {
				let fCategory = this.allFilter(t_array[c_id], c_id);
				fCategory = this.forDataContrastSearch(c_data[c_id] || [], fCategory);
				t_array[c_id] = fCategory;
			}
			t_array[0] = this.mergeData(t_array);
		}
		if (t_sh != 'search') {
			t_array[super.navlistLength.categoryId] = f_data
		}
		wx.setStorageSync(c_key, t_array);
	}
	/*
	 * Description: 过滤全部分类 或者  搜索全部分类 数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/8/7
	 */
	allFilter(data, c_id) {
		return data.filter((item) => { // 过滤全部分类 当前选中所有分类数据
			if (item.item.categoryId1 == c_id) { // 返回当前选中的所有分类数据
				return item
			}
		})
	}
	/*
	 * Description: 合并选中总数据并赋值给 0 全部分类
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/8/7
	 */
	mergeData(data) {
		let tempA = Object.values(data); // 对象转换成数组
		tempA.splice(0, 1); // 删除全部分类 进行对象合并成数组
		return utils.cacheDataDeal(tempA); // 去除全部分类后 整合数组对象
	}
	/*
	 * Description: 连续加载数据处理
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/23
	 */
	refreshLoadData(a1, a2_index) {
		super.constructor();
		this.constructor();
	  if (super.pageIndex == 0) {
	    if (super.cacheData[a2_index]) { // 订货
		    this.plistArray = this.forDataContrastSearch(a1, super.cacheData[a2_index]);
	    }
    } else if (super.pageIndex == 1) {
	    if (super.inventoryCacheData[a2_index]) { // 盘点
		    this.plistArray = this.forDataContrastSearch(a1, super.inventoryCacheData[a2_index])
	    }
    } else if (super.pageIndex == 2 || super.pageIndex == 7) {
	    if (super.outboundCacheData[a2_index]) { //出库 退货
		    this.plistArray = this.forDataContrastSearch(a1, super.outboundCacheData[a2_index]);
	    }
    }
    if (this.plistArray.length > 0) {
	    return this.plistArray;
    } else {
			return a1;
    }
	}

	/*
	 * Description: 调拨 a1 -> 调拨选中缓存; a2 -> 搜索缓存
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/24
	 */
	allocationModule(a1, a2) {
		let transferData;
		if(a2) {
			if (a1.length == 0) {
				transferData = a2.filter((item) => {
					return item.outNumber != 0
				})
			} else {
				transferData = this.forDataContrastSearch(a1, this.filterData(a2, 7));
			}
		}
		wx.setStorageSync('transferCacheData', transferData); // 搜索结束后 需要把搜索结果放入到总的结果缓存中
		return transferData;
	}
}
export default {
	StoreLogic,
	OrderLogic
}