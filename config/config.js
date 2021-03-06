let config = {
  pageImgUrl:'../../icons/',
  showModal:{
    confirmColor: '#ff4c4c'
  },
  getPageUrl(iscomponent, pageName = 'login', parth=''){
    return iscomponent == true ? `../../pages/${pageName}/${pageName}${parth}` : `pages/${pageName}/${pageName}${parth}`;
  },
}

/* 退出登录 */
config.logOutAll = function(){
	wx.showToast({
		title: '权限已过期，请重新登录',
		icon: 'none',
		duration: 1500,
		success: () => {
			setTimeout(() => {
				wx.clearStorage();
				wx.reLaunch({
					url: config.getPageUrl(true, 'login')
				})
			}, 2000)
		}
	})
}
config.updateManager = function () {
	// 获取小程序更新机制兼容
	if (wx.canIUse('getUpdateManager')) {
		const updateManager = wx.getUpdateManager()
		updateManager.onCheckForUpdate(function (res) {
			// 请求完新版本信息的回调
			if (res.hasUpdate) {
				updateManager.onUpdateReady(function () {
					wx.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success: function (res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate()
							}
						}
					})
				})
				updateManager.onUpdateFailed(function () {
					// 新的版本下载失败
					wx.showModal({
						title: '已经有新版本了哟~',
						content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
					})
				})
			}
		})
	} else {
		// 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
		wx.showModal({
			title: '提示',
			content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
		})
	}
}
config.dict={
  /*页面 title 对应的索引 */
  pageTitle: [
    '订货',
    '盘点',
    '出库操作',
    '入库操作',
    '置换',
    '调拨',
    '库存查询',
    '课程消耗',
	  '退货',
  ],
  
  /* 导航 icon */
  menuIcon:{
    '订货':'order-goods.png',
    '盘点':'inventory.png',
    '出库操作':'library.png',
    '置换':'substitution.png',
    '调拨':'allocation.png',
    '库存查询':'stock-check.png',
    '课程消耗':'consume.png',
	  '退货':'return.png',
  },

  /* 订货订单状态 */
  orderGoodsStatus:[
    '',
    '待收货',
    '部分收货',
    '已收货',
    '待派单'
  ],

  /* 商品类型 */
  shopType:[
    '',
    '现制现售品',
    '零售品',
    '课程',
    '原料',
    '耗材',
    '工具'
  ],

  /* 盘点订单状态 */
  inventoryStatus:[
    '待审核',
    '已完成'
  ],

  /* 置换状态 */
  displaces:[
    '已完成'
  ],

  /* 调拨出库 订单状态 */
  allotStatus:[
    '待收货',
    '已完成'
  ],

  /* 调拨订单类型 */
  allotOrderStatus:[
    '调拨入库',
    '调拨出库'
  ],

  /* 出库类型 0 报废原因 1 退货原因 */
  outGoType:[
	  [
		  { name: '商品破损', checked:false},
		  { name: '商品过期', checked: false },
		  { name: '商品变质', checked: false }
	  ],
	  [
		  { name: '临期', checked: false },
		  { name: '过期', checked: false },
		  { name: '在库退货', checked: false },
		  { name: '质量问题', checked: false }
	  ]
  ],

	/* 发货方式*/
	shipping: [
		{name: '供应商自提', value: 1, checked: true},
		{name: '快递', value: 2, checked: false},
	]
}

module.exports = config;