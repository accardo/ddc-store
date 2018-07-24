// pages/allocation/allocation.js
import * as logic from  '../../utils/logic';
const config = require('../../config/config.js');
const utils = require('../../utils/util');
const shopListService = require('../../service/service.service.js');
const app = getApp();
const storeLogic = new logic.StoreLogic();
const orderLogic = new logic.OrderLogic();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopAds: '',
    selectIndex: 0,
    shopArray: [], // 店铺地址
    productlist: [], // 初始化数据
	  defaultImg: '../../icons/shop.png', // 商品在没选择前 默认图片
	  imgDefault: true, // 控制要转换商品默认图
    tempCacheData: [], // 累加存储数据
	  inShopId: null, //调入店铺id
  },
	/**
	 * Description: 处理店铺地址
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
	shopAddress() {
		let companyId = wx.getStorageSync('companyId');
		shopListService.api({
			url: "/list",
			method: "get",
			data: {
				companyId
			}
		}).then((res) => {
			if (res.code == 0) {
			  let shopAddress = res.shopList.filter((item) => {
			     return item.id != app.selectIndex
			  })
				this.setData({
					shopArray: shopAddress
				})
			}else{
				wx.showToast({
					title: res.msg,
					icon:'none'
				})
			}
		})
  },
  /* 选择门店 */
  selectShop(e) {
	  this.data.inShopId = this.data.shopArray[e.detail.value].id;
    this.setData({
	    selectIndex: this.data.shopArray[e.detail.value].id,
	    shopName: this.data.shopArray[e.detail.value].shopName
    })
  },

  /* 添加调拨 商品 */
  searchShop(){
  	wx.removeStorageSync('searchTransferCacheData');
    wx.navigateTo({
      url:'../../pages/search/search?shopTypeSearch=search'
    })
  },

	/**
	 * Description: 提交调拨
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
  subAllot(){
  	let transferCacheData = wx.getStorageSync('transferCacheData');
	  let promeData = {
	  	id: 0,
		  outShopId: app.selectIndex, // 调出的店铺id
		  inShopId: this.data.inShopId, // 调入店铺id
		  outTransferId: 0,
		  transferDetailVOList: storeLogic.processData(transferCacheData)
	  }
	  if (promeData.inShopId == '' || promeData.inShopId == null) {
		  wx.showToast({
			  title: '调入门店不能为空',
			  icon: 'none'
		  })
		  return
	  }
    wx.showModal({
      content: '是否确认提交调拨？',
      confirmColor: config.showModal.confirmColor,
      success: function (res) {
        if(res.confirm){
        	storeLogic.ajaxSaveUpdate('transfer', promeData, true).then(() => {
		        utils.showToast({title: '调拨成功', page: 1, pages: getCurrentPages()});
		        wx.removeStorageSync('transferCacheData');
		        wx.removeStorageSync('searchTransferCacheData');
	        })
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.shopAddress() // 获取店铺列表
	  wx.removeStorageSync('searchTransferCacheData');
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
    let transferCacheData = wx.getStorageSync('transferCacheData') || []; // 调拨 所有选中 缓存
    let searchTransferCacheData = wx.getStorageSync('searchTransferCacheData'); // 调拨 搜索 缓存
	  if (searchTransferCacheData) {
		  this.setData({
			  imgDefault: false,
			  productlist: orderLogic.allocationModule(transferCacheData, searchTransferCacheData),
		  })
	  }
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