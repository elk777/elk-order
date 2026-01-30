/*
 * @Author: elk
 * @Date: 2026-01-30 11:13:54
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-30 15:08:18
 * @FilePath: /hkt-applet/stores/order.js
 * @Description: 订单模块状态管理
 */
import { defineStore } from "pinia";
import { ref } from "vue";

export const useOrderStore = defineStore(
	"order",
	() => {
        // 订单分类组件当前选中项 0 厨房订单 1 我的订单
		const orderSort = ref(0);
        // 订单种类：0 全部 1 待接单 2 已接单 3 烹饪中 4 已完成 5 已取消
        const orderType = ref(0);
		/**
		 * @description: 设置订单分类组件当前选中项
		 * @param {*} index 选中项索引
		 * @return {*}
		 */
		function setCurrent(index) {
			current.value = index;
		}
		// 日期筛选组件是否显示
		const dateShow = ref(false);
		/**
		 * @description: 设置日期筛选组件是否显示
		 * @return {*}
		 */
		function setDateShow() {
			dateShow.value = !dateShow.value;
		}
		return { orderSort, orderType, dateShow, setCurrent, setDateShow };
	},
	{
		persist: {
			key: "order",
			storage: {
				getItem: (k) => uni.getStorageSync(k),
				setItem: (k, v) => uni.setStorageSync(k, v),
			},
		},
	}
);
