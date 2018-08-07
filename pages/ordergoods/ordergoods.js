const config = require('../../config/config.js');
import * as utils from'../../utils/util';
import * as logic from  '../../utils/logic';
const storeLogic = new logic.StoreLogic();
const orderLogic = new logic.OrderLogic();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _index: 0, // 分类导航索引号
    currPage: 1,
    pageSize: 10,
    categoryId: 0, // 导航分类Id
    scrollTop: 0,
    navlist: [],  // 侧边导航
    productlist: [], // 初始化数据
	  tempInventList: [], // 子组件返回父组件临时盘点数据待提交用
    pageindex: '', // 页面判断 是哪一个类型
    productType: '', // 同一个模块判断不同页面类型 做数据缓存
    shopTotalN: 0, // 选中多少个商品
    shopPieceN: 0, // 选中多少件商品
	  reason: '', //  出库原因  报废：商品破损、商品过期、商品变质； 退货：临期、过期、在库退货、质量问题；
	  outboundType: 0, // 出库类型 1 报废  2 退货
	  pagetListData: [],
  },
	/*
	 * Description: 选择产品类别 - 导航
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/16
	 */
	selectNav(e) {
    this.setData({
      _index: e.currentTarget.dataset.index,
	    categoryId: e.currentTarget.dataset.categoryid,
	    productlist: [],
	    pagetListData: [],
	    currPage: 1,
	    scrollTop: 0,
    })
    this.getProductByNav();
		this.listLength();
	},
	/*
	 * Description: 获取类别信息
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/16
	 */
	getMenuList() {
		storeLogic.ajaxGetData('category/listCategory').then((res) => {
			res.categoryVOList.unshift({
				id: 0,
				name: '全部',
				level: 0,
				sort: 0
			})
			this.setData({
				categoryId: res.categoryVOList[0].id,
				navlist: res.categoryVOList
			})
			this.listLength();
			this.getProductByNav();
		})
  },
	listLength() {
		let a = this.data.navlist.map((item) => {
			return item.id
		})
		wx.setStorageSync('navlistLength', {voLenght: this.data.navlist.length, keyIndex: a, categoryId: this.data.categoryId}); // 分类长度
	},
	/*
	 * Description: 获取产品信息
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/16
	 */
	getProductByNav() {
	  let pageIndex = wx.getStorageSync('pageindex');
	  let itemTypes = utils.limitClass(pageIndex);
    let promdData = {
      currPage: this.data.currPage,
      pageSize: this.data.pageSize,
      shopId: app.selectIndex, // 店铺ID
	    itemTypes, // 订货为 2,4,5,6 限制商品  盘点为 2,4,6 其他都是2,4,6，具体请看prd
    }
    // 分类id为0的时候是全部分类 不传分类id 搜索全部商品
		this.data.categoryId != 0 ? promdData.categoryId = this.data.categoryId : '' // 产品分类ID
		pageIndex == 1 ? promdData.type = 1 : '';
		storeLogic.ajaxGetData('category/listProduct', promdData, this.data.categoryId).then((res) => {
			wx.stopPullDownRefresh();
			if (res.page.totalPage < this.data.currPage || res.page.list.length == 0) {
				utils.showToastNone('没有更多数据');
				return false
			}
	    this.data.pagetListData = this.data.pagetListData.concat(res.page.list); // 数组合并
			this.data.pagetListData = orderLogic.refreshLoadData(this.data.pagetListData, this.data.categoryId);

	    this.setData({
		    productlist: this.data.pagetListData,
		    currPage: this.data.currPage + 1
	    })
    })
  },

	/**
   * Description: 设置商品总数 只需要监听数据变化即可
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/27
   */
  _watchChange(){
  	let cacheData = wx.getStorageSync('cacheData');
		let setShop = storeLogic.watchChange(cacheData && cacheData[0]);
    this.setData({
      shopTotalN: setShop.total || 0,
      shopPieceN: setShop.shopPieceN || 0
    })
  },

  /**
   * Description: shopTypeSearch 判断是搜索类型不走缓存数据  categoryId 产品分类id
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  goSearch() {
    wx.navigateTo({
      url: `../../pages/search/search?categoryId=${this.data.categoryId}&shopType=goods&shopTypeSearch=search`
    })
	  wx.setStorageSync('optionStorage', 2) // 用于判断进入不同页面 在返回获取数据 1是进入订单总结页面，2是进入搜索查询页面
  },

  /* 前往商品信息页面 */
  goNext() {
  	if (this.data.pageindex == 0) {
		  if (this.data.shopTotalN <= 0) {
			  utils.showToastNone('请选择商品');
			  return
		  }
	  } else if (this.data.pageindex == 2 || this.data.pageindex == 7) {
		  if (this.conclusion().length <= 0) {
			  utils.showToastNone('请选择商品');
			  return
		  }
	  }
	  wx.setStorageSync('optionStorage', 1) // 用于判断进入不同页面 在返回获取数据 1是进入订单总结页面，2是进入搜索查询页面
	  wx.navigateTo({ // conclusion = 1  订货单总结页面 所有下订单的结果页
		  url: `../../pages/goodsinfo/goodsinfo?conclusion=1&productType=goods&orderStatus=4&reason=${this.data.reason}&outboundType=${this.data.outboundType}`
	  })
  },
	/**
	 * Description: 过滤商品不为空的时候才可以提交
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/20
	 */
	conclusion() {
  	let outboundCacheData = wx.getStorageSync('outboundCacheData'); // 出库过滤
		return orderLogic.filterData(outboundCacheData ? outboundCacheData[0] : [], 3);
	},
	/**
	 * Description: 保存盘点 接口
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
  getInventory() {
  	let inventoryCacheData = wx.getStorageSync('inventoryCacheData');
  	let promdData = storeLogic.subData(inventoryCacheData && inventoryCacheData[0], this.data.productlist);
		if (promdData.inventListLenght == 0 ) {
			utils.showToastNone('盘点数据不能为空');
			return
		}
		promdData = {
			id: this.data.itemId || null, // 订单id // 更新必传
			shopId: app.selectIndex, // 店铺ID
			inventoryDetailVOList: promdData.isComplete,
		}
		wx.showModal({
			content: '是否确认提交盘点？',
			confirmColor: config.showModal.confirmColor,
			success: (res) => {
				if (res.confirm) {
					storeLogic.ajaxSaveUpdate('inventory', promdData, true).then(() => {
						utils.showToast({title: '提交盘点成功', page: 1, pages: getCurrentPages()});
						wx.removeStorageSync('inventoryCacheData'); // 数据提交后 清除缓存
					})
				}
			}
		});
  },
	/**
	 * Description: 提交保存 盘点操作
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
  subInventory(){
		this.getInventory();
  },
  /**
   * Description: 清除缓存
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  clearCache() {
    this.setData({
	    productlist: [],
	    pagetListData: [],
	    currPage: 1,
    })
	  this.getProductByNav();
	  wx.removeStorageSync('inventoryCacheData');
  },
	/**
	 * Description: scroll view 下拉刷新
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/15
	 */
	lower(e) {
		this.getProductByNav();
	},

	/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMenuList();
    console.log(options, 'ordergoods');
    let pageindex = wx.getStorageSync('pageindex');
    this.setData({
      pageindex,
	    productType: options.productType || '',
	    reason: options.reason || '', // 出库原因  报废：商品破损、商品过期、商品变质； 退货：临期、过期、在库退货、质量问题；
	    outboundType: options.outboundType || 0, // 出库类型 1、报废 2、退货
    })
		if (pageindex == 2 || pageindex == 7) {
			wx.setStorageSync('reasonRadio', options.reason); // 判断页面进入的是哪个类别
		}
    /* 根据页面标题 获取对应的数据源 */
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('pagetitle')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
	/*
	* 缓存说明：
	* 0、通用
	*     wx.getStorageSync('optionStorage') -> 读取判断进入哪一个页面 1、为结果页面；2、搜索查询页面
	* */
  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    let pageindex = wx.getStorageSync('pageindex');
	  let os = wx.getStorageSync('optionStorage');
    if (pageindex ==0 || pageindex == 1 || pageindex == 2 || pageindex == 7) {
	    if (os == 2 || os == 1) {
		    this.data.currPage = 1;
		    this.data.pagetListData = [];
		    this.data.productlist = [];
		    this.getProductByNav();
	    }
	    if (pageindex == 0) {
		    this._watchChange();
	    }
    }
	  this.setData({
			productlist: this.data.productlist
		})
	  wx.removeStorageSync('optionStorage'); // 每次显示清空上一次判断结果
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
    console.log('下拉加载数据');
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