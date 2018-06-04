// pages/displacesgoods/displacesgoods.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnDisabled:true,
    wantShop:[],
    coverShop:[],
    isSelect:1,
    defaultImg: '../../icons/shop.png'
  },

  /* 选择商品 */
  goSearch(e){
    // convert = from: 要转换商品, convert = info: 转化为商品
    wx.navigateTo({
      url: `../../pages/search/search?convert=${e.currentTarget.dataset.name}`
    })
  },

  /* 设置选中的商品 */
  setShopFun(){
    let _this = this;
    let wantShop = wx.getStorageSync('want');
    let coverShop = wx.getStorageSync('cover');
    _this.setData({
      wantShop: wantShop ? [wantShop] : [],
      coverShop: coverShop ? [coverShop] :[]
    })
    if (wantShop && coverShop){
      _this.setData({
        btnDisabled:false
      })
    }
  },

  /* 提交置换 */
  subDisplace(){
    let wantShop = wx.getStorageSync('want');
    let { wannum } =wantShop;
    if (wannum != "" && wannum >0){
      wx.showToast({
        title: '转化成功',
      })
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1
        })
      },1200);
    }else{
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