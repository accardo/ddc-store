const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/* 获取 值类型  */
function getType(val){
  return Object.prototype.toString.call(val).slice(8,-1);
}

/**
 * Description: 限制商品分类 订货-- 商品类型(1 - 现制现售品, 2 - 零售品, 3 - 课程, 4 - 原料, 5 - 耗材, 6 - 工具) --以逗号形式传参，如：1,2,3
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/5/22
 */
function limitClass(num) {
  let limitClass = '';
	switch (parseInt(num)) {
		case 0:  // 0 订货
			limitClass = '2,4,5,6';
			break;
		case 1: // 1 盘点
			limitClass = '2,4,6';
			break;
		case 2: // 2 出库操作
			limitClass = '2,4,6';
			break;
		case 3:  // 3 置换
			limitClass = '2,4,6';
			break;
		case 4:  // 4 调拨
			limitClass = '2,4,6';
			break;
		case 5:  // 5 库存查询
			limitClass = '2,4,6';
			break;
		case 6:  // 6 课程消耗
			limitClass = null;
			break;
	}
	return limitClass;
}

/**
 * Description: 订货 提交数据处理
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/5/23
 */
function dataSorting(data) {
	data.forEach((item) => { // 属性 数组转字符串
		item.shopItemSkuVO.attrValues = item.shopItemSkuVO.attrValues.toString();
	})
	return data;
}

/**
 * Description: 数组拷贝转换
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/5/24
 */
function ArrayDeepCopy(data) {
	return JSON.parse(JSON.stringify(data))
}

/**
 * Description: 提示成功跳转
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/5/24
 */
function showToast(data) {
	wx.showToast({
		title: data.title,
	});
	setTimeout(() => {
		wx.navigateBack({
			delta: data.page
		})
	}, 800);
}

/**
 * Description: 总结页面缓存 二维数组处理成一维
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/6/3
 */
function cacheDataDeal(data) {
	let tempArray = [];
	data.forEach((item) => {
		return tempArray.push(...item)
	})
	return tempArray;
}

/**
 * Description: 设置商品总数
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/6/3
 */
function setTotalNumber(data) {
	let shopPieceN = 0;
	let tempArray = [];
	data.forEach((item) => {
		return tempArray.push(...item)
	})
	tempArray.forEach((item) => {
		shopPieceN += item.needNumber
	})
	return {
		total: tempArray.length,
		shopPieceN
	}
}

module.exports = {
  formatTime,
  getType,
	limitClass,
	ArrayDeepCopy,
	dataSorting,
	showToast,
	cacheDataDeal,
	setTotalNumber,
}
