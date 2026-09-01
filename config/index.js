/*
 * @Author: elk
 * @Date: 2025-07-19 16:45:55
 * @LastEditors: elk 
 * @LastEditTime: 2026-06-22 16:37:02
 * @FilePath: /hkt-applet/config/index.js
 * @Description: 整体基础配置
 */
// const BASE_URL = 'http://192.168.31.64:3000/api' // 局域网开发地址，支持真机调试

import { baseUrl, appId } from './privacy.js' // 隐私配置

const BASE_URL = baseUrl
const APP_ID = appId

// 主题颜色组合
const COLOURS = {
	'theme-color': '#FF5C8D',
	'fu-color': '#FFF5F5',
	'inter-color': '#FF5C8D',
	'tinge-color': '#707070',
	'gray-color': '#dadbde'
}

// 底部tabber
const TABBAR_DATA = [
	{
		id: 0,
		text: '首页',
		icon: '/static/images/tabbar_png/home.png',
		actIcon: '/static/images/tabbar_png/home_act.png',
		pagePath: '/pages/home/index'
	},
	{
		id: 1,
		text: '菜单',
		icon: '/static/images/tabbar_png/sort.png',
		actIcon: '/static/images/tabbar_png/sort_act.png',
		pagePath: '/pages/sort/index'
	},
	{
		id: 2,
		text: '订单',
		icon: '/static/images/tabbar_png/souvv.png',
		actIcon: '/static/images/tabbar_png/souvv_act.png',
		pagePath: '/pages/order/index'
	},
	{
		id: 3,
		text: '我的',
		icon: '/static/images/tabbar_png/my.png',
		actIcon: '/static/images/tabbar_png/my_act.png',
		pagePath: '/pages/my/index'
	},
];
// 订单状态信息
const ORDER_STATUS_INFO =  [
	{
		value: 0,
		label: '全部',
	},
	{
		value: 1,
		label: '待接单',
		color: 'primary',
	},
	{
		value: 2,
		label: '已接单',
		color: 'warning',
	},
	{
		value: 3,
		label: '烹饪中',
		color: 'error',
	},
	{
		value: 4,
		label: '已完成',
		color: 'success',
	},
	{
		value: 5,
		label: '已取消',
		color: 'info',
	},
]

const ORDER_VIEW_TYPE = {
	KITCHEN: 0,
	MINE: 1,
}

const ORDER_ACTION_TYPE = {
	REJECT: 'reject',
	ACCEPT: 'accept',
	START_COOKING: 'startCooking',
	COMPLETE_COOKING: 'completeCooking',
	CANCEL: 'cancel',
	REORDER: 'reorder',
}

const ORDER_ACTIONS_BY_VIEW = {
	[ORDER_VIEW_TYPE.KITCHEN]: {
		1: [
			{ type: ORDER_ACTION_TYPE.REJECT, text: '拒绝接单', nextStatus: 5, confirmText: '确认拒绝这个订单吗？' },
			{ type: ORDER_ACTION_TYPE.ACCEPT, text: '开始接单', nextStatus: 2, primary: true, color: 'primary' },
		],
		2: [
			{ type: ORDER_ACTION_TYPE.CANCEL, text: '取消订单', nextStatus: 5, confirmText: '确认取消这个订单吗？' },
			{ type: ORDER_ACTION_TYPE.START_COOKING, text: '开始烹饪', nextStatus: 3, primary: true, color: 'warning' },
		],
		3: [
			{ type: ORDER_ACTION_TYPE.CANCEL, text: '取消订单', nextStatus: 5, confirmText: '确认取消这个订单吗？' },
			{ type: ORDER_ACTION_TYPE.COMPLETE_COOKING, text: '完成烹饪', nextStatus: 4, primary: true, color: 'error' },
		],
	},
	[ORDER_VIEW_TYPE.MINE]: {
		1: [
			{ type: ORDER_ACTION_TYPE.CANCEL, text: '取消订单', nextStatus: 5, confirmText: '确认取消这个订单吗？' },
		],
		2: [
			{ type: ORDER_ACTION_TYPE.CANCEL, text: '取消订单', nextStatus: 5, confirmText: '确认取消这个订单吗？' },
		],
		4: [
			{ type: ORDER_ACTION_TYPE.REORDER, text: '再来一单', primary: true, color: COLOURS['theme-color'] },
		],
		5: [
			{ type: ORDER_ACTION_TYPE.REORDER, text: '再来一单', primary: true, color: COLOURS['theme-color'] },
		],
	},
}

function getOrderActions(viewType, status) {
	const viewActions = ORDER_ACTIONS_BY_VIEW[Number(viewType)] || {}
	return viewActions[Number(status)] || []
}

// 反馈类型，取值与后端 FEEDBACK_TYPE 对齐，改动需两端同步
const FEEDBACK_TYPE = {
	BUG: 0,
	SUGGESTION: 1,
	OTHER: 2,
}

// 反馈类型展示信息，颜色对应原型里的三种标签配色
const FEEDBACK_TYPE_INFO = [
	{ value: FEEDBACK_TYPE.BUG, label: '问题反馈', color: '#FF5C8D', bgColor: '#FFF1F5' },
	{ value: FEEDBACK_TYPE.SUGGESTION, label: '功能建议', color: '#5B7CD6', bgColor: '#EEF3FF' },
	{ value: FEEDBACK_TYPE.OTHER, label: '其他', color: '#8B72C4', bgColor: '#F4F1FA' },
]

/**
 * 反馈工单状态，取值与后端 FEEDBACK_STATUS 对齐。
 * VERIFIED=1 当前流程不会产生：管理端「认证通过」是核实与发放同一个事务，直接 0 -> 3。
 * 保留这一位是为了和后端枚举逐位对应，用户端拿到历史数据时也能正常展示。
 */
const FEEDBACK_STATUS = {
	PENDING: 0,
	VERIFIED: 1,
	REJECTED: 2,
	REWARDED: 3,
}

// 反馈状态展示信息，REWARDED 对用户表述为「已处理」，避免用户端出现「补偿」这类内部口径
const FEEDBACK_STATUS_INFO = [
	{ value: FEEDBACK_STATUS.PENDING, label: '待处理', color: '#E6952B', bgColor: '#FFF4E6' },
	{ value: FEEDBACK_STATUS.VERIFIED, label: '已认证', color: '#22A45D', bgColor: '#E8F8EE' },
	{ value: FEEDBACK_STATUS.REJECTED, label: '已驳回', color: '#8B8F96', bgColor: '#F2F3F5' },
	{ value: FEEDBACK_STATUS.REWARDED, label: '已处理', color: '#22A45D', bgColor: '#E8F8EE' },
]

// 反馈提交规则，与后端 FEEDBACK_RULES 及 CreateFeedbackDto 校验保持一致
const FEEDBACK_RULES = {
	minContentLength: 5,
	maxContentLength: 2000,
	maxImages: 3,
	maxContactLength: 100,
}

// 补偿区间仅用于提交页告知规则；实际发放金额由后端按档位推导，前端不参与计算
const FEEDBACK_REWARD_RANGE = {
	min: 20,
	max: 100,
}

/**
 * @description: 获取反馈类型展示信息
 * @param {number} type 反馈类型，取值见 FEEDBACK_TYPE
 * @return {Object} 类型标签展示信息，未知类型回退到「其他」
 */
function getFeedbackTypeInfo(type) {
	return FEEDBACK_TYPE_INFO.find((item) => item.value === Number(type)) || FEEDBACK_TYPE_INFO[2]
}

/**
 * @description: 获取反馈状态展示信息
 * @param {number} status 工单状态，取值见 FEEDBACK_STATUS
 * @return {Object} 状态标签展示信息，未知状态回退到「待处理」
 */
function getFeedbackStatusInfo(status) {
	return FEEDBACK_STATUS_INFO.find((item) => item.value === Number(status)) || FEEDBACK_STATUS_INFO[0]
}

export {
	BASE_URL,
	APP_ID,
	TABBAR_DATA,
	COLOURS,
	ORDER_STATUS_INFO,
	ORDER_VIEW_TYPE,
	ORDER_ACTION_TYPE,
	ORDER_ACTIONS_BY_VIEW,
	getOrderActions,
	FEEDBACK_TYPE,
	FEEDBACK_TYPE_INFO,
	FEEDBACK_STATUS,
	FEEDBACK_STATUS_INFO,
	FEEDBACK_RULES,
	FEEDBACK_REWARD_RANGE,
	getFeedbackTypeInfo,
	getFeedbackStatusInfo
}
