// components/listOrder/listOrder.js
var config = require('../../config/config.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type:Array,
      value:[]
    },
    typeName:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    list:[],
    typeName:'',
    getTypeName: [],
    getOutType:['报废','退货'],
    getOrderType:['调拨入库','调拨出库'],
    pagetTypeIndex:0,
    pagetitle:''
  },

  //组件初始化
  ready() {
    let pagetitle = wx.getStorageSync('pagetitle');
    let _this = this;
    let pagetTypeIndex = wx.getStorageSync('pageindex');
    if (!pagetitle.includes('课程消耗')) {
      _this.setData({
        getTypeName: config.dict[this.data.typeName]
      })
    }
    _this.setData({
      pagetitle,
      pagetTypeIndex
    });
  },

  /**
   * 组件的方法列表
   */
  methods: {
    detail(e){
      let { order, typenum,itemid } = e.currentTarget.dataset;
      let parth = '?ordernumber=' + order + '&itemId=' + itemid;
      let { pageName = '', pagetitle, pagetTypeIndex=0 } = this.data;
      switch (pagetTypeIndex){
        case 0:
          pageName = typenum ==1 || typenum == 2 ? 'goodsreceipt' : (typenum == 3 ? 'orderfrom':'goodsinfo' )
          break;
        case 1:
          pageName = typenum == 1 ? 'inventoryreview' : 'orderfrom';
          break;
        case 2:
          pageName = 'orderfrom';
          break;
        case 4:
          pageName = 'displaceslist';
          break;
        case 5:
          pageName = typenum == 1 ? 'orderfrom' : 'allotcollect';
          break;
        case 7:
          pageName = 'expenddetail';
          break;
      }
      wx.navigateTo({
        url: config.getPageUrl(true, pageName, parth)
      })
    }
  }
})
