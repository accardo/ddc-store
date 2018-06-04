const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _index:0,
    currPage:1,
    pageSize:10,
    shopId:0,
    categoryId:0,
    goodsName:'',
    showbtnbox:1,
    scrollTop:0,
    selectProductList:[],
    navlist:[],  // 侧边导航
    stockquerylist:[],
    productlist: [], // 初始化数据
	  tempInventList: [], // 子组件返回父组件临时盘点数据待提交用
    pageindex:'', // 页面判断 是哪一个类型
    productType: '', // 同一个模块判断不同页面类型 做数据缓存
    shopTotalN:0, // 选中多少个商品
    shopPieceN:0, // 选中多少件商品
	  reason: '', //  出库原因  报废：商品破损、商品过期、商品变质； 退货：临期、过期、在库退货、质量问题；
	  outboundType: 0, // 出库类型 1 报废  2 退货
	  cacheArray: [],
  },
  //选择产品类别 - 导航
  selectNav(e){
    this.setData({
      _index: e.currentTarget.dataset.index,
      scrollTop:0
    })
	  wx.setStorageSync('selectNavIndex', e.currentTarget.dataset.index);
	  this.data.categoryId = e.currentTarget.dataset.categoryid
    this.getProductByNav()
  },
  /* 获取类别信息 */
  getMenuList(){
    sysService.category({
      url:'listCategory',
      method:'get',
    }).then((res) => {
      if (res.code == '0' && res.categoryVOList.length > 0) {
        this.setData({
          categoryId: res.categoryVOList[0].id,
          navlist: res.categoryVOList
        })
        this.getProductByNav();
      } else if (res.code == '401') {
        config.logOutAll();
        return
      } else {
        wx.showToast({
          title: res.msg,
          icon:'none'
        })
      }
    })
  },
	/* 获取产品信息 */
  getProductByNav(){
	  wx.showLoading({ title: '加载中' });
	  let productlist = [];
	  let pageIndex = wx.getStorageSync('pageindex');
	  let cacheData = wx.getStorageSync('cacheData'); // 读取分类中订货所有选中的数据
	  let inventoryCacheData = wx.getStorageSync('inventoryCacheData'); // 读取分类中盘点所有选中的数据
	  let outboundCacheData = wx.getStorageSync('outboundCacheData'); // 读取分类中出库所有选中的数据
	  let itemTypes = utils.limitClass(pageIndex);
    let promdData = {
      currPage: this.data.currPage,
      pageSize: this.data.pageSize,
      shopId: app.selectIndex, // 店铺ID
      categoryId: this.data.categoryId, // 产品分类ID
	    itemTypes, // 订货为 2,4,5,6 限制商品  盘点为 2,4,6
    }
    sysService.category({
      url:'listProduct',
      method:'get',
      data:promdData
    }).then((res) => {
      if (res.code == '0' && res.page.list) {
	      productlist = res.page.list.map((item) => {
          item.attrValues = item.attrValues != null ? item.attrValues.split(',') : null;
          if (pageIndex == 0) { // 订货
	          item.needNumber = 0;
          } else if(pageIndex == 1 || pageIndex == 2) { // 盘点 出库
          	item.unitValue = '';
          	item.materialUnitValue = '';
          }
          item.navClass = this.data._index;
          return item;
        })

	      if (cacheData[this.data._index]) { // 订货
		      productlist = this.forDataContrast(productlist, cacheData[this.data._index]);
	      }
	      if (inventoryCacheData[this.data._index]) { // 盘点
		      productlist = this.forDataContrast(productlist, inventoryCacheData[this.data._index]);
	      }
	      if (outboundCacheData[this.data._index]) { //出库
		      productlist = this.forDataContrast(productlist, outboundCacheData[this.data._index]);
	      }
	      console.log(productlist, cacheData, 'getProductByNavproductlist')
        this.setData({
          productlist,
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
    })
  },

	/**
   * Description: 设置商品总数 只需要监听数据变化即可
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/27
   */
  _watchChange(){
  	let cacheData = wx.getStorageSync('cacheData'); // 读取缓存中所有选中数据
		let setShop = {};
		if (cacheData) {
			setShop = utils.setTotalNumber(cacheData)
		}
		console.log(setShop, '设置商品总数');
    this.setData({
      shopTotalN: setShop.total || 0,
      shopPieceN: setShop.shopPieceN || 0
    })
  },

  /**
   * Description: shopTypeSearch 判断是搜索类型不走缓存数据  categoryId 产品分类id
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  goSearch() {
    wx.navigateTo({
      url: `../../pages/search/search?categoryId=${this.data.categoryId}&shopType=goods&shopTypeSearch=search&navClass=${this.data._index}`
    })
	  wx.removeStorageSync('searchGoodsOrderCacheData');
	  wx.removeStorageSync('searchInventoryCacheData');
	  wx.setStorageSync('optionStorage', 2) // 用于判断进入不同页面 在返回获取数据 1是进入订单总结页面，2是进入搜索查询页面
  },

  /* 前往商品信息页面 */
  goNext() {
  	if (this.data.pageindex == 0) {
		  if (this.data.shopTotalN <=0){
			  wx.showToast({
				  title: '请选择商品',
				  icon:'none'
			  })
			  return
		  }
	  }
	  wx.setStorageSync('optionStorage', 1) // 用于判断进入不同页面 在返回获取数据 1是进入订单总结页面，2是进入搜索查询页面
	  wx.navigateTo({ // conclusion = 1  订货单总结页面 所有下订单的结果页
		  url: `../../pages/goodsinfo/goodsinfo?conclusion=1&productType=goods&orderStatus=4&reason=${this.data.reason}&outboundType=${this.data.outboundType}`
	  })
  },
	/**
	 * Description: 保存盘点 接口
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
  getInventory() {
    //处理数据结构 start
    let tempInventList = wx.getStorageSync('inventoryCacheData');
        tempInventList = tempInventList ? tempInventList : this.data.productlist;
		let inventoryDetailVOList = utils.ArrayDeepCopy(tempInventList);
				inventoryDetailVOList = utils.cacheDataDeal(inventoryDetailVOList);
    let isComplete = inventoryDetailVOList.filter((item) =>{ // 过滤 没有填写数据
      if (item.unitValue !== '' || item.materialUnitValue !== '') { // 提交数据整理
          item.goodsId = item.skuId;
          item.shopItemSkuVO = {
              attrValues: item.attrValues != null ? item.attrValues.toString() : null,
              id: item.id,
              item: item.item
          }
          delete item.attrValues;
          delete item.copyShopItemSkuId;
          delete item.isExist;
          delete item.isSale;
          delete item.item;
          delete item.price;
          delete item.shopItemId;
          delete item.skuId;
          delete item.skuSn;
          delete item.stock;
          delete item.thumb;
          delete item.valueIds;
          delete item.costPrice;
          return item;
      }
    })
		let promdData = {
			id: this.data.itemId || null, // 订单id // 更新必传
			shopId: app.selectIndex, // 店铺ID
			inventoryDetailVOList: isComplete,
		}
		console.log(promdData, 'promdData111222333')
	  //处理数据结构 end
       return new Promise((resolve) => {
         sysService.inventory({
           url:'save',
           method:'post',
           data:promdData
         }).then((res) => {
           resolve(res);
         })
       })
  },
	/**
	 * Description: 提交保存 盘点操作
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
  subInventory(){
    wx.showModal({
      content: '是否确认提交盘点？',
      confirmColor: config.showModal.confirmColor,
      success: (res) => {
        if (res.confirm){
            this.getInventory().then((data) => {
              if (data.code == '0') {
                utils.showToast({title: '提交盘点成功', page: 1});
	              wx.removeStorageSync('inventoryCacheData'); // 数据提交后 清除缓存
	              wx.removeStorageSync('searchInventoryCacheData'); // 数据提交后 清除缓存
              } else if (data.code == '401') {
                config.logOutAll();
                return
              } else {
                wx.showToast({
                  title: data.msg,
                  icon:'none'
                })
              }
            })
        }
      }
    });
  },
  /**
   * Description: 清除缓存
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  clearCache() {
    wx.removeStorageSync('inventoryCacheData');
    this.getMenuList();
  },
	/**
	 * Description: 过滤数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/28
	 */
  filterData(data, num) {
    if (num == 1) {
	    return data && data.filter((item) =>{ // 全部数据 返回没有输入值的数据
		    return item.item.unitValue == 0 || item.item.unitValue == '0' || item.item.unitValue == ''
	    });
    } else if(num == 2) {
	    return data && data.filter((item) =>{ // 搜索查询  返回搜索的数据
		    return item.needNumber != 0 || item.needNumber != '0' || item.needNumber != '';
	    });
    } else if(num == 3) {
      return data && data.filter((item) => { // 盘点 搜索查询 返回搜索数据
        return item.unitValue != '' || item.materialUnitValue != '';
      })
    } else if (num == 4) {
	    return data && data.filter((item) => { // 出库 返回没有输入值的数据
		    return item.unitValue == '' && item.materialUnitValue == '';
	    })
    }
  },
	/**
	 * Description: 搜索返回 缓存数据 需要和完整数据做对比取出输入值在进行赋值
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/30
	 */
	forDataContrast(data1, data2) {
		data1 && data1.forEach((item, index) => {
			data2 && data2.forEach((itemA) =>{
				if (item.skuId == itemA.skuId) {
					data1[index] = itemA;
				}
			})
		})
    return data1;
  },
	/**
	 * Description: 搜索结果对比 链接 去重
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/4
	 */
	forDataContrastSearch(data1, data2) {
		let data3 = [];
		data1 && data1.forEach((item) => {
			data2 && data2.forEach((itemA) =>{
				if (item.skuId == itemA.skuId) {
					item = itemA
				} else {
					data3 = data1.concat(data2);
				}
			})
		})
		// 去除重复skuId
		Array.prototype.distinct = function(){
			var arr = this, result = [], i, j, len = arr.length;
			for(i = 0; i < len; i++){
				for(j = i + 1; j < len; j++){
					if(arr[i].skuId === arr[j].skuId){
						j = ++i;
					}
				}
				result.push(arr[i]);
			}
			return result;
		}
		return data3.distinct();
		console.log(data3.distinct(), '返回 过滤后数据 需要 给 结果页面')
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, 'ordergoods');
    this.getMenuList();
    let pageindex = wx.getStorageSync('pageindex');
	  if (pageindex == 0) {
	    this.setData({
		    productType: options.productType,
      })
    }
    if (pageindex == 2) {
	    wx.setStorageSync('reasonRadio', options.reason); // 判断页面进入的是哪个类别
	  	this.setData({
			  reason: options.reason, // 出库原因  报废：商品破损、商品过期、商品变质； 退货：临期、过期、在库退货、质量问题；
			  outboundType: options.outboundType, // 出库类型 1、报废 2、退货
		  })
    }
    this.setData({
      pageindex,
    })
	  wx.setStorageSync('selectNavIndex', 0);
    /* 根据页面标题 获取对应的数据源 */
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('pagetitle')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
	/*
	* 缓存说明：
	* 0、通用
	*     wx.getStorageSync('optionStorage') -> 读取判断进入哪一个页面 1、为结果页面；2、搜索查询页面
	* 1、订货
	*     wx.getStorageSync('cacheData') -> 读取盘订货中全部数据
	*     wx.getStorageSync('searchGoodsOrderCacheData') -> 读取订货 搜索查询数据
	* 2、盘点
	*     wx.getStorageSync('inventoryCacheData') -> 读取盘点选中全部数据
	*     wx.getStorageSync('searchInventoryCacheData') -> 读取盘点 搜索查询数据
	* 3、出库
	*     wx.getStorageSync('outboundCacheData') -> 读取出库选中全部数据
	*     wx.getStorageSync('searchOutboundCacheData') -> 读取出库 搜索查询数据
	*
	* */
  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    let pageindex = wx.getStorageSync('pageindex');
	  let optionStorage = wx.getStorageSync('optionStorage'); // 判断进入是哪个一个页面 1、订单结果页 2、搜索查询页

	  // 订货
	  let cacheData = wx.getStorageSync('cacheData') ? wx.getStorageSync('cacheData') : []; // 读取分类订货中所有选中的数据
    let searchGoodsOrderCacheData = wx.getStorageSync('searchGoodsOrderCacheData'); // 订货 搜索缓存

	  // 盘点
	  let inventoryCacheData = wx.getStorageSync('inventoryCacheData') ? wx.getStorageSync('inventoryCacheData') : []; // 读取分类中盘点所有选中数据
		let searchInventoryCacheData = wx.getStorageSync('searchInventoryCacheData'); // 盘点 搜索缓存

		// 出库
	  let outboundCacheData = wx.getStorageSync('outboundCacheData') ? wx.getStorageSync('outboundCacheData') : []; // 读取分类中出库所有选中数据
	  let searchOutboundCacheData = wx.getStorageSync('searchOutboundCacheData'); // 出库 搜索缓存

	  let tempArray = [];
    if (pageindex == 0) {
    	if (optionStorage == 2) { // 进入搜索页面
		    let tempArray1 = this.filterData(searchGoodsOrderCacheData, 2); // 搜索数据获取数据输入不为0的数据
    		if (cacheData.length >0) { // 有缓存先读取缓存数据后在和 当前数据对比赋值
			    cacheData[this.data._index] = this.forDataContrastSearch(cacheData[this.data._index], tempArray1); // 搜索结果和总数据对比，如果有skuId相同责替换
			    tempArray = this.forDataContrast(this.data.productlist, cacheData[this.data._index]); // 搜索返回 缓存数据 需要和完整数据做对比取出输入值在进行赋值
			    wx.setStorageSync('cacheData', cacheData); // 搜索结束后 需要把搜索结果放入到总的结果缓存中
		    } else { // 当页面没有缓存 直接搜索时候当前数据对比赋值
			    cacheData[this.data._index] = tempArray1;
    			tempArray = this.forDataContrastSearch(this.data.productlist, tempArray1); // 搜索结果和总数据对比，如果有skuId相同责替换
			    console.log(cacheData, tempArray, ' 没有缓存的时候执行');
			    wx.setStorageSync('cacheData', cacheData); // 搜索结束后 需要把搜索结果放入到总的结果缓存中
		    }
	    } else if (optionStorage == 1) { // 多分类综合页面
    		  tempArray = this.forDataContrast(this.data.productlist, cacheData[this.data._index]); // 搜索返回 缓存数据 需要和完整数据做对比取出输入值在进行赋值
	    }
	    this._watchChange();
    }
    // 盘点缓存数据操作
    if(pageindex == 1) {
    	if (optionStorage == 2) {
		    let tempArray1 = this.filterData(searchInventoryCacheData, 3); // 搜索数据获取数据输入不为0的数据
		    if (inventoryCacheData.length > 0) { //有缓存数据 先读取缓存数据 后在和当前数据对比 赋值
			    inventoryCacheData[this.data._index] = this.forDataContrastSearch(inventoryCacheData[this.data._index], tempArray1);
			    tempArray = this.forDataContrast(this.data.productlist, inventoryCacheData[this.data._index]);
			    wx.setStorageSync('inventoryCacheData', inventoryCacheData);
		    } else { // 当前页面没有缓存数据 直接搜索和当前数据对比赋值
			    inventoryCacheData[this.data._index] = tempArray1;
			    tempArray = this.forDataContrastSearch(this.data.productlist, tempArray1);
			    console.log(inventoryCacheData, tempArray, ' 没有缓存的时候执行');
			    wx.setStorageSync('inventoryCacheData', inventoryCacheData);
		    }
	    }
    }
    // 出库缓存数据操作
    if (pageindex == 2) {
	    let tempArray1 = this.filterData(searchOutboundCacheData, 3); // 搜索数据获取数据输入不为0的数据
	    if (optionStorage == 2) {
		    if (outboundCacheData.length > 0) { // 有缓存数据 先读取缓存数据
			    outboundCacheData[this.data._index] = this.forDataContrastSearch(outboundCacheData[this.data._index], tempArray1);
			    tempArray = this.forDataContrast(this.data.productlist, outboundCacheData[this.data._index]);
			    wx.setStorageSync('outboundCacheData', outboundCacheData);
		    } else { // 当前页面没有缓存数据 直接搜索和当前数据对比赋值
			    outboundCacheData[this.data._index] = tempArray1;
			    tempArray = this.forDataContrastSearch(this.data.productlist, tempArray1);
			    console.log(outboundCacheData, tempArray, ' 没有缓存的时候执行');
			    wx.setStorageSync('outboundCacheData', outboundCacheData);
		    }
	    } else if(optionStorage == 1) {
		    tempArray = this.forDataContrast(this.data.productlist, outboundCacheData[this.data._index]); // 搜索返回 缓存数据 需要和完整数据做对比取出输入值在进行赋值
	    }
    }
	  this.setData({
		  productlist: tempArray
	  })
	  wx.removeStorageSync('optionStorage'); // 每次显示清空上一次判断结果
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
    console.log('下拉加载数据');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})