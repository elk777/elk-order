<template>
	<view class="order-details-container">
		<up-loading-page v-if="loading" />

		<scroll-view v-else-if="orderDetails" class="order-scroll" scroll-y>
			<view class="detail-hero">
				<view class="hero-main">
					<view class="hero-kicker">订单进度</view>
					<view class="hero-title">{{ statusLabel }}</view>
					<view class="hero-time">{{ orderDetails.orderTime || "时间待同步" }}</view>
				</view>
				<view class="hero-status">
					<OrderStatus :status="orderDetails.orderStatus" />
				</view>
			</view>

			<view class="detail-section progress-section">
				<view class="section-head">
					<view class="section-icon">
						<up-icon name="clock-fill" size="17" color="#ffffff" />
					</view>
					<view>
						<view class="section-title">制作进度</view>
						<view class="section-subtitle">{{ progressSubtitle }}</view>
					</view>
				</view>
				<view class="timeline">
					<view
						v-for="(item, index) in progressItems"
						:key="item.key"
						class="timeline-item"
						:class="[`timeline-item--${item.state}`]"
					>
						<view class="timeline-rail">
							<view class="timeline-dot">
								<up-icon v-if="item.state === 'done'" name="checkmark" size="12" color="#ffffff" />
							</view>
							<view v-if="index < progressItems.length - 1" class="timeline-line"></view>
						</view>
						<view class="timeline-content">
							<view class="timeline-title">{{ item.title }}</view>
							<view class="timeline-desc">{{ item.desc }}</view>
						</view>
					</view>
				</view>
			</view>

			<view class="detail-section">
				<view class="section-head">
					<view class="section-icon section-icon--teal">
						<up-icon name="order" size="17" color="#ffffff" />
					</view>
					<view>
						<view class="section-title">订单信息</view>
						<view class="section-subtitle">这份投喂的小纸条</view>
					</view>
				</view>

				<view class="info-grid">
					<view class="info-cell">
						<view class="info-label">订单编号</view>
						<view class="info-value">#{{ orderDetails.orderNo || orderDetails.id }}</view>
					</view>
					<view class="info-cell">
						<view class="info-label">菜品数量</view>
						<view class="info-value">{{ recipeCount }} 道</view>
					</view>
				</view>

				<view class="info-row user-row">
					<view class="info-row-label">下单用户</view>
					<view class="user-info">
						<up-image
							:src="orderDetails.userAvatar"
							mode="aspectFill"
							width="42"
							height="42"
							radius="21"
						></up-image>
						<view class="user-name">{{ orderDetails.orderUser || "匿名吃货" }}</view>
					</view>
				</view>

				<view class="remark-box" v-if="orderDetails.remark">
					<view class="remark-label">口味偏好</view>
					<view class="remark-content">{{ orderDetails.remark }}</view>
				</view>
			</view>

			<view class="detail-section recipe-section">
				<view class="section-head">
					<view class="section-icon section-icon--orange">
						<up-icon name="file-text-fill" size="17" color="#ffffff" />
					</view>
					<view>
						<view class="section-title">菜谱信息</view>
						<view class="section-subtitle">今天想吃的都在这里</view>
					</view>
				</view>

				<view class="recipe-list">
					<view v-for="item in recipeItems" :key="item.id" class="recipe-item">
						<up-image
							:src="item.cover"
							mode="aspectFill"
							width="68"
							height="68"
							radius="8"
						></up-image>
						<view class="recipe-main">
							<view class="recipe-name">{{ item.name || "未命名菜谱" }}</view>
							<view class="recipe-meta">投喂数量</view>
						</view>
						<view class="recipe-quantity">x{{ item.quantity || 1 }}</view>
					</view>
				</view>
			</view>

			<view :style="{ height: bottomPlaceholderHeight + 'px' }"></view>
		</scroll-view>

		<view v-else class="empty-container">
			<up-empty text="订单不存在" mode="order" textSize="16" iconSize="100" :iconColor="COLOURS['theme-color']">
			</up-empty>
		</view>

		<view
			v-if="orderDetails && detailActions.length"
			:style="{ paddingBottom: bottomSpacing + 'px' }"
			class="bottom-button-container"
		>
			<OrderButton
				:order-id="orderDetails.id"
				:status="orderDetails.orderStatus"
				:view-type="orderStore.orderSort"
				block
			/>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { COLOURS, ORDER_STATUS_INFO, getOrderActions } from "@/config/index.js";
import { getBottomSpacing } from "@/utils/tool.js";
import { useOrderStore } from "@/stores/order.js";
import { usePageParams } from "@/hooks/usePageTitle.js";

import OrderStatus from "./component/OrderStatus.vue";
import OrderButton from "./component/OrderButton.vue";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";

const orderStore = useOrderStore();
useAuthGuard();

const params = usePageParams();
const loading = ref(true);

const orderDetails = computed(() => orderStore.orderDetails);
const bottomSpacing = computed(() => Math.max(getBottomSpacing() - 50, 0));
const detailActions = computed(() => {
	if (!orderDetails.value) return [];
	return getOrderActions(orderStore.orderSort, orderDetails.value.orderStatus);
});
const bottomPlaceholderHeight = computed(() => (detailActions.value.length ? bottomSpacing.value + 86 : 26));

const orderId = computed(() => params.value.id);

const statusInfo = computed(() => {
	return ORDER_STATUS_INFO.find((item) => item.value === orderDetails.value?.orderStatus && item.value !== 0);
});

const statusLabel = computed(() => statusInfo.value?.label || "订单详情");
const recipeItems = computed(() => orderDetails.value?.orderList || []);
const recipeCount = computed(() => recipeItems.value.length);

const progressSubtitle = computed(() => {
	const status = orderDetails.value?.orderStatus;
	if (status === 1) return "已收到点单，等待饲养员确认";
	if (status === 2) return "饲养员已接单，准备开火";
	if (status === 3) return "正在认真制作中";
	if (status === 4) return "这份投喂已经完成";
	if (status === 5) return "订单已取消";
	return "订单状态同步中";
});

const progressItems = computed(() => {
	const order = orderDetails.value;
	if (!order) return [];

	if (order.orderStatus === 5) {
		return [
			{
				key: "created",
				title: "下单成功",
				desc: formatTime(order.orderTime),
				state: "done",
			},
			{
				key: "canceled",
				title: "订单已取消",
				desc: formatTime(order.cancelTime) || "已取消",
				state: "active",
			},
		];
	}

	return [
		{
			key: "created",
			title: "下单成功",
			desc: formatTime(order.orderTime),
			state: "done",
		},
		{
			key: "accepted",
			title: order.orderStatus >= 2 ? "已接单" : "等待接单",
			desc: formatTime(order.acceptTime) || "等待饲养员确认",
			state: getStepState(order.orderStatus, 2),
		},
		{
			key: "making",
			title: order.orderStatus >= 3 ? "开始烹饪" : "准备烹饪",
			desc: formatTime(order.makingTime) || (order.orderStatus >= 3 ? "制作中" : "等待制作"),
			state: getStepState(order.orderStatus, 3),
		},
		{
			key: "completed",
			title: "烹饪完成",
			desc: formatTime(order.completionTime) || "未完成",
			state: getStepState(order.orderStatus, 4),
		},
	];
});

const getStepState = (status, target) => {
	if (status > target) return "done";
	if (status === target) return "active";
	return "pending";
};

const getOrderDetails = async (id) => {
	loading.value = true;
	orderStore.orderDetails = null;
	try {
		if (orderStore.orderList.length === 0) {
			await orderStore.getOrderList(true);
		}
		await orderStore.getOrderById(id);
	} catch (error) {
		console.error("获取订单详情失败:", error);
	} finally {
		loading.value = false;
	}
};

const formatTime = (time) => {
	if (!time) return "";
	return time;
};

onMounted(() => {
	if (orderId.value) {
		getOrderDetails(orderId.value);
	}
});
</script>

<style lang="scss" scoped>
.order-details-container {
	width: 100%;
	box-sizing: border-box;
	min-height: 100vh;
	background:
		linear-gradient(180deg, #fff2f6 0, #f7f7f8 300rpx, #f7f7f8 100%);
}

.order-scroll {
	width: 100%;
	height: 100vh;
	box-sizing: border-box;
	padding: 20rpx 24rpx 0;
}

.detail-hero {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	box-sizing: border-box;
	padding: 30rpx 28rpx;
	border-radius: 16rpx;
	background:
		linear-gradient(135deg, rgba(255, 92, 141, 0.95) 0%, rgba(255, 143, 173, 0.92) 58%, rgba(255, 190, 133, 0.88) 100%);
	box-shadow: 0 18rpx 36rpx rgba(255, 92, 141, 0.18);
	color: #ffffff;
}

.hero-main {
	min-width: 0;
}

.hero-kicker {
	font-size: 24rpx;
	opacity: 0.9;
}

.hero-title {
	margin-top: 10rpx;
	font-size: 42rpx;
	line-height: 1.25;
	font-weight: 700;
	letter-spacing: 0;
}

.hero-time {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.86);
}

.hero-status {
	flex-shrink: 0;
	margin-left: 18rpx;
	padding: 6rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.72);
}

.detail-section {
	margin-top: 22rpx;
	padding: 26rpx 24rpx;
	box-sizing: border-box;
	border-radius: 16rpx;
	background: #ffffff;
	border: 1rpx solid rgba(34, 34, 34, 0.06);
	box-shadow: 0 12rpx 28rpx rgba(30, 34, 42, 0.05);
}

.section-head {
	display: flex;
	align-items: center;
	margin-bottom: 22rpx;
}

.section-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48rpx;
	height: 48rpx;
	margin-right: 16rpx;
	border-radius: 14rpx;
	background: linear-gradient(135deg, #ff5c8d, #ff8eb0);
}

.section-icon--teal {
	background: linear-gradient(135deg, #34b6a6, #65d7c7);
}

.section-icon--orange {
	background: linear-gradient(135deg, #ff9f52, #ffc069);
}

.section-title {
	font-size: 32rpx;
	line-height: 1.25;
	font-weight: 700;
	color: #333333;
}

.section-subtitle {
	margin-top: 4rpx;
	font-size: 23rpx;
	line-height: 1.3;
	color: #9a9a9a;
}

.timeline {
	padding-top: 2rpx;
}

.timeline-item {
	display: flex;
	min-height: 82rpx;
}

.timeline-rail {
	position: relative;
	width: 44rpx;
	display: flex;
	justify-content: center;
}

.timeline-dot {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24rpx;
	height: 24rpx;
	margin-top: 5rpx;
	border-radius: 50%;
	background: #d8d8d8;
	box-shadow: 0 0 0 8rpx #f5f5f5;
}

.timeline-line {
	position: absolute;
	top: 32rpx;
	bottom: -4rpx;
	width: 2rpx;
	background: #e8e8e8;
}

.timeline-item--done .timeline-dot {
	background: #ff5c8d;
	box-shadow: 0 0 0 8rpx #fff0f5;
}

.timeline-item--active .timeline-dot {
	background: #ff9f52;
	box-shadow: 0 0 0 8rpx #fff3e8;
}

.timeline-item--done .timeline-line {
	background: #ffd3df;
}

.timeline-content {
	flex: 1;
	padding-bottom: 24rpx;
}

.timeline-title {
	font-size: 28rpx;
	line-height: 1.35;
	font-weight: 700;
	color: #3c3c3c;
}

.timeline-desc {
	margin-top: 6rpx;
	font-size: 24rpx;
	line-height: 1.35;
	color: #9b9b9b;
}

.timeline-item--active .timeline-title {
	color: #ff5c8d;
}

.info-grid {
	display: flex;
	margin-bottom: 18rpx;
}

.info-cell {
	flex: 1;
	min-width: 0;
	padding: 20rpx;
	border-radius: 14rpx;
	background: #fafafa;
	border: 1rpx solid #f0f0f0;
}

.info-cell + .info-cell {
	margin-left: 16rpx;
}

.info-label,
.info-row-label,
.remark-label {
	font-size: 24rpx;
	line-height: 1.3;
	color: #888888;
}

.info-value {
	margin-top: 10rpx;
	font-size: 30rpx;
	line-height: 1.35;
	font-weight: 700;
	color: #333333;
	word-break: break-all;
}

.info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-top: 1rpx solid #f2f2f2;
}

.user-info {
	display: flex;
	align-items: center;
	min-width: 0;
	margin-left: 24rpx;
}

.user-name {
	margin-left: 14rpx;
	max-width: 260rpx;
	font-size: 28rpx;
	font-weight: 700;
	color: #555555;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.remark-box {
	margin-top: 4rpx;
	padding: 20rpx;
	border-radius: 14rpx;
	background: #fff6f9;
	border: 1rpx solid #ffe0ea;
}

.remark-content {
	margin-top: 10rpx;
	font-size: 28rpx;
	line-height: 1.55;
	color: #ff5c8d;
	word-break: break-word;
}

.recipe-list {
	display: flex;
	flex-direction: column;
}

.recipe-item {
	display: flex;
	align-items: center;
	padding: 18rpx;
	border-radius: 16rpx;
	background: #fafafa;
	border: 1rpx solid #f0f0f0;
}

.recipe-item + .recipe-item {
	margin-top: 18rpx;
}

.recipe-main {
	flex: 1;
	min-width: 0;
	margin-left: 20rpx;
}

.recipe-name {
	font-size: 30rpx;
	line-height: 1.35;
	font-weight: 700;
	color: #444444;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.recipe-meta {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #999999;
}

.recipe-quantity {
	flex-shrink: 0;
	margin-left: 18rpx;
	min-width: 70rpx;
	height: 46rpx;
	line-height: 46rpx;
	text-align: center;
	border-radius: 999rpx;
	background: #fff0f5;
	color: #ff5c8d;
	font-size: 26rpx;
	font-weight: 700;
}

.empty-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 80vh;
}

.bottom-button-container {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10;
	width: 100%;
	box-sizing: border-box;
	padding: 18rpx 24rpx 0;
	background: rgba(255, 255, 255, 0.96);
	border-top: 1rpx solid rgba(34, 34, 34, 0.06);
	box-shadow: 0 -12rpx 28rpx rgba(30, 34, 42, 0.08);
}
</style>
