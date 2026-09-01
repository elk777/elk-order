/*
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/apis/admin/request.js
 * @Description: 管理端 HTTP 封装（仅 H5 管理后台使用）
 *
 * 【为什么不复用 utils/request.js】那份封装与用户体系强绑定：
 *   1. token 固定取自 useUserStore()，管理端 token 存在独立 storage 键里
 *   2. 401 走 handleUnauthorized() 跳小程序登录页，管理端要跳自己的登录页
 *   3. 它带 token 无感刷新，而管理端 token 是 Redis 里带 TTL 的随机凭证，
 *      没有 refresh 接口，过期即重新登录 —— 复用刷新逻辑只会白打一次 /auth/refresh
 * 与其加分支把两套鉴权揉进一个文件，不如让管理端持有一份轻量实现。
 */

import { BASE_URL } from '@/config/index.js'
import {
	ADMIN_DEV_BASE_URL,
	ADMIN_LOGIN_PAGE,
	ADMIN_PROFILE_KEY,
	ADMIN_TOKEN_KEY,
} from './constants.js'

/** 业务成功码，与后端统一响应体一致 */
const SUCCESS_CODE = 200

/** 请求超时 (ms) */
const TIMEOUT = 15000

/**
 * 管理端接口基地址。
 * 生产走同源相对路径：admin.lucky-elk.xyz/api/* 由 nginx 反代到 NestJS，
 * 同源意味着不依赖 CORS 配置是否漏配。
 * 开发环境优先用管理端自己的地址，未配置时才回退到用户端 BASE_URL，
 * 由后端 CORS_ORIGIN 放行本地端口。
 */
const ADMIN_BASE =
	process.env.NODE_ENV === 'production' ? '/api' : ADMIN_DEV_BASE_URL || BASE_URL

/** 跳转登录页的进行中标记，避免并发请求同时 401 时连续 reLaunch 多次 */
let redirectingToLogin = false

/**
 * @description: 读取管理端 token
 * @return {string} token，未登录返回空串
 */
export function getAdminToken() {
	try {
		return uni.getStorageSync(ADMIN_TOKEN_KEY) || ''
	} catch (error) {
		console.warn('[admin] read token failed', error)
		return ''
	}
}

/**
 * @description: 写入登录态
 * @param {string} token 管理端 token
 * @param {Object} profile 管理员信息
 * @return {void}
 */
export function setAdminSession(token, profile) {
	uni.setStorageSync(ADMIN_TOKEN_KEY, token || '')
	uni.setStorageSync(ADMIN_PROFILE_KEY, profile || null)
	// 新会话建立后解除跳转锁，否则本次登录前触发过 401 会让后续 401 永远不再跳登录
	redirectingToLogin = false
}

/**
 * @description: 读取本地缓存的管理员信息
 * @return {Object|null} 管理员信息，未登录返回 null
 */
export function getAdminProfile() {
	try {
		return uni.getStorageSync(ADMIN_PROFILE_KEY) || null
	} catch (error) {
		console.warn('[admin] read profile failed', error)
		return null
	}
}

/**
 * @description: 清除登录态
 * @return {void}
 */
export function clearAdminSession() {
	uni.removeStorageSync(ADMIN_TOKEN_KEY)
	uni.removeStorageSync(ADMIN_PROFILE_KEY)
}

/**
 * 会话失效处理：清本地态并回登录页。
 * @description 管理端没有 refresh 通道，token 过期或被吊销后只能重新登录。
 * @return {void}
 */
function handleAdminUnauthorized() {
	clearAdminSession()
	if (redirectingToLogin) return
	redirectingToLogin = true
	uni.reLaunch({
		url: ADMIN_LOGIN_PAGE,
		complete: () => {
			redirectingToLogin = false
		},
	})
}

/**
 * @description: 拼接 query 参数
 * @param {string} url 请求地址
 * @param {Object} params query 参数，空值不参与拼接
 * @return {string} 完整地址
 */
function buildUrl(url, params = {}) {
	const query = Object.entries(params)
		.filter(([, value]) => value !== undefined && value !== null && value !== '')
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&')
	if (!query) return url
	return url + (url.includes('?') ? '&' : '?') + query
}

/**
 * @description: 统一错误对象
 * @param {number} code 业务码
 * @param {string} message 错误文案
 * @return {Error} 带 code 的 Error
 */
function createError(code, message) {
	const error = new Error(message)
	error.code = code
	return error
}

/**
 * 解析响应体。
 * @description 后端非 2xx 时也返回统一响应体，因此优先取 body 里的 message ——
 * 「该工单已被处理，请刷新后查看」这类业务提示正是靠这条路径透传到界面上的。
 * @param {Object} res uni.request 响应
 * @return {Object} { code, data, message }
 */
function parseResponse(res) {
	const { statusCode, data } = res
	const body = data && typeof data === 'object' ? data : null
	const message = body?.message || body?.msg || ''

	if (statusCode === 401) {
		return { code: 401, data: null, message: message || '登录已过期，请重新登录' }
	}
	if (statusCode >= 400) {
		return { code: body?.code ?? statusCode, data: null, message: message || '请求失败' }
	}
	if (body) {
		const hasDataField = Object.prototype.hasOwnProperty.call(body, 'data')
		return {
			code: body.code ?? SUCCESS_CODE,
			data: hasDataField ? body.data : body,
			message: message || 'ok',
		}
	}
	return { code: SUCCESS_CODE, data, message: 'ok' }
}

/**
 * 发起管理端请求。
 * @description 与用户端封装不同，这里对失败一律 reject —— 管理端每个操作都有明确后果
 * （发积分、改终态），静默拿到一个 code!==200 的对象继续往下走比抛错危险得多。
 * @param {Object} options 请求配置
 * @param {string} options.url 接口路径，相对 ADMIN_BASE
 * @param {string} [options.method] 请求方法，默认 GET
 * @param {Object} [options.params] query 参数
 * @param {Object} [options.data] 请求体
 * @param {boolean} [options.auth] 是否携带 token，默认 true
 * @param {boolean} [options.loading] 是否展示全局 loading，默认 false
 * @return {Promise<Object>} 解析后的响应体 { code, data, message }
 * @throws {Error} 网络异常、鉴权失效或业务码非 200
 */
function request({ url, method = 'GET', params = {}, data = {}, auth = true, loading = false }) {
	const header = {
		'Content-Type': 'application/json',
		'X-Request-From': 'admin-h5',
	}
	if (auth) {
		const token = getAdminToken()
		if (token) header.Authorization = `Bearer ${token}`
	}

	if (loading) uni.showLoading({ title: '处理中…', mask: true })

	return new Promise((resolve, reject) => {
		uni.request({
			url: buildUrl(`${ADMIN_BASE.replace(/\/$/, '')}/${String(url).replace(/^\//, '')}`, params),
			method,
			data,
			header,
			timeout: TIMEOUT,
			success: (res) => {
				const parsed = parseResponse(res)
				if (parsed.code === 401) {
					handleAdminUnauthorized()
					reject(createError(401, parsed.message))
					return
				}
				if (parsed.code !== SUCCESS_CODE) {
					reject(createError(parsed.code, parsed.message))
					return
				}
				resolve(parsed)
			},
			fail: (err) => {
				const message = err?.errMsg || ''
				reject(createError(-1, /timeout/i.test(message) ? '请求超时，请检查网络' : '网络异常，请稍后重试'))
			},
			complete: () => {
				if (loading) uni.hideLoading()
			},
		})
	})
}

export const adminHttp = {
	get: (url, params = {}, opts = {}) => request({ ...opts, url, method: 'GET', params }),
	post: (url, data = {}, opts = {}) => request({ ...opts, url, method: 'POST', data }),
}

export default adminHttp
