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
    outage: '',
    pagetitle:'',
    ordernumber:'',
    listtype:'goods',
	  purchaseId: 0,
    shopTotalN: 0,
    shopPieceN: 0,
	  update: 0, // 判断更新操作
    status: 0,
    productlist:[],
    conclusion: '',
    productType: '', // 类型
	  pageindex: 0,
	  productStatus:'', // 判断订货详情
	  tempShopListData: [], // 临时处理数据
  },
	/**
	 * Description: 读取商品列表 待派单
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
	getShopListData() {
		let getData = {
			purchaseId: this.data.purchaseId,
			shopId:app.selectIndex,
		}
		sysService.purchasedetail({
			url:'info',
			method:'get',
			data: getData
		}).then((res) => {
			console.log(res);
			if (res.code == 0) {
				let shopTempArray = this.shopListDataProcess(res.purchaseDetailVOList);
				console.log(shopTempArray);
				this.setData({
					productType: 'goods',
					productStatus: 'goodsdetail',
					productlist: shopTempArray
				})
			} else if (res.code == 401) {
				config.logOutAll();
				return
			} else {
				wx.showToast({
					title: res.msg,
					icon:'none'
				})
			}
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
		let shopTempObject = {};
		data.forEach((item) => {
			let tempObj = { // 原始数据 第一层循环数据 需要提炼出来 放到循环数组中，以便提交数据用  needNumber为 订货数量数据 循环时候需要用
				id: item.id,
				purchaseId: item.purchaseId,
				goodsId: item.goodsId,
				needNumber: item.needNumber,
				finalNumber: item.finalNumber,
				deliveryCount: item.deliveryCount,
			}
			item.shopItemSkuVO.attrValues = item.shopItemSkuVO.attrValues != null ? item.shopItemSkuVO.attrValues.split(',') : null;
			Object.assign(shopTempObject, item.shopItemSkuVO, {tempObj: tempObj});
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
    if (this.data.update !== '1') { // 1 为更新操作 处理原始数据，原始数据和后台传数据结构相差太大，很坑人的。
	    purchaseDetailVOList = wx.getStorageSync('goodsOrderCacheData');
	    isComplete = purchaseDetailVOList.filter((item) =>{ // 过滤 没有填写数据
		    if (item.item.unitValue !== 0) { // 提交数据整理
			    item.goodsId = item.skuId;
			    item.needNumber = item.item.unitValue;
			    item.shopItemSkuVO = {
				    attrValues: item.attrValues.toString(),
				    id: item.id,
				    item: item.item
			    }
			    delete item.attrValues;
			    delete item.copyShopItemSkuId;
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
			    return item;
		    }
	    })
    } else {
	    purchaseDetailVOList = wx.getStorageSync('productList-dh-confirm');
	    isComplete = purchaseDetailVOList.map((item) => { // 属性 数组转字符串
	      item.shopItemSkuVO.attrValues = item.shopItemSkuVO.attrValues.toString();
      })
    }
    let promeData = {
	    id: this.data.purchaseId || null, // 订单id
      shopId: app.selectIndex, // 店铺ID
      status: this.data.status || 0, // 状态 (1、待收货 2、部分收货 3、已收货 4、待派单)
	    purchaseDetailVOList: isComplete
    }
    if (this.data.update === '1') {
      sysService.purchase({
	      url: 'update',
        method: "post",
	      data: promeData
      }).then((res) => {
        if (res.code == 0) {
	        utils.showToast({title: '更新成功', page: '1'})
        } else if(res.code == 401) {
	        config.logOutAll();
	        return
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
			    utils.showToast({title: '订货成功', page: '2'});
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
		wx.removeStorageSync('resultsGoodsOrderCacheData');
		wx.removeStorageSync('searchGoodsOrderCacheData');
	},
  /* 前往照片上传页面 */
  nextGo(){
    let _this = this;
    let { outage, shopTotalN } = _this.data;
    if (shopTotalN <=0){
      wx.showToast({
        title: '请选择商品',
        icon:'none'
      });
      return 
    }
    
    wx.redirectTo({
      url: '../../pages/uploadimg/uploadimg?radiotxt=' + outage
    })
  },

	/**
	 * Description: 设置商品总数 只需要监听数据变化即可
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/27
	 */
	_watchChange(){
		let resultsGoodsOrderCacheData = [];
		let shopPieceN = 0; // 选中多少件商品
		if (this.data.productStatus == 'goodsdetail') {
			resultsGoodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData'); // 读取订货缓存
		} else {
			resultsGoodsOrderCacheData = wx.getStorageSync('resultsGoodsOrderCacheData'); // 读取订货缓存
		}
		resultsGoodsOrderCacheData = resultsGoodsOrderCacheData ? resultsGoodsOrderCacheData : this.data.productlist;
		let tempGoodsOrderData = resultsGoodsOrderCacheData.filter((item) => {
			return item.item.unitValue != '' || item.item.unitValue != 0;
		})
		tempGoodsOrderData.forEach((item) => {
			shopPieceN += item.item.unitValue
		})
		this.setData({
			shopTotalN: tempGoodsOrderData.length,
			shopPieceN: shopPieceN
		})
	},
  /**
   * Description: 订单结果页 完全读取缓存显示
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/27
   */
  orderResultsPage() {
    let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData');
    let tempgoodsOrderCacheData = goodsOrderCacheData.filter((item) => {
      return item.item.unitValue != '' || item.item.unitValue != '0' || item.item.unitValue != 0;
    })
    wx.setStorageSync('resultsGoodsOrderCacheData', tempgoodsOrderCacheData); // 订单结果整合页数据需要提出来 在缓存
    this.setData({
      productlist: tempgoodsOrderCacheData
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  	console.log(options, 'status');
    let pageindex = wx.getStorageSync('pageindex');
    let pagetitle = wx.getStorageSync('pagetitle');
	  let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData');
	  if (pageindex == 0 && goodsOrderCacheData) {
		  this.orderResultsPage(); // 订单结果页面重新缓存新数据
		  this._watchChange(); //商品数量
	  }
    if (pageindex == 0) {
      this.setData({
        conclusion: options.conclusion ? options.conclusion : null, // 是否进入订货结果页面
        productType: options.productType ? options.productType : null,
	      status: options.orderStatus ? options.orderStatus : null,  // 订货单状态
	      purchaseId: options.orderId ? options.orderId : null, // 订货单id
      })
    }
	  if (options.goods == 'goodsdetail') {
		  this.getShopListData();
		  this.clearCache();
		  this._watchChange(); //商品数量
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