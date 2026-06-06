/*
 * @Author: elk
 * @Date: 2026-06-05 00:00:00
 * @LastEditors: elk
 * @LastEditTime: 2026-06-05 00:00:00
 * @FilePath: /hkt-applet/hooks/useAuthGuard.js
 * @Description: 页面级登录守卫
 */

import { onShow } from "@dcloudio/uni-app";
import { requireRouteLogin } from "@/utils/auth.js";

/**
 * @description: 页面级登录守卫，命中受保护路由且未登录时跳转登录页
 * @param {Object} options 登录跳转配置
 * @return {void}
 */
export function useAuthGuard(options = {}) {
	onShow(() => {
		requireRouteLogin(options);
	});
}
