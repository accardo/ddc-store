const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
// pages/expendtrim/expendtrim.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:false,
	  pagetListData: [], // 临时数据
    courseList:[], // 初始化数据
	  currPage:1,
	  pageSize:10,
    id: 0,
    number: 0,
    useCount: 0,
    scrapCount: 0,
	  nIndex: 0,
  },
	/**
	 * Description: 获取课程消耗 列表
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
	getExpendtrim() {
		wx.showLoading({ title: '加载中' });
		let getParm = {
			currPage: this.data.currPage,
			pageSize: this.data.pageSize,
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
  //设置Input 框 的值
  setValue(e){
	  // number 实际上课人 useCount 正常消耗量 scrapCount 制作报废量
    console.log()
	  if (number == 'number') {

    } else if(number == 'useCount') {

    } else if (number == 'useCount') {

    }
    // let val = e.detail.value;
    // let tempCourseList = this.data.courseList[this.data.nIndex][this.data.number];
    // console.log(tempCourseList);
    // this.setData({
	   //  courseList[this.data.nIndex].number: e.detail.value
    // })
  },

  //修改 数值
  editNum(e){
	  console.log(e, '点击数值');
    this.setData({
	   nIndex: e.currentTarget.dataset.index,
	   number: e.currentTarget.dataset.number,
	   isShow: true
    })
  },

  // 确定调整
  confimNum(e){
    let _this = this;
    let { ind, num, mold, val, courseList } = _this.data;
    if (val ==0){
      wx.showToast({
        title: '请输入数量',
        icon:'none'
      })
      return 
    }
    let actualN = parseInt(courseList[ind].actual);
    switch (mold){
      case 'actual':
        courseList[ind].actual = val;
        _this.setListData(courseList);
        break;
      case 'normal':
        if (actualN > val) {
          wx.showToast({
            title: '正常消耗，不能小于实际上课人数',
            icon: 'none'
          })
          return
        }else{
          courseList[ind].normal = val;
          _this.setListData(courseList);
        }
        break;
      case 'scrap':
        courseList[ind].scrap = val;
        _this.setListData(courseList);
        break;
    }
    _this.setData({
      val:0
    })
  },

  //设置 修改后的列表
  setListData(courseList){
    let _this = this;
    _this.setData({
      courseList,
      isShow: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getExpendtrim();
    let pagetitle = wx.getStorageSync('pagetitle');
    wx.setNavigationBarTitle({
      title: pagetitle == '课程消耗' ? '课程消耗调整' : pagetitle
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
    this.getExpendtrim();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})