/*
 * @Author: elk
 * @Date: 2026-01-30 11:13:54
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-04 16:48:14
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

		/**
		 * @description: 根据当前状态过滤订单列表
		 * @return {*}
		 */
		const filterOrderList = computed(() => {
			if (orderStatus.value === 0) {
				return orderList.value;
			}
			return orderList.value.filter((item) => item.orderStatus === orderStatus.value);
		});

		/**
		 * @description: 切换状态
		 * @return {*}
		 */
		function setOrderStatus(status) {
			console.log("🚀 ~ setOrderStatus ~ status:", status)
			orderStatus.value = status.value;
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
						makingTime: "2026-02-03 11:05:00",
						completionTime: "2026-02-03 12:07:00",
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

		return {
			orderSort,
			orderStatus,
			dateShow,
			filterOrderList,
			setCurrent,
			setDateShow,
			getOrderList,
			setOrderStatus,
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
