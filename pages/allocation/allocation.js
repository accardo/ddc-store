// pages/allocation/allocation.js
const config = require('../../config/config.js');
const sysService = require('../../service/sys.service.js');
const utils = require('../../utils/util');
const shopListService = require('../../service/service.service.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopAds: '',
    selectIndex: 0,
    shopArray: [], // 店铺地址
    productlist: [], // 初始化数据
	  defaultImg: '../../icons/shop.png', // 商品在没选择前 默认图片
	  imgDefault: true, // 控制要转换商品默认图
    tempCacheData: [], // 累加存储数据
	  inShopId: null, //调入店铺id
  },
	/**
	 * Description: 处理店铺地址
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
	shopAddress() {
		shopListService.api({
			url: "/list",
			method: "get",
			data: {
				companyId: app.companyId
			}
		}).then((res) => {
			if (res.code == 0) {
			  let shopAddress = res.shopList.filter((item) => {
			     return item.id != app.selectIndex
			  })
				this.setData({
					shopArray: shopAddress
				})
			}else{
				wx.showToast({
					title: res.msg,
					icon:'none'
				})
			}
		})
  },
  /* 选择门店 */
  selectShop(e) {
	  this.data.inShopId = this.data.shopArray[e.detail.value].id;
    this.setData({
	    selectIndex: this.data.shopArray[e.detail.value].id,
	    shopName: this.data.shopArray[e.detail.value].shopName
    })
  },

  /* 添加调拨 商品 */
  searchShop(){
    wx.navigateTo({
      url:'../../pages/search/search?shopTypeSearch=search'
    })
  },

	/**
	 * Description: 提交调拨
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
  subAllot(){
  	let transferCacheData = wx.getStorageSync('transferCacheData');
  	console.log(transferCacheData, 'transferCacheData')
	  let isComplete = transferCacheData.filter((item) => { // 过滤 没有填写数据
		  item.goodsId = item.id;
		  item.shopItemSkuVO = {
			  attrValues: utils.attrValuesToString(item), // array 转 string 提交数据
			  id: item.id,
			  item: item.item
		  }
		  delete item.attrValues;
		  delete item.copyShopItemSkuId;
		  delete item.id;
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
		  delete item.navClass;
		  return item;
	  })
	  let promeData = {
	  	id: 0,
		  outShopId: app.selectIndex, // 调出的店铺id
		  inShopId: this.data.inShopId, // 调入店铺id
		  outTransferId: 0,
		  transferDetailVOList: isComplete
	  }
	  if (promeData.inShopId == '' || promeData.inShopId == null) {
		  wx.showToast({
			  title: '调入门店不能为空',
			  icon: 'none'
		  })
		  return
	  }
	  console.log(promeData, '调拨 保存提交 数据');
	  // return false;
    wx.showModal({
      content: '是否确认提交调拨？',
      confirmColor: config.showModal.confirmColor,
      success: function (res) {
        if(res.confirm){
	        sysService.transfer({
		        url: 'save',
		        method: "post",
		        data: promeData
	        }).then(res => {
		        let {code,msg} = res;
		        if (code == 401) {
			        config.logOutAll();
			        return
		        }
		        if(code == 0){
			        utils.showToast({title: '调拨成功', page: 1, pages: getCurrentPages()});
			        wx.removeStorageSync('transferCacheData');
			        wx.removeStorageSync('searchTransferCacheData');
		        }else{
			        wx.showToast({
				        title: msg,
				        icon: 'none'
			        })
		        }
	        })
        }
      }
    });
  },
	/**
	 * Description: 搜索结果对比 链接 去重
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
	forDataContrastSearch(data1, data2) {
		 data1.forEach((item) => {
			 data2.forEach((itemA, index) =>{
				if (itemA.skuId == item.skuId) {
					data2[index] = item
				} else {
					data2.push(item);
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
		return data2.distinct();
		console.log(data2.distinct(), '返回 过滤后数据 需要 给 结果页面')
	},
	/**
	 * Description: 过滤 选中数据
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/6
	 */
	filterData(data) {
		return data && data.filter((item) =>{ // 搜索查询  返回搜索的数据
			return item.outNumber != 0 || item.outNumber != '0' || item.outNumber != '';
		});
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.shopAddress() // 获取店铺列表
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let transferCacheData = wx.getStorageSync('transferCacheData'); // 调拨 所有选中 缓存
    let searchTransferCacheData = wx.getStorageSync('searchTransferCacheData'); // 调拨 搜索 缓存
    if (searchTransferCacheData) {
    	this.data.productlist = []
	    searchTransferCacheData = searchTransferCacheData.filter((item) => {
		    return item.outNumber != 0;
	    })
      if (this.data.productlist.length == 0) {
	      this.setData({
		      imgDefault: false,
		      productlist: searchTransferCacheData
	      })
	      wx.setStorageSync('transferCacheData', searchTransferCacheData);
      } else {
	      let tempArray1 = this.filterData(searchTransferCacheData); // 搜索数据获取数据输入不为0的数据
	          transferCacheData = this.forDataContrastSearch(tempArray1, transferCacheData); // 搜索结果和总数据对比，如果有skuId相同责替换
	      this.setData({
		      imgDefault: false,
		      productlist: transferCacheData,
	      })
	      wx.setStorageSync('transferCacheData', transferCacheData); // 搜索结束后 需要把搜索结果放入到总的结果缓存中
      }
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