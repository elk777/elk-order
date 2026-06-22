/*
 * @Author: elk
 * @Date: 2026-06-11
 * @FilePath: /hkt-applet/apis/user.js
 * @Description: 用户资料接口
 */

import http from '@/utils/request.js'
import { uploadToUpyun } from '@/utils/upyunUpload.js'

/**
 * @description: 获取当前登录用户最新资料（用于刷新 store）
 * @return {Promise}
 */
export function getUserProfile() {
	return http.get('/users/me')
}

/**
 * @description: 更新当前登录用户资料
 * @param {Object} data 用户资料
 * @return {Promise}
 */
export function updateUserProfile(data) {
	return http.patch('/users/me', data, {
		loading: true,
	})
}

/**
 * @description: 上传当前登录用户头像
 * @param {string} filePath 本地头像路径
 * @return {Promise}
 */
export function uploadUserAvatar(filePath) {
	return uploadToUpyun({
		filePath,
		folder: 'avatar',
		mediaType: 'image',
		timeout: 30000,
	})
}
