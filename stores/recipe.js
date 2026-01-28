/*
 * @Author: elk
 * @Date: 2026-01-22 16:23:29
 * @LastEditors: elk
 * @LastEditTime: 2026-01-27 10:17:33
 * @FilePath: /hkt-applet/stores/recipe.js
 * @Description: 菜谱-购物车-状态管理
 */
import { defineStore } from "pinia";
import { ref } from "vue";

export const useRecipeStore = defineStore(
	"recipe",
	() => {
		const cartList = ref([]); // 购物车列表
		const cartTotal = ref(0); // 购物车总数量

		const cateTotal = ref(0); // 菜谱总数量

		const errorMessage = ref(""); // 错误信息
		/**
		 * @description: 获取指定商品在购物车中的数量
		 * @param {*} productId 商品ID
		 * @return {*} 商品数量
		 */
		const getCartQuantity = (productId) => {
			const item = cartList.value.find((item) => item.id === productId);
			return item ? item.quantity : 0;
		};

		/**
		 * @description: 设置购物车列表
		 * @param {*} v
		 * @return {*}
		 */
		const setCartList = (v) => (cartList.value = v);
		/**
		 * @description: 设置购物车总数量
		 * @param {*} v
		 * @return {*}
		 */
		const setCartTotal = (v) => (cartTotal.value = v);
		/**
		 * @description: 设置菜谱总数量
		 * @param {*} v
		 * @return {*}
		 */
		const setCateTotal = (v) => (cateTotal.value = v);

		/**
		 * @description: 新增购物车
		 * @return {*}
		 */
		const addCart = (product) => {
			try {
				// 调用后端新增购物车接口
				const res = new Promise((resolve, reject) => {
					return resolve({
						code: 200,
						data: {
							id: product.id,
							quantity: 1,
						},
					});
				});
				// 更新本地购物车列表
				const existingItem = cartList.value.find((item) => item.id === product.id);
				if (existingItem) {
					// 商品已存在，增加数量
					existingItem.quantity += 1;
				} else {
					// 新商品，添加到购物车
					cartList.value.push({
						...product,
						quantity: 1,
					});
				}
				// 更新购物车总数量
				cartTotal.value = cartList.value.reduce((total, item) => total + item.quantity, 0);
				return res;
			} catch (error) {
				errorMessage.value = error.message || "新增购物车失败";
				console.error("新增购物车失败:", error);
			}
		};

		/**
		 * @description: 删除购物车
		 * @param {*} productId 商品ID
		 * @return {*}
		 */
		const deleteCart = (productId) => {
			try {
				// 调用后端删除购物车接口
				const res = new Promise((resolve, reject) => {
					return resolve({
						code: 200,
						data: {
							id: productId,
						},
					});
				});
				// 更新本地购物车列表
				cartList.value = cartList.value.filter((item) => item.id !== productId);
				// 更新购物车总数量
				cartTotal.value = cartList.value.reduce((total, item) => total + item.quantity, 0);
				return res;
			} catch (error) {
				errorMessage.value = error.message || "删除购物车失败";
				console.error("删除购物车失败:", error);
			}
		};

		/**
		 * @description: 清空购物车
		 * @return {*}
		 */
		const clearCart = () => {
			try {
				// 调用后端清空购物车接口
				const res = new Promise((resolve, reject) => {
					return resolve({
						code: 200,
						data: {},
					});
				});
				// 清空本地购物车列表
				cartList.value = [];
				// 购物车总数量设为0
				cartTotal.value = 0;
				return res;
			} catch (error) {
				errorMessage.value = error.message || "清空购物车失败";
				console.error("清空购物车失败:", error);
			}
		};

		return {
			cartList,
			cartTotal,
			cateTotal,
			getCartQuantity,
			setCartList,
			setCartTotal,
			setCateTotal,
			addCart,
			deleteCart,
			clearCart,
		};
	},
	{
		persist: {
			key: "recipe",
			storage: {
				getItem: (k) => uni.getStorageSync(k),
				setItem: (k, v) => uni.setStorageSync(k, v),
			},
		},
	}
);
