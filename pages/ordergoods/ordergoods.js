// pages/ordergoods/ordergoods.js
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
    pagetitle:'',
    scrollTop:0,
    outage:'',
    shopTotalN:0,
    shopPieceN:0,
    selectProductList:[],
    navlist:[
      '饮品',
      '零食',
      '牛奶',
      '水果',
      '饼干',
      '糖果'
    ],
    productlist: [],
    stockquerylist:[],
	  tempInventList: [], // 子组件返回父组件临时盘点数据待提交用
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
    let _this = this;
    let token = wx.getStorageSync('getusertoken');
    sysService.category({
      url:'listCategory',
      method:'get',
      data:{token}
    }).then(res=>{
      let { code, categoryVOList,msg } = res;
      if (code == 401){
        config.logOutAll();
        return 
      }
      if (code == 0 && categoryVOList.length >0){
        let categoryId = categoryVOList[0].id;
        _this.setData({
          categoryId,
          navlist: categoryVOList
        })
        _this.getProductByNav(categoryId);
      }else{
        wx.showToast({
          title: msg,
          icon:'none'
        })
      }
    })
  },

  /* 设置商品数量 */
  setTotal(productlist, isArray){
    let _this = this;
    let shopPieceN = 0, shopTotalN = 0, listArray = [];
    productlist.map((item,index)=>{
      if (isArray){
        item.attrValues = item.attrValues.split(',');
        listArray.push(item);
      }
      shopPieceN = parseInt(item.item.unitValue) + shopPieceN;
      if (item.item.unitValue > 0) {
        shopTotalN = shopTotalN + 1;
      }
    })
    _this.setData({
      shopTotalN,
      shopPieceN
    });
    return listArray;
  },

  /* 获取产品信息 */
  getProductByNav(categoryId){
    let _this = this;
    let { currPage, pageSize, shopId} = _this.data;
	  let pageIndex = wx.getStorageSync('pageindex');
	  let itemTypes = utils.limitClass(pageIndex);
    let promdData = {
      currPage,
      pageSize,
      shopId, // 店铺ID
      categoryId, // 产品分类ID
	    itemTypes, // 订货为 2,4,5,6 限制商品  盘点为 2,4,6
      token: wx.getStorageSync('getusertoken')
    }
    sysService.category({
      url:'listProduct',
      method:'get',
      data:promdData
    }).then(res=>{
      let { code,msg,page} = res;
      if (code == 401) {
        config.logOutAll();
        return
      }
      if(code ==0 && page.list && page.list.length >0){
        let listArray  = _this.setTotal(page.list,true);
        _this.setData({
          productlist: listArray
        })
      }else{
        wx.showToast({
          title: msg,
          icon: 'none'
        })
      }
    })
  },

  /* 设置商品总数 */
  modifyNum(){
    let _this = this;
    let productList = wx.getStorageSync('productList-dingh');
    _this.setTotal(productList);
  },

  //前往搜搜页面
  goSearch(){
    let _this = this;
    let { categoryId } = _this.data;
    wx.navigateTo({
      url: `../../pages/search/search?categoryId=${categoryId}&shopType=goods&shopTypeSearch=search`
    })
  },

  /* 前往商品信息页面 */
  goNext(){
    let _this = this;
    let { shopTotalN, shopPieceN, shopId, outage } = _this.data;
    if (shopTotalN <=0){
      wx.showToast({
        title: '请选择商品',
        icon:'none'
      })
      return
    }
    wx.navigateTo({
      url: '../../pages/goodsinfo/goodsinfo?outage=' + outage
    })
  },
  /* 盘点 start*/
	/**
	 * Description:  子组件返回的盘点数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
	_bindInventoryData(e) {
		this.setData({
			tempInventList: e.detail
		})
  },
	/**
	 * Description: 保存盘点 接口
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
  getInventory() {
    //处理数据结构 start
    let ArrayDeepCopy = utils.ArrayDeepCopy(this.data.tempInventList);
		let inventoryDetailVOList = utils.ArrayDeepCopy(ArrayDeepCopy);
		inventoryDetailVOList.forEach((item) => {
			item.goodsId = item.skuId;
			item.shopItemSkuVO = {
				attrValues: item.attrValues.toString(),
				id: item.id,
				item: item.item
			}
		})
		let promdData = {
			id: this.data.itemId || null, // 订单id // 更新必传
			shopId: app.selectIndex, // 店铺ID
			inventoryDetailVOList,
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
    //console.log();
    this.getInventory().then((data) => {
      console.log(data);
    })

    return false;
    wx.showModal({
      content: '是否确认提交盘点？',
      confirmColor: config.showModal.confirmColor,
      success: function (res) {
        if (res.confirm){
          wx.showToast({
            title: '提交盘点成功'
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1200)
        }
      }
    });
  },
	/* 盘点 end*/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    _this.getMenuList();
    let shopId = app.selectIndex;
    let pagetitle = wx.getStorageSync('pagetitle');
    let outage = options.radiotxt ? options.radiotxt : '';
    /* 根据页面标题 获取对应的数据源 */
    switch (pagetitle){
      case '订货':
        _this.setData({
          pagetitle,
          shopId,
        //  productlist: _this.data.productlist
        })
        break;
      case '盘点':
        _this.setData({
          pagetitle,
	        shopId,
        //  productlist: _this.data.stockquerylist
        });
        break;
      case '出库操作':
        pagetitle = '出库'
        _this.setData({
          outage,
          pagetitle:'出库',
        //  productlist: _this.data.stockquerylist
        });
        break;
      case '库存查询':
        _this.setData({
          pagetitle,
          showbtnbox: 0,
        //  productlist: _this.data.stockquerylist
        })
        break;
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
  onShow () { // 当订货显示页面修改时返回时，缓存和原始数据对比如果有修改就把修改后的数据赋值
    this.modifyNum();
    let _this = this;
    let productListDingh = wx.getStorageSync('productList-dingh'); // 获取页面缓存数据
    if (_this.data.productlist.length > 0 && productListDingh) {
	    _this.data.productlist.forEach((itemA, index) => {
        productListDingh.forEach((itemB) => {
		      if (itemA.id == itemB.id) {
			      _this.data.productlist.splice(index, 1, itemB);
            _this.setData({
				      productlist:_this.data.productlist
            })
          }
        })
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