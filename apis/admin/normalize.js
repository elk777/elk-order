/*
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/apis/admin/normalize.js
 * @Description: 管理端工单字段归一化
 */

import { normalizeFeedbackTicket } from '@/utils/feedback.js'
import { normalizeMediaUrl } from '@/utils/media.js'
import { REWARDED_COUNT_WARN_THRESHOLD } from './constants.js'

/**
 * 归一化管理端工单。
 * @description 工单主体复用用户端的归一化，管理端只补两块用户端拿不到的数据：
 * 提交人信息与反馈历史统计。避免同一份 BigInt / JSON 列的处理逻辑写两遍。
 * @param {Object} raw 后端返回的单条工单
 * @return {Object} 可直接渲染的工单对象
 */
export function normalizeAdminTicket(raw = {}) {
	return {
		...normalizeFeedbackTicket(raw),
		userId: raw.userId === undefined || raw.userId === null ? '' : String(raw.userId),
		user: normalizeTicketUser(raw.user),
		userStats: normalizeUserStats(raw.userStats),
		handlerId: raw.handlerId === undefined || raw.handlerId === null ? '' : String(raw.handlerId),
	}
}

/**
 * @description: 批量归一化工单列表
 * @param {Array} list 后端列表数据
 * @return {Array} 归一化后的工单列表
 */
export function normalizeAdminTicketList(list) {
	if (!Array.isArray(list)) return []
	return list.map((item) => normalizeAdminTicket(item))
}

/**
 * @description: 归一化提交人信息
 * @param {Object} user 后端 user 关联对象，可能为 null
 * @return {Object} 提交人展示信息
 */
function normalizeTicketUser(user) {
	const nickName = user?.nickName || '匿名用户'
	return {
		id: user?.id === undefined || user?.id === null ? '' : String(user.id),
		uuid: user?.uuid || '',
		nickName,
		avatar: normalizeMediaUrl(user?.avatar || ''),
		// 无头像时用昵称首字回退成文字头像，避免列表出现一排空白占位
		initial: nickName.slice(0, 1),
	}
}

/**
 * 归一化反馈历史统计。
 * @description 仅详情接口返回，列表接口没有这块数据，因此缺省补零而不是抛错。
 * @param {Object} stats 后端 userStats
 * @return {Object} { totalCount, rewardedCount, todayCount, rewardedWarning }
 */
function normalizeUserStats(stats) {
	const rewardedCount = Number(stats?.rewardedCount) || 0
	return {
		totalCount: Number(stats?.totalCount) || 0,
		rewardedCount,
		todayCount: Number(stats?.todayCount) || 0,
		// 超阈值只标黄提示，不做拦截：是否放行由管理员判断，系统不替人做决定
		rewardedWarning: rewardedCount > REWARDED_COUNT_WARN_THRESHOLD,
	}
}
