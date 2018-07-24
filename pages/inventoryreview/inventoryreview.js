// pages/inventoryreview/inventoryreview.js
import * as utils from'../../utils/util';
import * as logic from  '../../utils/logic';
const config = require('../../config/config.js');
const storeLogic = new logic.StoreLogic();
const orderLogic = new logic.OrderLogic();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop:0,
    ind:'',
    defImg: config.pageImgUrl+'logo.png',
    pagetitle: '',
    status: 0, // 盘点状态
	  inventoryId: 0, // 盘点id
	  receiptList: [], // 初始化数据
	  iIndex: '', // 判断input框是否开启
	  configFl: config.dict.shopType,
  },
	/**
	 * Description: 获取 待审核数据列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/30
	 */
  getInentoryreviewData() {
		let promseData = {
			inventoryId: this.data.inventoryId,
			shopId: app.selectIndex,
			status: this.data.status
		}
		storeLogic.ajaxGetData('inventorydetail/info', promseData).then((res) => {
			let receiptList = utils.attrValuesSkuSplit(res.inventoryDetailVOList); // attrValues  string 转 array 页面铺数据
			this.setData({
				receiptList
			})
		})
  },
	/**
	 * Description: 修改 按钮 触发显示input
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/31
	 */
  editNum(e) {
    this.setData({
	    iIndex: e.currentTarget.dataset.inputindex
    })
  },
	/**
	 * Description: 直接扣减
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/31
	 */
	editNnit(e) {
		this.nitUnit(e, 1)
	},
	/**
	 * Description: 拆零扣减
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/31
	 */
	editMaterialUnit(e) {
		this.nitUnit(e, 2)
	},
	/**
	 * Description: 直接扣减，拆零扣减 混合
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/7/2
	 */
	nitUnit(e, nNum) {
		this.data.receiptList.forEach((item, index) =>{
			if(e.currentTarget.dataset.eindex == index) {
				if (nNum == 1) {
					item.unitValue = e.detail.value
				} else if (nNum == 2) {
					item.materialUnitValue = e.detail.value
				}
			}
		})
	},
  /* 提交审核 */
  subReview(){
	  let inventoryDetailVOList = utils.attrValuesSkuToString(this.data.receiptList); // attrValues array 转 string 提交数据
	      inventoryDetailVOList = orderLogic.filterData(inventoryDetailVOList, 5);
	  let promeData = {
				  id: this.data.inventoryId || null, // 盘点id
				  shopId: app.selectIndex, // 店铺ID
				  inventoryDetailVOList
		    }
	  if (inventoryDetailVOList.length != this.data.receiptList.length) {
	  	utils.showToastNone('盘点数量不能为空');
		  return
	  }
	  wx.showModal({
		  content: '确认提交审核？',
		  confirmColor: config.showModal.confirmColor,
		  success: function (res) {
			  if (res.confirm){
				  storeLogic.ajaxSaveUpdate('inventory', promeData, false).then(() => {
					  utils.showToast({title: '盘点成功', page: 1, pages: getCurrentPages()});
				  })
			  }
		  }
	  });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pageindex = wx.getStorageSync('pageindex');
    this.setData({
	    inventoryId : options.orderId,
      status: options.orderStatus
    })
	  if (pageindex == 1) {
		  this.getInentoryreviewData();
	  }
    wx.setNavigationBarTitle({
      title: '盘点审核'
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