/*
 * @Author: elk
 * @Date: 2026-06-22
 * @FilePath: /hkt-applet/apis/storage.js
 * @Description: 文件存储接口
 */

import http from "@/utils/request.js";

/**
 * @description: 获取又拍云前端直传签名
 * @param {Object} data 签名参数
 * @param {string} data.folder 上传目录 avatar | recipes | wallpaper | feedback | files
 * @param {string} data.originalName 原始文件名
 * @param {string} [data.contentType] 文件 MIME
 * @param {number} [data.contentLength] 文件字节数
 * @param {string} [data.contentMd5] 文件 MD5
 * @return {Promise}
 */
export function getUpyunUploadSignature(data) {
	return http.post("/storage/upyun/signature", data, {
		loading: false,
		auth: true,
	});
}
