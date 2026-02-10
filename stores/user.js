/*
 * @Author: elk
 * @Date: 2025-09-05 15:24:16
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-09 17:44:13
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
			avatar: "https://img2.baidu.com/it/u=3422228222,2822228222&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
			nickName: "星雾",
			uuId: "ko4k1ttv",
			gender: 0,
			userType: 0,
			binding: false, // 是否绑定另一半
		}); // 当前用户信息

		const setToken = (v) => (token.value = v);
		const setUserType = (v) => (userType.value = v);
		const setProfile = (v) => (profile.value = v);

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
