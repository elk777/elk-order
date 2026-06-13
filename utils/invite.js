/*
 * @Author: elk
 * @Date: 2026-06-11
 * @FilePath: /hkt-applet/utils/invite.js
 * @Description: 邀请绑定工具：暂存邀请码并在登录后触发相互绑定
 */

import { bindCouple } from "@/apis/couples.js";
import { getUserProfile } from "@/apis/user.js";
import { useUserStore } from "@/stores/user.js";

// 分享链接携带的邀请码 query 参数名
export const INVITE_QUERY_KEY = "inviteUid";
// 待处理邀请码的本地存储键名
const PENDING_INVITE_KEY = "PENDING_INVITE_UID";

// 防止登录态与 onShow 同时触发导致的重复绑定请求。
let consuming = false;

/**
 * @description: 构建情侣邀请分享卡片，首页和我的页保持同一套邀请文案与路径。
 * @param {Object} options 邀请参数
 * @param {string} options.uuid 当前用户公开邀请码
 * @param {number|null} options.userType 当前用户身份：0 饲养员，1 吃货
 * @param {string} options.targetRole 目标身份：keeper/foodie
 * @return {{title: string, path: string}} 分享卡片配置
 */
export const buildInviteShareMessage = ({ uuid = "", userType = null, targetRole = "" } = {}) => {
	const role = targetRole || (userType === 1 ? "keeper" : "foodie");
	const title = role === "keeper" ? "来当我的饲养员，负责今天吃啥～" : "来做我的小吃货，今天我请你吃饭～";
	return {
		title,
		path: `/pages/home/index?${INVITE_QUERY_KEY}=${uuid}`,
	};
};

/**
 * @description: 从页面启动参数中提取并暂存邀请码
 * @param {Object} options 小程序启动参数（含 query）
 * @return {string} 捕获到的邀请码，未捕获返回空串
 */
export const captureInvite = (options = {}) => {
	const query = options.query || options;
	const inviteUid = query?.[INVITE_QUERY_KEY];
	if (!inviteUid) {
		return "";
	}

	uni.setStorageSync(PENDING_INVITE_KEY, inviteUid);
	return inviteUid;
};

/**
 * @description: 读取暂存的待处理邀请码
 * @return {string} 邀请码，无则返回空串
 */
export const getPendingInvite = () => uni.getStorageSync(PENDING_INVITE_KEY) || "";

/**
 * @description: 清除暂存的邀请码
 * @return {void}
 */
export const clearPendingInvite = () => uni.removeStorageSync(PENDING_INVITE_KEY);

/**
 * @description: 消费待处理邀请码，登录后调用绑定接口完成相互绑定
 * @return {Promise<boolean>} 是否成功完成绑定
 */
export const consumePendingInvite = async () => {
	const userStore = useUserStore();
	const inviteUid = getPendingInvite();

	// 未登录或无待处理邀请码时不处理；邀请码留待登录后再消费。
	if (!userStore.isLogin || !inviteUid) {
		return false;
	}

	// 已绑定则丢弃邀请码，避免对已绑定用户反复请求。
	if (userStore.profile.binding) {
		clearPendingInvite();
		return false;
	}

	// 邀请人点击自己分享的卡片时跳过，避免无谓的“不能绑定自己”请求。
	if (inviteUid === userStore.profile.uuid) {
		clearPendingInvite();
		return false;
	}

	if (consuming) {
		return false;
	}

	consuming = true;
	try {
		// 请求层对业务错误码（code !== 200）是正常 resolve，需显式判 code 而非依赖 throw。
		const res = await bindCouple(inviteUid);
		if (res?.code !== 200) {
			// 透传后端中文错误消息（如“对方已绑定”“不能绑定自己”）。
			clearPendingInvite();
			uni.showToast({
				title: res?.message || "绑定失败",
				icon: "none",
			});
			return false;
		}

		// 绑定成功后刷新用户资料，确保所有字段同步最新状态。
		clearPendingInvite();
		try {
			const profileRes = await getUserProfile();
			if (profileRes?.code === 200 && profileRes?.data) {
				userStore.setProfile(profileRes.data);
			} else {
				// API 刷新失败时，手动更新 binding 状态作为降级方案。
				userStore.setProfile({ ...userStore.profile, binding: true });
			}
		} catch (error) {
			console.warn("绑定成功但刷新资料失败，手动同步 binding 状态:", error);
			userStore.setProfile({ ...userStore.profile, binding: true });
		}
		uni.showToast({
			title: "绑定成功",
			icon: "success",
		});
		return true;
	} catch (error) {
		// 仅网络/超时等异常会进入此分支。
		clearPendingInvite();
		uni.showToast({
			title: error?.message || "绑定失败",
			icon: "none",
		});
		return false;
	} finally {
		consuming = false;
	}
};
