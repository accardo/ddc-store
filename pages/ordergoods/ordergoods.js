const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _index:0,
    currPage:1,
    pageSize:10,
    shopId:0,
    categoryId:0,
    goodsName:'',
    showbtnbox:1,
    scrollTop:0,
    outage:'',
    selectProductList:[],
    navlist:[
      '饮品',
      '零食',
      '牛奶',
      '水果',
      '饼干',
      '糖果'
    ],
    stockquerylist:[],
    productlist: [], // 初始化数据
	  tempInventList: [], // 子组件返回父组件临时盘点数据待提交用
    pageindex:'', // 页面判断 是哪一个类型
    productType: '', // 同一个模块判断不同页面类型 做数据缓存
    shopTotalN:0, // 选中多少个商品
    shopPieceN:0, // 选中多少件商品
  },
  //选择产品类别 - 导航
  selectNav(e){
    let ind = e.currentTarget.dataset.index;
    let _this = this;
    _this.setData({
      _index:ind,
      scrollTop:0
    })
  },
  /* 获取类别信息 */
  getMenuList(){
    sysService.category({
      url:'listCategory',
      method:'get',
    }).then((res) => {
      if (res.code == '0' && res.categoryVOList.length > 0) {
        this.setData({
          categoryId: res.categoryVOList[0].id,
          navlist: res.categoryVOList
        })
        this.getProductByNav();
      } else if (res.code == '401') {
        config.logOutAll();
        return
      } else {
        wx.showToast({
          title: res.msg,
          icon:'none'
        })
      }
    })
  },
  /* 获取产品信息 */
  getProductByNav(){
	  let pageIndex = wx.getStorageSync('pageindex');
	  let itemTypes = utils.limitClass(pageIndex);
    let promdData = {
      currPage: this.data.currPage,
      pageSize: this.data.pageSize,
      shopId: app.selectIndex, // 店铺ID
      categoryId: this.data.categoryId, // 产品分类ID
	    itemTypes, // 订货为 2,4,5,6 限制商品  盘点为 2,4,6
    }
    sysService.category({
      url:'listProduct',
      method:'get',
      data:promdData
    }).then((res) => {
      if (res.code == '0' && res.page.list && res.page.list.length > 0) {
        res.page.list.forEach((item) => {
          item.attrValues = item.attrValues.split(',');
        })
        this._watchChange(res.page.list);
        this.setData({
          productlist: res.page.list
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
    })
  },

  /**
   * Description: 设置商品总数 只需要监听数据变化即可
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/27
   */
  _watchChange(productlist){
    let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData'); // 读取订货缓存
    let shopPieceN = 0; // 选中多少件商品
    let productlistData = goodsOrderCacheData ? goodsOrderCacheData : productlist;
    let tempGoodsOrderData = productlistData.filter((item) => {
      return item.item.unitValue != '' || item.item.unitValue != 0;
    })
    tempGoodsOrderData.forEach((item, index) => {
      shopPieceN += item.item.unitValue
    })
    this.setData({
      shopTotalN: tempGoodsOrderData.length,
      shopPieceN: shopPieceN
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
  },

  /* 前往商品信息页面 */
  goNext() {
    if (this.data.shopTotalN <=0){
      wx.showToast({
        title: '请选择商品',
        icon:'none'
      })
      return
    }
    wx.navigateTo({ // conclusion = 1  订货单总结页面 所有下订单的结果页
      url: '../../pages/goodsinfo/goodsinfo?conclusion=1&productType=goods'
    })
  },
  /* 盘点 start*/
	/**
	 * Description: 保存盘点 接口
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
  getInventory() {
    //处理数据结构 start
    let tempInventList = wx.getStorageSync('inventoryCacheData');
    let inventoryDetailVOList = utils.ArrayDeepCopy(tempInventList);
    let isComplete = inventoryDetailVOList.filter((item) =>{ // 过滤 没有填写数据
      if (item.unitValue !== '' || item.materialUnitValue !== '') {
          item.goodsId = item.skuId;
          item.shopItemSkuVO = {
              attrValues: item.attrValues.toString(),
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
      }
    })
		let promdData = {
			id: this.data.itemId || null, // 订单id // 更新必传
			shopId: app.selectIndex, // 店铺ID
			inventoryDetailVOList: isComplete,
		}
	  //处理数据结构 end
       return new Promise((resolve) => {
         sysService.inventory({
           url:'save',
           method:'post',
           data:promdData
         }).then((res) => {
           resolve(res);
         })
       })
  },
	/**
	 * Description: 提交保存 盘点操作
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
  subInventory(){
    wx.showModal({
      content: '是否确认提交盘点？',
      confirmColor: config.showModal.confirmColor,
      success: (res) => {
        if (res.confirm){
            this.getInventory().then((data) => {
              if (data.code == '0') {
                utils.showToast({title: '提交盘点成功', page: 1});
                this.clearCache(); // 数据提交后 清除缓存
              } else if (data.code == '401') {
                config.logOutAll();
                return
              } else {
                wx.showToast({
                  title: data.msg,
                  icon:'none'
                })
              }
            })
        }
      }
    });
  },
  /**
   * Description: 清除缓存
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  clearCache() {
    wx.removeStorageSync('inventoryCacheData');
    this.getMenuList();
  },
	/* 盘点 end*/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, 'ordergoods');
    this.getMenuList();
    let pageindex = wx.getStorageSync('pageindex');
    this.setData({
      productType: options.productType,
      pageindex,
    })
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    let pageindex = wx.getStorageSync('pageindex');
    let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData'); // 读取订货缓存
    if (pageindex == 0 && goodsOrderCacheData ) { // 设置商品数量和件数
      this._watchChange()
      this.setData({
        productlist: goodsOrderCacheData ? goodsOrderCacheData : this.data.productlist
      })
    }
    // 获取缓存数据
    if(pageindex == 1) {
      let inventoryCacheData = wx.getStorageSync('inventoryCacheData');
      this.setData({
        productlist: inventoryCacheData ? inventoryCacheData : this.data.productlist
      })
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