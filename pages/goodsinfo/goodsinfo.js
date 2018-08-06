
import * as utils from'../../utils/util';
import * as logic from  '../../utils/logic';
const config = require('../../config/config.js');
const app = getApp();
const storeLogic = new logic.StoreLogic();
const orderLogic = new logic.OrderLogic();
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
	 * Description: 读取商品列表 待派单； 订货 状态 4 save; 未提交 状态 4 update; 部分收货 状态2 update ; 收货完毕 状态2 update
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
	getShopListData() {
		let promseData = {
			purchaseId: this.data.purchaseId,
			shopId: app.selectIndex,
		}
		storeLogic.ajaxGetData('purchasedetail/info', promseData).then((res) => {
			this.setData({
				productStatus: 'goodsdetail',
				productType: 'goods',
				productlist: storeLogic.subData3(res.purchaseDetailVOList)
			})
			this.clearCache();
			this._watchChangeDetial(); //详情商品数量
		})
	},
	/**
	 * Description: 下一步 订货商品
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
  goNext() {
    if (this.data.shopPieceN <= 0){
    	utils.showToastNone('请选择商品');
      return;
    }
    let thisTime = new Date().getHours();
		wx.showModal({
			content: (15 <= thisTime && thisTime <=24) ? '当前订货需求将在明天15:00提交至BD' : '是否提交数据？',
			confirmColor: config.showModal.confirmColor,
			success:(res) => {
				if(res.confirm){
					this.setPostData();
				}
			}
		})
  },
	/**
	 * Description: 更新 保存 数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
  setPostData(){
		let cacheData = wx.getStorageSync('cacheData');
		let cacheDataDetial = wx.getStorageSync('cacheDataDetial');
		let promeData = {
			id: this.data.purchaseId || null, // 订单id
			shopId: app.selectIndex, // 店铺ID
			status: this.data.status || 0, // 状态 (4、未提交 / 保存)
			purchaseDetailVOList: storeLogic.subData4(this.data.update == '1' ? cacheDataDetial : cacheData[0], this.data.productlist, this.data.update)
		}
		storeLogic.ajaxSaveUpdate('purchase', promeData, this.data.update == '1' ? false : true).then(() => {
			utils.showToast({
				title: this.data.update == '1' ? '更新成功' : '订货成功',
				page: this.data.update == '1' ? 1 : 2,
				pages: getCurrentPages()
			});
			this.clearCache();
		})
  },
	/**
	 * Description: 清空订货缓存
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/29
	 */
	clearCache() {
		wx.removeStorageSync('cacheData');
		wx.removeStorageSync('cacheDataDetial');
	},
  /* 前往照片上传页面 */
  nextGo(){
    let outboundCacheData = wx.getStorageSync('outboundCacheData');
	  let outboundCacheArray = orderLogic.filterData(outboundCacheData && outboundCacheData[0], 3);
	  if (outboundCacheData.length < 0) {
	  	utils.showToastNone('请添加商品');
	  	return
	  }
		if (this.data.productlist.length == outboundCacheArray.length) {
			wx.navigateTo({
				url: `../../pages/upload/upload?reason=${this.data.reason}&outboundType=${this.data.outboundType}`
			})
		} else {
			wx.showModal({
				content: '出库数量有未填，未填将不记录入库',
				confirmColor: config.showModal.confirmColor,
				success:(res) => {
					if(res.confirm){
						wx.navigateTo({
							url: `../../pages/upload/upload?reason=${this.data.reason}&outboundType=${this.data.outboundType}`
						})
					}
				}
			})
		}
  },

	/**
	 * Description: 设置商品总数 只需要监听数据变化即可
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/27
	 */
	_watchChange(){
		let cacheData = wx.getStorageSync('cacheData');
		let setShop = storeLogic.watchChange(cacheData && cacheData[0]);
		this.setData({
			shopTotalN: setShop.total || 0,
			shopPieceN: setShop.shopPieceN || 0
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
		let setShop = storeLogic.watchChange(cacheDataDetial);
		this.setData({
			shopTotalN: setShop.total || 0,
			shopPieceN: setShop.shopPieceN || 0
		})
	},
  /**
   * Description: 订单结果页 完全读取缓存显示
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/27
   */
  orderResultsPage() {
	  let cacheData = wx.getStorageSync('cacheData'); // 所有结果数据
	  if (cacheData) {
		  this.setData({
			  productlist: orderLogic.filterData(cacheData[0], 2)
		  })
	  }
  },
	/**
	 * Description: 出库页面 完全读取缓存显示 结果页面
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/31
	 */
	outboundResultePage() {
		let outboundCacheData = wx.getStorageSync('outboundCacheData'); // 所有结果数据
		if (outboundCacheData) {
			this.setData({
				productlist: orderLogic.filterData(outboundCacheData[0], 3)
			})
		}
	},
	/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pageindex = wx.getStorageSync('pageindex');
    let pagetitle = wx.getStorageSync('pagetitle');
    let cacheData = wx.getStorageSync('cacheData');
		this.setData({
			pageindex,
			update: options.update || null,
			conclusion: options.conclusion || null, // 是否进入订货结果页面
			productType: options.productType || null,
			status: options.orderStatus || null,  // 订货单状态
			purchaseId: options.orderId || null, // 订货单id
			reason: options.reason || null, // 出库原因
			outboundType: options.outboundType || null, // 1 报废 2 退货
		})
	  if (pageindex == 0 && cacheData) {
		  this.orderResultsPage(); // 订单结果页面重新缓存新数据
		  this._watchChange(); //商品数量
	  }
    if (pageindex == 2 || pageindex == 7) {
	    this.outboundResultePage();
    }
	  if (options.goods == 'goodsdetail') {
		  this.getShopListData();
	  }
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