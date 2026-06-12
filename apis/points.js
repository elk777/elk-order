/*
 * @Author: elk
 * @Date: 2026-06-12
 * @FilePath: /hkt-applet/apis/points.js
 * @Description: 积分接口
 */

import http from '@/utils/request.js';

/**
 * @description: 获取当前用户积分账户
 * @return {Promise}
 */
export function getPointsAccount() {
	return http.get('/points/account');
}

/**
 * @description: 获取积分流水
 * @param {Object} params 查询参数
 * @return {Promise}
 */
export function getPointsRecords(params = {}) {
	return http.get('/points/records', params);
}

/**
 * @description: 每日签到领取积分
 * @return {Promise}
 */
export function checkinPoints() {
	return http.post('/points/checkin', {}, { loading: true });
}

/**
 * @description: 获取当前用户签到中心数据
 * @param {Object} params 查询参数
 * @return {Promise}
 */
export function getCheckinOverview(params = {}) {
	return http.get('/points/checkin/overview', params);
}

/**
 * @description: 提醒另一半签到
 * @return {Promise}
 */
export function remindPartnerCheckin() {
	return http.post('/points/checkin/remind', {}, { loading: true });
}
