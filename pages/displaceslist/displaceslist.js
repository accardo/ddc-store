// pages/displaceslist/displaceslist.js
import * as utils from'../../utils/util';
import * as logic from  '../../utils/logic';
const app = getApp();
const storeLogic = new logic.StoreLogic();
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
		storeLogic.ajaxGetData('displacedetail/info', promdData).then((res) => {
			let needAttrValues = res.displaceDetailVOList[0].needShopItemSkuVO; // 要转换商品
			let shopAttrValues = res.displaceDetailVOList[0].shopItemSkuVO; // 转化为商品
			needAttrValues.attrValues = utils.attrValuesSplit(needAttrValues); // string 转 array 铺页面数据
			shopAttrValues.attrValues = utils.attrValuesSplit(shopAttrValues);  // string 转 array 铺页面数据
			res.displaceDetailVOList[0].needShopItemSkuVO.resultNumber = res.displaceDetailVOList[0].resultNumber;
			this.setData({
				converFromShop: [res.displaceDetailVOList[0].needShopItemSkuVO],
				converIntoShop: [res.displaceDetailVOList[0].shopItemSkuVO]
			})
		})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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