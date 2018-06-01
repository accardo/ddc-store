const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
// pages/uploadimg/uploadimg.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    maxUpNum:5,
    imgList:[],
	  reason: '', //  出库原因  报废：商品破损、商品过期、商品变质； 退货：临期、过期、在库退货、质量问题；
	  outboundType: 0, // 出库类型 1 报废  2 退货
  },

  /* 提交信息 */
  subInfo(){
    let resultsOutboundCacheData = wx.getStorageSync('resultsOutboundCacheData');
    console.log(resultsOutboundCacheData);
	  let isComplete = resultsOutboundCacheData.map((item) => { // 提交数据整理
			  item.goodsId = item.skuId;
			  item.shopItemSkuVO = {
				  attrValues: item.attrValues != null ? item.attrValues.toString() : null,
				  id: item.id,
				  item: item.item
			  }
			  delete item.attrValues;
			  delete item.copyShopItemSkuId;
			  delete item.isExist;
			  delete item.isSale;
			  delete item.item;
			  delete item.price;
			  delete item.shopItemId;
			  delete item.skuId;
			  delete item.skuSn;
			  delete item.stock;
			  delete item.thumb;
			  delete item.valueIds;
			  delete item.costPrice;
			  return item;
      })

	  let promdData = {
		  id: null,
		  shopId: app.selectIndex, // 店铺ID
      type: this.data.outboundType, // 出库类型
		  reason: this.data.reason, // 出库原因
		  imageUrls: this.data.imgList.toString(),
		  deliveryDetailVOList: isComplete
	  }
	  sysService.delivery({
		  url: 'save',
		  method: "post",
		  data: promdData
	  }).then((res) => {
		  if (res.code == 0) {
			  utils.showToast({title: '保存成功', page: 3})
		  } else if(res.code == 401) {
			  config.logOutAll();
			  return
		  } else {
			  wx.showToast({
				  title: res.msg,
				  icon: 'none'
			  })
		  }
	  })
	  console.log(promdData, 'uploadimg')
    // wx.redirectTo({
    //   url: '../../pages/orderfrom/orderfrom'
    // })
  },

  /* 图片上传 */
  openMedia() {
	  wx.chooseImage({
		  count: this.data.maxUpNum, // 默认 9
		  sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
		  sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
		  success: (res) => {
			  let i = 0; // 第几个
			  var length = res.tempFilePaths.length; //总共个数
			  this.uploadDIY(res.tempFilePaths, i, length);
		  }
	  })
  },
	/**
	 * Description: 多文件上传  递归方式。 小程序不支持多文件上传
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/1
	 */
	uploadDIY(filePaths,i,length) {
		   let token = wx.getStorageSync('getusertoken');
       wx.uploadFile({
        url: 'https://wms-d.daydaycook.com.cn/wms/sys/oss/upload', //仅为示例，非真实的接口地址
        filePath: filePaths[i],
        name: 'file',
        formData:{
          'token': token
        },
        success: (res) => {
          let resData = JSON.parse(res.data);
          if (resData.code == 0) {
	          this.data.imgList.push(resData.url[0]);
	          this.setData({
		          imgList: this.data.imgList
            })
          }
        },
        complete: () => {
            i ++;
            if(i == length) {
              return false
            } else {
              this.uploadDIY(filePaths, i, length)
          }
         }
		 })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, 'uploadimg');
    let pagetitle = wx.getStorageSync('pagetitle');
    this.setData({
	    reason: options.reason, // 出库原因
	    outboundType: options.outboundType, // 1 报废 2 退货
    })
    wx: wx.setNavigationBarTitle({
      title: pagetitle
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