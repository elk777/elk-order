/*
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/apis/admin/index.js
 * @Description: 管理端接口封装（仅 H5 管理后台使用）
 */

import adminHttp, { clearAdminSession, setAdminSession } from './request.js'

/**
 * @description: 管理员账号密码登录，成功后写入本地会话
 * @param {Object} data 登录入参
 * @param {string} data.username 管理员账号，3~50 字符
 * @param {string} data.password 密码，8~72 字符
 * @return {Promise<Object>} { token, expiresIn, admin }
 */
export async function adminLogin(data) {
	const res = await adminHttp.post('/admin/auth/login', data, { auth: false, loading: true })
	setAdminSession(res.data?.token, res.data?.admin)
	return res.data
}

/**
 * 登出并吊销服务端会话。
 * @description 无论接口成功与否都清本地态：接口失败通常意味着 token 已失效，
 * 这时把用户留在「看似已登录」的界面上没有意义。
 * @return {Promise<void>}
 */
export async function adminLogout() {
	try {
		await adminHttp.post('/admin/auth/logout')
	} catch (error) {
		console.warn('[admin] logout request failed', error)
	} finally {
		clearAdminSession()
	}
}

/**
 * @description: 读取当前登录管理员，用于进入后台时校验会话是否仍然有效
 * @return {Promise<Object>} { id, username, nickName, role }
 */
export async function getAdminProfileRemote() {
	const res = await adminHttp.get('/admin/auth/me')
	return res.data
}

/**
 * 工单分页列表。
 * @description status 与 handled 互斥：前者查单一状态，后者查「已流转到终态的全部工单」。
 * 管理端「已处理」tab 必须走 handled —— 用不传条件再在前端筛掉待处理，
 * 会让每页条数与 total 双双失真。
 * @param {Object} params 查询参数
 * @param {number} [params.status] 工单状态，不传表示全部
 * @param {number} [params.handled] 传 1 表示只看已处理（status != 0）
 * @param {number} [params.page] 页码，从 1 开始
 * @param {number} [params.pageSize] 每页条数
 * @return {Promise<Object>} { list, total, page, pageSize }
 */
export async function getAdminFeedbackList(params = {}) {
	const res = await adminHttp.get('/admin/feedback', params)
	return res.data
}

/**
 * @description: 工单看板统计，供列表页 KPI 与 tab 计数使用
 * @return {Promise<Object>} { pendingCount, handledCount, rewardedCount, totalPoints }
 */
export async function getAdminFeedbackStats() {
	const res = await adminHttp.get('/admin/feedback/stats')
	return res.data
}

/**
 * @description: 工单详情，附带提交人的反馈历史统计
 * @param {string|number} id 工单 ID
 * @return {Promise<Object>} 工单详情，含 user 与 userStats
 */
export async function getAdminFeedbackDetail(id) {
	const res = await adminHttp.get(`/admin/feedback/${id}`)
	return res.data
}

/**
 * 认证通过：流转工单并发放补偿积分。
 * @description 只传档位标识不传金额 —— 金额由后端按工单类型推导，
 * 传金额等于把「给任意用户加任意积分」的能力暴露在前端。
 * @param {string|number} id 工单 ID
 * @param {Object} data 处理入参
 * @param {string} [data.level] bug 类必传，取值见 FEEDBACK_REWARD_LEVELS
 * @param {string} [data.reply] 给用户的回复，留空由后端生成默认文案
 * @return {Promise<Object>} 工单终态与实际发放积分
 */
export async function approveAdminFeedback(id, data = {}) {
	const res = await adminHttp.post(`/admin/feedback/${id}/approve`, data, { loading: true })
	return res.data
}

/**
 * @description: 驳回工单，原因对用户可见
 * @param {string|number} id 工单 ID
 * @param {Object} data 驳回入参
 * @param {string} data.reason 驳回原因，必填，最长 200 字
 * @return {Promise<Object>} 工单终态与回复文案
 */
export async function rejectAdminFeedback(id, data) {
	const res = await adminHttp.post(`/admin/feedback/${id}/reject`, data, { loading: true })
	return res.data
}

export { clearAdminSession, getAdminProfile, getAdminToken } from './request.js'
