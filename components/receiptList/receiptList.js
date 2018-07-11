// components/receiptList/receiptList.js
var config = require('../../config/config.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    receiptArr:{
      type: Array,
      value: [],
	    observer: function(newVal, oldVal) {
      	console.log(newVal, 'newVal')
        if (newVal) {
	        newVal.forEach((item) => {
	          if (item.shopItemSkuVO !== null && item.shopItemSkuVO.attrValues !== null) {
		          item.shopItemSkuVO.attrValues = item.shopItemSkuVO.attrValues.split(',');
            }
          })
        }
		    this.setData({
			    receiptArr: newVal
		    })
		    this.triggerEvent("bindReceiptData", this.data.receiptArr); // 返回父组件数据
      }
    },
    pageType:{
      type: String,
      value: ''
    },
	  orderStatus: { // 订货状态
      type: String,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    defImg: config.pageImgUrl+'logo.png',
    pageType:'',
    // titlename:'',
	  pageindex:0,
    thisReceiptArr:[],
	  configFl: config.dict.shopType,
  },
	ready(){
    let pageindex = wx.getStorageSync('pageindex');
    // let titlename ='';
    this.setData({
      pageindex,
      // titlename
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
	  /**
	   * Description: 设置输入值
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/5/23
	   */
	  setNumber(e) {

	  	if(this.data.pageindex == 2) {
			  this.data.receiptArr[e.currentTarget.dataset.index].deliveryCount = e.detail.value;
		  } else if(this.data.pageindex == 7) {
	  		if(this.data.receiptArr[e.currentTarget.dataset.index].shopItemSkuVO.item.unitValue < e.detail.value) {
				  this.data.receiptArr[e.currentTarget.dataset.index].unitValue = '';
				  this.setData({
					  receiptArr: this.data.receiptArr
				  })
				  wx.showToast({
					  title: '不能大于当前库存',
					  icon:'none'
				  })
				  return
			  }
			  this.data.receiptArr[e.currentTarget.dataset.index].unitValue = e.detail.value;
		  }
		  this.triggerEvent("bindReceiptData", this.data.receiptArr); // 返回父组件数据
	  },
  }
})
