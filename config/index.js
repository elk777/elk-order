/**
 * @Description: 整体基础配置
 * @Author: elk
 * @Date: 2025-07-19 16:59:02
 * @LastEditors: 
 * @LastEditTime: 2025-07-19 16:59:02
 */

const BASE_URL = 'https://5nmzg5443748.vicp.fun' // 本地渗透开发地址

const APP_ID = 'wx49ecb7bac043ee73' // wx appid

// 主题颜色组合
const COLOURS = {
	'theme-color': '#FF5C8D',
	'fu-color': '#FFF5F5',
	'inter-color': '#FF5C8D',
	'tinge-color': '#707070'
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
		pagePath: '/pages/souvv/index'
	},
	{
		id: 3,
		text: '我的',
		icon: '/static/images/tabbar_png/my.png',
		actIcon: '/static/images/tabbar_png/my_act.png',
		pagePath: '/pages/my/index'
	},
];

export {
	BASE_URL,
	APP_ID,
	TABBAR_DATA,
	COLOURS
}