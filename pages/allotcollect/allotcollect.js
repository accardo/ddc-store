// pages/allotcollect/allotcollect.js
const app = getApp();
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productlist: [],
    productType: '调拨收货',
    status: '',
	  transferId: '',
  },
	/**
	 * Description: 获取调拨详情列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
	gettransferData() {
		wx.showLoading({ title: '加载中' });
		let promseData = {
			transferId: this.data.transferId,
			shopId: app.selectIndex,
			type: this.data.status
		}
		sysService.transferdetail({
			url:'info',
			method:'get',
			data: promseData
		}).then((res) => {
			if (res.code == '0') {
				this.setData({
					receiptList: res.transferVO, // 订货列表数据
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
  /* 收货完毕 */
  subAllot(){
    let productList = wx.getStorageSync('productList');
    let state = true;
    productList = productList ? JSON.parse(productList) : [];
    productList.map(item=>{
      let collect = item.collect;
      if (!collect){
        state = false;
        wx.showToast({
          title: '部分商品未完成收货',
          icon: "none"
        })
        return ;
      }
    })
    /* 收货成功 */
    if (state){
      wx.showToast({
        title: '收货成功'
      })
      setTimeout(()=>{
        wx.navigateBack({
          delta:1
        })
      },1200);
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  this.setData({
		  transferId: options.orderId, // 调拨单id
		  status: options.orderStatus  // 调拨点状态
	  })
	  this.gettransferData();
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
    let selectIndex = app.selectIndex;
    let pagetitle = wx.getStorageSync('pagetitle');
    wx: wx.setNavigationBarTitle({
      title: pagetitle
    })
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