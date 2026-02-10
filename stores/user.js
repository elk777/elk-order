/*
 * @Author: elk
 * @Date: 2025-09-05 15:24:16
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 16:03:56
 * @FilePath: /hkt-applet/stores/user.js
 * @Description: 用户信息状态管理
 */

import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore(
	"user",
	() => {
		const token = ref("elk"); //token信息
		const userType = ref(0); // 0 饲养员  1 吃货
		const profile = ref({
			avatar: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
			nickName: "星雾",
			uuId: "ko4k1ttv",
			gender: 0,
			userType: 0,
			binding: true, // 是否绑定另一半
		}); // 当前用户信息

		const setToken = (v) => (token.value = v);
		const setUserType = (v) => (userType.value = v);

		/**
		 * @description: 设置用户信息
		 * @param {*} v 新的用户信息对象
		 * @return {*}
		 */
		const setProfile = (v) => {
			console.log("🚀 ~ setProfile ~ v:", v);
			profile.value = { ...v };
			console.log("🚀 ~ setProfile ~ profile:", profile)
		};

		return { token, userType, profile, setToken, setUserType, setProfile };
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
