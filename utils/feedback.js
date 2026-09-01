/*
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/utils/feedback.js
 * @Description: 反馈工单前端视图层工具：字段归一化、跨页传递、本地已读态
 */

import { FEEDBACK_STATUS } from "@/config/index.js";
import { normalizeMediaUrl } from "@/utils/media.js";
import { useUserStore } from "@/stores/user.js";

/** 已读态存储键前缀，版本号用于后续已读口径变化时整体失效 */
const SEEN_STORAGE_PREFIX = "FEEDBACK_SEEN_V1";

/** 已读 id 保留上限。单用户反馈量极小，截断只为防止长期使用后存储无界增长 */
const SEEN_ID_LIMIT = 100;

/** 详情页跨页缓存上限，超出后丢弃最早写入的工单 */
const DETAIL_CACHE_LIMIT = 30;

/**
 * 列表页 -> 详情页的工单缓存。
 * 【为什么用内存缓存】后端只开放了 /feedback/mine 分页接口，用户端没有 /feedback/:id，
 * 详情页无法凭 id 直接取单条数据。写 storage 会留下需要清理的垃圾，
 * 所以走模块级内存缓存；小程序冷启动后缓存为空，由详情页的分页兜底查询补齐。
 */
const detailCache = new Map();

/**
 * @description: 归一化后端工单，抹平 BigInt 字符串、JSON 列与 null 字段带来的差异
 * @param {Object} raw /feedback/mine 返回的单条工单
 * @return {Object} 可直接渲染的工单对象
 */
export function normalizeFeedbackTicket(raw = {}) {
	return {
		// id 是 BigInt，后端已序列化为字符串；前端统一按字符串比较，避免精度丢失
		id: raw.id === undefined || raw.id === null ? "" : String(raw.id),
		type: Number(raw.type ?? 0),
		status: Number(raw.status ?? FEEDBACK_STATUS.PENDING),
		content: raw.content || "",
		images: normalizeFeedbackImages(raw.images),
		contact: raw.contact || "",
		reply: raw.reply || "",
		rewardPoints: Number(raw.rewardPoints) > 0 ? Number(raw.rewardPoints) : 0,
		handleTime: raw.handleTime || "",
		createTime: raw.createTime || "",
	};
}

/**
 * @description: 批量归一化工单列表
 * @param {Array} list 后端列表数据
 * @return {Array} 归一化后的工单列表
 */
export function normalizeFeedbackList(list) {
	if (!Array.isArray(list)) return [];
	return list.map((item) => normalizeFeedbackTicket(item));
}

/**
 * @description: 归一化截图字段
 * @param {*} images images 是 JSON 列，可能为 null、字符串数组或历史脏数据
 * @return {string[]} 可渲染的图片地址数组
 */
function normalizeFeedbackImages(images) {
	if (!Array.isArray(images)) return [];
	return images
		.map((item) => normalizeMediaUrl(typeof item === "string" ? item : item?.url || ""))
		.filter(Boolean);
}

/**
 * @description: 缓存工单，供详情页免请求直接渲染
 * @param {Object} ticket 归一化后的工单
 * @return {void}
 */
export function cacheFeedbackTicket(ticket) {
	if (!ticket?.id) return;
	// Map 保持插入顺序，超限时淘汰最早写入的一条
	if (detailCache.size >= DETAIL_CACHE_LIMIT && !detailCache.has(ticket.id)) {
		const oldestKey = detailCache.keys().next().value;
		detailCache.delete(oldestKey);
	}
	detailCache.set(ticket.id, ticket);
}

/**
 * @description: 读取缓存的工单
 * @param {string} id 工单 id
 * @return {Object|null} 缓存命中的工单，未命中返回 null
 */
export function getCachedFeedbackTicket(id) {
	if (!id) return null;
	return detailCache.get(String(id)) || null;
}

/**
 * @description: 判断工单是否已进入终态（用户可以看到处理结果）
 * @param {Object} ticket 工单
 * @return {boolean} 是否已处理完毕
 */
export function isFeedbackHandled(ticket) {
	return Number(ticket?.status) !== FEEDBACK_STATUS.PENDING;
}

/**
 * 已读态存储键。
 * 按用户维度隔离：同一台设备可能先后登录不同账号，共用一个键会互相误标已读。
 * @return {string} 当前用户的已读态存储键
 */
function getSeenStorageKey() {
	const profile = useUserStore().profile || {};
	return `${SEEN_STORAGE_PREFIX}_${profile.uuid || profile.id || "current"}`;
}

/**
 * @description: 读取本地已读工单 id 集合
 * @return {Set<string>} 已读工单 id
 */
export function getSeenFeedbackIds() {
	try {
		const payload = uni.getStorageSync(getSeenStorageKey());
		return new Set(Array.isArray(payload?.ids) ? payload.ids.map(String) : []);
	} catch (error) {
		// 读失败按「全未读」处理：宁可多提示一次角标，也不要吞掉处理结果通知
		console.warn("[feedback] read seen state failed", error);
		return new Set();
	}
}

/**
 * @description: 把已看到处理结果的工单写入本地已读态
 * @param {Array} tickets 本次已展示给用户的工单列表
 * @return {void}
 */
export function markFeedbackTicketsSeen(tickets) {
	const handledIds = (Array.isArray(tickets) ? tickets : [])
		.filter((item) => item?.id && isFeedbackHandled(item))
		.map((item) => String(item.id));
	if (!handledIds.length) return;

	const seenIds = getSeenFeedbackIds();
	const hasNewId = handledIds.some((id) => !seenIds.has(id));
	// 没有新增已读时不写存储，避免列表每次分页都触发一次同步写
	if (!hasNewId) return;

	handledIds.forEach((id) => seenIds.add(id));
	// 只保留最近的 id：Set 保持插入顺序，截断时丢弃最早的
	const ids = Array.from(seenIds).slice(-SEEN_ID_LIMIT);
	try {
		uni.setStorageSync(getSeenStorageKey(), { ids, time: Date.now() });
	} catch (error) {
		console.warn("[feedback] save seen state failed", error);
	}
}

/**
 * @description: 统计「已补偿但用户还没看过」的工单数，用于「我的」入口角标
 * @param {Array} tickets 归一化后的工单列表
 * @return {number} 未读数量
 */
export function countUnreadFeedback(tickets) {
	if (!Array.isArray(tickets) || !tickets.length) return 0;
	const seenIds = getSeenFeedbackIds();
	return tickets.filter(
		(item) => Number(item?.status) === FEEDBACK_STATUS.REWARDED && !seenIds.has(String(item.id)),
	).length;
}
