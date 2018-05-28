const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const app = getApp();
const utils = require('../../utils/util');
// pages/goodsinfo/goodsinfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop:0,
    outage: '',
    pagetitle:'',
    ordernumber:'',
    listtype:'goods',
    itemId:0,
    shopTotalN: 0,
    shopPieceN: 0,
	  update: 0, // 判断更新操作
    status: 0,
    productlist:[],
    conclusion: '',
    productType: '', // 类型
	  pageindex: 0,
  },

  // 下一步
  goNext(e){
    console.log(e)
    let _this = this;
    let { shopPieceN,shopTotalN } = _this.data;
    if (shopPieceN <=0){
      wx.showToast({
        title: '请选择商品',
        icon:'none'
      });
      return;
    }
    let thisTime = new Date().getHours();
    if (15 <= thisTime && thisTime <=24){
      wx.showModal({
        content: '当前订货需求将在明天15:00提交至BD',
        confirmColor: config.showModal.confirmColor,
        success:function(res){
          if(res.confirm){
            _this.setPostData();
          }
        }
      })
    }else{
      wx.showModal({
        content: '是否提交数据？',
        confirmColor: config.showModal.confirmColor,
        success: function (res) {
          if (res.confirm) {
            _this.setPostData();
          }
        }
      });
    }
  },

  /* 设置请求的数据信息 */
  setPostData(){
    let _this = this;
    let purchaseDetailVOList = [];
    let token = wx.getStorageSync('getusertoken');
    if (this.data.update !== '1') { // 1 为更新操作 处理原始数据，原始数据和后台传数据结构相差太大，很坑人的。
	    purchaseDetailVOList = wx.getStorageSync('goodsOrderCacheData');
	    purchaseDetailVOList.forEach((item) => {
		    item.goodsId = item.skuId;
		    item.needNumber = item.item.unitValue;
		    item.shopItemSkuVO = {
			    attrValues: item.attrValues.toString(),
          id: item.id,
          item: item.item
        }
      })
    } else {
	    purchaseDetailVOList = wx.getStorageSync('productList-dh-confirm');
	    purchaseDetailVOList.forEach((item) => { // 属性 数组转字符串
	      item.shopItemSkuVO.attrValues = item.shopItemSkuVO.attrValues.toString();
      })
    }

    let promeData = {
	    id: this.data.itemId || null, // 订单id
      shopId: app.selectIndex, // 店铺ID
      status: this.data.status || 0, // 状态 (1、待收货 2、部分收货 3、已收货 4、待派单)
	    purchaseDetailVOList
    }
    if (this.data.update === '1') {
      sysService.purchase({
	      url: 'update?token='+token,
        method: "post",
	      data: promeData
      }).then((res) => {
        if (res.code == 0) {
	        utils.showToast({title: '更新成功', page: '1'})
        } else if(res.code == 401) {
	        config.logOutAll();
	        return
        }
      })
    } else {
	    sysService.purchase({
		    url: 'save?token='+token,
		    method: "post",
		    data: promeData
	    }).then(res => {
		    let {code,msg} = res;
		    if (code == 401) {
			    config.logOutAll();
			    return
		    }
		    if(code == 0){
			    utils.showToast({title: '订货成功', page: '2'})
		    }else{
			    wx.showToast({
				    title: msg,
				    icon: 'none'
			    })
		    }
	    })
    }
  },

  /* 前往照片上传页面 */
  nextGo(){
    let _this = this;
    let { outage, shopTotalN } = _this.data;
    if (shopTotalN <=0){
      wx.showToast({
        title: '请选择商品',
        icon:'none'
      });
      return 
    }
    
    wx.redirectTo({
      url: '../../pages/uploadimg/uploadimg?radiotxt=' + outage
    })
  },

  modifyNum(){
    let _this = this;
    let { itemId} =_this.data;
    let productlist = [], shopPieceN = 0, shopTotalN = 0;
    if (itemId){
      productlist = wx.getStorageSync('productList-dh-confirm');
      productlist.map(item => {
        shopPieceN = parseInt(item.needNumber) + shopPieceN;
      })
    }else{
      productlist = wx.getStorageSync('productList-dingh');
      console.log(productlist);
      productlist.map(item => {
        shopPieceN = parseInt(item.item.unitValue) + shopPieceN;
      })
    }
    shopTotalN = productlist.length;
    _this.setData({
      shopPieceN,
      shopTotalN
    })
  },

  /* 获取选择商品 */
  getSelectShop(){
    let _this =this;
    let { shopTotalN, shopPieceN } = _this.data;
    let productlist = wx.getStorageSync('goodsOrderCacheData');

    if (productlist && productlist.length >0){
      shopTotalN = productlist.length;
      productlist.map(item=>{
        shopPieceN = parseInt(item.item.unitValue) + shopPieceN;
      })
      _this.setData({
        shopPieceN,
        shopTotalN,
        productlist,
        listtype:'goods'
      })
    }
  },

  /* 设置商品数量 */
  setTotal(productlist, isArray) {
    let _this = this;
    let shopPieceN = 0, shopTotalN = 0, listArray = [];
    productlist.map((item,index) =>{
      if (item.shopItemSkuVO){
        let { shopItemSkuVO } = item;
        shopTotalN = shopTotalN+1;
        item.shopItemSkuVO.attrValues = shopItemSkuVO.attrValues.split(',');
        shopPieceN = parseInt(item.needNumber) + shopPieceN
      }else{
        productlist.splice(index,1)
      }
    })
    _this.setData({
      shopTotalN,
      shopPieceN
    });
    return listArray;
  },

  /* 根据订货单ID 获取 商品信息 */
  getShopListById(itemId){
    let _this = this;
    wx.removeStorageSync('productList-dh-confirm');
    let token = wx.getStorageSync('getusertoken');
    let getData = {
      purchaseId: itemId,
      shopId:app.selectIndex,
      token
    }
    sysService.purchasedetail({
      url:'info',
      method:'get',
      data: getData
    }).then(res =>{
      let { code, msg, purchaseDetailVOList } =res;
      if (code == 401) {
        config.logOutAll();
        return
      }
      if (code == 0 && purchaseDetailVOList){
        _this.setTotal(purchaseDetailVOList, false);
	      _this.setData({
		      productlist: purchaseDetailVOList
	      });
      //  wx.setStorageSync('productList-dh-confirm', purchaseDetailVOList);
      }else{
        wx.showToast({
          title: msg,
          icon:'none'
        })
      }
    })
  },
	/**
	 * Description: 设置商品总数 只需要监听数据变化即可
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/27
	 */
	_watchChange(){
	  let resultsGoodsOrderCacheData = wx.getStorageSync('resultsGoodsOrderCacheData'); // 读取订货缓存
		let shopPieceN = 0; // 选中多少件商品
		let tempGoodsOrderData = resultsGoodsOrderCacheData.filter((item) => {
			return item.item.unitValue != '' || item.item.unitValue != 0;
		})
		tempGoodsOrderData.forEach((item) => {
			shopPieceN += item.item.unitValue
		})
		this.setData({
			shopTotalN: tempGoodsOrderData.length,
			shopPieceN: shopPieceN
		})
	},
  /**
   * Description: 订单结果页 完全读取缓存显示
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/27
   */
  orderResultsPage() {
    let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData');
    let tempgoodsOrderCacheData = goodsOrderCacheData.filter((item) => {
      return item.item.unitValue != '' || item.item.unitValue != '0' || item.item.unitValue != 0;
    })
    wx.setStorageSync('resultsGoodsOrderCacheData', tempgoodsOrderCacheData); // 订单结果整合页数据需要提出来 在缓存
    this.setData({
      productlist: tempgoodsOrderCacheData
    })
    //console.log(tempgoodsOrderCacheData);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pageindex = wx.getStorageSync('pageindex');
    let pagetitle = wx.getStorageSync('pagetitle');
	  let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData');
    if (pageindex == 0 && goodsOrderCacheData) {
	    this.orderResultsPage(); // 订单结果页面重新缓存新数据
	    this._watchChange(); //商品数量
      this.setData({
        conclusion: options.conclusion,
        productType: options.productType
      })
    }
    console.log(this.data.conclusion, 'goodsinfo');
    this.setData({
	    pageindex,
    })
    wx:wx.setNavigationBarTitle({
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