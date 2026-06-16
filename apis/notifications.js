/*
 * @Author: elk
 * @Date: 2026-06-15
 * @FilePath: /hkt-applet/apis/notifications.js
 * @Description: 消息通知与订阅设置接口
 */

import http from "@/utils/request.js";

export function getSubscriptionSettings() {
	return http.get("/notifications/subscription-settings");
}

export function saveSubscriptionSettings(data) {
	return http.put("/notifications/subscription-settings", data);
}
