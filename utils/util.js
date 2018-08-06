/* 获取 值类型  */
export function getType(val){
  return Object.prototype.toString.call(val).slice(8,-1);
}
/**
 * Description: IOS 手机 时间格式转换
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/6/15
 */
export function strToDate(dateObj){
	dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/')
	dateObj = dateObj.slice(0, dateObj.indexOf("."))
	return new Date(dateObj)
}

/*
 * Description: 格式化时间 例：2018-07-23
 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
 * Date: 2018/7/25
 */
export function formatTime(data, objTime) {
	return data.forEach((item) => {
		if (item[objTime] !== null) {
			let time = strToDate(item[objTime])
			return item[objTime] = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
		}
	})
}

/**
 * Description: 限制商品分类 订货-- 商品类型(1 - 现制现售品, 2 - 零售品, 3 - 课程, 4 - 原料, 5 - 耗材, 6 - 工具) --以逗号形式传参，如：1,2,3
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/5/22
 */

export function limitClass(num) {
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
		case 7: // 7 退货
			limitClass = '2,4,6';
			break;
	}
	return limitClass;
}
/**
 * Description: attrValues 直接转 array 转 string
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/6/8
 */
export function attrValuesToString(data) {
	return data.attrValues !== null ? data.attrValues.toString() : null;
}

/**
 * Description: 直接转 string 转 array
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/6/8
 */
export function attrValuesSplit(data) {
	return data.attrValues != null ? data.attrValues.split(',') : null;
}
/**
 * Description: shopItemSkuVO 数据结构 attrValues string 转 array
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/6/8
 */
export function attrValuesSkuSplit(data) {
	data.forEach((item) => {
		if (item.shopItemSkuVO !== null && item.shopItemSkuVO.attrValues !== null) {
			item.shopItemSkuVO.attrValues = item.shopItemSkuVO.attrValues.split(',');
		}
	})
	return data;
}
/**
 * Description: shopItemSkuVO 数据结构 attrValues array 转 string
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/6/8
 */
export function attrValuesSkuToString(data) {
	data.forEach((item) => {
		if (item.shopItemSkuVO !== null && item.shopItemSkuVO.attrValues !== null) {
			item.shopItemSkuVO.attrValues = item.shopItemSkuVO.attrValues.toString();
		}
	})
	return data;
}
/**
 * Description: 数组拷贝转换
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/5/24
 */
export function ArrayDeepCopy(data) {
	return JSON.parse(JSON.stringify(data))
}

/**
 * Description: 提示成功跳转
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/5/24
 */
export function showToast(data) {
	let pages = data.pages[data.pages.length - (data.page + 1)]; // 当前页面选中的 this
	wx.showToast({
		title: data.title,
	});
	setTimeout(() => {
		wx.navigateBack({
			delta: data.page
		})
		if (pages == undefined || pages == null) {
			return
		}
		pages.setData({
			listData: [],
			pagetListData: [],
			currPage: 1
		})
		pages.onLoad(pages.options)
	}, 800);
}
/*
 * Description: 验证信息 node toast
 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
 * Date: 2018/7/23
 */
export function showToastNone(msg) {
	wx.showToast({
		title: msg,
		icon: 'none'
	})
}
/**
 * Description: 总结页面缓存 二维数组处理成一维
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/6/3
 */
export function cacheDataDeal(data) {
	return [].concat.apply([],data);
}

/**
 * Description: 设置商品总数
 * Author: yanlichen <lichen.yan@daydaycook.com>
 * Date: 2018/6/3
 */
export function setTotalNumber(data) {
	let shopPieceN = 0;
	let tempArray = cacheDataDeal(data).map((item) => {
		return shopPieceN += Number(item.needNumber)
	})
	return {
		total: tempArray.length,
		shopPieceN
	}
}

export function digitLength(num){
	const eSplit = num.toString().split(/[eE]/);
	const len = (eSplit[0].split('.')[1] || '').length - (+(eSplit[1] || 0));
	return len > 0 ? len : 0;
}

//精确加法
export function add(num1, num2){
	const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
	return (sub(num1, baseNum) + sub(num2, baseNum)) / baseNum;
}

//精确减法
export function reduce(num1, num2){
	const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
	return (sub(num1, baseNum) - sub(num2, baseNum)) / baseNum;
}

// 精确乘法
export function sub(num1, num2){
	const num1Changed = Number(num1.toString().replace('.', ''));
	const num2Changed = Number(num2.toString().replace('.', ''));
	const baseNum = digitLength(num1) + digitLength(num2);
	return num1Changed * num2Changed / Math.pow(10, baseNum);
}

//精确除法
export function divide(num1, num2){
	const num1Changed = Number(num1.toString().replace('.', ''));
	const num2Changed = Number(num2.toString().replace('.', ''));
	return sub((num1Changed / num2Changed), Math.pow(10, digitLength(num2) - digitLength(num1)));
}

export default {
  getType,
	limitClass,
	ArrayDeepCopy,
	showToast,
	cacheDataDeal,
	setTotalNumber,
	attrValuesToString,
	attrValuesSplit,
	attrValuesSkuSplit,
	attrValuesSkuToString,
	add,
	reduce,
	sub,
	divide,
	showToastNone,
	formatTime,
}