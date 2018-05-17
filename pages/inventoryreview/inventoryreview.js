// pages/inventoryreview/inventoryreview.js
const config = require('../../config/config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countNum:1,
    scrollTop:0,
    isShow:false,
    val:'',
    ind:'',
    stoknum:0,
    defImg: 'logo.png', 
    pagetitle: '',
    imgUrl: config.pageImgUrl,
    inventoryList: [
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 120, netcontent: 100, typelist: ["大杯", "黑色"], company: "g",stockthory:100 },
      { img: "pro-img2.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 130, netcontent: 100, company: "g", stockthory: 10},
      { img: "pro-img6.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 20, netcontent: 100, typelist: ["大杯", "黑色"], company: "g",stockthory: 10 },
      { name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: "48", current: 190, netcontent: 100, company: "g", stockthory: 20 },
      { img: "pro-img3.png", name: "皇家奶茶杯盖", typename: "原料", unit: "10g", stock: 10, netcontent: 100, company: "个", stockthory: 30 }
    ]
  },


  //设置Input 框 的值
  setValue(e) {
    let val = e.detail.value;
    this.setData({
      val
    })
  },

  //修改 数值
  editNum(e) {
    let _this = this;
    let { ind, stoknum } = e.target.dataset;
    _this.setData({
      isShow: true,
      stoknum,
      ind
    })
  },

  /* 确定调整 */
  confimNum(e) {
    let _this = this;
    let { val, ind,inventoryList } = _this.data;
    if (!val){
      wx.showToast({
        title: '请输入盘点数量',
        icon:'none'
      })
      return 
    }
    let stoknum = parseInt(inventoryList[ind].stoknum);
    inventoryList[ind].stoknum = val;
    _this.setListData(inventoryList);
  },

  //设置 修改后的列表
  setListData(inventoryList) {
    let _this = this;
    _this.setData({
      inventoryList,
      isShow: false,
      val:''
    })
  },

  /* 提交审核 */
  subReview(){
    wx.showModal({
      content: '确认提交审核？',
      confirmColor: config.showModal.confirmColor,
      success: function (res) {
        if (res.confirm){
          wx.showToast({
            title: '提交审核成功'
          })
          /* 成功后返回上一页面 */
          setTimeout(()=>{
            wx.navigateBack({
              delta: 1
            })
          },1200);
        }
      }
    });
    console.log('点击提交审核');
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let inventoryList = [];
    let _this = this;
    _this.data.inventoryList.map(item => {
      let stoknum = config.transCompany(item.stock, item.netcontent, item.company);
      item['stoknum'] = stoknum.split(' ')[0];
      item['unitinfo'] = stoknum.split(' ')[1]
      inventoryList.push(item);
    })
    _this.setData({
      inventoryList
    })
    console.log(inventoryList);
    wx.setNavigationBarTitle({
      title: '盘点审核'
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