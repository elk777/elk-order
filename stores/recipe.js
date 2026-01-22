/*
 * @Author: elk
 * @Date: 2026-01-22 16:23:29
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-22 16:49:51
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

		const setCartList = (v) => (cartList.value = v);
		const setCartTotal = (v) => (cartTotal.value = v);
		const setCateTotal = (v) => (cateTotal.value = v);

		return { cartList, cartTotal, cateTotal, setCartList, setCartTotal, setCateTotal };
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
