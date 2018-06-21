const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
// pages/goodsinfo/goodsinfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop:0,
    pagetitle:'',
	  purchaseId: 0,
    shopTotalN: 0,
    shopPieceN: 0,
	  update: 0, // 判断更新操作
    status: 0,
    productlist:[],
    conclusion: 0,
    productType: '', // 类型
	  pageindex: 0,
	  productStatus:'', // 判断订货详情
	  reason: '', // 出库原因
	  outboundType: 0 // 1 报废 2 退货
  },
	/**
	 * Description: 读取商品列表 待派单； 订货 状态 4 save; 待派单 状态 4 update; 部分收货 状态2 update ; 收货完毕 状态2 update
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
	getShopListData() {
		wx.showLoading({ title: '加载中' });
		let getData = {
			purchaseId: this.data.purchaseId,
			shopId:app.selectIndex,
		}
		sysService.purchasedetail({
			url:'info',
			method:'get',
			data: getData
		}).then((res) => {
			if (res.code == 0) {
				let shopTempArray = this.shopListDataProcess(res.purchaseDetailVOList);
				console.log(res.purchaseDetailVOList, shopTempArray, '读取列表');
				this.setData({
					productStatus: 'goodsdetail',
					productType: 'goods',
					productlist: shopTempArray
				})
				this.clearCache();
				this._watchChangeDetial(); //详情商品数量
			} else if (res.code == 401) {
				config.logOutAll();
				return
			} else {
				wx.showToast({
					title: res.msg,
					icon:'none'
				})
			}
			wx.hideLoading();
		})
	},
	/**
	 * Description: 数据处理， 第一次见这烂的数据结构
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
	shopListDataProcess(data) {
		console.log(data);
		let shopTempArray = [];
		data.forEach((item) => {
			let shopTempObject = {};
			let tempObj = { // 原始数据 第一层循环数据 需要提炼出来 放到循环数组中，以便提交数据用  needNumber为 订货数量数据 循环时候需要用
				id: item.id,
				purchaseId: item.purchaseId,
				goodsId: item.goodsId,
				finalNumber: item.finalNumber,
				deliveryCount: item.deliveryCount,
			}
			item.shopItemSkuVO.attrValues = utils.attrValuesSplit(item.shopItemSkuVO); // attrValues string 转 array
			Object.assign(shopTempObject, item.shopItemSkuVO, {needNumber: item.needNumber}, {tempObj:tempObj});
			shopTempArray.push(shopTempObject);
		})
		return shopTempArray;
	},
	/**
	 * Description: 下一步 订货商品
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
  goNext(){
    if (this.data.shopPieceN <= 0){
      wx.showToast({
        title: '请选择商品',
        icon:'none'
      });
      return;
    }
    let thisTime = new Date().getHours();
    if (15 <= thisTime && thisTime <=24) {
      wx.showModal({
        content: '当前订货需求将在明天15:00提交至BD',
        confirmColor: config.showModal.confirmColor,
        success:(res) => {
          if(res.confirm){
            this.setPostData();
          }
        }
      })
    }else{
      wx.showModal({
        content: '是否提交数据？',
        confirmColor: config.showModal.confirmColor,
        success: (res) => {
          if (res.confirm) {
            this.setPostData();
          }
        }
      });
    }
  },
	/**
	 * Description: 更新 保存 数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
  setPostData(){
    let purchaseDetailVOList = [];
    let isComplete = [];
    if (this.data.update != '1') { // 1 为更新操作 处理原始数据，原始数据和后台传数据结构相差太大，很坑人的。
	    purchaseDetailVOList = wx.getStorageSync('cacheData');
	    purchaseDetailVOList = utils.cacheDataDeal(purchaseDetailVOList);
	    isComplete = purchaseDetailVOList.filter((item) => { // 过滤 没有填写数据
			    item.goodsId = item.id;
			    item.shopItemSkuVO = {
				    attrValues: utils.attrValuesToString(item), // attrValues array 转 string
				    id: item.id,
				    item: item.item
			    }
			    delete item.attrValues;
			    delete item.copyShopItemSkuId;
		      delete item.id;
			    delete item.isExist;
			    delete item.isSale;
			    delete item.item;
			    delete item.price;
			    delete item.shopItemId;
			    delete item.skuId;
			    delete item.skuSn;
			    delete item.stock;
			    delete item.thumb;
			    delete item.valueIds;
			    delete item.costPrice;
			    delete item.navClass;
			    return item;
	    })
    } else {
	    purchaseDetailVOList = wx.getStorageSync('cacheDataDetial');
    	if (this.data.productStatus == 'goodsdetail') {
		    purchaseDetailVOList = purchaseDetailVOList ? purchaseDetailVOList : this.data.productlist;
		    isComplete = purchaseDetailVOList.map((item) => {
			    let tempObj1 = JSON.parse(JSON.stringify(item.tempObj));
			    item.shopItemSkuVO = {
			    	id : item.id,
			      attrValues: utils.attrValuesToString(item), // attrValues array 转 string ,
			    	item: item.item
			    }
			    item.shopItemSkuVO.item.unitValue = tempObj1.tempunitValue;
			    Object.assign(item, tempObj1);
			    delete item.attrValues;
			    delete item.copyShopItemSkuId;
			    delete item.costPrice;
			    delete item.isExist;
			    delete item.isSale;
			    delete item.item;
			    delete item.price;
			    delete item.shopItemId;
			    delete item.skuId;
			    delete item.skuSn;
			    delete item.stock;
			    delete item.tempunitValue;
			    delete item.thumb;
			    delete item.valueIds;
			    return item
		    })
	    } else {
		    isComplete = purchaseDetailVOList.map((item) => { // 属性 数组转字符串
		       item.shopItemSkuVO.attrValues = utils.attrValuesToString(item.shopItemSkuVO); // attrValues array 转 string
		    })
	    }
    }

    let promeData = {
	    id: this.data.purchaseId || null, // 订单id
      shopId: app.selectIndex, // 店铺ID
      status: this.data.status || 0, // 状态 (1、待收货 2、部分收货 3、已收货 4、待派单)
	    purchaseDetailVOList: isComplete
    }
		console.log(promeData, 'promeData222222');
    if (this.data.update == '1') {
      sysService.purchase({
	      url: 'update',
        method: "post",
	      data: promeData
      }).then((res) => {
        if (res.code == 0) {
	        utils.showToast({title: '更新成功', page: 1, pages: getCurrentPages()});
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
    } else {
	    sysService.purchase({  // 订货 走save
		    url: 'save',
		    method: "post",
		    data: promeData
	    }).then(res => {
		    let {code,msg} = res;
		    if (code == 401) {
			    config.logOutAll();
			    return
		    }
		    if(code == 0){
			    utils.showToast({title: '订货成功', page: 2, pages: getCurrentPages()});
			    this.clearCache();
		    }else{
			    wx.showToast({
				    title: msg,
				    icon: 'none'
			    })
		    }
	    })
    }
  },
	/**
	 * Description: 清空订货缓存
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
	clearCache() {
		wx.removeStorageSync('goodsOrderCacheData');
		wx.removeStorageSync('cacheData');
		wx.removeStorageSync('searchGoodsOrderCacheData');
		wx.removeStorageSync('cacheDataDetial');
	},
  /* 前往照片上传页面 */
  nextGo(){
    let outboundCacheData = wx.getStorageSync('outboundCacheData');
	      outboundCacheData = utils.cacheDataDeal(outboundCacheData);
	  let outboundCacheArray = outboundCacheData.filter((item) => {
		      return item.unitValue != '' || item.materialUnitValue != '';
	      })
	  if (outboundCacheData.length > 0) {
		  if (outboundCacheData.length == outboundCacheArray.length) {
			  wx.navigateTo({
				  url: `../../pages/uploadimg/uploadimg?reason=${this.data.reason}&outboundType=${this.data.outboundType}`
			  })
		  } else {
			  wx.showToast({
				  title: '原料商品，必填一项',
				  icon: 'none'
			  })
		  }
	  } else {
		  wx.showToast({
			  title: '请添加商品',
			  icon: 'none'
		  })
	  }
  },

	/**
	 * Description: 设置商品总数 只需要监听数据变化即可
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/27
	 */
	_watchChange(){
		let cacheData = wx.getStorageSync('cacheData'); // 读取缓存中所有选中数据
		let setShop = {};
		if (cacheData) {
			setShop = utils.setTotalNumber(cacheData)
		}
		this.setData({
			shopTotalN: setShop.total,
			shopPieceN: setShop.shopPieceN
		})
	},
	/**
	 * Description: 详情 设置商品数量
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/4
	 */
	_watchChangeDetial() {
		let cacheDataDetial = wx.getStorageSync('cacheDataDetial');
				cacheDataDetial = cacheDataDetial ? cacheDataDetial : this.data.productlist;
		let shopPieceN = 0;
		let tempArray = [];
		tempArray = cacheDataDetial.filter((item) => {
			return item.needNumber != 0 || item.needNumber != '';
		})
		tempArray.forEach((item) => {
				shopPieceN += item.needNumber
			})
		this.setData({
			shopTotalN: tempArray.length,
			shopPieceN: shopPieceN
		})
	},
  /**
   * Description: 订单结果页 完全读取缓存显示
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/27
   */
  orderResultsPage() {
	  let cacheData = wx.getStorageSync('cacheData'); // 所有结果数据
	  let resultsCacheData = []
	  if (cacheData) {
		  resultsCacheData = utils.cacheDataDeal(cacheData);
		  resultsCacheData = resultsCacheData.filter((item) => {
		  	return item.needNumber != 0
		  })
	  }
    this.setData({
      productlist: resultsCacheData
    })
  },
	/**
	 * Description: 出库页面 完全读取缓存显示 结果页面
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/31
	 */
	outboundResultePage() {
		let outboundCacheData = wx.getStorageSync('outboundCacheData'); // 所有结果数据
		let resultsCacheData = [];
		if (outboundCacheData) {
			resultsCacheData = utils.cacheDataDeal(outboundCacheData);
			resultsCacheData = resultsCacheData.filter((item) => {
				return item.unitValue != '' || item.materialUnitValue != '';
			})
		}
		this.setData({
			productlist: resultsCacheData
		})
	},
	/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  	console.log(options, 'status');
    let pageindex = wx.getStorageSync('pageindex');
    let pagetitle = wx.getStorageSync('pagetitle');
    let cacheData = wx.getStorageSync('cacheData');
	  if (pageindex == 0 && cacheData) {
		  this.orderResultsPage(); // 订单结果页面重新缓存新数据
		  this._watchChange(); //商品数量
	  }
    if (pageindex == 0) {
      this.setData({
	      update: options.update ? options.update :null,
	      conclusion: options.conclusion ? options.conclusion : null, // 是否进入订货结果页面
        productType: options.productType ? options.productType : null,
	      status: options.orderStatus ? options.orderStatus : null,  // 订货单状态
	      purchaseId: options.orderId ? options.orderId : null, // 订货单id
      })
    }
    if (pageindex == 2) {
	  	this.setData({
			  conclusion: options.conclusion ? options.conclusion : null, // 是否进入出库结果页面
			  reason: options.reason ? options.reason : null, // 出库原因
			  outboundType: options.outboundType ? options.outboundType : null // 1 报废 2 退货
		  })
	    this.outboundResultePage();
	  	// this._watchChange();
    }
	  if (options.goods == 'goodsdetail') {
		  this.getShopListData();
	  }
    this.setData({
	    pageindex,
    })
    wx:wx.setNavigationBarTitle({
      title: pagetitle
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})