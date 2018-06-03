// pages/search/search.js
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    focus:true,
    searchtxt:'',
    searchReset: false,
    showList: false,
    shopType:'',
	  shopTypeSearch: '', // 当一个类型中既有搜索又有下单时候判断搜索类型缓存
    scrollTop: 0,
    currPage:1,
    pageSize:10,
    categoryId: '',
    productlist: [], // 搜索原始数据
	  navClassIndex: 0,
  },

  /**
   * Description: 清除搜索文本框
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  clearText() {
    this.setData({
      searchtxt: ''
    })
  },

  /**
   * Description: 获取搜索的数据列表 首先读取缓存数据
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  getSearchList() {
    let shopid = app.selectIndex;
	  let pageIndex = wx.getStorageSync('pageindex');
	  let itemTypes = utils.limitClass(pageIndex);
    let getProse = {
      currPage: this.data.currPage,
      pageSize: this.data.pageSize,
      categoryId: this.data.categoryId,
      shopId: shopid,
	    goodsName: this.data.searchtxt,
	    itemTypes
    }
    sysService.category({
      url: 'listProduct',
      method: 'get',
      data: getProse
    }).then((res) => {
      if (res.code == 0) {
        console.log(res.page.list);
	      res.page.list.forEach((item) => {
		      item.attrValues = item.attrValues ? item.attrValues.split(',') : null;
		      item.needNumber = 0;
		      item.navClass = this.data.navClassIndex;
	      })
	      this.setData({
		      showList: true,
          searchReset: res.page.list.length == 0 ? true : false,
		      productlist: res.page.list
        })
      }
    })
  },

  /**
   * Description: 点击查询
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  searchFun() {
    if (!this.data.searchtxt){
      wx.showToast({
        title: '请输入搜索内容',
        icon:"none"
      })
    } else {
      this.getSearchList();
    }
  },
  /**
   * Description: 设置文本内容
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  setSearchtxt(e) {
    this.setData({
      searchtxt: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { shopType, categoryId, shopTypeSearch } = options;
    console.log(options)
    if (shopType){
      this.setData({
        shoptype: shopType ? shopType : '',
        categoryId,
	      shopTypeSearch,
	      navClassIndex: options.navClass
      });
    }
    wx: wx.setNavigationBarTitle({
      title: '搜索'
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
    console.log('离开搜索页面执行')
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