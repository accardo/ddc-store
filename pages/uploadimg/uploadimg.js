// pages/uploadimg/uploadimg.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    outage:'',
    maxUpNum:5,
    imgList:[]
  },

  /* 提交信息 */
  subInfo(){
    let _this = this;
    let { imgList } = _this.data;
    wx.setStorageSync('imgList', imgList);
    wx.redirectTo({
      url: '../../pages/orderfrom/orderfrom'
    })
  },

  /* 图片上传 */
  openMedia(){
    let _this = this;
    let { imgList, maxUpNum } = _this.data;
    wx.chooseImage({
      count: maxUpNum, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
         imgList.unshift(...res.tempFilePaths);
         imgList = imgList.slice(0, maxUpNum);
         console.log(imgList);
        _this.setData({
          imgList
        })
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pagetitle = wx.getStorageSync('pagetitle');
    let outage = options.radiotxt ? options.radiotxt : '';
    this.setData({
      outage
    })
    wx: wx.setNavigationBarTitle({
      title: '出库'
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