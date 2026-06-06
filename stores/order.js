/*
 * @Author: elk
 * @Date: 2026-01-30 11:13:54
 * @LastEditors: elk
 * @LastEditTime: 2026-02-05 17:02:19
 * @FilePath: /hkt-applet/stores/order.js
 * @Description: 订单模块状态管理
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useOrderStore = defineStore(
	"order",
	() => {
		// 订单分类组件当前选中项 0 厨房订单 1 我的订单
		const orderSort = ref(0);
		// 订单种类：0 全部 1 待接单 2 已接单 3 烹饪中 4 已完成 5 已取消
		const orderStatus = ref(0);
		// 页码
		const page = ref(1);
		// 加载中
		const loading = ref(false);
		// 错误信息
		const errorMessage = ref("");

		// 订单列表
		const orderList = ref([]);

		// 日期筛选组件是否显示
		const dateShow = ref(false);
		// 日期筛选组件选中日期
		const selectedDate = ref("");

		// 订单详情
		const orderDetails = ref(null);

		/**
		 * @description: 根据订单 ID 获取订单详情
		 * @param {*} id 订单 ID
		 * @return {*}
		 */
		function getOrderById(id) {
			// 先从本地订单列表中查找
			const order = orderList.value.find((item) => item.id === parseInt(id));
			if (order) {
				orderDetails.value = order;
				return order;
			}
			// 如果本地没有，从后端获取
			// 这里可以添加后端接口调用逻辑
			return null;
		};

		/**
		 * @description: 根据当前状态过滤订单列表
		 * @return {*}
		 */
		const filterOrderList = computed(() => {
			if (selectedDate.value) {
				return orderList.value.filter((item) => item.orderTime.includes(selectedDate.value));
			}
			if (orderStatus.value !== 0) {
				return orderList.value.filter((item) => item.orderStatus === orderStatus.value);
			}
			return orderList.value;
		});

		/**
		 * @description: 切换状态
		 * @return {*}
		 */
		function setOrderStatus(status) {
			orderStatus.value = status.value;
		}
		/**
		 * @description: 设置日期
		 * @return {*}
		 */
		function setSelectedDate(date) {
			selectedDate.value = date;
		}
		/**
		 * @description: 获取订单列表
		 * @return {*}
		 */
		const getOrderList = async (isRefresh = false) => {
			loading.value = true;
			try {
				const params = {
					sort: orderSort.value,
					status: orderStatus.value,
					page: isRefresh ? 1 : page.value,
					pageSize: 10,
				};
				// 后续联调后端时替换为真实订单列表接口。
				const res = await Promise.resolve({
					code: 200,
					data: {
						list: [],
					},
				});
				orderList.value = res.data?.list || [];

				return res;
			} catch (error) {
				errorMessage.value = error.message || "获取订单列表失败";
				console.error("获取订单列表失败:", error);
			} finally {
				loading.value = false;
			}
		};

		/**
		 * @description: 设置订单分类组件当前选中项
		 * @param {*} index 选中项索引
		 * @return {*}
		 */
		function setOrderSort(index) {
			orderSort.value = index;
		}

		/**
		 * @description: 设置日期筛选组件是否显示
		 * @return {*}
		 */
		function setDateShow() {
			dateShow.value = !dateShow.value;
		}

		/**
		 * @description: 重置订单模块状态
		 * @return {void}
		 */
		function resetOrderState() {
			orderSort.value = 0;
			orderStatus.value = 0;
			page.value = 1;
			loading.value = false;
			orderList.value = [];
			dateShow.value = false;
			selectedDate.value = "";
			orderDetails.value = null;
			errorMessage.value = "";
		}

		return {
			orderSort,
			orderStatus,
			dateShow,
			selectedDate,
			orderList,
			errorMessage,
			filterOrderList,
			orderDetails,
			setOrderSort,
			setDateShow,
			getOrderList,
			setOrderStatus,
			setSelectedDate,
			getOrderById,
			resetOrderState,
		};
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
