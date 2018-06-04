4// components/productInfo/productInfo.js
var config = require('../../config/config.js');
Component({
  /**
   * 组件的属性列表  希望后来人不要骂我 都是让 后端逼的才这么写
   */
  properties: {
    productList:{ // 数据
      type:Array,
      value:[],
	    observer: function(newVal, oldVal) {
		    let pageindex = wx.getStorageSync('pageindex');
		    console.log(newVal, pageindex, 'newVal');
		    console.log(this.data.productConclusion, 'productConclusion')
        this.setData({
          pageindex,
          productList: newVal
        })
      }
    },
    productType:{ // 类型 判断是否订货，盘点，调拨 ....
      type:String,
      value:''
    },
    productClick:{ // 商品是否可以点击
      type:String,
      value:''
    },
    productStatus:{ // 订货详情状态
      type:String,
      value:''
    },
    productConclusion: { // 1 -- 订货单总结页面 所有下订单的结果页
      type: String,
      value: 0
    },
	  shopTypeSearch: { // 判断缓存是否是搜索页面中内容
      type: String,
      value: ''
    },
	  inputShow: { // 默认搜索 不显示input框
    	type: Boolean,
		  value: false
	  }
  },

  /**
   * 组件的初始数据
   */
  data: {
    defImg: config.pageImgUrl+'logo.png',
    shopType: config.dict.shopType,
	  cacheArray: [],
	  inventoryCacheArray: [],
	  outboundCacheArray: [],
  },

  ready() {
	  /**
	   * Description: 缓存数据 如果存在 需要记录之前的数据重新把之前的赋值
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/4
	   */
	  let cacheData = wx.getStorageSync('cacheData');
	  let inventoryCacheData = wx.getStorageSync('inventoryCacheData');
	  let outboundCacheData = wx.getStorageSync('outboundCacheData');
	  if (cacheData.length > 0) { // 订货
	  	this.data.cacheArray = wx.getStorageSync('cacheData');
	  }
	  if (inventoryCacheData.length > 0) { // 盘点
		  this.data.inventoryCacheArray = wx.getStorageSync('inventoryCacheData');
	  }
	  if (outboundCacheData.length > 0) { // 出库
		  this.data.outboundCacheArray = wx.getStorageSync('outboundCacheData');
	  }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /* 盘点部分 start*/
	  /**
	   * Description: 拆零扣减 直接扣减 设置整数 input 用一个字段 unitValue
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/5/25
	   */
	  setScattered1(e) {
		  this.data.productList[e.currentTarget.dataset.index].unitValue = e.detail.value;
		  if (this.data.pageindex == 1) {
		  	if (this.data.shopTypeSearch == 'search') {
				  wx.setStorageSync('searchInventoryCacheData', this.data.productList); // 查询页面 设置盘点缓存
			  } else {
				  this.cacheStorageSpaceInfo(e.currentTarget.dataset.navclassindex)
			  }
		  }else if(this.data.pageindex == 2) {
		  	if (this.data.shopTypeSearch == 'search') {
				  wx.setStorageSync('searchOutboundCacheData', this.data.productList); // 查询页面 设置出库缓存
			  } else {
				  this.cacheStorageSpaceInfo(e.currentTarget.dataset.navclassindex)
			  }
		  }
    },
	  /**
	   * Description: 拆零扣减 设置零散 input
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/5/25
	   */
	  setScattered2(e) {
		  this.data.productList[e.currentTarget.dataset.index].materialUnitValue = e.detail.value;
		  if (this.data.pageindex == 1) {
			  if (this.data.shopTypeSearch == 'search') {
				  wx.setStorageSync('searchInventoryCacheData', this.data.productList); // 查询页面 设置盘点缓存
			  } else {
				  this.cacheStorageSpaceInfo(e.currentTarget.dataset.navclassindex)
			  }
		  } else if (this.data.pageindex == 2) {
			  if (this.data.shopTypeSearch == 'search') {
				  wx.setStorageSync('searchOutboundCacheData', this.data.productList); // 查询页面 设置出库缓存
			  } else {
				  this.cacheStorageSpaceInfo(e.currentTarget.dataset.navclassindex)
			  }
		  }
    },
	  /* 盘点部分 end*/
	  /**
	   * Description: 盘点存储所有缓存数据
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/4
	   */
	  cacheStorageSpaceInfo(navClassIndex) {
		  let tempInfoData = [];
		  tempInfoData = this.data.productList.filter((item) => { // 过滤不是结果页面 返回 不为空和 0 的数据
			  return item.unitValue != '' || item.materialUnitValue != '';
		  })
		  if (this.data.pageindex == 1) {
			  this.data.inventoryCacheArray[navClassIndex] = tempInfoData;
			  wx.setStorageSync('inventoryCacheData', this.data.inventoryCacheArray);
		  } else if(this.data.pageindex == 2) {
			  if (this.data.productConclusion == 1) {
				  tempInfoData = this.data.productList.filter((item) =>{
				  	return item.navClass == navClassIndex;
				  })
			  }
			  this.data.outboundCacheArray[navClassIndex] = tempInfoData;
			  wx.setStorageSync('outboundCacheData', this.data.outboundCacheArray);
		  }
	  },
	  /**
	   * Description: 订单存储所有缓存选中数据 radio
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/2
	   */
	  cacheStorageSpace(navClassIndex) {
		  let tempGoodsOrderData = [];
		  tempGoodsOrderData = this.data.productList.filter((item) => { // 过滤不是结果页面 返回 不为空和 0 的数据
			  return item.needNumber != '' || item.needNumber != 0;
		  })
		  if (this.data.productConclusion == 1) { // 当是结果页面 返回 当前分类的数据 放入到对应的数据中
		  	tempGoodsOrderData = this.data.productList.filter((item) => {
				  return item.navClass == navClassIndex;
			  })
		  }
		  console.log(this.data.productList, tempGoodsOrderData,  '设置数据 用navclass');
		  this.data.cacheArray[navClassIndex] = tempGoodsOrderData
		  wx.setStorageSync('cacheData', this.data.cacheArray);
	  },
	  /**
	   * Description: 订单存储所有详情缓存数据 radio
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/4
	   */
	  cacheStorageSpaceDetial() {
		  let tempGoodsOrderData = [];
		  tempGoodsOrderData = this.data.productList.filter((item) => { // 过滤不是结果页面 返回 不为空和 0 的数据
			  return item.needNumber != '' || item.needNumber != 0;
		  })
		  wx.setStorageSync('cacheDataDetial', tempGoodsOrderData);
	  },
    /**
     * Description: 加号
     * Author: yanlichen <lichen.yan@daydaycook.com>
     * Date: 2018/5/27
     */
    countAdd(e) {
      this.setCurrentNum(e, true);
    },
    /**
     * Description: 减号
     * Author: yanlichen <lichen.yan@daydaycook.com>
     * Date: 2018/5/27
     */
    countReduce(e) {
      this.setCurrentNum(e, false);
    },

    /**
     * Description: 处理 加 or 减
     * Author: yanlichen <lichen.yan@daydaycook.com>
     * Date: 2018/5/27
     */
    setCurrentNum(e,isAddRed) {
      // let current = this.getCurrent(e);
	    console.log(e);
      let index = e.currentTarget.dataset.index;
      if ( isAddRed) {// 加法
        if (this.data.productType == 'goods') { // 订货详情
          ++ this.data.productList[index].needNumber;
           if(this.data.shopTypeSearch == 'search') {
	           wx.setStorageSync('searchGoodsOrderCacheData', this.data.productList); // 搜索页面的缓存数据 需要处理
           } else if (this.data.productStatus == 'goodsdetail') {
	           this.cacheStorageSpaceDetial();
           } else {
	           this.cacheStorageSpace(e.currentTarget.dataset.navclassindex);
           }

        }
      } else { // 减法
        if (this.data.productType == 'goods') {
          if (this.data.productList[index].needNumber > 0) {
            -- this.data.productList[index].needNumber;
	          if(this.data.shopTypeSearch == 'search') {
		          wx.setStorageSync('searchGoodsOrderCacheData', this.data.productList); // 搜索页面的缓存数据 需要处理
            } else if(this.data.productStatus == 'goodsdetail') {
		          this.cacheStorageSpaceDetial();
	          } else {
		          this.cacheStorageSpace(e.currentTarget.dataset.navclassindex);
	          }

          }
        }
      }
      this.setData({
        productList: this.data.productList
      })
	    if (this.data.productStatus == 'goodsdetail') {
		    this.triggerEvent("watchChangeDetial", "click");
	    } else {
		    this.triggerEvent("watchChange", "click");
	    }
    },

    /* 设置调拨收货 输入数量 */
    setCollect(e) {
      let val = e.detail.value;
      let listArr = this.data.productList;
      let { ind, name } = e.target.dataset;
      val = val ? parseInt(val) : 0;
      if (val){
        listArr[ind][name] = val;
        wx.setStorageSync('productList', JSON.stringify(listArr))
      }
    },

    /* 设置转化数量 */
    setWantNum(e){
      let val = e.detail.value;
      let wantList = wx.getStorageSync('want');
      wantList['wannum'] = val;
      wx.setStorageSync('want', wantList);
    },

    /* 保存当前选中的商品 */
    clickShop(e){
	    let index = e.currentTarget.dataset.index;
    	console.log(this.data.productList[index], '需要保持当前商品');
    	wx.setStorageSync('', '');
      // let { productList, productType, productClick} = this.data;
      // let { ind } = e.currentTarget.dataset;
      // if (productClick ==1){
      //   return
      // }
      // let selectData = this.data.productList[ind];
      // if(productType == 'want'){
      //   selectData['wannum'] = 0;
      // }
      // wx.setStorageSync(productType, selectData);
      // wx.navigateBack({
      //   delta:1
      // })
    }
  }
})
