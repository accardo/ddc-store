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
    outage:'',
    selectProductList:[],
    navlist:[
      '饮品',
      '零食',
      '牛奶',
      '水果',
      '饼干',
      '糖果'
    ],
    stockquerylist:[],
    productlist: [], // 初始化数据
	  tempInventList: [], // 子组件返回父组件临时盘点数据待提交用
    pageindex:'', // 页面判断 是哪一个类型
    productType: '', // 同一个模块判断不同页面类型 做数据缓存
    shopTotalN:0, // 选中多少个商品
    shopPieceN:0, // 选中多少件商品
  },
  //选择产品类别 - 导航
  selectNav(e){
    console.log(e.currentTarget.dataset.categoryid);
    this.setData({
      _index: e.currentTarget.dataset.index,
      scrollTop:0
    })
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
	  let pageIndex = wx.getStorageSync('pageindex');
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
        res.page.list.forEach((item) => {
          item.attrValues = item.attrValues != null ? item.attrValues.split(',') : null;
        })
        this._watchChange(res.page.list);
        console.log(res.page.list, 'res.page.list')
        this.setData({
          productlist: res.page.list
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
    })
  },

  /**
   * Description: 设置商品总数 只需要监听数据变化即可
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/27
   */
  _watchChange(productlist, shopShow){
    let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData'); // 订单全部数据
    let shopPieceN = 0; // 选中多少件商品
    let productlistData = goodsOrderCacheData ? goodsOrderCacheData : productlist; // 当第一次进入页面 读取页面数据 综合商品数量
    if (shopShow == 'shopShow') { // 订单结果页面返回时候，读取订单结果页面数据进行重新计算
	    productlistData = productlist
    }
    console.log(productlistData, 'watchaaaaaaaa');
    let tempGoodsOrderData = productlistData.filter((item) => {
      return item.item.unitValue != '' || item.item.unitValue != 0;
    })
    tempGoodsOrderData.forEach((item, index) => {
      shopPieceN += item.item.unitValue
    })
    this.setData({
      shopTotalN: tempGoodsOrderData.length,
      shopPieceN: shopPieceN
    })
  },

  /**
   * Description: shopTypeSearch 判断是搜索类型不走缓存数据  categoryId 产品分类id
   * Author: yanlichen <lichen.yan@daydaycook.com>
   * Date: 2018/5/26
   */
  goSearch() {
    wx.navigateTo({
      url: `../../pages/search/search?categoryId=${this.data.categoryId}&shopType=goods&shopTypeSearch=search`
    })
	  wx.setStorageSync('optionStorage', 2) // 用于判断进入不同页面 在返回获取数据 1是进入订单总结页面，2是进入搜索查询页面
  },

  /* 前往商品信息页面 */
  goNext() {
    if (this.data.shopTotalN <=0){
      wx.showToast({
        title: '请选择商品',
        icon:'none'
      })
      return
    }
    wx.setStorageSync('optionStorage', 1) // 用于判断进入不同页面 在返回获取数据 1是进入订单总结页面，2是进入搜索查询页面
    wx.navigateTo({ // conclusion = 1  订货单总结页面 所有下订单的结果页
      url: '../../pages/goodsinfo/goodsinfo?conclusion=1&productType=goods'
    })
  },
  /* 盘点 start*/
	/**
	 * Description: 保存盘点 接口
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/25
	 */
  getInventory() {
    //处理数据结构 start
    let tempInventList = wx.getStorageSync('inventoryCacheData');
    let inventoryDetailVOList = utils.ArrayDeepCopy(tempInventList);
    let isComplete = inventoryDetailVOList.filter((item) =>{ // 过滤 没有填写数据
      if (item.unitValue !== '' || item.materialUnitValue !== '') { // 提交数据整理
          item.goodsId = item.skuId;
          item.shopItemSkuVO = {
              attrValues: item.attrValues.toString(),
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
                this.clearCache(); // 数据提交后 清除缓存
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
		    return item.item.unitValue != 0 || item.item.unitValue != '0' || item.item.unitValue != '';
	    });
    }
  },
	/**
	 * Description: 搜索页面 和 订单结果页 数据比对过滤赋值
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/28
	 */
	forDataComparison(data1, data2) {
		 data1.forEach((item) => { // 结果缓存 和全部数据缓存对比 赋值 确定数据完整
			 data2.forEach((itemA) => {
				if (item.id == itemA.id) {
					item.item.unitValue = itemA.item.unitValue;
				}
			})
		})
    return data1;
  },
	/* 盘点 end*/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, 'ordergoods');
    this.getMenuList();
    let pageindex = wx.getStorageSync('pageindex');
    this.setData({
      productType: options.productType,
      pageindex,
    })
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    let pageindex = wx.getStorageSync('pageindex');
    let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData'); // 读取订货 全部 缓存
    let resultsGoodsOrderCacheData = wx.getStorageSync('resultsGoodsOrderCacheData'); // 读取订货 结果页 缓存
    let searchGoodsOrderCacheData = wx.getStorageSync('searchGoodsOrderCacheData'); // 读取搜索 查询 缓存
    let optionStorage = wx.getStorageSync('optionStorage'); // 判断进入是哪个一个页面 1、订单结果页 2、搜索查询页
	  let tempProductlist = goodsOrderCacheData ? goodsOrderCacheData : this.data.productlist; // 有缓存读取缓存 否则 正常读数据
	  let tempArray = [];
	  let tempArray1 = this.filterData(tempProductlist, 1); // 获取全部缓存数据为0的数据 有一种清空是直接搜索没有进行缓存
    let tempArray2 = this.filterData(searchGoodsOrderCacheData, 2); // 搜索数据获取数据输入不为0的数据

    let tempProductlistData = [];
    if (pageindex == 0) { // 设置商品数量和件数
	    if (optionStorage == 1) {
		    tempProductlistData = this.forDataComparison(tempProductlist, resultsGoodsOrderCacheData);
		    tempArray = tempArray1.concat(resultsGoodsOrderCacheData); // 两个缓存数据 过滤后进行合并
		    this._watchChange(tempProductlistData, 'shopShow'); // 当时shopShow的时候 读取综合数据 重置底部商品数量
	    } else if(optionStorage == 2) {
		     tempArray = tempArray1.concat(tempArray2); // 两个缓存数据 过滤后进行合并
		     // tempProductlistData = this.forDataComparison(tempProductlist, tempArray2);
        // tempProductlist.forEach((item, index) => {
			   //  tempArray2.forEach((itemA) => {
			   //    console.log(item, 222222222)
			   //    if (item.id == itemA.id) {
			   //      console.log(item, 1111)
			   //      if (item.item.unitValue == '0') {
			   //        console.log(2222)
				 //        tempProductlist.splice(index, 1)
        //       }
        //     }
        //   })
        // })

		    console.log(tempArray, 'tempProductlistData');
		    this._watchChange(tempProductlistData, 'shopShow'); // 当时shopShow的时候 读取综合数据 重置底部商品数量
	    }
      this.setData({
        productlist: tempArray
      })
    }
	  wx.removeStorageSync('optionStorage'); // 每次显示清空上一次判断结果
    // 获取缓存数据
    if(pageindex == 1) {
      let inventoryCacheData = wx.getStorageSync('inventoryCacheData');
      this.setData({
        productlist: inventoryCacheData ? inventoryCacheData : this.data.productlist
      })
    }
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