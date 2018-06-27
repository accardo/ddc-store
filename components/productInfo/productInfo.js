// components/productInfo/productInfo.js
var config = require('../../config/config.js');
const utils = require('../../utils/util');
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
        this.setData({
          pageindex,
          productList: newVal
        })
		    /**
		     * Description: 缓存数据 如果存在 需要记录之前的数据重新把之前的赋值
		     * Author: yanlichen <lichen.yan@daydaycook.com>
		     * Date: 2018/6/4
		     */
		    let cacheData = wx.getStorageSync('cacheData');
		    let inventoryCacheData = wx.getStorageSync('inventoryCacheData');
		    let outboundCacheData = wx.getStorageSync('outboundCacheData');
		    let transferCacheData = wx.getStorageSync('transferCacheData');

		    if (cacheData.length > 0) { // 订货
			    this.data.cacheArray = wx.getStorageSync('cacheData');
		    }
		    if (inventoryCacheData.length > 0) { // 盘点
			    this.data.inventoryCacheArray = wx.getStorageSync('inventoryCacheData');
		    }
		    if (outboundCacheData.length > 0) { // 出库
			    this.data.outboundCacheArray = wx.getStorageSync('outboundCacheData');
		    }
		    if (transferCacheData.length >0) { // 调拨
			    this.data.transferCacheArray = wx.getStorageSync('transferCacheData');
		    }
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
	  },
	  fromInto: { // 要被转的商品 和 转换为的商品
		  type: String,
		  value: ''
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
	  transferCacheArray: [],
  },

  ready() {
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
			  if (this.data.productList[e.currentTarget.dataset.index].item.deductionType == 1) {
			  	// 判断输入商品数量不能大于当前库存，直接扣减
			  	if (parseInt(e.detail.value) > parseInt(this.data.productList[e.currentTarget.dataset.index].item.unitValue)) {
					  this.data.productList[e.currentTarget.dataset.index].unitValue = ''
			  		this.setData({
						  productList: this.data.productList
					  })
					  wx.showToast({
						  title: '不能大于当前库存',
						  icon: 'none'
					  })
				  }
			  } else if(this.data.productList[e.currentTarget.dataset.index].item.deductionType == 2) { // 拆零扣减
			  	// 拆零扣减 计算 当前总量 > 库存总量  清空输入框 提示 不能大于当前库存
				  // 库存总量 = 拆零扣减整数 * 净含量 + 拆零扣减拆零位
				  // 当前总量 = 输入拆零扣减整数位 * 净含量 + 输入拆零扣减拆零位
				  let itemUnitValue = this.data.productList[e.currentTarget.dataset.index].item.unitValue; // 拆零扣减 整数位
				  let itemMaterialUnitValue = this.data.productList[e.currentTarget.dataset.index].item.materialUnitValue; // 拆零扣减 拆零位
				  let netWightValue = this.data.productList[e.currentTarget.dataset.index].item.netWightValue; // 净含量
				  let itemTotal = utils.add(utils.sub(itemUnitValue, netWightValue), itemMaterialUnitValue); // 库存总量

				  let inputUnitValue = this.data.productList[e.currentTarget.dataset.index].unitValue; // 输入拆零扣减 整数位
				  let inputMaterialUnitValue = this.data.productList[e.currentTarget.dataset.index].materialUnitValue; //输入拆零扣减 拆零位
				  let total = utils.add(utils.sub(inputUnitValue, netWightValue), inputMaterialUnitValue); // 当前总量
				  if (total > itemTotal) {
					  this.data.productList[e.currentTarget.dataset.index].unitValue = '';
					  this.setData({
						  productList: this.data.productList
					  })
					  wx.showToast({
						  title: '不能大于当前库存',
						  icon: 'none'
					  })
				  }
			  }
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

			    // 拆零扣减
				  // 拆零扣减 计算 当前总量 > 库存总量  清空输入框 提示 不能大于当前库存
				  // 库存总量 = 拆零扣减整数 * 净含量 + 拆零扣减拆零位
				  // 当前总量 = 输入拆零扣减整数位 * 净含量 + 输入拆零扣减拆零位
				  let itemUnitValue = this.data.productList[e.currentTarget.dataset.index].item.unitValue; // 拆零扣减 整数位
				  let itemMaterialUnitValue = this.data.productList[e.currentTarget.dataset.index].item.materialUnitValue; // 拆零扣减 拆零位
				  let netWightValue = this.data.productList[e.currentTarget.dataset.index].item.netWightValue; // 净含量
				  let itemTotal = utils.add(utils.sub(itemUnitValue, netWightValue), itemMaterialUnitValue); // 库存总量

				  let inputUnitValue = this.data.productList[e.currentTarget.dataset.index].unitValue; // 输入拆零扣减 整数位
				  let inputMaterialUnitValue = this.data.productList[e.currentTarget.dataset.index].materialUnitValue; //输入拆零扣减 拆零位
				  let total = utils.add(utils.sub(inputUnitValue, netWightValue), inputMaterialUnitValue); // 当前总量
				  if (total > itemTotal) {
					  this.data.productList[e.currentTarget.dataset.index].materialUnitValue = '';
					  this.setData({
						  productList: this.data.productList
					  })
					  wx.showToast({
						  title: '不能大于当前库存',
						  icon: 'none'
					  })
				  }

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
		  let getDatas = wx.getStorageSync('outboundCacheData');
		  tempInfoData = this.data.productList.filter((item) => { // 过滤不是结果页面 返回 不为空和 0 的数据
			  return item.unitValue != '' || item.materialUnitValue != '';
		  })
		  console.log(tempInfoData, this.data.outboundCacheArray, '寻找问题')
		  if (this.data.pageindex == 1) {
			  this.data.inventoryCacheArray[navClassIndex] = tempInfoData;
			  wx.setStorageSync('inventoryCacheData', this.data.inventoryCacheArray);
		  } else if(this.data.pageindex == 2) {
			  if (this.data.productConclusion == 1) {
				  // this.setData({
					 //  productList: tempInfoData
				  // })
				  tempInfoData = tempInfoData.filter((item) => {
				  	return item.navClass == navClassIndex;
				  })
			  }

			  if (!getDatas) {
				  for (let i=0; i < navClassIndex; i++) {
					  this.data.outboundCacheArray[i] = [];
				  }
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
		  let getDatas = wx.getStorageSync('cacheData');
		  tempGoodsOrderData = this.data.productList.filter((item) => { // 过滤不是结果页面 返回 不为空和 0 的数据
			  return item.needNumber != '' || item.needNumber != '0';
		  })
		  console.log(this.data.productConclusion, this.data.productList, tempGoodsOrderData,  '设置数据 用navclass');

		  if (this.data.productConclusion == 1) { // 当是结果页面 返回 当前分类的数据 放入到对应的数据中
			  this.setData({
			   productList: tempGoodsOrderData
			  })
		  	tempGoodsOrderData = tempGoodsOrderData.filter((item) => {
				  return item.navClass == navClassIndex;
			  })
		  }
		  if (!getDatas) {
		  	for (let i=0; i < navClassIndex; i++) {
				  this.data.cacheArray[i] = [];
			  }
		  }
		  this.data.cacheArray[navClassIndex] = tempGoodsOrderData;
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
	  /**
	   * Description: 调拨独立设置
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/6
	   */
	  transfercacheStorageSpace() {
		  let tempGoodsOrderData = [];
		  tempGoodsOrderData = this.data.productList.filter((item) => { // 过滤不是结果页面 返回 不为空和 0 的数据
			  return item.outNumber != '' || item.outNumber != 0;
		  })
		  console.log(this.data.productList, tempGoodsOrderData,  '设置数据 用navclass');
		  this.data.transferCacheArray = tempGoodsOrderData
		  wx.setStorageSync('transferCacheData', this.data.transferCacheArray);
		  this.setData({
			  productList: this.data.transferCacheArray

		  })
	  },
	  /**
	   * Description: 调拨 加
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/5
	   */
	  transferAdd(e) {
	  	this.transferSetCurrentNum(e, true)
	  },
	  /**
	   * Description: 调拨 减
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/5
	   */
	  transferReduce(e) {
    	this.transferSetCurrentNum(e, false)
	  },
	  transferSetCurrentNum(e,isAddRed) {
		  let index = e.currentTarget.dataset.index;
	  	if (isAddRed ) { // 加
			  if (this.data.productList[index].outNumber >= this.data.productList[index].item.unitValue) {
				  this.setData({
					  productList: this.data.productList
				  })
				  wx.showToast({
					  title: '不能大于当前库存',
					  icon: 'none'
				  })
			  } else {
				  ++ this.data.productList[index].outNumber;
			  }
	  		if (this.data.shopTypeSearch == 'search') {
				  wx.setStorageSync('searchTransferCacheData', this.data.productList);
			  } else {
	  			this.transfercacheStorageSpace();
			  }
		  } else { // 减
	  		if (this.data.productList[index].outNumber > 0) {
				  -- this.data.productList[index].outNumber;
				  if (this.data.shopTypeSearch == 'search') {
					  wx.setStorageSync('searchTransferCacheData', this.data.productList);
				  } else {
					  this.transfercacheStorageSpace()
				  }
			  }
		  }
		  this.setData({
			  productList: this.data.productList
		  })
	  },
	  /**
	   * Description: 设置调拨收货 输入数量
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/7
	   */
    setCollect(e) {
	    let index = e.currentTarget.dataset.index;
      this.data.productList[index].inNumber = e.detail.value
	    wx.setStorageSync('collectCacheData', this.data.productList);
    },

	  /**
	   * Description: 设置转化数量
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/5
	   */
	  setConverNum(e){
		  this.data.productList[e.currentTarget.dataset.index].resultNumber = e.detail.value;
		  // 判断输入商品数量不能大于当前库存，直接扣减
		  if (parseInt(e.detail.value) > parseInt(this.data.productList[e.currentTarget.dataset.index].item.unitValue)) {
			  this.data.productList[e.currentTarget.dataset.index].resultNumber = ''
			  this.setData({
				  productList: this.data.productList
			  })
			  wx.showToast({
				  title: '不能大于当前库存',
				  icon: 'none'
			  })
		  }
      wx.setStorageSync('setConverFrom', this.data.productList);
    },

	  /**
	   * Description: 保存当前选中的商品
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/5
	   */
    clickShop(e){
    	if (this.data.productClick == 1) { // 当是转换显示页面不执行点击事件操作
    		return;
	    }
	    let index = e.currentTarget.dataset.index;
    	if (this.data.fromInto == 'from') {
		    wx.setStorageSync('setConverFrom', [this.data.productList[index]]);
	    } else if (this.data.fromInto == 'into') {
		    wx.setStorageSync('setConverInto', [this.data.productList[index]]);
	    }
			wx.navigateBack({
	      delta:1
	    })
    }
  }
})
