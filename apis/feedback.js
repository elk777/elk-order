/*
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/apis/feedback.js
 * @Description: 用户侧反馈工单接口
 */

import http from "@/utils/request.js";
import { uploadToUpyun } from "@/utils/upyunUpload.js";

/**
 * @description: 提交反馈工单
 * @param {Object} data 工单内容
 * @param {number} data.type 反馈类型，取值见 FEEDBACK_TYPE
 * @param {string} data.content 问题描述，5~2000 字
 * @param {string[]} [data.images] 截图 URL，最多 3 张，需为已上传完成的又拍云地址
 * @param {string} [data.contact] 联系方式，最长 100 字符
 * @return {Promise} 落库后的工单
 */
export function createFeedback(data) {
	return http.post("/feedback", data, { loading: true });
}

/**
 * @description: 获取我的反馈工单分页列表
 * @param {Object} params 分页参数
 * @param {number} [params.page] 页码，从 1 开始
 * @param {number} [params.pageSize] 每页条数
 * @return {Promise} { list, total, page, pageSize }
 */
export function getMyFeedbackList(params = {}) {
	return http.get("/feedback/mine", params);
}

/**
 * @description: 上传反馈截图
 * @param {string} filePath 本地临时文件路径
 * @return {Promise} 直传结果，data.url 为可提交的公网地址
 */
export function uploadFeedbackImage(filePath) {
	return uploadToUpyun({
		filePath,
		folder: "feedback",
		mediaType: "image",
		timeout: 30000,
	});
}
