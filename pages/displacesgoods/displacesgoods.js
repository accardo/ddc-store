// pages/displacesgoods/displacesgoods.js
import * as logic from  '../../utils/logic';
const utils = require('../../utils/util');
const app = getApp();
const storeLogic = new logic.StoreLogic();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnDisabled: true, // 当转换商品和 转化为商品都选中时候 打开 提交置换按钮
	  converFromShop: [], // 要转换商品
	  converIntoShop: [], // 转化为商品
    isSelect: 1, // 判断是否可以点击 1 为不可点击
    defaultImg: '../../icons/shop.png', // 商品在没选择前 默认图片
	  fromDefault: true, // 控制要转换商品默认图
	  intoDefault: true, // 控制转为商品默认图
	  inputShow: false // 是否显示input框
  },
	/**
	 * Description: 选择搜索商品 convert = from: 要转换商品, convert = info: 转化为商品
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
  goSearch(e) {
    wx.navigateTo({
      url: `../../pages/search/search?convert=${e.currentTarget.dataset.convert}`
    })
  },
	/**
	 * Description: 设置选中的商品
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
  setShopFun(){
    let converFrom = wx.getStorageSync('setConverFrom'); // 读取 要转换商品
    let converInto = wx.getStorageSync('setConverInto'); // 读取 转化为商品
    this.setData({
	    converFromShop: converFrom ? converFrom : [],
	    converIntoShop: converInto ? converInto : []
    })
    if (converFrom) {
      this.setData({
	      fromDefault: false,
	      inputShow: true
      })
    }
    if (converInto) {
	    this.setData({
		    intoDefault: false
	    })
    }
    if(converFrom && converInto) {
	    this.setData({
		    btnDisabled: false
	    })
    }
  },
	/**
	 * Description: 提交置换
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
  subDisplace(){
		let converFrom = wx.getStorageSync('setConverFrom'); // 要转换商品 数据
		let converInto = wx.getStorageSync('setConverInto'); // 转化为商品 数
		let processData = {
				id: null,
				shopId: app.selectIndex, // 店铺ID
				displaceDetailVOList: storeLogic.subData5(converFrom, converInto)
			}
		let resultNumber = processData.displaceDetailVOList[0].resultNumber;
    if (resultNumber == '' || resultNumber < 0) {
    	utils.showToastNone('请填写转化数量');
	    return
    }
		storeLogic.ajaxSaveUpdate('displace', processData, true).then(() => {
			utils.showToast({title: '置换成功', page: 1, pages: getCurrentPages()});
		})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.setShopFun();
	  wx.setNavigationBarTitle({
		  title: wx.getStorageSync('pagetitle')
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
    this.setShopFun();
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