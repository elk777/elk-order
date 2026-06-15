/*
 * @Author: elk
 * @Date: 2026-06-11
 * @FilePath: /hkt-applet/apis/couples.js
 * @Description: 情侣绑定接口
 */

import http from '@/utils/request.js'

/**
 * @description: 查询当前用户的有效绑定关系
 * @return {Promise}
 */
export function getActiveCouple() {
	return http.get('/couples/active')
}

/**
 * @description: 通过邀请码绑定对方
 * @param {string} uuid 邀请人邀请码
 * @return {Promise}
 */
export function bindCouple(uuid) {
	return http.post('/couples/bind', { uuid })
}

/**
 * @description: 解除当前用户的有效绑定关系
 * @return {Promise}
 */
export function unbindCouple() {
	return http.del('/couples/active', {}, {
		loading: true,
	})
}
