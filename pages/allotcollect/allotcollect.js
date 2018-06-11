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
	  type: '', // 调拨状态 1、调拨入库； 2、调拨出库
	  transferId: '', // 调拨单id
	  outShopId: '', // 调出店铺 id
	  inShopId: '',  // 调入店铺id
	  outTransferId: '', // 调拨出库单id
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
			type: this.data.type
		}
		sysService.transferdetail({
			url:'info',
			method:'get',
			data: promseData
		}).then((res) => {
			if (res.code == '0') {
				res.transferVO.transferDetailVOList.forEach((item) => {
					if (item.shopItemSkuVO !== null) {
						item.shopItemSkuVO.attrValues = utils.attrValuesSplit(item.shopItemSkuVO);
						item.type = this.data.type;
					}
				})
				this.setData({
					productlist: res.transferVO.transferDetailVOList, // 订货列表数据
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
	 * Description: 收货完毕
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/7
	 */
  subAllot(){
    let collectCacheData = wx.getStorageSync('collectCacheData');
		collectCacheData = collectCacheData && collectCacheData.filter((item) => {
			if (item.inNumber != '' && item.inNumber != '0') {
				item.shopItemSkuVO.attrValues = utils.attrValuesToString(item.shopItemSkuVO);
				return item;
			}
		})
		if (collectCacheData.length != this.data.productlist.length ) {
		    wx.showToast({
		      title: '部分商品未完成收货',
		      icon: "none"
		    })
		    return ;
		} else {
			let promseData = {
				id: this.data.transferId, // 调拨单id
				outShopId: this.data.outShopId,  // 调出店铺 id
				inShopId: this.data.inShopId, // 调入店铺id
				outTransferId: this.data.outTransferId, // 调拨出库单id
				transferDetailVOList: collectCacheData
			}
			sysService.transfer({
				url:'update',
				method:'post',
				data: promseData
			}).then((res) => {
				if (res.code == '0') {
					utils.showToast({title: '调拨更新成功', page: 1, pages: getCurrentPages()});
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
		}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  	wx.removeStorageSync('collectCacheData');
	  let pagetitle = wx.getStorageSync('pagetitle');
	  this.setData({
		  transferId: options.orderId, // 调拨单id
		  type: options.orderType,  // 调拨点状态
		  outShopId: options.outShopId, // 调出店铺 id
		  inShopId: options.inShopId,  // 调入店铺id
		  outTransferId: options.outTransferId // 调拨出库单id
	  })
	  this.gettransferData();
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