// pages/goodsreceipt/goodsreceipt.js
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,
    ordernumber:'',
    pagetype:'goodsreceipt',
    txtName: "实收数量",
    receiptList: [], // 订货列表初始化数据
	  status: '', // 订货状态
	  tempReceiptList: [], // 子组件返回父组件临时数据待提交用
	  invoiceVO: {}, // 供应商数据
    purchaseId: '', // 订货单ID
	  shipping: config.dict.shipping,
	  shipName: '联系人',
	  shipSn: '联系电话',
	  isShow: false,
	  shipNameValue: '',
	  shipSnValue: '',
	  listType: 0,
	  courierCompany: [],
	  logisticsCompany: '请选择快递',
	  indexId: 0,
	  radioIsShow: 1, // 1 供应商自提 2快递 默认 1

  },
	/*
	 * Description: 切换配送商
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/9
	 */
	radioChange(e) {
		let val = e.detail.value;
		let shipName = '';
		let shipSn = '';
		this.data.invoiceVO.deliveryMethod = val;
		if (val == '1') {
			this.data.invoiceVO.deliveryMethodStr = '供应商自提';
			this.data.invoiceVO.expressCompany = '';
			this.data.invoiceVO.expressCompanyId = '';
			this.data.invoiceVO.waybillSn = '';
			shipName = '联系人';
			shipSn = '联系电话';
		} else if(val == '2') {
			this.data.invoiceVO.deliveryMethodStr = '快递';
			this.data.invoiceVO.contactsPhone = '';
			this.data.invoiceVO.contacts = '';
			shipName = '快递公司';
			shipSn = '运单号';
		}
		this.setData({
			shipName,
			shipSn,
			shipNameValue: '',
			shipSnValue: '',
			radioIsShow: val
		})
	},
	/*
	 * Description: 设置 快递公司 联系人
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/12
	 */
	setShipName(e) {
		this.data.invoiceVO.contacts = e.detail.value
		this.setData({
			shipNameValue: e.detail.value,
		})
	},
	/*
	 * Description: 设置 运单号 联系电话
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/12
	 */
	setShipSn(e) {
		if (this.data.invoiceVO.deliveryMethod == 1) {
			this.data.invoiceVO.contactsPhone = e.detail.value
		} else if(this.data.invoiceVO.deliveryMethod == 2) {
			this.data.invoiceVO.waybillSn = e.detail.value
		}
		this.setData({
			shipSnValue: e.detail.value,
		})
	},
	/*
	 * Description: 快递选择单号
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/13
	 */
	bindPickerChange(e) {
		let _index = parseInt(e.detail.value);
		this.data.invoiceVO.expressCompany = this.data.courierCompany[_index].logisticsCompany;
		this.data.invoiceVO.expressCompanyId = this.data.courierCompany[_index].id;
		this.setData({
			logisticsCompany : this.data.courierCompany[_index].logisticsCompany,
			indexId: _index
		})
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
	 * Description: 子组件返回的订货数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/23
	 */
	_bindReceiptData(e) {
	  this.setData({
		  tempReceiptList: e.detail
    })
  },
	/**
	 * Description: 部分收货
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/23
	 */
	partialReceipt(){
		let processData = this.processData(2);
		if (processData.isComplete.length == 0) {
			wx.showToast({
				title: '至少填写一项部分收货',
				icon:'none'
			})
			return
		}
		console.log(processData, '部分收货返回数据');
		wx.showModal({
			content: '是否确认部分收货!',
			confirmColor: config.showModal.confirmColor,
			success: function (res) {
				if (res.confirm){
					sysService.receipt({
						url: 'update',
						method: "post",
						data: processData.promeData
					}).then((res) => {
						if (res.code == 0) {
							utils.showToast({title: '更新成功', page: 1, pages: getCurrentPages()});
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
  },
	/*
	 * Description: 全部收货
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/11
	 */
	completeReceipt(){
	  let processData = this.processData(3, 'complete');
	  console.log(processData, '全部收货返回数据');
	  wx.showModal({
		  content: processData.isComplete.length > 0 ? '部分商品无实收数量，是否确认收货完毕' : '是否确认收货完毕，提交的数据不可修改!',
		  confirmColor: config.showModal.confirmColor,
		  success: function (res) {
			  if (res.confirm){
				  sysService.receipt({
					  url: 'update',
					  method: "post",
					  data: processData.promeData
				  }).then((res) => {
					  if (res.code == 0) {
						  utils.showToast({title: '收货成功', page: 1, pages: getCurrentPages()});
					  } else if (res.code == 401) {
						  config.logOutAll();
						  return
					  }
				  })
			  }
		  }
	  });
  },
	/*
	 * Description: 部分收货 全部收货 处理数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/17
	 */
	processData(status, receipt) {
		let	ArrayDeepCopyData = utils.ArrayDeepCopy(this.data.tempReceiptList);  // 深层拷贝防止子组件数据联动
		let receiptDetailVOList = utils.attrValuesSkuToString(ArrayDeepCopyData); // array 转 string 提交数据
		receiptDetailVOList = receiptDetailVOList.filter((item) => {
			item.goodsId = item.id;
			if (receipt == 'complete') { // 全部收货 过滤
				if (item.finalNumber == 0) {
					if (item.deliveryCount == '' || item.deliveryCount == null ) {
						return item;
					}
				}
			} else { // 部分收货 过滤
				if (item.deliveryCount !== null && item.deliveryCount !== '') {
					return item;
				};
			}
		})
		let promeData = {
			id: this.data.purchaseId || null, // 订单id
			shopId: app.selectIndex, // 店铺ID
			status, // 状态 (1、待收货 2、部分收货 3、已收货 4、待派单)
			receiptDetailVOList: receipt == 'complete' ? utils.attrValuesSkuToString(this.data.tempReceiptList) : receiptDetailVOList,
		}
		return {
			promeData,
			isComplete: receiptDetailVOList
		}
	},
	/**
	 * Description: 待收货 部分收货 页面数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/23
	 */
  getSreceipt() {
		wx.showLoading({ title: '加载中' });
		let promseData = {
			receiptId: this.data.purchaseId, // 订货单ID
			shopId: app.selectIndex, // 店铺ID
		}
		sysService.receiptdetail({
			url:'info',
			method:'get',
			data: promseData
		}).then((res) => {
			if (res.code == '0') {
				wx.hideLoading();
				this.setData({
					receiptList: res.receiptDetailVOList // 订货列表数据
				})
			} else if (res.code == 401) {
				config.logOutAll();
				return
			}
		})
  },
	/*
	 * Description: 申请退货页面详情数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/9
	 */
	getAppReturn() {
		wx.showLoading({ title: '加载中' });
		let promseData = {
			returnId: this.data.purchaseId, // 订货单ID
			shopId: app.selectIndex, // 店铺ID
		}
		sysService.returndetail({
			url:'info',
			method:'get',
			data: promseData
		}).then((res) => {
			if (res.code == '0') {
				wx.hideLoading();
				this.setData({
					receiptList: res.inventoryDetailVOList
				})
			} else if (res.code == 401) {
				config.logOutAll();
				return
			}
		})
	},
	/*
	 * Description: 退货页面详情数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/11
	 */
	getReturn() {
		wx.showLoading({ title: '加载中' });
		let promseData = {
			invoiceId: this.data.purchaseId, // 订货单ID
			shopId: app.selectIndex, // 店铺ID
		}
		sysService.invoicedetail({
			url:'info',
			method:'get',
			data: promseData
		}).then((res) => {
			if (res.code == '0') {
				wx.hideLoading();

				this.setData({
					receiptList: res.invoiceVO.invoiceDetailVOList,
					invoiceVO: res.invoiceVO,
					courierCompany: res.expressCompanys,
				})
				this.data.invoiceVO.deliveryMethod = 1;
			} else if (res.code == 401) {
				config.logOutAll();
				return
			}
		})
	},
	/*
	 * Description: 发货完毕
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/12
	 */
	completeDelivery() {
		this.setData({
			isShow: true
		})
	},
	/*
	 * Description: 发货完毕
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/12
	 */
	confimNum() {
			if (this.data.radioIsShow == 1 && (this.data.shipNameValue == '' || this.data.shipSnValue == '')) {
				wx.showToast({
					title: '供应商信息不能为空',
					icon:'none'
				})
				return
			}
			if (this.data.radioIsShow == 2 && (this.data.logisticsCompany == '请选择快递' || this.data.shipSnValue == '')) {
				wx.showToast({
					title: '快递信息不能为空',
					icon:'none'
				})
				return
			}
			this.data.tempReceiptList.forEach((item) => {
				item.shopItemSkuVO.attrValues = utils.attrValuesToString(item.shopItemSkuVO);
			})
			let promeData = {
				...{...this.data.invoiceVO},
				invoiceDetailVOList: this.data.tempReceiptList
			}
			console.log(promeData)
			sysService.invoice({
					url: 'save',
					method: "post",
					data: promeData
				}).then((res) => {
					if (res.code == 0) {
						utils.showToast({title: '发货成功', page: 1, pages: getCurrentPages()});
					} else if (res.code == 401) {
						config.logOutAll();
						return
					}
				})

	},
	/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
	  let pageindex = wx.getStorageSync('pageindex');
	  let pagetitle = wx.getStorageSync('pagetitle');
		this.setData({
			purchaseId: options.orderId || '', // 订货单id
			status: options.orderStatus || '',
			listType: options.listType || 0,
			pageindex,
		})
		console.log(options)
	  if (pageindex == 0) { // 0 订货页面
		  this.getSreceipt();
	  }
	  if (pageindex == 7) { // 7 申请退货页面
	  	if (options.listType == 3) {
			  this.getAppReturn();
		  } else if (options.listType == 4) {
	  		this.getReturn();
		  }
	  }
    wx.setNavigationBarTitle({
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