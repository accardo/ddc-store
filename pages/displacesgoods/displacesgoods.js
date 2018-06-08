// pages/displacesgoods/displacesgoods.js
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
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
	 * Description: 选择搜索商品
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
  goSearch(e){
    // convert = from: 要转换商品, convert = info: 转化为商品
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
		let converInto = wx.getStorageSync('setConverInto'); // 转化为商品 数据
    let isComplete = converFrom.map((item, index) => { // 提交数据整理
			item.needShopItemSkuVO = {
				attrValues: utils.attrValuesToString(item), // array 转 string 提交数据
				id: item.id,
				item: item.item
			}
	    item.shopItemSkuVO = {
		    attrValues: utils.attrValuesToString(converInto[index]), // array 转 string 提交数据
		    id: converInto[index].id,
		    item: converInto[index].item
      }
      item.id = null;
			delete item.attrValues;
			delete item.copyShopItemSkuId;
			delete item.isExist;
			delete item.isSale;
			delete item.item;
			delete item.price;
			delete item.shopItemId;
			delete item.skuId;
			delete item.skuSn;
			delete item.stock;
			delete item.thumb;
			delete item.valueIds;
			delete item.costPrice;
			delete item.navClass;
			return item;
		})

		let promdData = {
			id: null,
			shopId: app.selectIndex, // 店铺ID
			displaceDetailVOList: isComplete
		}
    let resultNumber = promdData.displaceDetailVOList[0].resultNumber;
    if (resultNumber != '' && resultNumber > 0) {
	    sysService.displace({
		    url: 'save',
		    method: "post",
		    data: promdData
	    }).then((res) => {
		    if (res.code == 0) {
			    utils.showToast({title: '置换成功', page: 2})
		    } else if(res.code == 401) {
			    config.logOutAll();
			    return
		    } else {
			    wx.showToast({
				    title: res.msg,
				    icon: 'none'
			    })
		    }
	    })
    } else {
	    wx.showToast({
		    title: '请填写转化数量',
		    icon: 'none'
	    })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, '置换')
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