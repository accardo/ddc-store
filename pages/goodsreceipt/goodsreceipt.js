// pages/goodsreceipt/goodsreceipt.js
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,
    isComplete:1,
    ordernumber:'',
    pagetype:'goodsreceipt',
    txtName:"实收数量",
    receiptList:[
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", typelist: ["大杯", "黑色"], current: 0,ordercurrent:78,actul:78, company: "袋" },
      { img: "pro-img3.png", name: "皇家奶茶杯盖", unit: "10g", current: 10, ordercurrent: 78, actul: 78, company: "袋" },
      {  name: "皇家奶茶杯盖", typename: "原料", unit: "10g", current: 0, ordercurrent: 28, actul: 28, company: "kg" },
      { img: "pro-img4.png", name: "皇家奶茶杯盖",  unit: "10g",current: 20, ordercurrent: 78, actul: 78, company: "袋" },
      { name: "皇家奶茶杯盖", typename: "原料", unit: "10g", typelist: ["大杯", "黑色"], current: 0, ordercurrent: 78, actul:'20', company: "kg" }
    ]
  },

  /* 根据订单号获取订单详情 */
  getOrderDetailByNum(){
  

  },

  //部分收货
  partialReceipt(){
    wx.showToast({
      title: '部分收货成功'
    })
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
    }, 1000);
  },

  //全部收货
  completeReceipt(){
    let _this = this.data;
    let { isComplete, receiptList } = _this;
    receiptList.map(item=>{
      if (!item.actul || item.actul =='-'){
        isComplete = 0;
      }
    })
    if (isComplete==1){
      wx.showModal({
        content: '是否确认收货完毕？',
        confirmColor: config.showModal.confirmColor,
        success: function (res) {
          if (res.confirm){
            wx.showToast({
              title: '收货成功'
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
            }, 1000);
          }
        }
      });
    }else{
      wx.showToast({
        title: '部分商品无实收数据',
        icon:'none'
      })
    }
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '收货'
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