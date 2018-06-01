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
  },
  //选择产品类别 - 导航
  selectNav(e){
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
	  wx.showLoading({ title: '加载中' });
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
	      if (this.data.index == 0) {
		      this._watchChange(res.page.list);
	      }
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
	    wx.hideLoading();
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
    let tempGoodsOrderData = productlistData.filter((item) => {
      return item.item.unitValue != '' || item.item.unitValue != 0;
    })
    tempGoodsOrderData.forEach((item) => {
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
    let inventoryDetailVOList = utils.ArrayDeepCopy(tempInventList);
		    inventoryDetailVOList = inventoryDetailVOList ? inventoryDetailVOList : this.data.productlist;
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
		    return item.item.unitValue != 0 || item.item.unitValue != '0' || item.item.unitValue != '';
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
	/**
	 * Description: 搜索返回 缓存数据 需要和完整数据做对比取出输入值在进行赋值
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/5/30
	 */
	forDataContrast(data1, data2) {
		data1.forEach((item, index) => {
			data2.forEach((itemA) =>{
				if (item.id == itemA.id) {
					data1[index] = itemA;
				}
			})
		})
    return data1;
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
	*     wx.getStorageSync('goodsOrderCacheData') -> 读取订货全部数据
	*     wx.getStorageSync('searchGoodsOrderCacheData') -> 读取订货搜索查询数据
	*     wx.getStorageSync('resultsGoodsOrderCacheData') ->  读取订货结果页面数据
	* 2、盘点
	*     wx.getStorageSync('inventoryCacheData') -> 读取盘点全部数据
	*     wx.getStorageSync('searchInventoryCacheData') -> 读取盘点搜索查询数据
	* 3、出库
	*     wx.getStorageSync('outboundCacheData') -> 读取出库全部数据
	*     wx.getStorageSync('searchOutboundCacheData') -> 读取出库搜索查询数据
	*     wx.getStorageSync('resultsOutboundCacheData') -> 读取出库结果页面数据
	*
	* */
  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    let pageindex = wx.getStorageSync('pageindex');
	  let optionStorage = wx.getStorageSync('optionStorage'); // 判断进入是哪个一个页面 1、订单结果页 2、搜索查询页

    let goodsOrderCacheData = wx.getStorageSync('goodsOrderCacheData'); // 读取订货 全部 缓存
    let resultsGoodsOrderCacheData = wx.getStorageSync('resultsGoodsOrderCacheData'); // 读取订货 结果页 缓存
    let searchGoodsOrderCacheData = wx.getStorageSync('searchGoodsOrderCacheData'); // 读取搜索 查询 缓存
	  let tempProductlist = goodsOrderCacheData ? goodsOrderCacheData : this.data.productlist; // 有缓存读取缓存 否则 正常读数据

	  let tempArray = [];
    let tempProductlistData = []; // 用于商品数量的计算，搜索查询后，订单结果页面 两次分别计算
    if (pageindex == 0) { // 设置商品数量和件数
	    let tempArray1 = this.filterData(tempProductlist, 1); // 获取全部缓存数据为0的数据 有一种清空是直接搜索没有进行缓存
	    let tempArray2 = this.filterData(searchGoodsOrderCacheData, 2); // 搜索数据获取数据输入不为0的数据
	    if (optionStorage == 1) {
		    tempProductlistData = this.forDataComparison(tempProductlist, resultsGoodsOrderCacheData); // 缓存数据 和 订单结果页 数据比对过滤赋值
		    tempArray = tempArray1.concat(resultsGoodsOrderCacheData); // 两个缓存数据 过滤后进行合并
		    this._watchChange(tempProductlistData, 'shopShow'); // 当时shopShow的时候 读取综合数据 重置底部商品数量
	    } else if(optionStorage == 2) {
		    tempArray = this.forDataContrast(tempProductlist, tempArray2); // 搜索返回 缓存数据 需要和完整数据做对比取出输入值在进行赋值
        tempProductlistData = this.forDataComparison(tempProductlist, tempArray2); // 搜索页面 和 订单结果页 数据比对过滤赋值
        wx.setStorageSync('goodsOrderCacheData', tempArray);  // 搜索查询添加商品 需要把查出的商品处理后 重新 赋值给 全部商品缓存修改最后订单页面的值
		    this._watchChange(tempProductlistData, 'shopShow'); // 当时shopShow的时候 读取综合数据 重置底部商品数量
	    }
    }
    // 盘点缓存数据操作
    if(pageindex == 1) {
      let inventoryCacheData = wx.getStorageSync('inventoryCacheData'); // 读取盘点 全部数据
      let searchInventoryCacheData = wx.getStorageSync('searchInventoryCacheData'); // 读取搜索 查询 缓存
	    let tempSearchProductlist = inventoryCacheData ? inventoryCacheData : this.data.productlist; // 有缓存读取缓存 否则 正常读数据
	    let tempArray3 = this.filterData(searchInventoryCacheData, 3); // 搜索数据获取数据 输入不为空的数据
	    if(optionStorage == 2) {
		    tempArray = this.forDataContrast(tempSearchProductlist, tempArray3) // 搜索返回 缓存数据 需要和完整数据做对比取出输入值在进行赋值
		    wx.setStorageSync('inventoryCacheData', tempArray);  // 搜索查询添加商品 需要把查出的商品处理后 重新 赋值给 全部商品缓存修改最后盘点页面的值
      }
    }
    // 出库缓存数据操作
    if (pageindex == 2) {
	    let outboundCacheData = wx.getStorageSync('outboundCacheData'); // 读取出库 全部数据
	    let searchOutboundCacheData = wx.getStorageSync('searchOutboundCacheData'); // 读取搜索 查询 缓存
	    let resultsOutboundCacheData = wx.getStorageSync('resultsOutboundCacheData') // 读取出库结果页面
	    let tempProductlist1 = outboundCacheData ? outboundCacheData : this.data.productlist; // 有缓存读取缓存 否则 正常读数据
	    let tempArray1 = this.filterData(tempProductlist1, 4); // 获取全部数据为空的 数据
	    let tempArray3 = this.filterData(searchOutboundCacheData, 3); // 搜索数据获取数据 输入不为空的数据
	    console.log(tempArray1, 'tempArray1')
	    if (optionStorage == 1) {
		    tempArray = this.forDataContrast(tempProductlist1, resultsOutboundCacheData); // 搜索页面 和 订单结果页 数据比对过滤赋值
		    //tempArray = tempArray1.concat(resultsOutboundCacheData); // 两个缓存数据 过滤后进行合并
		    console.log(tempArray, resultsOutboundCacheData, 'tempProductlist1temp')
	    } else if (optionStorage == 2) {
		    tempArray = this.forDataContrast(tempProductlist1, tempArray3) // 搜索返回 缓存数据 需要和完整数据做对比取出输入值在进行赋值
		    wx.setStorageSync('outboundCacheData', tempArray);  // 搜索查询添加商品 需要把查出的商品处理后 重新 赋值给 全部商品缓存修改最后盘点页面的值
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