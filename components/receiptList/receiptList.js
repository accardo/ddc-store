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
			    receiptArr: newVal,
			    listType: getCurrentPages()[1].data.listType // 点击的是 申请退货 或 退货
		    })
		    this.triggerEvent("bindReceiptData", this.data.receiptArr); // 返回父组件数据
      }
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
    // titlename:'',
	  pageindex: 0,
	  listType: 0,
	  configFl: config.dict.shopType,
  },
	ready(){
    let pageindex = wx.getStorageSync('pageindex');
    this.setData({
      pageindex,
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
	  	if(this.data.pageindex == 2 || this.data.pageindex == 0) {
			  this.data.receiptArr[e.currentTarget.dataset.index].deliveryCount = e.detail.value;
		  } else if(this.data.pageindex == 7) {
	  		if (this.data.listType == 3) {
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
			  } else if (this.data.listType == 4) {
				  this.data.receiptArr[e.currentTarget.dataset.index].realityNumber = e.detail.value;
			  }
		  }
		  this.triggerEvent("bindReceiptData", this.data.receiptArr); // 返回父组件数据
	  },
  }
})
