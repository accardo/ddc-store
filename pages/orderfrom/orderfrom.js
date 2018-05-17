// pages/orderfrom/orderfrom.js
const config = require('../../service/sys.service.js');
const sysService = require('../../service/sys.service.js');
const app = getApp();
const userToken = wx.getStorageSync('getusertoken');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagetype:'orderfrom',
    pagetitle:'',
    imgList:[],
    receiptList: [
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", typelist: ["大杯", "黑色"], current: 0, ordercurrent: 78, actul: 78, company: "袋" },
      { img: "pro-img3.png", name: "皇家奶茶杯盖", unit: "10g", current: 10, ordercurrent: 78, actul: 78, company: "袋" },
      { name: "皇家奶茶杯盖", typename: "原料", unit: "10g", current: 0, ordercurrent: 28, actul: 28, company: "kg" },
      { img: "pro-img4.png", name: "皇家奶茶杯盖", unit: "10g", current: 20, ordercurrent: 78, actul: 78, company: "袋" },
      { name: "皇家奶茶杯盖", typename: "原料", unit: "10g", typelist: ["大杯", "黑色"], current: 0, ordercurrent: 78, actul: '20', company: "kg" }
    ],
    stockquerylist:[
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 120, netcontent: 100, typelist: ["大杯", "黑色"],company: "g" },
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 130, netcontent: 100, company: "g" },
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 20, netcontent: 100, typelist: ["大杯", "黑色"], company: "g" },
      {name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", current: 190, netcontent: 100, company: "g" },
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 10, netcontent: 100, company: "个" }
    ],
    outGoList: [
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 120, netcontent: 100, typelist: ["大杯", "黑色"], company: "g" },
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 130, netcontent: 100, company: "g" },
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 20, netcontent: 100, typelist: ["大杯", "黑色"], company: "g" },
      { name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", current: 190, netcontent: 100, company: "g" },
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 10, netcontent: 100, company: "个" }
    ]
  },

  /* 获取订货单详情商品列表 */
  getPurchaseDetail(){
    let _this = this;
    let token = userToken;
    let shopId = app.selectIndex;
    let promseData = {
      purchaseId:'',
      shopId,
      token
    }
    sysService.purchasedetail({
      url:'info',
      method:'get',
      data: promseData
    }).then(res=>{
        console.log(res);
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    _this.getPurchaseDetail();
    let pagetitle = wx.getStorageSync('pagetitle');
    let imgList = wx.getStorageSync('imgList');
    imgList = imgList.length > 0 ? imgList : ['../../icons/def-img.png'];
    if(pagetitle=='盘点'){
      this.setData({
        receiptList:this.data.stockquerylist
      })
    }else if(pagetitle == '出库操作'){
      pagetitle = '出库';
      this.setData({
        pagetitle,
        imgList,
        receiptList: this.data.outGoList
      })
    }
    wx: wx.setNavigationBarTitle({
      title: pagetitle+'单'
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