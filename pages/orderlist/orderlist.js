// pages/orderlist/orderlist.js
const app = getApp();
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titlename: '',
    btntext:'',
    isShow:false,
    selectRadio:'',
	  listData: [], // 总数据
    pagetListData: [], // 结果数据数据 需要合并
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
    shopId:0
  },

  /* 商品详情 */
  ordergoods(){
    let _this = this;
    let { titlename } = _this.data;
    if (titlename.includes('课程消耗调整')){
      wx.navigateTo({
        url: '../../pages/expendtrim/expendtrim'
      })
    } else if (titlename.includes('置换')){
      wx.navigateTo({
        url: '../../pages/displacesgoods/displacesgoods'
      })
    } else if (titlename.includes('调拨')) {
      wx.navigateTo({
        url: '../../pages/allocation/allocation'
      })
    }else{
      wx.navigateTo({ // 订货 盘点
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
    let _this= this;
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
      if (res.code == 401) {
        config.logOutAll();
        return
      }
      if (res.code == 0) {
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
	      _this.setData({
		      listData: this.data.pagetListData,
		      currPage: this.data.currPage + 1
	      })
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
		let _this = this;
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
			if (res.code == 401) {
				config.logOutAll();
				return
			}
			if (res.code == 0) {
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
				_this.setData({
					listData: this.data.pagetListData,
					currPage: this.data.currPage + 1
				})
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
	   let typeName = ''; // 状态
	   let btntext = ''; // 拼接按钮提示
	   let titlename = ''; // title标题
	   let pageindex = wx.getStorageSync('pageindex');
	   console.log(pageindex, options);
	   switch(pageindex){
        case 0: // 订货
          btntext = options.titlename;
          typeName = 'orderGoodsStatus';
	        this.getOrderGoods();
          break;
        case 1: // 盘点
          btntext = '开始' + options.titlename;
          typeName = 'inventoryStatus';
          console.log(btntext);
          // this.getInventory();
          break;
        case 2: // 出库操作
          typeName = 'outGoType';
          break;
        case 4: // 置换
          btntext = '发起置换';
          typeName = 'displaces';
          break;
        case 5: // 调拨
          btntext = '调拨出库';
          typeName = 'allotStatus';
          break;
        case 7: // 课程消耗
          btntext = '消耗调整';
          titlename = '课程消耗调整';
          break;
	   }
	   this.setData({
        btntext,
        typeName,
		    titlename: options.titlename,
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