import * as utils from'../../utils/util';
import { StoreLogic } from '../../utils/logic';
const app = getApp();
const storeLogic = new StoreLogic();
// pages/uploadimg/uploadimg.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList: [],  // 图片存储
	  reason: '', //  出库原因  报废：商品破损、商品过期、商品变质； 退货：临期、过期、在库退货、质量问题；
	  outboundType: 0, // 出库类型 1 报废  2 退货
  },
	/*
	 * Description: 子组件返回的上传信息
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/19
	 */
	_bindUploadImg(e) {
		this.data.imgList = e.detail
	},
	/*
	 * Description: 提交信息
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/20
	 */
	subInfo(){
  	const pageindex = wx.getStorageSync('pageindex');
	  const outboundCacheData = wx.getStorageSync('outboundCacheData');
	  const serviceUrl = pageindex != 7 ? 'delivery' : 'returnlist';
	  const voList = pageindex != 7 ? 'deliveryDetailVOList' : 'returnDetailVOList';
	  let promdData = {
		  id: null,
		  shopId: app.selectIndex, // 店铺ID
		  type: this.data.outboundType, // 出库类型
		  reason: this.data.reason, // 出库原因
		  imageUrls: this.data.imgList.toString(),
		  [voList]: storeLogic.processData(outboundCacheData[0])
	  }
		storeLogic.ajaxSaveUpdate(serviceUrl, promdData, true).then(() => {
		  utils.showToast({title: '保存成功', page: 3, pages: getCurrentPages()});
		  wx.removeStorageSync('outboundCacheData');
	  })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pagetitle = wx.getStorageSync('pagetitle');
    this.setData({
	    reason: options.reason, // 出库原因
	    outboundType: options.outboundType, // 1 报废 2 退货
    })
    wx.setNavigationBarTitle({
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