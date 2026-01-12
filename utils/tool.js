/*
 * @Author: elk
 * @Date: 2025-09-04 16:30:03
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-12 14:23:04
 * @FilePath: /hkt-applet/utils/tool.js
 * @Description: 工具类方法集合
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
/**
 * @description: 获取tabbar高度(默认50)和底部安全高度(动态)
 * @param {:type} 
 * @return {:type} 
 */
export const getBottomSpacing = () => {
	const sys = uni.getSystemInfoSync()
	// 1. 原生 TabBar 高度（固定）
	const tabBarHeight = 50   // px
	// 2. 底部安全区高度（动态）
	const safeBottom = sys.safeAreaInsets?.bottom || 0
	// 3. 实际“底部占位”高度
	return tabBarHeight + safeBottom
}

/**
 * @description: 生成唯一id-随机数
 * @return {string} 唯一id字符串
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};