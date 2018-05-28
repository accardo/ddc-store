// components/productInfo/productInfo.js
var config = require('../../config/config.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    productList:{ // 数据
      type:Array,
      value:[],
	    observer: function(newVal, oldVal) {
		    let pageindex = wx.getStorageSync('pageindex');
        let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData'); // 订货数据缓存 直接订货
		    let resultsGoodsOrderCacheData = wx.getStorageSync('resultsGoodsOrderCacheData'); // 订单结果综合数据
		    let searchGoodsOrderCacheData = wx.getStorageSync('searchGoodsOrderCacheData'); // 查询搜索缓存数据
        let inventoryCacheData = wx.getStorageSync('inventoryCacheData'); // 获取盘点缓存数据 如果有缓存 读缓存数据
		    console.log(newVal, 'newVal');
        newVal.forEach((item, index)=> {
          console.log(this.data.productConclusion, 'productConclusion')
          if (pageindex == 0) { // 订货
            if (this.data.shopTypeSearch == 'search') {  // 当是search的时候走搜索页面 不走缓存数据 读取新的接口数据
              console.log(111111111111)
              item.needNumber = ''; // 订货数量 【必填】  提交数据
              item.finalNumber = ''; // 实收数量 【必填】如果是update必填  提交数据
              item.deliveryCount = ''; // 收货数量 【必填】 如果是update必填  提交数据
            } else if(this.data.productConclusion == '1'){
              console.log(22222222222)
            	item = resultsGoodsOrderCacheData[index];
            } else {
              console.log(3333333333);
            	if (!resultsGoodsOrderCacheData || !searchGoodsOrderCacheData) {
		            item.item.unitValue = goodsOrderCacheData ? goodsOrderCacheData[index].item.unitValue : item.item.unitValue; // 页面显示 数据
	            }
              item.needNumber = ''; // 订货数量 【必填】 提交数据
              item.finalNumber = ''; // 实收数量 【必填】如果是update必填  提交数据
              item.deliveryCount = ''; // 收货数量 【必填】 如果是update必填  提交数据
            }
          }
          if (pageindex == 1) { // 盘点
            if (this.data.shopTypeSearch == 'search') { // 当是search的时候走搜索页面 不走缓存数据 读取新的接口数据
              item.unitValue = '';
              item.materialUnitValue = '';
            } else {
              item.unitValue = inventoryCacheData ? inventoryCacheData[index].unitValue : '';
              item.materialUnitValue = inventoryCacheData ? inventoryCacheData[index].materialUnitValue : '';
            }
          }
        })
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
    productStatus:{ // 未知
      type:String,
      value:''
    },
    productConclusion: { // 1 -- 订货单总结页面 所有下订单的结果页
      type: String,
      value: ''
    },
	  shopTypeSearch: { // 判断缓存是否是搜索页面中内容
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
  },

  ready() {
    // ***
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
		 // this.triggerEvent("bindInventoryData", this.data.productList); // 返回父组件数据
      wx.setStorageSync('inventoryCacheData', this.data.productList); // 设置缓存数据 下次进来加载
    },
	  /**
	   * Description: 拆零扣减 设置零散 input
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/5/25
	   */
	  setScattered2(e) {
		  this.data.productList[e.currentTarget.dataset.index].materialUnitValue = e.detail.value;
      // this.triggerEvent("bindInventoryData", this.data.productList); // 返回父组件数据
      wx.setStorageSync('inventoryCacheData', this.data.productList); // 设置缓存数据 下次进来加载
    },
	  /* 盘点部分 end*/

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
          ++ this.data.productList[index].item.unitValue;
           if(this.data.productConclusion == '1') { // 订单结果页面 数据
	           wx.setStorageSync('resultsGoodsOrderCacheData', this.data.productList); // 结果页面缓存，下次需要合并
           } else if(this.data.shopTypeSearch == 'search') {
	           wx.setStorageSync('searchGoodsOrderCacheData', this.data.productList); // 搜索页面的缓存数据 需要处理
           } else {
	           wx.setStorageSync('goodsOrderCacheData', this.data.productList); // 设置缓存数据 下次进来加载
           }
        } else if (this.data.productType == 'goodsdetail') { // 详情

        }
      } else { // 减法
        if (this.data.productType == 'goods') {
          if (this.data.productList[index].item.unitValue > 0) {
            -- this.data.productList[index].item.unitValue;
	          if(this.data.productConclusion == '1') { // 订单结果页面 数据
		          wx.setStorageSync('resultsGoodsOrderCacheData', this.data.productList); // 结果页面缓存，下次需要合并
	          } else if(this.data.shopTypeSearch == 'search') {
		          wx.setStorageSync('searchGoodsOrderCacheData', this.data.productList); // 搜索页面的缓存数据 需要处理
            } else {
		          wx.setStorageSync('goodsOrderCacheData', this.data.productList); // 设置缓存数据 下次进来加载
	          }
          }
        } else if (this.data.productType == 'goodsdetail') {

        }
      }
      this.setData({
        productList: this.data.productList
      })
      this.triggerEvent("watchChange", "click");
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
      let { productList, productType, productClick} = this.data;
      let { ind } = e.currentTarget.dataset;
      if (productClick ==1){
        return
      }
      let selectData = this.data.productList[ind];
      if(productType == 'want'){
        selectData['wannum'] = 0;
      }
      wx.setStorageSync(productType, selectData);
      wx.navigateBack({
        delta:1
      })
    }
  }
})
