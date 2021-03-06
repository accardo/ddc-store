const config = require('../../config/config.js');
var app = getApp();
// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stockIcon:[],
    menuIcon: config.dict.menuIcon,
    signout:[
      { status: true, 'icon':'signout.png','text':'退出'}
    ],
    shopAds: '请选择店铺',
    selectIndex: app.selectIndex ? app.selectIndex :'0',
    shopArray: [],
  },

  /* 获取店铺列表 */
  getShoplist() {
    let { shopVOList, shopVO } = wx.getStorageSync('getuserinfo');
    if (shopVOList && shopVOList.length > 0){
      this.setData({
        selectIndex: shopVO.id,
        shopArray: shopVOList,
        shopAds: shopVO.shopName
      })
    }
  },

  /* 设置用户权限 */
  setUserMenu(){
    let { menuVOList } = wx.getStorageSync('getuserinfo');
    let stockIcon = [];
    if (menuVOList && menuVOList.length > 0) {
      menuVOList.map(item => {
        let text = item.menuName;
        let stockItem = {
          status:true,
          'path': item.path,
          'menuId': item.menuId,
          'icon': this.data.menuIcon[text] ? this.data.menuIcon[text] : 'order-goods.png',
          text
        }
        stockIcon.push(stockItem);
      })
      this.setData({
        stockIcon
      })
    } else {
	    config.logOutAll();
    }
  },

  /* 选择店铺  */
  selectShop(e){
    let _index = parseInt(e.detail.value);
    let { shopArray } = this.data;
    let selectIndex = shopArray[_index].id;
    this.setData({
      selectIndex,
      shopAds: shopArray[_index].shopName
    })
    app.selectIndex = selectIndex;
	  wx.setStorageSync('shopId', selectIndex);
	  wx.setStorageSync('companyId', shopArray[_index].companyId); // 公司id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getShoplist();
    this.setUserMenu();
	  let shopId = wx.getStorageSync('shopId');
	  if (shopId) {
		  app.selectIndex = shopId;
	  }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 调用 获取位置信息
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