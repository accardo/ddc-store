const baseService = require('../../service/base.service.js');
import * as utils from'../../utils/util';
// components/uploadImg/uploadImg.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
	  imgList: {
		  type: Array,
		  value: [],
	  },
	  orderStatus: {
		  type: String,
		  value: 0,
	  }
  },

  /**
   * 组件的初始数据
   */
  data: {
	  maxUpNum: 5, // 上传最大的数量
	  imgBigUrl: '', // 放大的图片
	  imgIsShow: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
	  /**
	   * Description: 删除图片
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/22
	   */
	  closeImg(e) {
		  let index = e.currentTarget.dataset.index;
		  this.data.imgList.splice(index, 1);
		  this.setData({
			  imgList: this.data.imgList
		  })
		  this.triggerEvent("bindUploadImg", this.data.imgList); // 返回父组件数据
	  },
	  /* 图片上传 */
	  openMedia() {
		  wx.chooseImage({
			  count: this.data.maxUpNum, // 默认 9
			  sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
			  sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			  success: (res) => {
				  let i = 0; // 第几个
				  var length = res.tempFilePaths.length; //总共个数
				  wx.showLoading({ title: '图片上传中...', mask: true });
				  this.uploadDIY(res.tempFilePaths, i, length);
			  }
		  })
	  },
	  /**
	   * Description: 多文件上传  递归方式。 小程序不支持多文件上传
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/1
	   */
	  uploadDIY(filePaths,i,length) {
		  let token = wx.getStorageSync('getusertoken');
		  wx.uploadFile({
			  url: `${baseService.apiPrefix}sys/oss/upload`,
			  filePath: filePaths[i],
			  name: 'file',
			  formData: {
				  token
			  },
			  success: (res) => {
				  let resData = JSON.parse(res.data);
				  if (resData.code == 0) {
					  if (this.data.imgList.length >= 5 ) {
						  utils.showToastNone('最多上传5张照片')
						  return
					  } else {
						  this.data.imgList.push(resData.url[0]);
					  }
					  this.setData({
						  imgList: this.data.imgList
					  })
					  this.triggerEvent("bindUploadImg", this.data.imgList); // 返回父组件数据
				  }
			  },
			  complete: () => {
				  i ++;
				  if(i == length) {
					  wx.hideLoading();
					  return false
				  } else {
					  this.uploadDIY(filePaths, i, length)
				  }
			  }
		  })
	  },
	  /**
	   * Description: 图片放大
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/15
	   */
	  zoomImg(e) {
		  let index = e.currentTarget.dataset.index;
		  this.setData({
			  imgBigUrl: this.data.imgList[index],
			  imgIsShow: true
		  })
	  },
	  /**
	   * Description: 图片关闭
	   * Author: yanlichen <lichen.yan@daydaycook.com>
	   * Date: 2018/6/15
	   */
	  imgClose() {
		  this.setData({
			  imgIsShow: false
		  })
	  },
  }
})
