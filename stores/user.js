/*
 * @Author: elk
 * @Date: 2025-09-05 15:24:16
 * @LastEditors: elk
 * @LastEditTime: 2026-06-05 15:36:49
 * @FilePath: /hkt-applet/stores/user.js
 * @Description: 用户信息状态管理
 */

import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

const DEFAULT_PROFILE = {
	avatar: "",
	nickName: "",
	uuId: "",
	gender: null,
	userType: null,
	binding: false,
};

const MOCK_TOKENS = ["elk"];

export const useUserStore = defineStore(
	"user",
	() => {
		const token = ref(""); //token信息
		const userType = ref(null); // 0 饲养员  1 吃货
		const profile = ref({ ...DEFAULT_PROFILE }); // 当前用户信息

		const isLogin = computed(() => !!token.value); // 是否已登录

		/**
		 * @description: 设置登录 token
		 * @param {string} v token 值
		 * @return {void}
		 */
		const setToken = (v) => (token.value = v || "");
		const setUserType = (v) => (userType.value = v ?? null);

		/**
		 * @description: 清空登录态
		 * @return {void}
		 */
		const clearLogin = () => {
			token.value = "";
			userType.value = null;
			profile.value = { ...DEFAULT_PROFILE };
		};

		/**
		 * @description: 设置用户信息
		 * @param {*} v 新的用户信息对象
		 * @return {*}
		 */
		const setProfile = (v) => {
			profile.value = { ...DEFAULT_PROFILE, ...v };
			if (v?.userType !== undefined) {
				userType.value = v.userType;
			}
		};

		// 清理历史开发阶段写入的假 token，避免未登录时展示 mock 用户资料。
		watch(
			token,
			(v) => {
				if (!v || MOCK_TOKENS.includes(v)) {
					clearLogin();
				}
			},
			{ immediate: true },
		);

		return { token, isLogin, userType, profile, setToken, setUserType, setProfile, clearLogin };
	},
	{
		persist: {
			key: "user",
			storage: {
				getItem: (k) => uni.getStorageSync(k),
				setItem: (k, v) => uni.setStorageSync(k, v),
			},
		},
	},
);
