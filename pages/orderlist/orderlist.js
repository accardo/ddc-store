// pages/orderlist/orderlist.js
const app = getApp();
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titlename: '', // 按钮名称
    btntext:'', // 类型名，如订货，盘点，出库操作，置换，调拨，库存查询，课程消耗
    isShow: false, // 报废 退货 遮罩层 显隐
	  outboundType: 0, // 1 -> 报废； 2 ->退货
    selectRadio: '',
	  listData: [], // 总数据
    pagetListData: [], // 临时拼接数据需要合并到 lisData中
    pageindex: 0, // 缓存数据中取出 判断是哪个类型
    labelList:[], // 报废 退货 信息 前端字典
	  listType: 0, // 1 -> 显示订货列表 ；2 -> 显示收货列表;  3 -> 显示申请退货列表 ； 4 -> 显示退货列表
    currPage: 1,
    pageSize: 10,
  },

  /* 商品详情 */
  ordergoods(){
    let pageindex = wx.getStorageSync('pageindex');
    if (pageindex == 0) {
	    wx.navigateTo({ // 订货
		    url: '../../pages/ordergoods/ordergoods?productType=goods'
	    })
	    wx.removeStorageSync('searchGoodsOrderCacheData');
	    wx.removeStorageSync('resultsGoodsOrderCacheData');
    } else if (pageindex == 1) {
	    wx.navigateTo({ // 盘点
		    url: '../../pages/ordergoods/ordergoods'
	    })
    } else if (pageindex == 3) {// 置换
	    wx.removeStorageSync('setConverFrom');
	    wx.removeStorageSync('setConverInto');
	    wx.navigateTo({
		    url: '../../pages/displacesgoods/displacesgoods'
	    })
    } else if (pageindex == 4) { // 调拨
	    wx.removeStorageSync('transferCacheData');
	    wx.removeStorageSync('searchTransferCacheData');
	    wx.navigateTo({
		    url: '../../pages/allocation/allocation'
	    })
    } else if (pageindex == 6) { // 课程消耗
	    wx.navigateTo({
		    url: '../../pages/expendtrim/expendtrim?&isupdate=true&isExpend=1'
	    })
    }
	  wx.removeStorageSync('optionStorage');
  },
	/**
	 * Description: 订货 1.1
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/27
	 */
	bindOrderPlace() {
		this.setData({
			listType: 1,
			listData: [],
			pagetListData: [],
			currPage: 1,
		})
		this.getOrderGoods();
	},
	/**
	 * Description: 收货 1.1
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/27
	 */
	bindOrdergoods() {
		this.setData({
			listType: 2,
			listData: [],
			pagetListData: [],
			currPage: 1,
		})
		this.getReceipt();
	},
	/*
	 * Description: 申请退货 按钮
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/6
	 */
	bindAppReturn() {
		this.setData({
			listType: 3,
			listData: [],
			pagetListData: [],
			currPage: 1,
		})
		this.getAppReturn();
	},
	/*
	 * Description: 退货 按钮
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/6
	 */
	bindReturn() {
		this.setData({
			listType: 4,
			listData: [],
			pagetListData: [],
			currPage: 1,
		})
		this.getReturn();
	},
	/**
	 * Description: 统一处理 返回信息
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/8
	 */
	requestReturnInfo (res) {
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
				listData: this.data.pagetListData,
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
	},
	/**
	 * Description: 请求数据 整合
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/8
	 */
	getData() {
		let getParm = {
			currPage: this.data.currPage,
			pageSize: this.data.pageSize,
			shopId: app.selectIndex,
		}
		return getParm
	},
	/**
	 * Description: 获取订货信息
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/31
	 */
  getOrderGoods() {
    wx.showLoading({ title: '加载中' });
    sysService.purchase({
      url: 'list',
      method: 'get',
      data: this.getData()
    }).then((res) => {
    	this.requestReturnInfo(res);
    }).catch(() => {
    	wx.hideLoading();
    })
  },
	/*
	 * Description: 获取收货信息
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/5
	 */
	getReceipt() {
		wx.showLoading({ title: '加载中' });
		sysService.receipt({
			url: 'list',
			method: 'get',
			data: this.getData()
		}).then((res) => {
			this.requestReturnInfo(res);
		}).catch(() => {
			wx.hideLoading();
		})
	},
	/**
	 * Description: 获取盘点信息
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
  getInventory() {
		wx.showLoading({ title: '加载中' });
		sysService.inventory({
			url: 'list',
			method: 'get',
			data: this.getData()
		}).then((res) => {
			this.requestReturnInfo(res);
		}).catch(() => {
			wx.hideLoading();
		})
  },
	/**
	 * Description: 获取出库信息
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/31
	 */
	getOutbound() {
		wx.showLoading({ title: '加载中' });
		sysService.delivery({
			url: 'list',
			method: 'get',
			data: this.getData()
		}).then((res) => {
			this.requestReturnInfo(res);
		}).catch(() => {
			wx.hideLoading();
		})
	},
	/**
	 * Description: 获取置换信息
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/4
	 */
	getSubstitution() {
		wx.showLoading({ title: '加载中' });
		sysService.displace({
			url: 'list',
			method: 'get',
			data: this.getData()
		}).then((res) => {
			this.requestReturnInfo(res);
		}).catch(() => {
			wx.hideLoading();
		})
	},
	/**
	 * Description: 获取调拨信息
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
	getTransfers() {
		wx.showLoading({ title: '加载中' });
		sysService.transfer({
			url: 'list',
			method: 'get',
			data: this.getData()
		}).then((res) => {
			this.requestReturnInfo(res);
		}).catch(() => {
			wx.hideLoading();
		})
	},
	/**
	 * Description: 获取课程消耗信息
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
	getConsumption() {
		wx.showLoading({ title: '加载中' });
		sysService.coursebill({
			url: 'list',
			method: 'get',
			data: this.getData()
		}).then((res) => {
			this.requestReturnInfo(res);
		}).catch(() => {
			wx.hideLoading();
		})
	},
	/*
	 * Description: 获取申请退货列表
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/6
	 */
	getAppReturn() {
		wx.showLoading({ title: '加载中' });
		sysService.returnlist({
			url: 'list',
			method: 'get',
			data: this.getData()
		}).then((res) => {
			this.requestReturnInfo(res);
		}).catch(() => {
			wx.hideLoading();
		})
	},
	/*
	 * Description: 获取退货列表
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/6
	 */
	getReturn() {
		wx.showLoading({ title: '加载中' });
		sysService.invoice({
			url: 'list',
			method: 'get',
			data: this.getData()
		}).then((res) => {
			this.requestReturnInfo(res);
		}).catch(() => {
			wx.hideLoading();
		})
	},
	/*
	 * Description: 报废 按钮
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/6
	 */
	scrapSelect(){
		this.setData({
			isShow: true,
			outboundType: 1,
			labelList: config.dict.outGoType[0]
		})
	},
	/*
	 * Description: 退货 按钮
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/6
	 */
	returnGoods(){
		this.setData({
			isShow: true,
			outboundType: 2,
			labelList: config.dict.outGoType[1]
		})
	},
	/* 报废 或 退货  选中的值 radio */
	radioChange(e){
		this.setData({
			selectRadio: e.detail.value
		})
	},
  /* 确定 跳转到相对应的页面*/
  confirmFun(){
    if (this.data.selectRadio !== '') {
	    this.dialogClose();
	    let reasonRadio = wx.getStorageSync('reasonRadio'); // 判断页面进入的是哪个类别
	    if (reasonRadio != this.data.selectRadio) {
		    wx.removeStorageSync('outboundCacheData');
		    wx.removeStorageSync('searchOutboundCacheData');
	    }
	    wx.removeStorageSync('optionStorage');
	    wx.removeStorageSync('searchOutboundCacheData');
	    wx.navigateTo({
		    url: `../../pages/ordergoods/ordergoods?reason=${this.data.selectRadio}&outboundType=${this.data.outboundType}`
	    })
    } else {
	    wx.showToast({
		    title: '请选择类型',
		    icon: 'none'
	    })
    }
  },
	/* 关闭 遮罩层 取消*/
  dialogClose(){
    this.setData({
      isShow: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	   let btntext = ''; // 拼接按钮提示
	   let pageindex = wx.getStorageSync('pageindex');
	   switch(pageindex){
        case 0: // 订货
	        this.setData({
		        listType: 1
	        })
	        this.getOrderGoods();
	        // this.getReceipt();
          break;
        case 1: // 盘点
          btntext = options.titlename || '盘点';
	        this.getInventory();
          break;
        case 2: // 出库操作
	        this.getOutbound();
          break;
        case 3: // 置换
          btntext = options.titlename;
	        this.getSubstitution();
          break;
        case 4: // 调拨
          btntext = '调拨出库';
          this.getTransfers();
          break;
        case 6: // 课程消耗
          btntext = options.titlename;
         // this.getConsumption();
          break;
        case 7: // 退货
	        this.setData({
		        listType: 3
	        })
	        this.getAppReturn();
			   break;
	   }
	   this.setData({
        btntext,
        pageindex,
     })
      wx.setNavigationBarTitle({
        title: options.titlename
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
  	if (this.data.pageindex == 6) {
		  this.data.pagetListData = []; // 数组合并
		  this.data.listData = [];
		  this.data.currPage = 1;
		  this.getConsumption();
	  }
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
    if (this.data.pageindex == 0) {
    	if (this.data.listType == 1) {
		    this.getOrderGoods();
	    } else if (this.data.listType == 2) {
		    this.getReceipt();
	    }
    } else if(this.data.pageindex == 1) {
      this.getInventory();
    } else if (this.data.pageindex == 2) {
	    this.getOutbound();
    } else if (this.data.pageindex == 3 ) {
    	this.getSubstitution();
    } else if (this.data.pageindex == 4) {
    	this.getTransfers();
    } else if (this.data.pageindex == 6) {
    	this.getConsumption();
    } else if (this.data.pageindex == 7) {
    	if (this.data.listType == 3) {
		    this.getAppReturn();
	    } else if (this.data.listType == 4) {
    		this.getReturn();
	    }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})