/*
 * @Author: elk
 * @Date: 2026-06-08
 * @FilePath: /hkt-applet/apis/home/skin.js
 * @Description: 首页换肤接口契约
 */

import http from '@/utils/request.js'

/**
 * @description: 获取当前用户保存的首页壁纸
 * @return {Promise} 响应数据建议为 { id, name, type, url, thumb }
 */
export function getHomeSkin() {
	return http.get('/home/skin', {}, {
		loading: false,
		dedup: true,
	})
}

/**
 * @description: 保存当前用户首页壁纸选择
 * @param {Object} data 壁纸信息 { id, name, type, url, thumb }
 * @return {Promise}
 */
export function saveHomeSkin(data) {
	return http.post('/home/skin', data, {
		loading: false,
	})
}

/**
 * @description: 上传用户自定义首页壁纸
 * @param {string} filePath uni.chooseImage/chooseVideo 返回的本地文件路径
 * @param {string} mediaType image | video
 * @return {Promise} 响应数据建议为 { url, path, thumb, mediaType }
 */
export function uploadHomeSkin(filePath, mediaType = 'image') {
	return http.upload('/home/skin/upload', filePath, 'file', {
		scene: 'home_skin',
		mediaType,
	}, {
		loading: true,
		timeout: mediaType === 'video' ? 120000 : 30000,
	})
}
