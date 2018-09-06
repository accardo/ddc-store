// pages/allotcollect/allotcollect.js
import * as logic from  '../../utils/logic';
import * as utils from'../../utils/util';
const config = require('../../config/config.js');
const app = getApp();
const storeLogic = new logic.StoreLogic();
// const orderLogic = new logic.OrderLogic();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productlist: [],
	  type: '', // 调拨状态 1、调拨入库； 2、调拨出库
	  transferId: '', // 调拨单id
	  outShopId: '', // 调出店铺 id
	  inShopId: '',  // 调入店铺id
	  outTransferId: '' // 调拨单id
  },
	/**
	 * Description: 获取调拨详情列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
	gettransferData() {
		let promseData = {
			transferId: this.data.transferId,
			shopId: app.selectIndex,
			type: this.data.type
		}
		storeLogic.ajaxGetData('transferdetail/info', promseData).then((res) => {
			let productlist = utils.attrValuesSkuSplit(res.transferVO.transferDetailVOList); // attrValues string 转 array 提交数据
					productlist.forEach((item) => {
						item.type = this.data.type;
					})
			this.setData({
				productlist, // 订货列表数据
				outTransferId: res.transferVO.outTransferId,
			})
		})
	},
	/**
	 * Description: 收货完毕
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/7
	 */
  subAllot(){
    let collectCacheData = wx.getStorageSync('collectCacheData');
				collectCacheData = collectCacheData ? utils.attrValuesSkuToString(collectCacheData) : utils.attrValuesSkuToString(this.data.productlist);
			//	collectCacheData = orderLogic.filterData(collectCacheData, 6);
		let promseData = {
			id: this.data.transferId, // 调拨单id
			outShopId: this.data.outShopId,  // 调出店铺 id
			inShopId: this.data.inShopId, // 调入店铺id
			outTransferId: this.data.outTransferId, // 调拨出库单id
			transferDetailVOList: collectCacheData
		}
		/*if (collectCacheData.length != this.data.productlist.length ) {
		    utils.showToastNone('部分商品未填写数量');
		    return;
		}*/
		console.log(promseData);

		wx.showModal({
			content: '是否确认收货完成？',
			confirmColor: config.showModal.confirmColor,
			success: (res) => {
				if (res.confirm) {
					storeLogic.ajaxSaveUpdate('transfer', promseData, false).then(() => {
						utils.showToast({title: '调拨更新成功', page: 1, pages: getCurrentPages()});
					})
				}
			}
		});
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  let pagetitle = wx.getStorageSync('pagetitle');
	  this.setData({
		  transferId: options.orderId, // 调拨单id
		  type: options.orderType,  // 调拨点状态
		  outShopId: options.outShopId, // 调出店铺 id
		  inShopId: options.inShopId,  // 调入店铺id
	  })
	  this.gettransferData();
	  wx.setNavigationBarTitle({
		  title: pagetitle
	  })
	  wx.removeStorageSync('collectCacheData');
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