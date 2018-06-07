const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
// pages/expenddetail/expenddetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
	  pagetListData: [], // 临时数组
    courseList: [],
	  courseBillId: '', // 课程消耗id
	  isupdate: false, // 判断是否可调整
	  currPage:1,
	  pageSize:10,
  },
	/**
	 * Description: 课程消耗列表
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
  getExpenddetail() {
		wx.showLoading({ title: '加载中' });
		let getParm = {
			currPage: this.data.currPage,
			pageSize: this.data.pageSize,
			courseBillId: this.data.courseBillId,
		}
		sysService.coursebilldetail({
			url: 'list',
			method: 'get',
			data: getParm
		}).then((res) => {
			wx.stopPullDownRefresh();
			if (res.code == '0') {
				console.log(res, 'getExpenddetail');
				if (res.page.list.length == 0) {
					wx.hideLoading();
					wx.showToast({
						title: '没有更多数据',
						icon:'none'
					});
					wx.stopPullDownRefresh();
					return
				}
				this.data.pagetListData = this.data.pagetListData.concat(res.page.list); // 数组合并
				this.setData({
					courseList: this.data.pagetListData,
					currPage: this.data.currPage + 1
				})
			} else if (res.code == '401') {
				config.logOutAll();
				return
			} else {
				wx.showToast({
					title: res.msg,
					icon: 'none'
				})
			}
			wx.hideLoading();
		}).catch(() => {
			wx.hideLoading();
		})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, '课程消耗');
    this.setData({
	    courseBillId: options.orderId, // 课程消耗id
	    isupdate: options.isupdate  // 判断是否显示可调整
    })
    this.getExpenddetail()
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
	  this.getExpenddetail()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})