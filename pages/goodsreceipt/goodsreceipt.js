// pages/goodsreceipt/goodsreceipt.js
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,
    ordernumber:'',
    pagetype:'goodsreceipt',
    txtName: "实收数量",
    receiptList: [], // 订货列表初始化数据
	  status: '', // 订货状态
	  tempReceiptList: [], // 子组件返回父组件临时数据待提交用
    purchaseId: '' // 订货单ID
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
	/**
	 * Description: 部分收货
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/23
	 */
	partialReceipt(){
		let	ArrayDeepCopyData = utils.ArrayDeepCopy(this.data.tempReceiptList);  // 深层拷贝防止子组件数据联动
		let purchaseDetailVOList = utils.attrValuesSkuToString(ArrayDeepCopyData); // array 转 string 提交数据
		    purchaseDetailVOList = purchaseDetailVOList.filter((item) => {
					if (item.deliveryCount !== null && item.deliveryCount !== '') {
						delete item.createTime;
						delete item.purchaseId;
						delete item.shopItemSkuVO.copyShopItemSkuId;
						delete item.shopItemSkuVO.costPrice;
						delete item.shopItemSkuVO.isExist;
						delete item.shopItemSkuVO.isSale;
						return item;
			    };
				})
		let promeData = {
			id: this.data.purchaseId || null, // 订单id
			shopId: app.selectIndex, // 店铺ID
			status: 2, // 状态 (1、待收货 2、部分收货 3、已收货 4、待派单)
			purchaseDetailVOList
		}
	  sysService.purchase({
		  url: 'update',
		  method: "post",
		  data: promeData
	  }).then((res) => {
		  if (res.code == 0) {
			  utils.showToast({title: '部分收货成功', page: 1});
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

  //全部收货
  completeReceipt(){
	  let	ArrayDeepCopyData = utils.ArrayDeepCopy(this.data.tempReceiptList);  // 深层拷贝防止子组件数据联动
	  let purchaseDetailVOList = utils.attrValuesSkuToString(ArrayDeepCopyData); // 属性 数组转字符串
	  let isComplete = ArrayDeepCopyData.filter((item) => { // 过滤是否有 - 的商品，有如果判断收货数量是否填写，返回为[]责为全部收货
		  if (item.finalNumber == 0) {
			  if (item.deliveryCount == '' || item.deliveryCount == null ) {
				  return item;
			  }
		  }
	  })
	  let promeData = {
		  id: this.data.purchaseId || null, // 订单id
		  shopId: app.selectIndex, // 店铺ID
		  status: 3, // 状态 (1、待收货 2、部分收货 3、已收货 4、待派单)
		  purchaseDetailVOList
	  }
    if (isComplete.length <= 0) {
      wx.showModal({
        content: '是否确认收货完毕？',
        confirmColor: config.showModal.confirmColor,
        success: function (res) {
          if (res.confirm){
	          sysService.purchase({
		          url: 'update',
		          method: "post",
		          data: promeData
	          }).then((res) => {
		          if (res.code == 0) {
		          	utils.showToast({ title:'收货成功', page: 1 });
		          } else if (res.code == 401) {
			          config.logOutAll();
			          return
		          }
	          })
          }
        }
      });
    }else{
      wx.showToast({
        title: '部分商品无实收数据',
        icon:'none'
      })
    }
    
  },
	/**
	 * Description: 待收货页面数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/23
	 */
  getSreceipt() {
		wx.showLoading({ title: '加载中' });
		let shopId = app.selectIndex;
		let promseData = {
			purchaseId: this.data.purchaseId, // 订货单ID
			shopId, // 店铺ID
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
			}
		})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
	  let pageindex = wx.getStorageSync('pageindex');
	  if (pageindex == 0) { // 0 订货页面
		  this.setData({
			  purchaseId: options.orderId, // 订货单id
			  status: options.orderStatus,
		  })
		  this.getSreceipt();
	  }
    wx.setNavigationBarTitle({
      title: '收货'
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