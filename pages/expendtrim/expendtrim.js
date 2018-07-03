const sysService = require('../../service/sys.service.js');
const config = require('../../config/config.js');
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
	  courseBillId: null, //消耗课程id
	  isupdate: false, // 判断是否可以调整
	  isExpend: 0, // 判断是否是直接点击课程消耗按钮
	  outShopId: 0, // 调出店铺 id
	  inShopId: 0,  // 调入店铺id
	  outTransferId: 0, // 调拨出库单id
	  currPage:1,
	  pageSize:10,
	  nIndex: 0,
	  name: ''
  },
	/**
	 * Description: 获取课程消耗 列表
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
	getExpendtrim() {
		wx.showLoading({ title: '加载中' });
		let getParm = {}
		if (this.data.isExpend == '1') {
			getParm = {
				currPage: this.data.currPage,
				pageSize: this.data.pageSize,
				shopId: app.selectIndex,
			}
		} else {
			getParm = {
				currPage: this.data.currPage,
				pageSize: this.data.pageSize,
				courseBillId: this.data.courseBillId,
				shopId: app.selectIndex
			}
		}

		sysService.coursebilldetail({
			url: 'list',
			method: 'get',
			data: getParm
		}).then((res) => {
			wx.stopPullDownRefresh();
			if (res.code == 0) {
				wx.hideLoading();
				if (res.page.list.length == 0) {
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
			} else if (res.code == 401) {
				config.logOutAll();
			} else {
				wx.showToast({
					title: res.msg,
					icon: 'none'
				})
				wx.hideLoading();
			}
		}).catch(() => {
			wx.hideLoading();
		})
  },
	/**
	 * Description: 设置Input 框 的值
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/7
	 */
  setValue(e){
	  // number 实际上课人 useCount 正常消耗量 scrapCount 制作报废量
    if (this.data.name == 'number') {
	    this.data.courseList[this.data.nIndex].number = e.detail.value
    } else if(this.data.name == 'useCount') {
	    this.data.courseList[this.data.nIndex].useCount = e.detail.value
    } else if (this.data.name == 'scrapCount') {
	    this.data.courseList[this.data.nIndex].scrapCount = e.detail.value
    }
  },
	/**
	 * Description: 关闭弹出层
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/29
	 */
	closeMask() {
		this.setData({
			isShow: false
		})
	},
	/**
	 * Description: 点击弹出框 修改 数值
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/7
	 */
  editNum(e){
  	if (this.data.isupdate == 'false') {
  		return
	  }
    this.setData({
	   nIndex: e.currentTarget.dataset.index,
	   name: e.currentTarget.dataset.name,
	   isShow: true
    })
  },
	/**
	 * Description: 更新调整数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/7
	 */
  confimNum(){
	  let course = this.data.courseList[this.data.nIndex]; // 当前选中的哪一条
	  if (course[this.data.name] == 0 || course[this.data.name] == '') {
		    wx.showToast({
		      title: '请输入数量',
		      icon:'none'
		    })
		   return false
	  }
		console.log(course.useCount, course.number, '数值计算')
		if (this.data.name == 'useCount') {
			if (parseInt(course.useCount) < parseInt(course.number)) {
				wx.showToast({
					title: '正常消耗，不能小于实际上课人数',
					icon: 'none'
				})
				return false
			}
		}

	  let postParm = {
	  	id: this.data.courseList[this.data.nIndex].id,
		  courseBillId: this.data.courseList[this.data.nIndex].courseBillId, //  调整单id
		  number: this.data.courseList[this.data.nIndex].number,
		  useCount: this.data.courseList[this.data.nIndex].useCount,
		  scrapCount: this.data.courseList[this.data.nIndex].scrapCount
	  }
	  sysService.coursebilldetail({
		  url: 'update',
		  method: 'post',
		  data: postParm
	  }).then((res) => {
		  if (res.code == 0) {
			  wx.showToast({
				  title: '修改成功'
			  })
			  this.setData({
				  isShow: false,
				  courseList: this.data.courseList
			  })
		  } else if (res.code == 401) {
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  let pagetitle = wx.getStorageSync('pagetitle');
  	console.log(options, '课程消耗')
	  this.setData({
		  courseBillId: options.orderId || 0, // 课程消耗id
		  isupdate: options.isupdate,  // 判断是否显示可调整
		  isExpend: options.isExpend || 0, // 判断是否是直接点击课程消耗按钮
	  })
    this.getExpendtrim();
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