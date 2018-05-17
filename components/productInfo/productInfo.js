// components/productInfo/productInfo.js
var config = require('../../config/config.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    productList:{
      type:Array,
      value:[]
    },
    productType:{
      type:String,
      value:''
    },
    productClick:{
      type:String,
      value:''
    },
    productStatus:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    productList:[],
    countNum:1,
    defImg: config.pageImgUrl+'logo.png', 
    pagetitle: '',
    productType:'',
    productClick:'',
    productStatus:'',
    shopType: config.dict.shopType
  },

  ready() {
    let _this = this;
    let productList = [];
    let {  productType ="" } = _this.data;
    let pagetitle = wx.getStorageSync('pagetitle');
    if (productType){
      let { productList } =_this.data;
      wx.setStorageSync('productList', JSON.stringify(productList));
    }
    this.setData({
      pagetitle,
      productList,
      productType
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getCurrent(e){
      let ind = e.currentTarget.dataset.index;
      let { item } = this.data.productList[ind];
      let current =  item.unitValue;
      current = current ? current : 0
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
      let { current, ind } = _this.getCurrent(e);
      if (sym){
        current = parseInt(current) + 1
      }else{
        current = parseInt(current) <= 0 ? 0 : parseInt(current) -1;
      }
      _this.data.productList[ind].item.unitValue = current;
      this.setData({
        productList: _this.data.productList
      })
      wx.setStorageSync('productList-dingh', _this.data.productList);
      this.triggerEvent("countAdd")
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
