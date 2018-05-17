// pages/expendtrim/expendtrim.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    endTime:'24',
    isShow:false,
    val:0,
    ind:0,
    num:0,
    mold:'',
    courseList:[
      {name:'五彩缤纷杯蛋糕体验课',telname:'冯长德',actual:5,normal:5,scrap:2,time:'2018-04-27 10:00'},
      { name: '五彩缤纷杯蛋糕体验课', telname: '冯长德', actual: 5, normal: 5, scrap: 2, time: '2018-04-27 12:00' },
      { name: '五彩缤纷杯蛋糕体验课', telname: '冯长德', actual: 5, normal: 5, scrap: 2, time: '2018-04-27 14:00'},
      { name: '五彩缤纷杯蛋糕体验课', telname: '冯长德', actual: 5, normal: 5, scrap: 2, time: '2018-04-27 16:00' }
    ]
  },

  //设置Input 框 的值
  setValue(e){
    let val = e.detail.value;
    this.setData({
      val
    })
  },

  //修改 数值
  editNum(e){ 
    let { ind, num,mold} = e.currentTarget.dataset;
    let _this = this;
    _this.setData({
      ind,
      num,
      mold,
      isShow: true
    })
  },

  // 确定调整
  confimNum(e){
    let _this = this;
    let { ind, num, mold, val, courseList } = _this.data;
    if (val ==0){
      wx.showToast({
        title: '请输入数量',
        icon:'none'
      })
      return 
    }
    let actualN = parseInt(courseList[ind].actual);
    switch (mold){
      case 'actual':
        courseList[ind].actual = val;
        _this.setListData(courseList);
        break;
      case 'normal':
        if (actualN > val) {
          wx.showToast({
            title: '正常消耗，不能小于实际上课人数',
            icon: 'none'
          })
          return
        }else{
          courseList[ind].normal = val;
          _this.setListData(courseList);
        }
        break;
      case 'scrap':
        courseList[ind].scrap = val;
        _this.setListData(courseList);
        break;
    }
    _this.setData({
      val:0
    })
  },

  //设置 修改后的列表
  setListData(courseList){
    let _this = this;
    _this.setData({
      courseList,
      isShow: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pagetitle = wx.getStorageSync('pagetitle');
    wx: wx.setNavigationBarTitle({
      title: pagetitle == '课程消耗' ? '课程消耗调整' : pagetitle
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