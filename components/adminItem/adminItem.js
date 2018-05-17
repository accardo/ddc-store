// components/adminItem/adminItem.js
var config = require('../../config/config.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    stockData:{
      type:Array,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    stockData:[],
    imgUrl: config.pageImgUrl
  },

  /**
   * 组件的方法列表
   */
  methods: {
    itemclick(e) {
      let { txt, ind } = e.currentTarget.dataset;
      // 如果是退出
      wx.setStorageSync('pagetitle', txt);
      switch (txt){
        case '订货':
          wx.setStorageSync('pageindex', 0);
          break;
        case '盘点':
          wx.setStorageSync('pageindex', 1);
          break;
        case '出库操作':
          wx.setStorageSync('pageindex', 2);
          break;
        case '入库操作':
          wx.setStorageSync('pageindex', 3);
          break;
        case '置换':
          wx.setStorageSync('pageindex', 4);
          break;
        case '调拨':
          wx.setStorageSync('pageindex', 5);
          break;
        case '库存查询':
          wx.setStorageSync('pageindex', 6);
          break;
        case '课程消耗':
          wx.setStorageSync('pageindex', 7);
          break;
      }
      if (txt == '退出'){
        wx.showModal({
          content: '确定要退出吗？',
          confirmColor: config.showModal.confirmColor,
          success: function (res) {
            res.confirm && wx.reLaunch({
              url: config.getPageUrl(true, 'login')
            })
          }
        });
      } else if (txt == '库存查询'){
        wx.navigateTo({
          url: config.getPageUrl(true, 'ordergoods')
        });
      }else{
        let parth = '?titlename='+txt+'&titleind='+ind;
        wx.navigateTo({
          url: config.getPageUrl(true, 'orderlist', parth)
        });
      }
    },
  }
})
