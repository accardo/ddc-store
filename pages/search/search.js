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
    searchReset:null,
    showList: false,
    shopType:'',
	  shopTypeSearch: '', // 当一个类型中既有搜索又有下单时候判断搜索类型缓存
    scrollTop: 0,
    currPage:1,
    pageSize:10,
    shopId:0,
    categoryId: '',
    goodsName:'',
    productlist: [],
    displaceList:[]
  },

  /* 清除 搜索文本框 */
  clearText(){
    let _this = this;
    _this.setData({
      searchtxt:''
    })
  },

  /* 获取搜索的数据列表 */
  getSearchList(goodsName){
    let _this = this;
    let shopid = app.selectIndex;
	  let pageIndex = wx.getStorageSync('pageindex');
	  let itemTypes = utils.limitClass(pageIndex);
    let getProse = {
      currPage: _this.data.currPage,
      pageSize: _this.data.pageSize,
      categoryId: _this.data.categoryId,
      shopId: shopid,
	    goodsName,
	    itemTypes
    }
    sysService.category({
      url:'listProduct',
      method:'get',
      data: getProse
    }).then((res) => {
      if (res.code == 0) {
        console.log(res.page.list);
	      res.page.list.forEach((item) => {
		      item.attrValues = item.attrValues.split(',');
	      })
	      _this.setData({
		      showList: true,
		      productlist: res.page.list
        })
      }
    })
  },

  /* 搜索方法 */
  searchFun(){
    let _this = this;
    let { searchtxt } = _this.data;
    if (!searchtxt){
      wx.showToast({
        title: '请输入搜索内容',
        icon:"none"
      })
      _this.isShowNull(null);
    }else{
      _this.getSearchList(searchtxt);
    }
  },

  isShowNull(state){
    this.setData({
      searchReset: state
    })
  },

  //设置文本内容
  setSearchtxt(e){
    let searchtxt = e.detail.value;
    let _this = this;
    _this.setData({
      searchtxt
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
	      shopTypeSearch
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