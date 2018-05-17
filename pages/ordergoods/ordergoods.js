// pages/ordergoods/ordergoods.js
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
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
    navlist:[
      '饮品',
      '零食',
      '牛奶',
      '水果',
      '饼干',
      '糖果'
    ],
    productlist: [
      { img: "pro-img1.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "55", company: "kg" },
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "23", company: "kg" },
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "零售品", unit: "10g", stock: "48", current: "99", company: "kg" },
      { img: "pro-img4.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "54", company: "kg" },
      { img: "pro-img5.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", typelist: ["大杯", "黑色"], current: "65", company: "kg" },
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", current: "76", company: "kg" }
    ],
    stockquerylist:[
      { img: "pro-img1.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 120, netcontent: 100, typelist: ["大杯", "黑色"],company: "g" },
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 130, netcontent: 100, company: "g" },
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 20, netcontent: 100, typelist: ["大杯", "黑色"], company: "g" },
      {name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", current: 190, netcontent: 100, company: "g" },
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 130, netcontent: 100, company: "g" },
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 20, netcontent: 100, typelist: ["大杯", "黑色"], company: "g" },
      { name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", current: 190, netcontent: 100, company: "g" },
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 10, netcontent: 100, company: "个" }
    ]
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
  setTotal(productlist, listArray){
    let _this = this;
    let shopPieceN = 0, shopTotalN=0;
    productlist.map((item,index)=>{
      if (listArray){
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
    let { currPage, pageSize, shopId, goodsName, shopTotalN, shopPieceN } = _this.data;
    let promdData = {
      currPage,
      pageSize,
      shopId,
      categoryId,
      goodsName,
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
        let listArray = [];
        listArray = _this.setTotal(page.list, listArray);
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
    let shopPieceN =0;
    let shopTotalN = 0;
    _this.setTotal(productList);
  },

  //前往搜搜页面
  goSearch(){
    let _this = this;
    let { categoryId } = _this.data;
    wx.navigateTo({
      url: '../../pages/search/search?categoryId=' + categoryId
    })
  },

  /* 前往商品信息页面 */
  goNext(){
    let ordernumber = '567878wfw';
    let { outage } = this.data;
    // wx.redirectTo({
    //   url: '../../pages/goodsinfo/goodsinfo?ordernumber=' + ordernumber + '&outage=' + outage
    // })
  },

  /* 提交盘点 */
  subInventory(){
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
          productlist: _this.data.productlist
        })
        break;
      case '盘点':
        _this.setData({
          pagetitle,
          productlist: _this.data.stockquerylist
        });
        break;
      case '出库操作':
        pagetitle = '出库'
        _this.setData({
          outage,
          pagetitle:'出库',
          productlist: _this.data.stockquerylist
        });
        break;
      case '库存查询':
        _this.setData({
          pagetitle,
          showbtnbox: 0,
          productlist: _this.data.stockquerylist
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