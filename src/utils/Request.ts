/* eslint-disable */
import axios from 'axios';

export async function request(url, options) {
  try {
    const axiosReponse = await axios(url, options);
    const retData = await dealResponse(axiosReponse);
    return retData;
  } catch (error) {
    console.log('------Requst-------');
    console.log(error);
    console.log('------Requst-------');
    return Promise.reject(error);
  }
}

function dealResponse(response) {
  return new Promise((resolve, reject) => {
    const resultData = response.data || response.rows;
    if (resultData.suc || (resultData.data || []).length > 0) {
      resolve(resultData);
    } else {
      const responseDesc = resultData?.remark || '后台处理数据错误';
      reject(responseDesc);
    }
  });
}
