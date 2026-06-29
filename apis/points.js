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
 * @description: 获取积分首页概览，包含账户、任务、兑换和亲密等级
 * @return {Promise}
 */
export function getPointsOverview() {
	return http.get('/points/overview');
}

/**
 * @description: 获取当前亲密等级概览
 * @return {Promise}
 */
export function getIntimacyOverview() {
	return http.get('/points/intimacy');
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
