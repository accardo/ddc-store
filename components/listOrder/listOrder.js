// components/listOrder/listOrder.js
var config = require('../../config/config.js');
const utils = require('../../utils/util');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type:Array,
      value:[],
	    observer: function(newVal, oldVal) {
		    let pageindex = wx.getStorageSync('pageindex');
		    if (pageindex == 6) {
			    newVal.forEach((item) => {
				     let time = this.strToDate(item.courseStartTime)
				     item.courseStartTime = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
			    })
        }
		    this.setData({
          pageindex,
          list: newVal
		    });
        console.log(newVal, 'newVal listOrder')
      }
    },
	  purchasReceipt: { // 订货列表 显示 订货 purchas / 收货 receipt
    	type: String,
		  value: '',
	  }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pageindex: 0, // 判断页面类型
  },

  //组件初始化
  ready() {
  },

  /**
   * 组件的方法列表
   */
  methods: {
	  /**
	   * Description: IOS 手机 时间格式转换
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/15
	   */
	  strToDate(dateObj){
		  dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/')
		  dateObj = dateObj.slice(0, dateObj.indexOf("."))
		  return new Date(dateObj)
	  },
    detail(e){
	    let orderStatus = e.currentTarget.dataset.orderstatus; // orderStatus 订货单状态(1、待收货 2、部分收货 3、已收货 4、待派单)
	    let orderId = e.currentTarget.dataset.orderid; // orderId 订货单id 和 盘点id 不同列表区分不同的id
      let pageName;
      let path;
      let outShopId = e.currentTarget.dataset.outshopid;
      let inShopId = e.currentTarget.dataset.inshopid;
      let orderType = e.currentTarget.dataset.ordertype;
      let outTransferId = e.currentTarget.dataset.outtransferid;
      let getuserinfo = wx.getStorageSync('getuserinfo');

      // 0 订货 - goodsreceipt - 待收货、部分收获路径名， orderfrom - 已收货路径名， goodsinfo - 待派单路径名
      switch (this.data.pageindex){
	      case 0: // 订货 / 收货
	        path = `?orderId=${orderId}&update=1&orderStatus=${orderStatus}&goods=goodsdetail`; // goods 待派单 和 订货页面缓存区分
          // pageName = orderStatus ==1 || orderStatus == 2 ? 'goodsreceipt' : ( orderStatus == 3 ? 'orderfrom':'goodsinfo' )
		      pageName = orderStatus == 1 ? 'orderfrom' : 'goodsinfo';
          break;
        case 1: // 盘点
	        path = `?orderId=${orderId}&orderStatus=${orderStatus}`; // orderStatus 盘点状态 1 已完成 2待审核 orderId 盘点id
	        pageName = orderStatus == 1 ? 'orderfrom' : 'inventoryreview';
	        if (getuserinfo.roleName == '店长') {
		        path = `?orderId=${orderId}&orderStatus=${orderStatus}`; // orderStatus 盘点状态 1 已完成 2待审核 orderId 盘点id
		        pageName = orderStatus == 1 ? 'orderfrom' : 'inventoryreview';
	        } else if(orderStatus == 2){
		        wx.showToast({
			        title: '没有权限审核',
			        icon: 'none'
		        })
		        return false;
	        }
          break;
        case 2: // 出库
          path = `?orderId=${orderId}`; // 出库单 id
          pageName = 'orderfrom';
          break;
        case 3: // 置换
          path = `?orderId=${orderId}`; // 置换单 id
          pageName = 'displaceslist';
          break;
        case 4: // 调拨
          path = `?orderId=${orderId}&orderStatus=${orderStatus}&orderType=${orderType}&outShopId=${outShopId}&inShopId=${inShopId}&outTransferId=${outTransferId}`;
          pageName = orderStatus == 1 ? 'orderfrom' : 'allotcollect';
          break;
        case 6: // 课程消耗
          path = `?orderId=${orderId}&isupdate=${e.currentTarget.dataset.isupdate}`; //isupdate 判断是否需要修改操作
          pageName = 'expendtrim';
          break;
      }
      wx.navigateTo({
        url: config.getPageUrl(true, pageName, path)
      })
    }
  }
})
