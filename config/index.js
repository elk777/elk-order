/*
 * @Author: elk
 * @Date: 2025-07-19 16:45:55
 * @LastEditors: elk 
 * @LastEditTime: 2026-06-16 09:03:57
 * @FilePath: /hkt-applet/config/index.js
 * @Description: 整体基础配置
 */
// const BASE_URL = 'http://192.168.31.64:3000/api' // 局域网开发地址，支持真机调试
const BASE_URL = 'http://y326a263.natappfree.cc/api' // 内网穿透 7788

const APP_ID = 'wx49ecb7bac043ee73' // wx appid

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

export {
	BASE_URL,
	APP_ID,
	TABBAR_DATA,
	COLOURS,
	ORDER_STATUS_INFO,
	ORDER_VIEW_TYPE,
	ORDER_ACTION_TYPE,
	ORDER_ACTIONS_BY_VIEW,
	getOrderActions
}
