/*
 * @Author: elk
 * @Date: 2026-06-05 13:57:42
 * @LastEditors: elk
 * @LastEditTime: 2026-06-11 13:02:06
 * @FilePath: /hkt-applet/apis/login.js
 * @Description: 登录模块接口
 */

import http from '@/utils/request.js'

/**
 * @description: 登录接口，登录请求本身不携带 token
 * @param {Object} data 登录参数
 * @return {Promise} 登录响应
 */
export function login(data) {
	return http.post('/auth/wechat-login', data, {
		auth: false,
		loading: true,
	})
}
