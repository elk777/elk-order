/*
 * @Author: elk
 * @Date: 2025-09-04 16:30:03
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-28 15:01:13
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
	return systemInfo.statusBarHeight || 0
}

/**
 * @description: 获取微信胶囊按钮安全底部位置，缺失时回退到状态栏高度
 * @return {number} 顶部安全内容底部位置(px)
 */
export const getCapsuleSafeBottom = () => {
	try {
		const menuButton = uni.getMenuButtonBoundingClientRect?.();
		if (menuButton?.bottom) return menuButton.bottom;
	} catch {
		// 非微信小程序或部分端无胶囊 API，使用保守高度兜底。
	}

	return getUniTopNavHeight() + 54;
}

/**
 * @description: 获取自定义导航区域总高度
 * @param {number} extraBottom 胶囊底部以下的额外留白(px)
 * @return {number} 导航总高度(px)
 */
export const getCustomNavbarHeight = (extraBottom = 12) => {
	return getCapsuleSafeBottom() + extraBottom;
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

/**
 * @description: 格式化日期
 * @param {*} date 日期对象 - 时间戳
 * @return {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
	const dateObj = new Date(date);
	const year = dateObj.getFullYear();
	const month = String(dateObj.getMonth() + 1).padStart(2, "0");
	const day = String(dateObj.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

/**
 * @description: 格式化日期时间
 * @param {*} value 日期对象 / 时间戳 / 后端返回的 ISO 字符串
 * @return {string} YYYY-MM-DD HH:mm，无法解析时原样返回
 */
export const formatDateTime = (value) => {
	if (!value) return "";
	const dateObj = new Date(value);
	if (Number.isNaN(dateObj.getTime())) return String(value);
	const pad = (num) => String(num).padStart(2, "0");
	return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
};

/**
 * @description: 格式化为相对时间，用于列表里更易读的「刚刚 / 2小时前」
 * @param {*} value 日期对象 / 时间戳 / 后端返回的 ISO 字符串
 * @return {string} 相对时间描述，超过 30 天回落到具体日期
 */
export const formatRelativeTime = (value) => {
	if (!value) return "";
	const dateObj = new Date(value);
	if (Number.isNaN(dateObj.getTime())) return String(value);

	const diff = Date.now() - dateObj.getTime();
	// 服务端与客户端时钟可能有偏差，未来时间统一按「刚刚」展示，避免出现「-1分钟前」
	if (diff < 60 * 1000) return "刚刚";

	const minutes = Math.floor(diff / (60 * 1000));
	if (minutes < 60) return `${minutes} 分钟前`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} 小时前`;

	const days = Math.floor(hours / 24);
	if (days <= 30) return `${days} 天前`;

	return formatDate(dateObj);
};
