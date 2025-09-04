/**
 * @Description: 工具类方法集合
 * @Author: elk
 * @Date: 2025-09-04 16:30:09
 * @LastEditors: 
 * @LastEditTime: 2025-09-04 16:30:09
 */

/**
 * @description:  获取导航的高度
 * @param {:type} 
 * @return {:type} 
 */
export const getUniTopNavHeight = () => {
	const systemInfo = uni.getSystemInfoSync();
	return systemInfo.statusBarHeight
}