const config = require('../../config/config.js');
const loginService = require('../../service/login.service.js');
const shopListService = require('../../service/service.service.js');
const app = getApp();

// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: config.pageImgUrl,
    username:'wms',
    userpwd:'123456',
    toastText:'',
    duration: 1200,
    selectIndex:0,
    isSelectShop:false,
    shopArray:[],
    shopName:'请选择所在店铺'
  },

  /* 获取店铺列表 */
  getShoplist(){
    let _this = this;
    shopListService.api({
      url: "/list",
      method: "get",
      data: null
    }).then(res => {
      let { code, shopList=[] } = res;
      if (code == 0 && shopList.length >0){
        _this.setData({
          shopArray:shopList
        })
      }else{
        wx.showToast({
          title: res.msg,
          icon:'none'
        })
      }
    })
  },

  getInfoByE(e) {
    let { name } = e.target.dataset;
    this.setData({
      [name]: e.detail.value
    })
  },
  
  /* 选择店铺 */
  selectShop(e){
    let _this = this;
    let _index = parseInt(e.detail.value);
    let selectIndex = _this.data.shopArray[_index].id;
    let shopName = _this.data.shopArray[_index].shopName;
    _this.setData({
      shopName,
      selectIndex,
      isSelectShop:true
    })
  },
  setUserName(e){
    this.getInfoByE(e);
  },
  setUserPwd(e){
    this.getInfoByE(e);
  },

  /* 清除 输入内容 */
  clearInput(e){
    let { utype } = e.target.dataset;
    let _this = this;
    _this.setData({
      [utype]: ''
    })
  },

  /* 登录 方法 */
  loginFun(){
    let _this = this;
    let userinfo = {
      username: this.data.username,
      userpwd: this.data.userpwd,
      selectIndex: this.data.selectIndex
    }
    if (!userinfo.username){
      this.setToast('请输入用户名');
      return;
    }
    if (!userinfo.userpwd){
      this.setToast('请输入密码');
      return;
    }
    if (!_this.data.isSelectShop){
      this.setToast('请选择店铺地址');
      return;
    }
    let postData = {
      username: this.data.username,
      password: this.data.userpwd,
      shopId: this.data.selectIndex,
      platform:'wms'
    }
    wx.showLoading({
      title: '数据加载中',
    });
    loginService.api({
      url: "/login",
      method:"post",
      data: postData
    }).then(res =>{
      wx.hideLoading();
      let { code, sysUser, msg,token } = res;
      if(code ==0){
        app.selectIndex = postData.shopId;
        wx.setStorageSync('getuserinfo', sysUser);
        wx.setStorageSync('getusertoken', token);
        wx.redirectTo({
          url: '/pages/index/index',
        })
      }else{
        wx.hideLoading();
        wx.showToast({
          title: msg,
          icon: 'none'
        })
      }
    })
  },

  /* 提示信息 */
  setToast(toastText){
    wx.showToast({
      title: toastText,
      icon:"none",
      duration: this.data.duration
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    _this.getShoplist();
    wx.setNavigationBarTitle({
      title: '登录'
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