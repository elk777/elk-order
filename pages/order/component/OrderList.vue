<!--
 * @Author: elk
 * @Date: 2026-01-30 14:08:19
 * @LastEditors: elk
 * @LastEditTime: 2026-02-05 15:44:12
 * @FilePath: /hkt-applet/pages/order/component/OrderList.vue
 * @Description: 订单列表组件
-->
<template>
	<view class="order-list-container">
		<up-tabs
			v-model:current="orderStore.orderStatus"
			:lineColor="COLOURS['theme-color']"
			:list="ORDER_STATUS_INFO"
			keyName="label"
			@click="handleStatusChange"
			:scrollable="false"
		>
		</up-tabs>
		<scroll-view
			class="order-list-content"
			scroll-y
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="onLoadMore"
			:lower-threshold="100"
		>
			<view v-if="orderStore.filterOrderList.length > 0">
				<view v-for="order in orderStore.filterOrderList" :key="order.id">
					<OrderItem :order="order" />
				</view>
				<!-- 加载状态提示 -->
				<view class="load-more" v-if="orderStore.loading">
					<up-loading-icon mode="circle" :color="COLOURS['theme-color']"></up-loading-icon>
					<text style="margin-left: 10px; color: #999;">加载中...</text>
				</view>
				<view class="load-more" v-else-if="!hasMore && orderStore.orderList.length > 0">
					<text style="color: #999;">没有更多了</text>
				</view>
			</view>
			<view style="margin-top: 50%" v-else-if="!orderStore.loading">
				<up-empty text="暂无订单哦~" mode="order" textSize="16" iconSize="100" :iconColor="COLOURS['theme-color']">
				</up-empty>
			</view>
		</scroll-view>
	</view>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useOrderStore } from "@/stores/order";
import { COLOURS, ORDER_STATUS_INFO } from "@/config/index.js";
import OrderItem from "./OrderItem.vue";

const orderStore = useOrderStore();
const refreshing = ref(false); // 下拉刷新状态
const hasMore = ref(true); // 是否还有更多数据

/**
 * @description: 下拉刷新
 */
const onRefresh = async () => {
	refreshing.value = true;
	const result = await orderStore.getOrderList(true);
	hasMore.value = result.hasMore;
	refreshing.value = false;
};

/**
 * @description: 上拉加载更多
 */
const onLoadMore = async () => {
	if (!hasMore.value || orderStore.loading) return;
	const result = await orderStore.loadMore();
	hasMore.value = result.hasMore;
};

/**
 * @description: 切换订单状态筛选
 */
const handleStatusChange = async (status) => {
	orderStore.setOrderStatus(status);
	// 重新加载订单列表
	const result = await orderStore.getOrderList(true);
	hasMore.value = result.hasMore;
};

onMounted(async () => {
	// 组件初次加载时不需要再调用 getOrderList
	// 因为 OrderClassification 的 onMounted 中已经调用了 setOrderSort，会触发加载
});
</script>
<style lang="scss" scoped>
.order-list-container {
	width: 100%;
	margin-top: 10px;
	.order-list-content {
		width: 100%;
		height: calc(100vh - 300px);
		.load-more {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 20px 0;
		}
	}
}
</style>
