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
    isShow: false,
    selectRadio:'',
	  listData: [], // 总数据
    pagetListData: [], // 临时拼接数据需要合并到 lisData中
    pageindex: 0, // 缓存数据中取出 判断是哪个类型
    radioList: [
      [
        { 'name': '商品破损', value: '1', checked:false},
        { 'name': '商品过期', value: '2', checked: false },
        { 'name': '商品变质', value: '3', checked: false }
      ],
      [
        { 'name': '临期', value: '1', checked: false },
        { 'name': '过期', value: '2', checked: false },
        { 'name': '在库退货', value: '3', checked: false },
        { 'name': '质量问题', value: '4', checked: false }
      ]
    ],
    labelList:[],
    orderGoodsList:[
      {'order':'OOED243245678','uname':'赵三','time':'2018-04-17 18:19:20',type:1},
      { 'order': 'OOED5234267', 'uname': '李四', 'time': '2018-04-17 18:19:20', type: 0 },
      { 'order': 'OOED4123423111', 'uname': '王五', 'time': '2018-03-17 18:19:20', type: 2 },
      { 'order': 'OOED452423422342', 'uname': '冯琪', 'time': '2018-04-19 18:19:20', type: 3 },
    ],
    inventoryList:[
      { 'order': 'OOED452423422342', 'uname': '冯琪', examine:'小吴','time': '2018-04-19 18:19:20', type: 1 },
      { 'order': 'OOED452423422342', 'uname': '冯琪', 'time': '2018-04-19 18:19:20', type: 0 },
      { 'order': 'OOED452423422342', 'uname': '冯琪', examine: '小吴', 'time': '2018-04-19 18:19:20', type: 1 },
      { 'order': 'OOED452423422342', 'uname': '冯琪', examine: '小吴', 'time': '2018-04-19 18:19:20', type: 1 },
      { 'order': 'OOED452423422342', 'uname': '冯琪', 'time': '2018-04-19 18:19:20', type: 0 }
    ],
    consumeList:[
      { 'order': 'OOED452423422342', 'uname': '冯琪', 'time': '2018-04-19 18:19:20'},
      { 'order': 'OOED45242777772', 'uname': '娃哈哈', 'time': '2018-04-19 18:19:20' },
      { 'order': 'OOED45242555552', 'uname': '冯琪', 'time': '2018-04-19 18:19:20' },
      { 'order': 'OOED4524433443', 'uname': '王老吉', 'time': '2018-04-19 18:19:20' }
    ],
    outGoList:[
      { 'order': 'OOED4524433443', outType: 0, outreason: 1, 'examine': '王老吉', 'time': '2018-04-19 18:19:20' },
      { 'order': 'OOED4524433443', outType: 0, outreason: 1, 'examine': '成龙', 'time': '2018-04-19 18:19:20' },
      { 'order': 'OOED412111443', outType: 1, outreason: 1, 'examine': '冯德瑞', 'time': '2018-03-19 18:19:20' },
      { 'order': 'OOED4524433443', outType: 0, outreason: 2, 'examine': '冯德瑞', 'time': '2018-04-29 18:19:20' },
    ],
    displacesList:[
      { 'order': 'DOC23456', type: 0, 'uname': '娃哈哈', 'time': '2018-04-19 18:19:20' },
      { 'order': 'DOC267896', type: 0, 'uname': '王老吉', 'time': '2018-04-19 18:19:20' },
      { 'order': 'DOC26756', type: 0, 'uname': '雪碧', 'time': '2018-04-19 18:19:20' }
    ],
    allotList:[
      { 'order': 'DOC245676756', type: 0, ordertype: 1, allotOut: '上海K11烘焙课', allotEnter: '武汉K11烘焙课', 'subname': '雪碧', collect:'小吴', 'time': '2018-04-19 18:19:20' },
      { 'order': 'DOC245676756', type: 1, ordertype: 1, allotOut: '上海K11烘焙课', allotEnter: '武汉K11烘焙课', 'subname': '雪碧', collect: '小吴', 'time': '2018-04-19 18:19:20' },
      { 'order': 'DOC245676756', type: 1, ordertype: 0, allotOut: '上海K11烘焙课', allotEnter: '武汉K11烘焙课', 'subname': '雪碧', collect: '小吴', 'time': '2018-04-19 18:19:20' },
      { 'order': 'DOC245676756', type: 0, ordertype: 0, allotOut: '上海K11烘焙课', allotEnter: '武汉K11烘焙课', 'subname': '雪碧', collect: '小吴', 'time': '2018-04-19 18:19:20' }
    ],
    currPage:1,
    pageSize:10,
  },

  /* 商品详情 */
  ordergoods(){
    let pageindex = wx.getStorageSync('pageindex');
    if (pageindex == 7) { // 课程消耗
      wx.navigateTo({
        url: '../../pages/expendtrim/expendtrim'
      })
    } else if (pageindex == 4){ // 置换
      wx.navigateTo({
        url: '../../pages/displacesgoods/displacesgoods'
      })
    } else if (pageindex == 5) { // 调拨
      wx.navigateTo({
        url: '../../pages/allocation/allocation'
      })
    }else{
      if (pageindex == 0) {
        wx.navigateTo({ // 订货
          url: '../../pages/ordergoods/ordergoods?productType=goods'
        })
      }
      wx.navigateTo({ // 订货 盘点 出库操作 入库操作 库存查询
        url: '../../pages/ordergoods/ordergoods'
      })
    }
  },

  /* 报废 */
  scrapSelect(e){
    let _this = this;
    _this.setData({
      isShow:true,
      labelList: _this.data.radioList[0]
    })
  },

  /* 获取订货信息 */
  getOrderGoods() {
    wx.showLoading({ title: '加载中' });
    let getParm = {
      currPage: this.data.currPage,
      pageSize: this.data.pageSize,
      shopId: app.selectIndex,
    }
    sysService.purchase({
      url: 'list',
      method: 'get',
      data: getParm
    }).then((res) => {
      wx.stopPullDownRefresh();
      if (res.code = '0') {
        if (res.page.list.length == 0) {
          wx.hideLoading();
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
      } else if (res.code == '401') {
        config.logOutAll();
        return
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      }
      wx.hideLoading();
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
		let getParm = {
			currPage: this.data.currPage,
			pageSize: this.data.pageSize,
			shopId: app.selectIndex,
		}
		sysService.inventory({
			url: 'list',
			method: 'get',
			data: getParm
		}).then((res) => {
			wx.stopPullDownRefresh();
			if (res.code == '0') {
				if (res.page.list.length == 0) {
					wx.hideLoading();
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
			} else if (res.code == '401') {
        config.logOutAll();
        return
      } else {
				wx.showToast({
					title: res.msg,
					icon: 'none'
				})
			}
			wx.hideLoading();
		}).catch(() => {
			wx.hideLoading();
		})
  },

  /* 退货 */
  returnGoods(e){
    let _this = this;
    _this.setData({
      isShow: true,
      labelList: _this.data.radioList[1]
    })
  },

  /* 确定 */
  confirmFun(){
    let _this = this;
    _this.dialogClose();
    let { selectRadio } = _this.data;
    wx.navigateTo({
      url: '../../pages/ordergoods/ordergoods?radiotxt=' + selectRadio
    })
  },

  dialogClose(){
    this.setData({
      isShow: false
    })
  },

  dialogShow(){
    this.setData({
      isShow: true
    })
  },

  /* radio 选中的 */
  radioChange(e){
    this.setData({
      selectRadio: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	   let btntext = ''; // 拼接按钮提示
	   let titlename = ''; // title 按钮名称
	   let pageindex = wx.getStorageSync('pageindex');
	   console.log(pageindex, options);
	   switch(pageindex){
        case 0: // 订货
          btntext = options.titlename;
	        this.getOrderGoods();
          break;
        case 1: // 盘点
          btntext = options.titlename;
          console.log(btntext);
          // this.getInventory();
          break;
        case 2: // 出库操作
          break;
        case 4: // 置换
          btntext = '发起置换';
          break;
        case 5: // 调拨
          btntext = '调拨出库';
          break;
        case 7: // 课程消耗
          btntext = '消耗调整';
          titlename = '课程消耗调整';
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
    this.getOrderGoods();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})