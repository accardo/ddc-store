// components/productInfo/productInfo.js
import * as logic from  '../../utils/logic';
const config = require('../../config/config.js');
const utils = require('../../utils/util');
const orderLogic = new logic.OrderLogic();
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

		    if (cacheData) { // 订货
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
	  cacheArray: {},
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
	  /**
	   * Description: 拆零扣减 直接扣减 设置整数 input 用一个字段 unitValue
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/5/25
	   */
	  setScattered1(e) {
	  	let uIndex = e.currentTarget.dataset.index; // 当前选中索引号
		  let navClassIndex = e.currentTarget.dataset.navclassindex;
		  this.data.productList[uIndex].unitValue = e.detail.value;
		  if (this.data.pageindex == 1) {
			  this.setInventoryCache('searchInventoryCacheData', navClassIndex);
		  }else if(this.data.pageindex == 2 || this.data.pageindex == 7) {
			  if (this.data.productList[uIndex].item.deductionType == 1) {
			  	// 判断输入商品数量不能大于当前库存，直接扣减
			  	if (parseInt(e.detail.value) > parseInt(this.data.productList[uIndex].item.unitValue)) {
					  this.data.productList[uIndex].unitValue = '';
			  		this.setVerTosast();
				  }
			  } else if(this.data.productList[uIndex].item.deductionType == 2) { // 拆零扣减
			  	this.setVerification(uIndex, 1);
			  }
			  this.setInventoryCache('searchOutboundCacheData', navClassIndex);
		  }
    },
	  /**
	   * Description: 拆零扣减 设置零散 input
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/5/25
	   */
	  setScattered2(e) {
	  	let uIndex = e.currentTarget.dataset.index;
		  let navClassIndex = e.currentTarget.dataset.navclassindex;
		  this.data.productList[uIndex].materialUnitValue = e.detail.value;
		  if (this.data.pageindex == 1) {
			  this.setInventoryCache('searchInventoryCacheData', navClassIndex);
		  } else if (this.data.pageindex == 2 || this.data.pageindex == 7) {
			  this.setVerification(uIndex, 2);
			  this.setInventoryCache('searchOutboundCacheData', navClassIndex);
		  }
    },
	  /*
	   * Description: 查询缓存设置 公共整合
	   * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	   * Date: 2018/7/18
	   */
	  setInventoryCache(cacheKey, navClassIndex) {
		  if (this.data.shopTypeSearch == 'search') {
			  wx.setStorageSync(cacheKey, this.data.productList); // 查询页面 设置盘点缓存
		  } else {
			  this.cacheStorageSpaceInfo(navClassIndex);
		  }
	  },
	  /**
		 * Description: 验证信息 拆零 整合
		 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
		 * Date: 2018/7/18
		 */
	  setVerification(uIndex, uInput) {
		  // 拆零扣减
		  // 拆零扣减 计算 当前总量 > 库存总量  清空输入框 提示 不能大于当前库存
		  // 库存总量 = 拆零扣减整数 * 净含量 + 拆零扣减拆零位
		  // 当前总量 = 输入拆零扣减整数位 * 净含量 + 输入拆零扣减拆零位
		  let itemUnitValue = this.data.productList[uIndex].item.unitValue; // 拆零扣减 整数位
		  let itemMaterialUnitValue = this.data.productList[uIndex].item.materialUnitValue; // 拆零扣减 拆零位
		  let netWightValue = this.data.productList[uIndex].item.netWightValue; // 净含量
		  let inputUnitValue = this.data.productList[uIndex].unitValue; // 输入拆零扣减 整数位
		  let inputMaterialUnitValue = this.data.productList[uIndex].materialUnitValue; //输入拆零扣减 拆零位
		  let itemTotal = utils.add(utils.sub(itemUnitValue, netWightValue), itemMaterialUnitValue); // 库存总量
		  let total = utils.add(utils.sub(inputUnitValue, netWightValue), inputMaterialUnitValue); // 当前总量
		  if (total > itemTotal) {
			  if (uInput == 1) {
				  this.data.productList[uIndex].unitValue = '';
			  } else if (uInput == 2) {
				  this.data.productList[uIndex].materialUnitValue = '';
			  }
			  this.setVerTosast();
		  }
	  },
	  /*
	   * Description: 提示信息
	   * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	   * Date: 2018/7/18
	   */
	  setVerTosast() {
		  this.setData({
			  productList: this.data.productList
		  })
		  utils.showToastNone('不能大于当前库存');
	  },
	  /**
	   * Description: 盘点存储所有缓存数据
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/4
	   */
	  cacheStorageSpaceInfo(navClassIndex) {
		  let getOutboundCacheData = wx.getStorageSync('outboundCacheData');
		  let getInventoryCacheData = wx.getStorageSync('inventoryCacheData');
		  let tempInfoData = orderLogic.filterData(this.data.productList, 3);
		  if (this.data.pageindex == 1) {
		  	// 缓存数据 , 盘点临时存放空数组， 读取盘点缓存数据， 过滤后的数据 , 分类索引号：用于创建第几空数组
		  	this.setEmptyArray('inventoryCacheData', 'inventoryCacheArray', getInventoryCacheData, tempInfoData, navClassIndex);
		  } else if(this.data.pageindex == 2 || this.data.pageindex == 7) {
			  if (this.data.productConclusion == 1) {
				  tempInfoData = tempInfoData.filter((item) => {
				  	return item.navClass == navClassIndex;
				  })
			  }
			  this.setEmptyArray('outboundCacheData', 'outboundCacheArray', getOutboundCacheData, tempInfoData, navClassIndex);
		  }
	  },
	  /**
	   * Description: 订单存储所有缓存选中数据 radio
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/2
	   */
	  cacheStorageSpace(categoryId) {
		  let getCacheData = wx.getStorageSync('cacheData');
		  let tempInfoData = orderLogic.filterData(this.data.productList, 8);
		  if (this.data.productConclusion == 1) { // 当是结果页面 返回 当前分类的数据 放入到对应的数据中
			  this.setData({
			   productList: tempInfoData
			  })
		  	tempInfoData = tempInfoData.filter((item) => {
				  return item.navClass == navClassIndex;
			  })
		  }
		  this.setEmptyArray('cacheData', 'cacheArray', getCacheData, tempInfoData, categoryId);
	  },
	  /**
	   * Description: 订单存储所有详情缓存数据 radio
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/4
	   */
	  cacheStorageSpaceDetial() {
		  let tempInfoData = orderLogic.filterData(this.data.productList, 9);
		  wx.setStorageSync('cacheDataDetial', tempInfoData);
	  },
	  /*
	 * Description: 设置空数组 占位 有多少分类设置多少个空数组
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2018/7/18
	 */
	  setEmptyArray(cacheKey, tempArray, cacheData, filterData, categoryId) {
		  let navlistLength = wx.getStorageSync('navlistLength');
		  if (!cacheData) {
			  for (let i=0; i < navlistLength.voLenght; i++) {
				  this.data[tempArray][navlistLength.keyIndex[i]] = [];
			  }
		  }
		  this.data[tempArray][navlistLength.categoryId] = filterData //先添加 在进行过滤
		  if (navlistLength.categoryId == 0) { // 全部分类
			  let filterCategory = this.data[tempArray][0].filter((item) => { // 过滤全部分类 当前选中所有分类数据
			  	if (item.item.categoryId1 == categoryId) { // 返回当前选中的所有分类数据
			  		return item
				  }
			  })
			  this.data[tempArray][categoryId] = filterCategory
		  } else { // 除全部分类 所有分类累加即使全部分类 在赋值到全部分类
		  	let tempA = Object.values(this.data[tempArray]); // 对象转换成数组
		  	tempA.splice(0, 1); // 删除全部分类 进行对象合并成数组
		  	tempA = utils.cacheDataDeal(tempA); // 去除全部分类后 整合数组对象
			  this.data[tempArray][0] = tempA // 所有分类进行合并后 赋值给全部分类
		  }
		  this.data[tempArray][navlistLength.categoryId] = filterData
		  wx.setStorageSync(cacheKey, this.data[tempArray]);
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
      let index = e.currentTarget.dataset.index;
      let navClassIndex = e.currentTarget.dataset.navclassindex
	    let categoryId = e.currentTarget.dataset.categoryid
	    if (isAddRed) {// 加法
        if (this.data.productType == 'goods') { // 订货详情
          ++ this.data.productList[index].needNumber;
	        this.setCurrentInput(categoryId)
        }
      } else { // 减法
        if (this.data.productType == 'goods') {
          if (this.data.productList[index].needNumber > 0) {
            -- this.data.productList[index].needNumber;
	          this.setCurrentInput(categoryId);
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
	  /*
	   * Description: 订货直接输入input
	   * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	   * Date: 2018/7/30
	   */
	  setNumber(e) {
		  let index = e.currentTarget.dataset.index;
		  let navClassIndex = e.currentTarget.dataset.navclassindex;
		  this.data.productList[index].needNumber = e.detail.value;
		  if (e.detail.value < 0) {
			  utils.showToastNone('订货数量不能小于0');
			  this.data.productList[index].needNumber = 0;
		  }
		  this.setCurrentInput(navClassIndex);
		  this.setData({
			  productList: this.data.productList
		  })
		  if (this.data.productStatus == 'goodsdetail') {
			  this.triggerEvent("watchChangeDetial", "click");
		  } else {
			  this.triggerEvent("watchChange", "click");
		  }
	  },
	  /*
	   * Description: 合并代码
	   * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	   * Date: 2018/7/18
	   */
	  setCurrentInput(categoryId) {
		  if(this.data.shopTypeSearch == 'search') {
			  this.cacheStorageSpace(categoryId);
			  // wx.setStorageSync('searchGoodsOrderCacheData', this.data.productList); // 搜索页面的缓存数据 需要处理
		  } else if (this.data.productStatus == 'goodsdetail') {
			  this.cacheStorageSpaceDetial();
		  } else {
			  this.cacheStorageSpace(categoryId);
		  }
	  },
	  /**
	   * Description: 调拨独立设置
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/6
	   */
	  transfercacheStorageSpace() {
		  let tempInfoData = orderLogic.filterData(this.data.productList, 7);
		  this.data.transferCacheArray = tempInfoData
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
	  	if (isAddRed) { // 加
			  if (this.data.productList[index].outNumber >= this.data.productList[index].item.unitValue) {
			  	this.setVerTosast();
			  } else {
				  ++ this.data.productList[index].outNumber;
			  }
			  this.setTransfer();
		  } else { // 减
	  		if (this.data.productList[index].outNumber > 0) {
				  -- this.data.productList[index].outNumber;
				  this.setTransfer();
			  }
		  }
		  this.setData({
			  productList: this.data.productList
		  })
	  },
	  /*
	   * Description: 调拨 输入框
	   * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	   * Date: 2018/7/30
	   */
	  setTransferNumber(e) {
		  let index = e.currentTarget.dataset.index;
		  if (e.detail.value > this.data.productList[index].item.unitValue) {
			  this.setVerTosast();
		  } else {
			  this.data.productList[index].outNumber = e.detail.value;
			  this.setTransfer();
		  }
		  this.setData({
			  productList: this.data.productList
		  })
	  },
	  /*
	   * Description: 代码整合
	   * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	   * Date: 2018/7/18
	   */
	  setTransfer() {
		  if (this.data.shopTypeSearch == 'search') {
			  wx.setStorageSync('searchTransferCacheData', this.data.productList);
		  } else {
			  this.transfercacheStorageSpace();
		  }
	  },
	  /**
	   * Description: 设置调拨收货 输入数量
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/7
	   */
    setCollect(e) {
	    let index = e.currentTarget.dataset.index;
      this.data.productList[index].inNumber = e.detail.value == '' ? 0 :  e.detail.value
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
			  this.setVerTosast();
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
