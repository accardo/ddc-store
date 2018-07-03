
let config = {
  pageImgUrl:'../../icons/',
  showModal:{
    confirmColor: '#ff4c4c'
  },
  getPageUrl(iscomponent, pageName = 'login', parth=''){
    return iscomponent == true ? 
    `../../pages/${pageName}/${pageName}${parth}` : 
    `pages/${pageName}/${pageName}${parth}`;
  },
  getDictById(dic,id){
    return this.dict[dic][parseInt(id)];
  }
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

config.transCompany = function(total =0, netnum=0, companym = 'g'){
  if (companym == '个') return `${total} 个`;
    let bigN = parseInt((parseInt(total) / parseInt(netnum)));
    let smN = (parseInt(total) % parseInt(netnum));
    let getStr = bigN > 0 ? `${bigN} 袋${smN}${companym}` : `${total} ${companym}`
    return getStr;
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
    '课程消耗'
  ],
  
  /* 导航 icon */
  menuIcon:{
    '订货':'order-goods.png',
    '盘点':'inventory.png',
    '出库操作':'library.png',
    '置换':'substitution.png',
    '调拨':'allocation.png',
    '库存查询':'stock-check.png',
    '课程消耗':'consume.png'
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
		  { 'name': '商品破损', checked:false},
		  { 'name': '商品过期', checked: false },
		  { 'name': '商品变质', checked: false }
	  ],
	  [
		  { 'name': '临期', checked: false },
		  { 'name': '过期', checked: false },
		  { 'name': '在库退货', checked: false },
		  { 'name': '质量问题', checked: false }
	  ]
  ],
}

module.exports = config;