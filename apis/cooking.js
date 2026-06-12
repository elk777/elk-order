/*
 * @Author: elk
 * @Date: 2026-06-13
 * @FilePath: /hkt-applet/apis/cooking.js
 * @Description: 烹饪日历接口
 */

import http from '@/utils/request.js';

/**
 * @description: 获取烹饪日历概览
 * @param {Object} params { year, month }
 * @return {Promise}
 */
export function getCookingCalendarOverview(params = {}) {
	return http.get('/cooking/calendar/overview', params);
}

/**
 * @description: 获取某天的烹饪详情
 * @param {Object} params { date: 'YYYY-MM-DD' }
 * @return {Promise}
 */
export function getCookingDayDetail(params = {}) {
	return http.get('/cooking/calendar/day', params);
}
