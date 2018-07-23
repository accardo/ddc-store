// pages/orderfrom/orderfrom.js
const utils = require('../../utils/util');
import * as logic from  '../../utils/logic';
const storeLogic = new logic.StoreLogic();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagetitle:'',
    status: 0, // 订货状态 或 盘点状态
	  purchaseId: 0, // 订货单id 或 盘点id 出库id
	  reason: '', // 破损原因
    imgList:[], // 图片显示
	  receiptList: [], // 初始化数据
	  tempReceiptList: [], // 子组件返回父组件临时数据待提交用
	  pageindex: null, // 判断显示哪一个页面  订单、盘点、出库 等
	  type: '', // 调拨 状态 1、调拨入库 2、调拨出库
	  imgBigUrl: '', // 放大的图片
	  imgIsShow: false,
  },
	/**
	 * Description: 统一回调处理 返回信息
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/8
	 */
	requestReturnInfo(res, data, img = null) {
		this.setData({
			receiptList: data, // 订货列表数据
			imgList: img
		})
	},
	/**
	 * Description: 获取订货单详情商品列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/30
	 */
  getPurchaseDetail() {
    let promseData = {
      purchaseId: this.data.purchaseId,
      shopId: app.selectIndex
    }
		storeLogic.ajaxGetData('purchasedetail/info', promseData).then((res) => {
			this.requestReturnInfo(res, res.purchaseDetailVOList);
		})
  },
	/*
	 * Description: 获取收货详情商品列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/12
	 */
	getReceiptdetail() {
		let promseData = {
			receiptId: this.data.purchaseId,
			shopId: app.selectIndex
		}
		storeLogic.ajaxGetData('receiptdetail/info', promseData).then((res) => {
			this.requestReturnInfo(res, res.receiptDetailVOList);
		})
	},
	/**
	 * Description: 获取盘点详情列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/30
	 */
	getInventoryData() {
		let promseData = {
			inventoryId: this.data.purchaseId,
			shopId: app.selectIndex,
      status: this.data.status
		}
		storeLogic.ajaxGetData('inventorydetail/info', promseData).then((res) => {
			this.requestReturnInfo(res, res.inventoryDetailVOList);
		})
  },
	/**
	 * Description: 获取出库详情列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/1
	 */
	getoutboundData() {
		let promseData = {
			deliveryId: this.data.purchaseId,
			shopId: app.selectIndex,
		}
		storeLogic.ajaxGetData('deliverydetail/info', promseData).then((res) => {
			this.requestReturnInfo(res, res.deliveryDetailVOList, res.imageUrls);
		})
	},
	/**
	 * Description: 获取调拨详情列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
	gettransferData() {
		let promseData = {
			transferId: this.data.purchaseId,
			shopId: app.selectIndex,
			type: this.data.type
		}
		storeLogic.ajaxGetData('transferdetail/info', promseData).then((res) => {
			this.requestReturnInfo(res, res.transferVO.transferDetailVOList);
		})
	},
	/*
	 * Description: 获取申请退货详情 info
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/9
	 */
	getAppReturn() {
		let promseData = {
			returnId: this.data.purchaseId,
			shopId: app.selectIndex,
		}
		storeLogic.ajaxGetData('returndetail/info', promseData).then((res) => {
			this.requestReturnInfo(res, res.returnDetailVOList, res.imageUrls);
		})
	},
	/**
	 * Description: 子组件返回的订货数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/23
	 */
	_bindReceiptData(e) {
		this.setData({
			tempReceiptList: e.detail
		})
	},
	/*
	 * Description: 上传图片子组件
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/19
	 */
	_bindUploadImg(e) {
		this.data.imgList = e.detail
	},
	/*
	 * Description: 申请退货更新数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/10
	 */
	returnUpdate() {
		let	promdData = {
				id: this.data.purchaseId || null, // 订单id
				shopId: app.selectIndex, // 店铺ID
				status: 4, // 状态  4 未提交
				type: this.data.type,
				reason: this.data.reason,
				imageUrls: this.data.imgList.toString(),
				returnDetailVOList: storeLogic.subData1(this.data.tempReceiptList)
			}
			storeLogic.ajaxSaveUpdate('returnlist', promdData, true).then(() => {
				utils.showToast({title: '更新成功', page: 1, pages: getCurrentPages()});
			})
	},
	/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pageindex = wx.getStorageSync('pageindex');
    let pagetitle = wx.getStorageSync('pagetitle');
		let listType = getCurrentPages()[1].data.listType // 点击的是 申请退货 或 退货
	  this.setData({
		  purchaseId: options.orderId || '', // 订货id 盘点id 订货id 盘点id 出库id 调拨单id 集于一身
		  status: options.orderStatus || '', // 订货状态 或 盘点状态
		  type: options.orderType || '',  // 调拨点状态 订货状态 盘点状态
		  reason: options.orderReason || '', // 破损原因
		  pageindex,
	  })
    if (pageindex == 0) {
			if (listType == 1) {
				this.getPurchaseDetail();
			} else if(listType == 2) {
				this.getReceiptdetail();
			}
    } else if(pageindex == 1) {
	    this.getInventoryData();
    } else if (pageindex == 2) {
	  	this.getoutboundData();
    } else if (pageindex == 4) {
	    this.gettransferData();
    } else if (pageindex == 7) {
	  	this.getAppReturn();
    }
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