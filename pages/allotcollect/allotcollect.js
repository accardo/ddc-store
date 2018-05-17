// pages/allotcollect/allotcollect.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productlist:[
      { img: "pro-img4.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", order: "48", collect: 0, company: "袋" },
      { img: "pro-img5.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", order: "48", collect: 0, company: "袋" },
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", order: "48", collect: 0, company: "袋" }
    ],
    productType:'调拨收货'
  },

  /* 收货完毕 */
  subAllot(){
    let productList = wx.getStorageSync('productList');
    let state = true;
    productList = productList ? JSON.parse(productList) : [];
    productList.map(item=>{
      let collect = item.collect;
      if (!collect){
        state = false;
        wx.showToast({
          title: '部分商品未完成收货',
          icon: "none"
        })
        return ;
      }
    })
    /* 收货成功 */
    if (state){
      wx.showToast({
        title: '收货成功'
      })
      setTimeout(()=>{
        wx.navigateBack({
          delta:1
        })
      },1200);
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
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
    let selectIndex = app.selectIndex;
    let pagetitle = wx.getStorageSync('pagetitle');
    wx: wx.setNavigationBarTitle({
      title: pagetitle
    })
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