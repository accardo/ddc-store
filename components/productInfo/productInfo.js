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
		    this.setData({
			    pageindex
		    })
        console.log(newVal, this.data.pageindex);
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
    let productType = this.data.productType;
	  let shopTypeSearch = this.data.shopTypeSearch;
    if (productType == 'goods' && shopTypeSearch == '') { // 订货列表
	    let productList = wx.getStorageSync('productList-dingh'); // 点击加减订货数据
	    this.setData({
		    productList
	    })
    }

	  // let _this = this;
	  // let { productType = ""} = _this.data;
	  // let pagetitle = wx.getStorageSync('pagetitle');
	  // if (productType == 'want' || productType == 'cover'){ // 出库,
     //  let { productList } =_this.data;
     //  wx.setStorageSync('productList', JSON.stringify(productList));
	  //   this.setData({
		 //    productList
	  //   })
	  // } else if (productType == 'goods' && this.data.shopTypeSearch == ''){
     //
	  // }
	  // this.setData({
		 //  pagetitle
	  // })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /* 盘点部分 start*/
	  /**
	   * Description: 拆零扣减 设置整数 input 用一个字段 unitValue
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/5/25
	   */
	  setScattered1(e) {
		  this.data.productList[e.currentTarget.dataset.index].unitValue = e.detail.value;
		  this.triggerEvent("bindInventoryData", this.data.productList); // 返回父组件数据
		  console.log(e, this.data.productList);
    },
	  /**
	   * Description: 拆零扣减 设置零散 input
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/5/25
	   */
	  setScattered2(e) {
		  this.data.productList[e.currentTarget.dataset.index].materialUnitValue = e.detail.value;
		  console.log(e, this.data.productList);
    },
	  /**
	   * Description: 直接扣减 设置 input 用一个字段 unitValue
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/5/25
	   */
	  setDirectly(e) {
		  this.data.productList[e.currentTarget.dataset.index].unitValue = e.detail.value;
		  console.log(e);
    },
	  /* 盘点部分 end*/
    getCurrent(e){
      let ind = e.currentTarget.dataset.index;
      let { productType } = this.data;
      let current = 0;
      if (productType== 'goods'){
        let { item } = this.data.productList[ind];
        current = item.unitValue;
        current = current ? current : 0
      } else if (productType == 'listdetail'){
        let item = this.data.productList[ind];
        current = item.needNumber;
        current = current ? current : 0
      }
      return { current,ind } ;
    },
    countAdd(e){
      let _this = this;
      _this.setCurrentNum(e,true);
    },
    countReduce(e){
      let _this = this;
      _this.setCurrentNum(e,false);
    },
    //点击 加 OR 减
    setCurrentNum(e,sym){
      let _this = this;
      let selectList = [];
      let numAttr = '';
      let { productType } = _this.data;
      let { current, ind } = _this.getCurrent(e);
      let productListItem = _this.data.productList[ind];
      if (sym){
        current = parseInt(current) + 1
      }else{
        current = parseInt(current) <= 0 ? 0 : parseInt(current) -1;
      }
      if (productType =='goods'){
        productListItem.item.unitValue = current;
        _this.data.productList.map(item => {
          if (item.item.unitValue > 0) {
            selectList.push(item);
          }
        })
        wx.setStorageSync('productList-dingh', selectList);
      }else{
        productListItem.needNumber = current;
        _this.data.productList.map(item => {
          if (item.needNumber > 0) {
            selectList.push(item);
          }
        })
        wx.setStorageSync('productList-dh-confirm', selectList);
      }
      this.setData({
        productList: _this.data.productList
      })
      this.triggerEvent("countAdd");
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
