const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const app = getApp();
// pages/goodsinfo/goodsinfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop:0,
    outage:'',
    pagetitle:'',
    ordernumber:'',
    listtype:'goods',
    itemId:0,
    shopTotalN: 0,
    shopPieceN: 0,
    productlist:[
      { img:"pro-img1.png",name:"皇家奶茶杯盖",typename:"原料",unit:"10g",stock:"48",typelist:["大杯","黑色"],current:"55",company:"kg" },
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "23", company: "kg" },
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "零售品", unit: "10g", stock: "48", current: "99", company: "kg" },
      { img: "pro-img4.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "54", company: "kg" },
      { img: "pro-img5.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "65", company: "kg" },
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", current: "76", company: "kg" }
    ]
  },

  // 下一步
  goNext(){
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
    let { outage, shopTotalN } = _this.data;
    let productList = wx.getStorageSync('productList-dingh');
    let token = wx.getStorageSync('getusertoken');
    let selectIndex = app.selectIndex;
    let purchaseDetailVOList = [];
    productList.map((item,index) =>{
      let childItem = item.item;
      let postData = {
        id: item.id,
        goodsId: item.skuId,
        needNumber: childItem.unitValue
      }
      purchaseDetailVOList.push(postData)
    })
    let promeData = {
      shopId: selectIndex,
      status: 4,
      purchaseDetailVOList
    }
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
        wx.showToast({
          title: '订货成功',
          mask:true
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 800);
      }else{
        wx.showToast({
          title: msg,
          icon: 'none'
        })
      }
    })
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
    let productlist = wx.getStorageSync('productList-dingh');

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
        wx.setStorageSync('productList-dh-confirm', purchaseDetailVOList);
      }else{
        wx.showToast({
          title: msg,
          icon:'none'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let { ordernumber ='', outage, itemId = ''} = options;
    if (itemId){
      _this.setData({
        listtype:'listdetail'
      })
      _this.getShopListById(itemId);
    }else{
      _this.getSelectShop();
    }
    let pagetitle = wx.getStorageSync('pagetitle');
    if (pagetitle =='出库操作'){
      pagetitle = '出库';
      this.setData({
        outage
      })
    }
    this.setData({
      pagetitle,
      ordernumber,
      itemId
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