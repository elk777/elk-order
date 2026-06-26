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
		<view class="order-status-card">
			<up-tabs
				v-model:current="orderStore.orderStatus"
				:lineColor="COLOURS['theme-color']"
				:lineWidth="28"
				:lineHeight="4"
				:list="ORDER_STATUS_INFO"
				keyName="label"
				@click="handleStatusChange"
				:scrollable="false"
			>
			</up-tabs>
		</view>
		<scroll-view
			class="order-list-content"
			scroll-y
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="onLoadMore"
			:lower-threshold="100"
		>
			<view v-if="orderStore.filterOrderList.length > 0" class="order-list-inner">
				<view v-for="order in orderStore.filterOrderList" :key="order.id" class="order-list-row">
					<OrderItem :order="order" />
				</view>
				<!-- 加载状态提示 -->
				<view class="load-more" v-if="orderStore.loading">
					<up-loading-icon mode="circle" :color="COLOURS['theme-color']"></up-loading-icon>
					<text>加载中...</text>
				</view>
				<view class="load-more" v-else-if="!orderStore.hasMore && orderStore.orderList.length > 0">
					<text>没有更多了</text>
				</view>
			</view>
			<view class="order-list-empty pubColumnFlex" v-else-if="!orderStore.loading">
				<view class="empty-icon pubFlex">
					<up-icon name="order" size="58" :color="COLOURS['theme-color']"></up-icon>
				</view>
				<view class="empty-title">暂无订单哦~</view>
				<view class="empty-desc">{{ emptyDesc }}</view>
			</view>
		</scroll-view>
	</view>
</template>
<script setup>
import { computed, ref, onMounted } from "vue";
import { useOrderStore } from "@/stores/order";
import { COLOURS, ORDER_STATUS_INFO } from "@/config/index.js";
import OrderItem from "./OrderItem.vue";

const orderStore = useOrderStore();
const refreshing = ref(false); // 下拉刷新状态
const emptyDesc = computed(() => {
	if (orderStore.selectedDate) {
		return "这一天还没有订单记录";
	}
	if (orderStore.orderStatus !== 0) {
		const status = ORDER_STATUS_INFO.find((item) => item.value === orderStore.orderStatus);
		return `${status?.label || "当前状态"}下还没有订单`;
	}
	return "新的投喂记录会显示在这里";
});

/**
 * @description: 下拉刷新
 */
const onRefresh = async () => {
	refreshing.value = true;
	try {
		await orderStore.getOrderList(true);
	} finally {
		refreshing.value = false;
	}
};

/**
 * @description: 上拉加载更多
 */
const onLoadMore = async () => {
	if (!orderStore.hasMore || orderStore.loading) return;
	await orderStore.loadMore();
};

/**
 * @description: 切换订单状态筛选
 */
const handleStatusChange = async (status) => {
	orderStore.setOrderStatus(status);
	// 重新加载订单列表
	await orderStore.getOrderList(true);
};

onMounted(async () => {
	// 组件初次加载时不需要再调用 getOrderList
	// 因为 OrderClassification 的 onMounted 中已经调用了 setOrderSort，会触发加载
});
</script>
<style lang="scss" scoped>
.order-list-container {
	width: 100%;
	box-sizing: border-box;
	margin-top: 18rpx;
}

.order-status-card {
	position: relative;
	z-index: 1;
	box-sizing: border-box;
	padding: 4rpx 6rpx 0;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 12rpx 28rpx rgba(31, 31, 31, 0.05);

	:deep(.u-tabs__wrapper__nav__item) {
		padding: 0 8rpx;
	}

	:deep(.u-tabs__wrapper__nav__item__text) {
		color: #5c5c5c;
		font-size: 27rpx;
		font-weight: 700;
	}

	:deep(.u-tabs__wrapper__nav__item-0 .u-tabs__wrapper__nav__item__text) {
		color: #252525;
	}
}

.order-list-content {
	width: 100%;
	height: calc(100vh - var(--order-navbar-height) - var(--order-bottom-space) - 310rpx);
	margin-top: 18rpx;
	box-sizing: border-box;
}

.order-list-inner {
	padding: 0 0 24rpx;
}

.order-list-row {
	margin-bottom: 18rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.load-more {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 26rpx 0 18rpx;
	color: #999999;
	font-size: 24rpx;

	text {
		margin-left: 10rpx;
	}
}

.order-list-empty {
	box-sizing: border-box;
	min-height: 56vh;
	align-items: center;
	justify-content: center;
	padding: 80rpx 44rpx 120rpx;
	text-align: center;
}

.empty-icon {
	width: 138rpx;
	height: 138rpx;
	margin-bottom: 28rpx;
	border-radius: 42rpx;
	background:
		linear-gradient(180deg, #fff5f8 0%, #ffffff 100%),
		#ffffff;
	box-shadow: 0 18rpx 38rpx rgba(255, 92, 141, 0.12);
}

.empty-title {
	color: #454545;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 42rpx;
}

.empty-desc {
	margin-top: 10rpx;
	color: #9a9a9a;
	font-size: 24rpx;
	line-height: 36rpx;
}
</style>
