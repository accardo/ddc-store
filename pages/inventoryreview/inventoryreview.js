// pages/inventoryreview/inventoryreview.js
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop:0,
    ind:'',
    defImg: 'logo.png',
    pagetitle: '',
    imgUrl: config.pageImgUrl,
    status: 0, // 盘点状态
	  inventoryId: 0, // 盘点id
	  receiptList: [], // 初始化数据
	  iIndex: '', // 判断input框是否开启
  },
	/**
	 * Description: 获取 待审核数据列表 info
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/30
	 */
  getInentoryreviewData() {
		wx.showLoading({ title: '加载中' });
		let promseData = {
			inventoryId: this.data.inventoryId,
			shopId: app.selectIndex,
			status: this.data.status
		}
		sysService.inventorydetail({
			url:'info',
			method:'get',
			data: promseData
		}).then((res) => {
			if (res.code == '0') {
				res.inventoryDetailVOList.forEach((item) => {
					if (item.shopItemSkuVO !== null && item.shopItemSkuVO.attrValues !== null) {
						item.shopItemSkuVO.attrValues = item.shopItemSkuVO.attrValues.split(',');
					}
				})
				this.setData({
					receiptList: res.inventoryDetailVOList // 订货列表数据
				})
				wx.hideLoading();
			} else if(res.code == '401') {
				config.logOutAll();
				return
			} else {
				wx.showToast({
					title: res.msg,
					icon: 'none'
				})
			}
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
		this.data.receiptList.forEach((item, index) =>{
			 if(e.currentTarget.dataset.eindex == index) {
				 item.unitValue = e.detail.value
			 }
		})
	},
	/**
	 * Description: 拆零扣减
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/31
	 */
	editMaterialUnit(e) {
		this.data.receiptList.forEach((item, index) =>{
			if(e.currentTarget.dataset.eindex == index) {
				item.materialUnitValue = e.detail.value
			}
		})
	},
  /* 提交审核 */
  subReview(){
	  let inventoryDetailVOList = this.data.receiptList.filter((item) => {
		    item.shopItemSkuVO.attrValues = item.shopItemSkuVO.attrValues !== null ? item.shopItemSkuVO.attrValues.toString() : null;
			  return item;
	  })
	  let promeData = {
		  id: this.data.inventoryId || null, // 盘点id
		  shopId: app.selectIndex, // 店铺ID
		  inventoryDetailVOList,
	  }
    wx.showModal({
      content: '确认提交审核？',
      confirmColor: config.showModal.confirmColor,
      success: function (res) {
        if (res.confirm){
	        sysService.inventory({
		        url: 'update',
		        method: "post",
		        data: promeData
	        }).then((res) => {
		        if (res.code == 0) {
			        utils.showToast({title: '盘点成功', page: 1});
		        } else if (res.code == 401) {
			        config.logOutAll();
			        return
		        } else {
			        wx.showToast({
				        title: res.msg,
				        icon:'none'
			        })
		        }
	        })
        }
      }
    });
    console.log('点击提交审核');
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