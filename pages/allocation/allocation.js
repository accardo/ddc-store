// pages/allocation/allocation.js
const config = require('../../config/config.js');
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
    tempCacheData: [] // 累加存储数据
  },
	/**
	 * Description: 处理店铺地址
	 * Author: yanlichen <lichen.yan@daydaycook.com>
	 * Date: 2018/6/5
	 */
	shopAddress() {
		let shopAddress = wx.getStorageSync('shopAddress');
		    shopAddress = shopAddress.filter((item) => {
		      return item.id != app.selectIndex
        })
    this.setData({
	    shopArray: shopAddress
    })
  },
  /* 选择门店 */
  selectShop(e) {
    this.setData({
	    selectIndex: this.data.shopArray[e.detail.value].id,
	    shopName: this.data.shopArray[e.detail.value].shopName
    })
  },

  /* 添加调拨 商品 */
  searchShop(){
    wx.navigateTo({
      url:'../../pages/search/search'
    })
  },

  /* 提交调拨 */
  subAllot(){
    wx.showModal({
      content: '是否确认提交调拨？',
      confirmColor: config.showModal.confirmColor,
      success: function (res) {
        if(res.confirm){
          wx.showToast({
            title: '提交调拨成功'
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000);
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
		// let data3 = [];
		//     data3 = data1.concat(data2);
		// let data3 = [];
		 data1.forEach((item) => {
			 data2.forEach((itemA, index) =>{
				if (itemA.skuId == item.skuId) {
				  console.log(item,1)
					data2[index] = item
				} else {
				  console.log(item,2)
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
    let transferCacheData = wx.getStorageSync('transferCacheData');
    if (transferCacheData) {
	    transferCacheData = transferCacheData.filter((item) => {
		    return item.needNumber != 0;
	    })
      if (this.data.productlist.length == 0) {
	      this.setData({
		      imgDefault: false,
		      productlist: transferCacheData
	      })
      } else {
	      this.data.productlist = this.forDataContrastSearch(transferCacheData, this.data.productlist);
	      console.log(this.data.productlist, 'tempcachedata');
	      this.setData({
		      imgDefault: false,
		      productlist: this.data.productlist,
        })

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