const config = require('../../config/config.js');
// pages/goodsinfo/goodsinfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop:0,
    outage:'',
    pagetitle:'',
    productlist:[
      { img:"pro-img1.png",name:"皇家奶茶杯盖",typename:"原料",unit:"10g",stock:"48",typelist:["大杯","黑色"],current:"55",company:"kg" },
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "23", company: "kg" },
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "零售品", unit: "10g", stock: "48", current: "99", company: "kg" },
      { img: "pro-img4.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "54", company: "kg" },
      { img: "pro-img5.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "65", company: "kg" },
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", current: "76", company: "kg" }
    ]
  },

  // 下一步
  goNext(){
    wx.showModal({
      content: '是否提交数据？',
      confirmColor: config.showModal.confirmColor,
      success: function (res) {
        if (res.confirm){
          wx.showToast({
            title: '订货成功'
          })
          setTimeout(()=>{
            wx.navigateBack({
              delta: 1
            })
          },800);
        }
      }
    });
  },

  /* 前往照片上传页面 */
  nextGo(){
    let { outage} = this.data;
    wx.redirectTo({
      url: '../../pages/uploadimg/uploadimg?radiotxt=' + outage
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { ordernumber, outage} = options;
    let pagetitle = wx.getStorageSync('pagetitle');
    if (pagetitle =='出库操作'){
      pagetitle = '出库';
      this.setData({
        outage
      })
    }
    this.setData({
      pagetitle
    })
    wx:wx.setNavigationBarTitle({
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