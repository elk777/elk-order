<!--
 * @Author: elk
 * @Date: 2026-02-03 11:07:58
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-06 10:48:45
 * @FilePath: /hkt-applet/pages/order/component/OrderItem.vue
 * @Description: 订单项组件
-->
<template>
	<view class="order-card" @tap="handleClickOrder">
		<view class="order-card-accent"></view>
		<view class="order-header-container">
			<view class="order-header-left">
				<view class="order-avatar-wrap">
					<up-image
						width="44"
						height="44"
						shape="circle"
						:src="order.userAvatar"
						mode="aspectFill"
						class="order-avatar"
					></up-image>
				</view>
				<view :style="{ color: COLOURS['theme-color'] }" class="order-user-name font-weight-600">{{
					order.orderUser || "匿名吃货"
				}}</view>
				<view v-if="order.orderNo" class="order-no">#{{ order.orderNo }}</view>
			</view>
			<OrderStatus :status="order.orderStatus" />
		</view>

		<view class="order-body-container">
			<view class="order-dishes-panel">
				<CateList :imageSize="52" :cateList="order.orderList" readonly></CateList>
			</view>
			<view class="order-remark-panel">
				<OrderRemark :remark="order.remark" />
			</view>
		</view>

		<view class="order-footer-container">
			<view class="order-footer-left">
				{{ order.orderTime }}
			</view>
			<view class="order-actions">
				<OrderButton :order-id="order.id" :status="order.orderStatus" :view-type="orderStore.orderSort" />
			</view>
		</view>
	</view>
</template>
<script setup>
import { COLOURS } from "@/config/index.js";
import { useOrderStore } from "@/stores/order.js";
import CateList from "@/components/CateList/index.vue";
import OrderRemark from "./OrderRemark.vue";
import OrderButton from "./OrderButton.vue";
import OrderStatus from "./OrderStatus.vue";

const orderStore = useOrderStore();

const props = defineProps({
	order: {
		type: Object,
		required: true,
	},
});

/**
 * @description: 点击订单项事件
 * @return {*}
 */
const handleClickOrder = () => {
	uni.navigateTo({
		url: "/pages/order/details?id=" + props.order.id,
	});
};


</script>
<style lang="scss" scoped>
.order-card {
	position: relative;
	overflow: hidden;
	box-sizing: border-box;
	margin: 0;
	border-radius: 28rpx;
	background: #ffffff;
	border: 1rpx solid rgba(255, 92, 141, 0.1);
	box-shadow: 0 14rpx 34rpx rgba(31, 31, 31, 0.07);
}

.order-card-accent {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 8rpx;
	background: linear-gradient(90deg, #ff5c8d, rgba(255, 182, 202, 0.46));
}

.order-header-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 24rpx 22rpx;
	background: linear-gradient(135deg, #fff7fa 0%, #ffffff 72%);
}

.order-header-left {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	margin-right: 16rpx;
}

.order-avatar-wrap {
	flex-shrink: 0;
	padding: 4rpx;
	border-radius: 50%;
	background: #ffffff;
	box-shadow: 0 8rpx 20rpx rgba(255, 92, 141, 0.14);
}

.order-user-name {
	margin-left: 18rpx;
	font-size: 30rpx;
	line-height: 1.3;
	max-width: 260rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.order-no {
	max-width: 150rpx;
	flex-shrink: 1;
	margin-left: 12rpx;
	padding: 4rpx 12rpx;
	overflow: hidden;
	border-radius: 999rpx;
	background: rgba(255, 92, 141, 0.08);
	color: #9a9a9a;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.order-header-container :deep(.order-status-container) {
	flex-shrink: 0;
	padding: 8rpx 18rpx;
	font-size: 26rpx;
	line-height: 1.25;
}

.order-body-container {
	padding: 0 22rpx 18rpx;
}

.order-dishes-panel {
	padding: 18rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
	background: #ffffff;
}

.order-dishes-panel :deep(.cate-list-container:last-child .cate-list-item) {
	margin-bottom: 0;
}

.order-dishes-panel :deep(.cate-list-item) {
	align-items: center;
}

.order-dishes-panel :deep(.item-left-content) {
	margin-left: 18rpx;
}

.order-dishes-panel :deep(.cate-list-item-name) {
	font-size: 30rpx;
	line-height: 1.35;
	font-weight: 700;
	color: #303030;
}

.order-dishes-panel :deep(.quantity-display) {
	margin-top: 8rpx;
	font-size: 26rpx;
	color: #7d7d7d;
}

.order-remark-panel {
	margin-top: 2rpx;
	border-radius: 20rpx;
	background: #fff7fa;
}

.order-remark-panel :deep(.order-remark-container) {
	padding: 16rpx 18rpx;
	align-items: flex-start;
}

.order-remark-panel :deep(.order-remark-title) {
	flex-shrink: 0;
	font-size: 27rpx;
	line-height: 1.45;
	color: #555555;
}

.order-remark-panel :deep(.order-remark-content) {
	margin-left: 16rpx;
	font-size: 27rpx;
	line-height: 1.45;
	font-weight: 600;
	word-break: break-word;
}

.order-footer-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 22rpx 22rpx;
	background: #ffffff;
}

.order-footer-left {
	flex: 1;
	min-width: 0;
	font-size: 26rpx;
	line-height: 1.4;
	color: #9b9b9b;
	font-weight: 600;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.order-actions {
	flex-shrink: 0;
	margin-left: 20rpx;
}

.order-actions :deep(.order-button-item) {
	width: 104px;
}

.order-actions :deep(.u-button) {
	height: 64rpx;
	font-size: 24rpx;
	font-weight: 600;
}
</style>
