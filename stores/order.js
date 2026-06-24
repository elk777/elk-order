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
import {
	getOrderList as getOrderListAPI,
	getOrderDetail as getOrderDetailAPI,
	updateOrderStatus as updateOrderStatusAPI,
	reorderOrder as reorderOrderAPI,
} from "@/api/orders.js";
import { withDefaultMediaUrl } from "@/utils/media.js";
import { DEFAULT_USER_AVATAR } from "@/utils/userDefaults.js";

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

		const normalizeOrderItem = (item = {}) => ({
			id: item.recipeId ?? item.id,
			name: item.recipeName || item.recipe?.name || "",
			cover: withDefaultMediaUrl(item.recipeCover || item.recipe?.cover, DEFAULT_USER_AVATAR),
			quantity: item.quantity || 1,
			price: item.price,
		});

		const normalizeOrder = (order = {}) => {
			const orderItems = Array.isArray(order.items) ? order.items : (Array.isArray(order.orderList) ? order.orderList : []);
			const foodie = order.foodie || {};
			const feeder = order.feeder || {};
			const displayUser = order.foodie || order.user || {};
			const displayOrderTime = order.displayOrderTime || order.orderTimeText || order.orderTime || order.createTimeText || order.createTime || "";

			return {
				...order,
				id: order.id,
				orderNo: order.orderNo || order.id,
				orderUser: order.orderUser || displayUser.nickName || displayUser.nickname || "",
				userAvatar: withDefaultMediaUrl(order.userAvatar || displayUser.avatar, DEFAULT_USER_AVATAR),
				foodieName: foodie.nickName || foodie.nickname || "",
				foodieAvatar: withDefaultMediaUrl(foodie.avatar, DEFAULT_USER_AVATAR),
				feederName: feeder.nickName || feeder.nickname || "",
				feederAvatar: withDefaultMediaUrl(feeder.avatar, DEFAULT_USER_AVATAR),
				orderList: orderItems.map(normalizeOrderItem),
				orderTime: displayOrderTime,
				rawOrderTime: order.orderTime || order.createTime || "",
				acceptTime: order.acceptTimeText || order.acceptTime || "",
				makingTime: order.makingTimeText || order.makingTime || "",
				completionTime: order.completionTimeText || order.completionTime || "",
				cancelTime: order.cancelTimeText || order.cancelTime || "",
			};
		};

		const updateLocalOrder = (order) => {
			const normalized = normalizeOrder(order);
			const index = orderList.value.findIndex((item) => String(item.id) === String(normalized.id));
			if (index >= 0) {
				orderList.value.splice(index, 1, normalized);
			}
			if (orderDetails.value && String(orderDetails.value.id) === String(normalized.id)) {
				orderDetails.value = normalized;
			}
			return normalized;
		};

		/**
		 * @description: 根据订单 ID 获取订单详情
		 * @param {*} id 订单 ID
		 * @return {*}
		 */
		async function getOrderById(id) {
			// 先从本地订单列表中查找
			const order = orderList.value.find((item) => String(item.id) === String(id));
			if (order) {
				const detail = normalizeOrder(order);
				orderDetails.value = detail;
				return detail;
			}

			const res = await getOrderDetailAPI(id);
			if (res.code === 200 && res.data) {
				const detail = normalizeOrder(res.data);
				orderDetails.value = detail;
				return detail;
			}
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
		 * @param {boolean} isRefresh - 是否刷新（重置页码）
		 * @return {*}
		 */
		const getOrderList = async (isRefresh = false) => {
			loading.value = true;
			try {
				// 如果是刷新，重置页码
				if (isRefresh) {
					page.value = 1;
				}

				const params = {
					sort: orderSort.value, // 0=饲养员视角（厨房订单）, 1=吃货视角（我的订单）
					status: orderStatus.value === 0 ? undefined : orderStatus.value, // 0=全部，不传status参数
					date: selectedDate.value || undefined,
					page: page.value,
					pageSize: 10,
				};

				const res = await getOrderListAPI(params);

				if (res.code === 200 && res.data) {
					const newList = (res.data.list || []).map(normalizeOrder);

					// 如果是刷新，替换列表；否则追加
					if (isRefresh || page.value === 1) {
						orderList.value = newList;
					} else {
						orderList.value = [...orderList.value, ...newList];
					}

					// 判断是否还有更多数据
					const hasMore = newList.length >= 10;

					return { success: true, hasMore };
				}

				return { success: false, hasMore: false };
			} catch (error) {
				errorMessage.value = error.message || "获取订单列表失败";
				console.error("获取订单列表失败:", error);
				return { success: false, hasMore: false };
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
			// 切换分类时重置状态筛选为全部
			orderStatus.value = 0;
			// 重新加载订单列表
			getOrderList(true);
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

		/**
		 * @description: 加载更多订单
		 * @return {*}
		 */
		const loadMore = async () => {
			if (loading.value) return { success: false, hasMore: false };
			page.value += 1;
			return await getOrderList(false);
		};

		const changeOrderStatus = async (id, nextStatus) => {
			const res = await updateOrderStatusAPI(id, nextStatus);
			if (res.code !== 200) {
				throw new Error(res.message || "订单状态更新失败");
			}
			return updateLocalOrder(res.data);
		};

		const reorderOrder = async (id) => {
			const res = await reorderOrderAPI(id);
			if (res.code !== 200) {
				throw new Error(res.message || "再来一单失败");
			}
			return res.data;
		};

		return {
			orderSort,
			orderStatus,
			dateShow,
			selectedDate,
			orderList,
			errorMessage,
			filterOrderList,
			orderDetails,
			page,
			loading,
			setOrderSort,
			setDateShow,
			getOrderList,
			loadMore,
			setOrderStatus,
			setSelectedDate,
			getOrderById,
			changeOrderStatus,
			reorderOrder,
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
