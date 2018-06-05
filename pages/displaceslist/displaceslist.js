// pages/displaceslist/displaceslist.js
const app = getApp();
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnDisabled: true,
	  converFromShop: [], // 要转换商品
	  converIntoShop: [], // 转化为商品
	  isSelect: 1, // 判断是否可以点击 1 为不可点击
	  displaceId: 0, // 置换单id
  },
	/**
	 * Description: 获取置换详情列表
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
	getdisplacedetailinfo() {
		let promdData = {
		  shopId: app.selectIndex,
			displaceId: this.data.displaceId, // 置换单id
    }
		sysService.displacedetail({
			url:'info',
			method:'get',
      data: promdData
		}).then((res) => {
		  console.log(res, '置换单数据');
			if (res.code == '0') {
			  let needAttrValues = res.displaceDetailVOList[0].needShopItemSkuVO;
			  let shopAttrValues = res.displaceDetailVOList[0].shopItemSkuVO;
			  needAttrValues.attrValues = needAttrValues.attrValues != null ? needAttrValues.attrValues.split(',') : null;
			  shopAttrValues.attrValues = shopAttrValues.attrValues != null ? shopAttrValues.attrValues.split(',') : null;
				res.displaceDetailVOList[0].needShopItemSkuVO.resultNumber = res.displaceDetailVOList[0].resultNumber;
				this.setData({
					converFromShop: [res.displaceDetailVOList[0].needShopItemSkuVO],
					converIntoShop: [res.displaceDetailVOList[0].shopItemSkuVO]
				})
			} else if (res.code == '401') {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, '置换单')
    this.setData({
	    displaceId: options.orderId
    })
	  this.getdisplacedetailinfo();
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