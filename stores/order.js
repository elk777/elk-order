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
			console.log("🚀 ~ setOrderStatus ~ status:", status);
			orderStatus.value = status.value;
		}
		/**
		 * @description: 设置日期
		 * @return {*}
		 */
		function setSelectedDate(date) {
			console.log("🚀 ~ setSelectedDate ~ date:", date);
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
				// 调用后端获取订单列表接口
				const res = new Promise((resolve, reject) => {
					return resolve({
						code: 200,
						data: {
							list: [],
						},
					});
				});
				// 更新本地订单列表
				// orderList.value = res.data.list;
				orderList.value = [
					{
						id: 1,
						orderUser: "用户1",
						userAvatar: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
						orderStatus: 1,
						orderList: [
							{
								id: 1,
								name: "西红柿炒蛋",
								quantity: 2,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
							{
								id: 2,
								name: "红烧肉",
								quantity: 1,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
						],
						orderTime: "2026-02-03 10:00:00",
						makingTime: null,
						completionTime: null,
						remark: "不吃葱~~~",
					},
					{
						id: 2,
						orderUser: "用户2",
						userAvatar: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
						orderStatus: 2,
						orderList: [
							{
								id: 1,
								name: "西红柿炒蛋",
								quantity: 2,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
							{
								id: 2,
								name: "红烧肉",
								quantity: 1,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
						],
						orderTime: "2026-02-03 10:00:00",
						makingTime: "2026-02-03 11:05:00",
						completionTime: "2026-02-03 12:07:00",
						remark: "不吃蒜~~~",
					},
					{
						id: 3,
						orderUser: "用户3",
						userAvatar: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
						orderStatus: 3,
						orderList: [
							{
								id: 1,
								name: "西红柿炒蛋",
								quantity: 2,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
							{
								id: 2,
								name: "红烧肉",
								quantity: 1,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
						],
						orderTime: "2026-02-03 10:00:00",
						makingTime: "2026-02-03 11:05:00",
						completionTime: "2026-02-03 12:07:00",
						remark: "不吃蒜~~~",
					},
					{
						id: 4,
						orderUser: "用户4",
						userAvatar: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
						orderStatus: 4,
						orderList: [
							{
								id: 1,
								name: "西红柿炒蛋",
								quantity: 2,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
							{
								id: 2,
								name: "红烧肉",
								quantity: 1,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
						],
						orderTime: "2026-02-03 10:00:00",
						makingTime: "2026-02-03 11:05:00",
						completionTime: "2026-02-03 12:07:00",
						remark: "不吃蒜~~~",
					},
					{
						id: 5,
						orderUser: "用户5",
						userAvatar: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
						orderStatus: 5,
						orderList: [
							{
								id: 1,
								name: "西红柿炒蛋",
								quantity: 2,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
							{
								id: 2,
								name: "红烧肉",
								quantity: 1,
								cover: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
							},
						],
						orderTime: "2026-02-03 10:00:00",
						makingTime: "2026-02-03 11:05:00",
						completionTime: "2026-02-03 12:07:00",
						remark: "不吃蒜~~~",
					},
				];

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
			console.log("🚀 ~ setOrderSort ~ index:", index);
			orderSort.value = index;
		}

		/**
		 * @description: 设置日期筛选组件是否显示
		 * @return {*}
		 */
		function setDateShow() {
			dateShow.value = !dateShow.value;
		}

		return {
			orderSort,
			orderStatus,
			dateShow,
			selectedDate,
			orderList,
			filterOrderList,
			orderDetails,
			setOrderSort,
			setDateShow,
			getOrderList,
			setOrderStatus,
			setSelectedDate,
			getOrderById,
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
