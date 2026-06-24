/*
 * @Author: elk
 * @Date: 2026-06-24
 * @FilePath: /hkt-applet/utils/media.js
 * @Description: 媒体资源地址处理工具
 */

const LOCAL_PROTOCOL_RE = /^(wxfile|file|blob|data):/i;
const HTTP_RE = /^http:\/\//i;
const PROTOCOL_RELATIVE_RE = /^\/\//;
const HOST_RE = /^https?:\/\/([^/:?#]+)/i;

/**
 * @description: 规范化图片/视频资源 URL，兼容微信小程序远程图片 HTTPS 要求。
 * @param {string} value 资源地址
 * @param {string} fallback 兜底资源
 * @return {string}
 */
export function normalizeMediaUrl(value, fallback = "") {
	const raw = typeof value === "string" ? value.trim() : "";
	if (!raw) return fallback;

	if (isLocalMediaUrl(raw)) return raw;
	if (PROTOCOL_RELATIVE_RE.test(raw)) return `https:${raw}`;
	if (HTTP_RE.test(raw) && shouldUpgradeToHttps(raw)) {
		return raw.replace(HTTP_RE, "https://");
	}

	return raw;
}

/**
 * @description: 规范化媒体 URL 并提供兜底图。
 * @param {string} value 资源地址
 * @param {string} fallback 兜底资源
 * @return {string}
 */
export function withDefaultMediaUrl(value, fallback) {
	return normalizeMediaUrl(value) || fallback;
}

function isLocalMediaUrl(value) {
	return (
		value.startsWith("/") ||
		value.startsWith("./") ||
		value.startsWith("../") ||
		LOCAL_PROTOCOL_RE.test(value)
	);
}

function shouldUpgradeToHttps(value) {
	const host = getHost(value);
	if (!host) return false;
	return !isLocalHost(host);
}

function getHost(value) {
	const match = String(value).match(HOST_RE);
	return match?.[1]?.toLowerCase() || "";
}

function isLocalHost(host) {
	return (
		!host.includes(".") ||
		host === "localhost" ||
		host === "127.0.0.1" ||
		host === "::1" ||
		host.startsWith("127.") ||
		host.startsWith("10.") ||
		host.startsWith("192.168.") ||
		/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
	);
}
