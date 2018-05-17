// components/receiptList/receiptList.js
var config = require('../../config/config.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    receiptArr:{
      type:Array,
      value:[]
    },
    pageType:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    receiptArr:[],
    defImg: 'logo.png',
    imgUrl: config.pageImgUrl,
    pageType:'',
    titlename:'',
    pageindex:0,
    thisReceiptArr:[]
  },

  ready(){
    let _this = this;
    let pageindex = wx.getStorageSync('pageindex');
    let titlename ='';
    if(pageindex ==0){
      titlename = _this.data.pageType == 'orderfrom' ? '收货数量' : '实收数量' ;
    }else if(pageindex == 5){
      titlename = '实收数量';
    }else{
      let receiptArr =[];
      _this.data.receiptArr.map(item => {
        let stoknum = config.transCompany(item.stock, item.netcontent, item.company);
        item['stoknum'] = stoknum;
        receiptArr.push(item);
      })
      _this.setData({
        receiptArr
      })
    }
    _this.setData({
      pageindex,
      titlename
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
