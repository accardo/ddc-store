//请求的总 URL 地址
const util = require('../utils/util.js');
const url ="https://store-wms-s.daydaycook.com.cn/";
//const url ="https://wms-d.daydaycook.com.cn/";
const apiPrefix = url + 'wms/';
const apiPrefixList = {
  WMS: apiPrefix
}

/* 拼接请求参数 */
function qrstring(url,params){
  let keys = Object.keys(params);
  let str ='';
  if (url && url.indexOf('?') == -1 && keys.length >0){
    str = '?';
    keys.map(item =>{
      str = `${str}&${item}=${params[item]}`
    })
  }
  return str;
}

/* 设置 请求信息 */

function service({ formType, apiPrefix, url, method = "GET", params = { token: wx.getStorageSync('getusertoken') }, data = {}, header={'content-type':'application/json'}}){
  return new Promise((resolve, reject) => {
    apiPrefix = apiPrefixList[apiPrefix] || apiPrefixList.WMS;
    var urlData = url ? apiPrefix + url + qrstring(url, params) : apiPrefix ;
    wx.request({
      url: urlData,
      header,
      method,
      data,
      formType,
      // complete(res){
      //   //接口请求结束执行
      //   console.log(res)
      // },
      success(res){
        if(res.errMsg == 'request:ok'){
          resolve(res.data);
          if(res.data && res.data.data && util.getType(res.data.data) == 'Object'){
            resolve(res.data);
          } else if (res.data && res.data.data && util.getType(res.data.data) == 'String' && res.data.data.includes('{')){
            res.data = {
              ...res.data,
              data:JSON.parse(res.data.data)
            }
            resolve(res.data);
          }else{
            resolve(res.data);
          }
        }else{
          reject(res);
        }
      }
    })
  })
}

module.exports = {
  service,
  url,
	apiPrefix
}