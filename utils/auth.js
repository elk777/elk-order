/*
 * @Author: elk
 * @Date: 2026-06-05 00:00:00
 * @LastEditors: elk 
 * @LastEditTime: 2026-06-06 20:13:17
 * @FilePath: /hkt-applet/utils/auth.js
 * @Description: 登录态校验和登录跳转工具
 */

import { useUserStore } from "@/stores/user.js";
import { useRecipeStore } from "@/stores/recipe.js";
import { useOrderStore } from "@/stores/order.js";
import { TABBAR_DATA } from "@/config/index.js";

// 登录页路径
const LOGIN_PAGE = "/pages/login/index";
// 默认跳转路径
const DEFAULT_REDIRECT = "/pages/home/index";
// 登录跳转配置键名
export const LOGIN_REDIRECT_KEY = "LOGIN_REDIRECT";

// 需要登录才能进入的页面集合。页面守卫只会拦截命中该集合的路由。
export const AUTH_ROUTE_LIST = [
	// "/pages/my/index",
	"/pages/my/integral",
	"/pages/order/details",
	"/pages/cart/AffirmOrder",
	"/pages/recipe/redact",
	"/pages/recipe/classify",
];

let redirecting = false;

/**
 * @description: 判断当前用户是否已登录
 * @return {boolean} 是否存在有效 token
 */
export const isLogin = () => {
	const userStore = useUserStore();
	return !!userStore.token;
};

/**
 * @description: 获取当前页面完整路径，包含页面参数
 * @return {string} 当前页面路径
 */
export const getCurrentPageUrl = () => {
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	if (!currentPage?.route) {
		return DEFAULT_REDIRECT;
	}

	const route = currentPage.route.startsWith("/") ? currentPage.route : `/${currentPage.route}`;
	const options = currentPage.options || {};
	const query = Object.entries(options)
		.filter(([, value]) => value !== undefined && value !== null && value !== "")
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join("&");

	return query ? `${route}?${query}` : route;
};

/**
 * @description: 判断指定路径是否为 tabBar 页面
 * @param {string} url 页面路径
 * @return {boolean} 是否为 tabBar 页面
 */
export const isTabBarPage = (url = "") => {
	const path = getPathWithoutQuery(url);
	return TABBAR_DATA.some((item) => item.pagePath === path);
};

/**
 * @description: 判断指定页面是否需要登录后才能访问
 * @param {string} url 页面路径
 * @return {boolean} 是否为受保护页面
 */
export const isAuthRoute = (url = getCurrentPageUrl()) => {
	const path = getPathWithoutQuery(url);
	return AUTH_ROUTE_LIST.includes(path);
};

/**
 * @description: 保存登录成功后需要回跳的页面
 * @param {string} url 目标页面路径
 * @return {void}
 */
export const saveLoginRedirect = (url = getCurrentPageUrl()) => {
	if (getPathWithoutQuery(url) === LOGIN_PAGE) {
		return;
	}

	uni.setStorageSync(LOGIN_REDIRECT_KEY, {
		url,
		type: isTabBarPage(url) ? "switchTab" : "redirectTo",
	});
};

/**
 * @description: 清理登录回跳目标
 * @return {void}
 */
export const clearLoginRedirect = () => {
	uni.removeStorageSync(LOGIN_REDIRECT_KEY);
};

/**
 * @description: 跳转登录页，并记录登录后的回跳目标
 * @param {Object} options 登录跳转配置
 * @return {boolean} 固定返回 false，方便中断原业务流程
 */
export const goLogin = (options = {}) => {
	const { redirect = getCurrentPageUrl(), message = "请先登录" } = options;
	const currentPath = getPathWithoutQuery(getCurrentPageUrl());

	// 已经在登录页时不重复跳转，避免循环进入登录页。
	if (currentPath === LOGIN_PAGE) {
		return false;
	}

	// 先保存目标页，再跳登录页，保证登录成功后能恢复用户原本动作。
	saveLoginRedirect(redirect);

	if (message) {
		uni.showToast({
			title: message,
			icon: "none",
		});
	}

	if (redirecting) {
		return false;
	}

	// 延迟跳转让 toast 先展示，同时用 redirecting 防止连续点击重复入栈。
	redirecting = true;
	setTimeout(() => {
		uni.navigateTo({
			url: LOGIN_PAGE,
			complete: () => {
				redirecting = false;
			},
		});
	}, 300);

	return false;
};

/**
 * @description: 执行需要登录的操作，未登录则跳转登录页
 * @param {Function} callback 已登录时执行的业务函数
 * @param {Object} options 登录跳转配置
 * @return {*} 已登录时返回 callback 结果，未登录时返回 false
 */
export const requireLogin = (callback, options = {}) => {
	if (isLogin()) {
		return typeof callback === "function" ? callback() : true;
	}

	return goLogin(options);
};

/**
 * @description: 页面级登录校验，仅受保护页面未登录时跳转登录页
 * @param {Object} options 登录跳转配置
 * @return {boolean} 已登录、公开页面返回 true，未登录受保护页面返回 false
 */
export const requireRouteLogin = (options = {}) => {
	const redirect = options.redirect || getCurrentPageUrl();

	// 公开页面不拦截，避免误伤首页、菜单、菜谱详情等浏览场景。
	if (!isAuthRoute(redirect)) {
		return true;
	}

	return requireLogin(null, {
		...options,
		redirect,
	});
};

/**
 * @description: 完成登录，写入 token 和用户资料
 * @param {string} token 登录接口返回的 token
 * @param {Object} profile 用户资料
 * @return {void}
 */
export const completeLogin = (token, profile) => {
	const userStore = useUserStore();
	userStore.setToken(token);
	if (profile) {
		userStore.setProfile(profile);
	}
};

/**
 * @description: 清空当前登录态
 * @return {void}
 */
export const clearLogin = () => {
	const userStore = useUserStore();
	const recipeStore = useRecipeStore();
	const orderStore = useOrderStore();
	userStore.clearLogin();
	recipeStore.resetRecipeState();
	orderStore.resetOrderState();
};

/**
 * @description: 处理接口 401，清登录态并跳转登录页
 * @param {string} message 提示文案
 * @return {boolean} 固定返回 false，方便中断原业务流程
 */
export const handleUnauthorized = (message = "登录已过期，请重新登录") => {
	clearLogin();
	return goLogin({ message });
};

/**
 * @description: 登录成功后回跳到原目标页面
 * @return {void}
 */
export const redirectAfterLogin = () => {
	const redirectInfo = uni.getStorageSync(LOGIN_REDIRECT_KEY);
	clearLoginRedirect();

	// 没有目标页时默认回首页。
	if (!redirectInfo?.url) {
		uni.switchTab({ url: DEFAULT_REDIRECT });
		return;
	}

	// tabBar 页面必须使用 switchTab，且不能携带 query。
	if (redirectInfo.type === "switchTab") {
		uni.switchTab({ url: getPathWithoutQuery(redirectInfo.url) });
		return;
	}

	// 页面守卫场景下，目标页通常就在登录页下面，直接返回避免重复入栈。
	if (isPreviousPage(redirectInfo.url)) {
		uni.navigateBack();
		return;
	}

	// 普通页面由登录页替换到目标页；失败时回首页兜底。
	uni.redirectTo({
		url: redirectInfo.url,
		fail: () => {
			uni.switchTab({ url: DEFAULT_REDIRECT });
		},
	});
};

/**
 * @description: 去掉路径中的 query 参数
 * @param {string} url 页面路径
 * @return {string} 纯页面路径
 */
function getPathWithoutQuery(url = "") {
	const [path] = url.split("?");
	return path;
}

/**
 * @description: 判断登录页下方页面是否就是回跳目标页
 * @param {string} url 回跳目标路径
 * @return {boolean} 是否为上一页
 */
function isPreviousPage(url = "") {
	const pages = getCurrentPages();
	const previousPage = pages[pages.length - 2];
	if (!previousPage?.route) {
		return false;
	}

	const previousPath = previousPage.route.startsWith("/") ? previousPage.route : `/${previousPage.route}`;
	return previousPath === getPathWithoutQuery(url);
}
