/*
 * @Author: elk
 * @Date: 2025-07-19 16:45:55
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-04 15:33:59
 * @FilePath: /hkt-applet/config/index.js
 * @Description: 整体基础配置
 */
const BASE_URL = 'https://5nmzg5443748.vicp.fun' // 本地渗透开发地址

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
		submit: '开始接单',
		close: '拒绝接单',
	},
	{
		value: 2,
		label: '已接单',
		color: 'warning',
		submit: '开始烹饪',
		close: '取消订单',
	},
	{
		value: 3,
		label: '烹饪中',
		color: 'error',
		submit: '完成烹饪',
		close: '取消订单',
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

export {
	BASE_URL,
	APP_ID,
	TABBAR_DATA,
	COLOURS,
	ORDER_STATUS_INFO
}