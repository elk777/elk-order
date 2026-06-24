/*
 * @Author: elk
 * @Date: 2026-06-22
 * @FilePath: /hkt-applet/utils/upyunUpload.js
 * @Description: 又拍云前端直传工具
 */

import { getUpyunUploadSignature } from "@/apis/storage.js";
import { normalizeMediaUrl } from "@/utils/media.js";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "m4v", "webm"]);

const MIME_BY_EXTENSION = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
	gif: "image/gif",
	mp4: "video/mp4",
	mov: "video/quicktime",
	m4v: "video/mp4",
	webm: "video/webm",
};

/**
 * @description: 获取后端签名并将本地文件直传到又拍云
 * @param {Object} options 上传配置
 * @param {string} options.filePath 本地临时文件路径
 * @param {string} options.folder 后端允许的目录名
 * @param {string} [options.mediaType] image | video
 * @param {string} [options.originalName] 文件名
 * @param {string} [options.contentType] 文件 MIME
 * @param {number} [options.timeout] 上传超时时间
 * @return {Promise<{code: number, data: Object, message: string}>}
 */
export async function uploadToUpyun(options = {}) {
	const {
		filePath,
		folder = "files",
		mediaType = "",
		originalName,
		contentType,
		timeout = 60000,
	} = options;

	if (!filePath) {
		throw new Error("请选择要上传的文件");
	}

	const filename = originalName || resolveOriginalName(filePath, mediaType);
	const mimeType = contentType || resolveContentType(filename, mediaType);
	const fileData = await readFileAsArrayBuffer(filePath);
	const contentLength = resolveByteLength(fileData);
	const signatureRes = await getUpyunUploadSignature({
		folder,
		originalName: filename,
		contentType: mimeType,
		contentLength,
	});
	const signature = unwrapSignature(signatureRes);

	if (!signature?.uploadUrl || !signature?.publicUrl || !signature?.headers) {
		throw new Error("直传签名无效");
	}

	await putFileToUpyun({
		uploadUrl: signature.uploadUrl,
		headers: {
			...signature.headers,
			"Content-Type": mimeType,
		},
		fileData,
		timeout,
	});

	const publicUrl = normalizeMediaUrl(signature.publicUrl);

	return {
		code: 200,
		data: {
			url: publicUrl,
			path: signature.path,
			publicUrl,
			uploadUrl: signature.uploadUrl,
			driver: signature.driver,
		},
		message: "ok",
	};
}

function unwrapSignature(input = {}) {
	const data = input.data || input;
	return data.signature || data;
}

function putFileToUpyun({ uploadUrl, headers, fileData, timeout }) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: uploadUrl,
			method: "PUT",
			data: fileData,
			header: headers,
			timeout,
			success: (res) => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(res);
					return;
				}
				reject(new Error(resolveUploadErrorMessage(res)));
			},
			fail: (error) => {
				reject(new Error(error?.errMsg || "又拍云上传失败"));
			},
		});
	});
}

function readFileAsArrayBuffer(filePath) {
	const fileSystemManager = uni.getFileSystemManager?.();
	if (fileSystemManager?.readFile) {
		return new Promise((resolve, reject) => {
			fileSystemManager.readFile({
				filePath,
				success: (res) => resolve(res.data),
				fail: (error) => reject(new Error(error?.errMsg || "读取文件失败")),
			});
		});
	}

	return new Promise((resolve, reject) => {
		uni.request({
			url: filePath,
			method: "GET",
			responseType: "arraybuffer",
			success: (res) => {
				if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
					resolve(res.data);
					return;
				}
				reject(new Error("读取文件失败"));
			},
			fail: (error) => reject(new Error(error?.errMsg || "读取文件失败")),
		});
	});
}

function resolveOriginalName(filePath, mediaType) {
	const cleanPath = String(filePath).split("?")[0];
	const rawName = cleanPath.split("/").filter(Boolean).pop() || "";
	const decodedName = safeDecodeURIComponent(rawName);
	if (getExtension(decodedName)) return decodedName;

	const fallbackExt = mediaType === "video" ? "mp4" : "jpg";
	return `upload-${Date.now()}.${fallbackExt}`;
}

function resolveContentType(filename, mediaType) {
	const extension = getExtension(filename);
	if (MIME_BY_EXTENSION[extension]) return MIME_BY_EXTENSION[extension];
	if (mediaType === "video") return "video/mp4";
	if (mediaType === "image") return "image/jpeg";
	if (VIDEO_EXTENSIONS.has(extension)) return "video/mp4";
	if (IMAGE_EXTENSIONS.has(extension)) return "image/jpeg";
	return "application/octet-stream";
}

function getExtension(filename = "") {
	const cleanName = String(filename).split("?")[0].toLowerCase();
	const match = cleanName.match(/\.([a-z0-9]+)$/);
	return match?.[1] || "";
}

function resolveByteLength(fileData) {
	if (typeof fileData === "string") {
		return fileData.length;
	}
	if (fileData?.byteLength !== undefined) {
		return fileData.byteLength;
	}
	if (fileData?.length !== undefined) {
		return fileData.length;
	}
	return 0;
}

function safeDecodeURIComponent(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function resolveUploadErrorMessage(res = {}) {
	const data = res.data;
	if (typeof data === "string" && data) return data.slice(0, 80);
	if (data?.message) return data.message;
	if (data?.error) return data.error;
	return `又拍云上传失败(${res.statusCode || "unknown"})`;
}
