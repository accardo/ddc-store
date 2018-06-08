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
    imgList:[], // 图片显示
	  receiptList: [], // 初始化数据
	  pageindex: null, // 判断显示哪一个页面  订单、盘点、出库 等
	  type: '', // 调拨 状态 1、调拨入库 2、调拨出库
  },
	/**
	 * Description: 统一回调处理 返回信息
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/8
	 */
	requestReturnInfo(res, data, img = null) {
		if (res.code == '0') {
			this.setData({
				receiptList: data, // 订货列表数据
				imgList: img
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
      this.requestReturnInfo(res, res.purchaseDetailVOList);
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
			this.requestReturnInfo(res, res.inventoryDetailVOList);
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
			this.requestReturnInfo(res, res.deliveryDetailVOList, res.imageUrls);

		})
	},
	/**
	 * Description: 获取调拨详情列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
	gettransferData() {
		wx.showLoading({ title: '加载中' });
		let promseData = {
			transferId: this.data.purchaseId,
			shopId: app.selectIndex,
			type: this.data.type
		}
		sysService.transferdetail({
			url:'info',
			method:'get',
			data: promseData
		}).then((res) => {
			this.requestReturnInfo(res, res.transferVO.transferDetailVOList);
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, 'orderfrom'); // orderId 店铺id ，orderStatus 店铺状态 1、已完成， 2、待审核
    let pageindex = wx.getStorageSync('pageindex');
    let pagetitle = wx.getStorageSync('pagetitle');
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
    } else if (pageindex == 4) {
	    this.setData({
		    purchaseId: options.orderId, // 调拨单id
		    type: options.orderType  // 调拨点状态
	    })
	    this.gettransferData();
    }
    this.setData({
	    pageindex,
    })

    wx.setNavigationBarTitle({
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