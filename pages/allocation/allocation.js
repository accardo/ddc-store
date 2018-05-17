// pages/allocation/allocation.js
const config = require('../../config/config.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopAds: '',
    selectIndex: 0,
    shopArray: [
      '上海淮海路店铺',
      '上海中山公园店铺',
      '上海人民广场店铺'
    ],
    productlist: [
      { img: "pro-img4.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "54", company: "kg" },
      { img: "pro-img5.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "65", company: "kg" },
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", current: "76", company: "kg" }
    ]
  },

  /* 选择门店 */
  selectShop(e) {
    let selectIndex = e.detail.value;
    this.setData({
      selectIndex,
      shopAds: this.data.shopArray[parseInt(selectIndex)]
    })
    app.selectIndex = selectIndex;
  },

  /* 添加调拨 商品 */
  searchShop(){
    wx.navigateTo({
      url:'../../pages/search/search?source=allocation'
    })
  },

  /* 提交调拨 */
  subAllot(){
    wx.showModal({
      content: '是否确认提交调拨？',
      confirmColor: config.showModal.confirmColor,
      success: function (res) {
        if(res.confirm){
          wx.showToast({
            title: '提交调拨成功'
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000);
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let selectIndex = app.selectIndex;
    this.setData({
      selectIndex,
      shopAds: this.data.shopArray[parseInt(selectIndex)]
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