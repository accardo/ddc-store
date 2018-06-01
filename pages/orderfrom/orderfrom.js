// pages/orderfrom/orderfrom.js
const config = require('../../service/sys.service.js');
const sysService = require('../../service/sys.service.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagetype:'orderfrom',
    pagetitle:'',
    status: 0, // 订货状态 或 盘点状态
	  purchaseId: 0, // 订货单id 或 盘点id 出库id
    imgList:[],
	  receiptList: [], // 初始化数据
  },

	/**
	 * Description: 获取订货单详情商品列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/30
	 */
  getPurchaseDetail(){
	  wx.showLoading({ title: '加载中' });
    let promseData = {
      purchaseId: this.data.purchaseId,
      shopId: app.selectIndex
    }
    sysService.purchasedetail({
      url:'info',
      method:'get',
      data: promseData
    }).then((res) => {
      if (res.code == '0') {
	      this.setData({
	        receiptList: res.purchaseDetailVOList // 订货列表数据
        })
	      wx.hideLoading();
      } else if(res.code == '401') {
		    config.logOutAll();
		    return
	    } else {
		    wx.showToast({
			    title: res.msg,
			    icon: 'none'
		    })
      }
    })
  },
	/**
	 * Description: 获取盘点详情列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/30
	 */
	getInventoryData() {
		wx.showLoading({ title: '加载中' });
		let promseData = {
			inventoryId: this.data.purchaseId,
			shopId: app.selectIndex,
      status: this.data.status
		}
		sysService.inventorydetail({
			url:'info',
			method:'get',
			data: promseData
		}).then((res) => {
			if (res.code == '0') {
				this.setData({
					receiptList: res.inventoryDetailVOList // 订货列表数据
				})
				wx.hideLoading();
			} else if(res.code == '401') {
				config.logOutAll();
				return
			} else {
				wx.showToast({
					title: res.msg,
					icon: 'none'
				})
			}
		})
  },
	/**
	 * Description: 获取出库详情列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/1
	 */
	getoutboundData() {
		wx.showLoading({ title: '加载中' });
		let promseData = {
			deliveryId: this.data.purchaseId,
			shopId: app.selectIndex,
		}
		sysService.deliverydetail({
			url:'info',
			method:'get',
			data: promseData
		}).then((res) => {
			if (res.code == '0') {
				this.setData({
					receiptList: res.inventoryDetailVOList // 订货列表数据
				})
				wx.hideLoading();
			} else if(res.code == '401') {
				config.logOutAll();
				return
			} else {
				wx.showToast({
					title: res.msg,
					icon: 'none'
				})
			}
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, 'orderfrom'); // orderId 店铺id ，orderStatus 店铺状态 1、已完成， 2、待审核
    let pageindex = wx.getStorageSync('pageindex');
    let pagetitle = wx.getStorageSync('pagetitle');
    //let imgList = wx.getStorageSync('imgList');
   // imgList = imgList.length > 0 ? imgList : ['../../icons/def-img.png'];

    if (pageindex == 0) {
	    this.setData({
		    purchaseId: options.orderId, // 订货id 或 盘点id
		    status: options.orderStatus, // 订货状态 或 盘点状态
	    })
	    this.getPurchaseDetail();
    } else if(pageindex == 1) {
	    this.setData({
		    purchaseId: options.orderId, // 订货id 或 盘点id
		    status: options.orderStatus, // 订货状态 或 盘点状态
	    })
	    this.getInventoryData();
    } else if (pageindex == 2) {
	    this.setData({
		    purchaseId: options.orderId // 出库 id
	    })
	  	this.getoutboundData();
    }

    // if(pageIndex == 1){
    //   this.setData({
    //     receiptList:this.data.stockquerylist
    //   })
    // }else if(pageIndex == 2){
    //   pagetitle = '出库';
    //   this.setData({
    //     pagetitle,
    //     imgList,
    //     receiptList: this.data.outGoList
    //   })
    // }
    wx: wx.setNavigationBarTitle({
      title: pagetitle+'单'
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