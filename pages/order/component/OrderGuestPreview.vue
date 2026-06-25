<template>
	<view class="order-guest-preview" @touchmove.stop.prevent="noop">
		<view class="guest-summary">
			<view class="summary-copy">
				<view class="summary-title">
					订单记录 <text>0</text>
				</view>
				<view class="summary-desc">可先浏览订单页面，登录后同步厨房订单和我的订单。</view>
			</view>
			<view class="summary-icon pubFlex">
				<up-icon name="order" size="26" :color="COLOURS['theme-color']"></up-icon>
			</view>
		</view>

		<view class="guest-toolbar pubFlex">
			<view class="guest-segment">
				<view
					v-for="item in viewTypes"
					:key="item.value"
					class="guest-segment-item"
					:class="{ 'guest-segment-item--active': item.value === 0 }"
				>
					{{ item.name }}
				</view>
			</view>
			<view class="guest-calendar pubFlex">
				<up-icon size="23" name="calendar-fill" :color="COLOURS['theme-color']"></up-icon>
			</view>
		</view>

		<view class="guest-status-row">
			<view
				v-for="status in visibleStatuses"
				:key="status.value"
				class="guest-status"
				:class="{ 'guest-status--active': status.value === 0 }"
			>
				{{ status.label }}
			</view>
		</view>

		<view class="guest-empty pubColumnFlex">
			<view class="empty-icon pubFlex">
				<up-icon name="order" size="56" :color="COLOURS['theme-color']"></up-icon>
			</view>
			<view class="empty-title">暂无订单记录</view>
			<view class="empty-desc">发起点餐或处理订单后，会按状态汇总在这里。</view>
		</view>

		<view class="guest-login">
			<view class="login-copy">
				<view class="login-title">登录后同步专属订单</view>
				<view class="login-desc">由你自主授权后继续查看个人内容</view>
			</view>
			<up-button class="login-btn" size="small" shape="circle" plain :color="COLOURS['theme-color']" @click="emit('login')">
				登录查看
			</up-button>
		</view>
	</view>
</template>

<script setup>
import { COLOURS, ORDER_STATUS_INFO } from "@/config/index.js";

const emit = defineEmits(["login"]);

const viewTypes = [
	{ name: "厨房订单", value: 0 },
	{ name: "我的订单", value: 1 },
];

const visibleStatuses = ORDER_STATUS_INFO;
const noop = () => {};
</script>

<style lang="scss" scoped>
.order-guest-preview {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	padding: 28rpx 28rpx 30rpx;
}

.guest-summary {
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	padding: 24rpx 24rpx 22rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 28rpx;
	background:
		linear-gradient(135deg, rgba(255, 245, 248, 0.98) 0%, rgba(255, 255, 255, 0.96) 64%),
		#ffffff;
	box-shadow: 0 16rpx 36rpx rgba(255, 92, 141, 0.08);
}

.summary-copy {
	min-width: 0;
}

.summary-title {
	color: #252525;
	font-size: 34rpx;
	font-weight: 800;
	line-height: 48rpx;
}

.summary-title text {
	color: $theme-color;
	font-size: 40rpx;
	font-weight: 800;
}

.summary-desc {
	margin-top: 6rpx;
	color: $tinge-color;
	font-size: 24rpx;
	line-height: 34rpx;
}

.summary-icon {
	width: 72rpx;
	height: 72rpx;
	flex-shrink: 0;
	margin-left: 24rpx;
	border-radius: 24rpx;
	background: #fff0f5;
}

.guest-toolbar {
	justify-content: space-between;
	box-sizing: border-box;
	margin-top: 18rpx;
	padding: 12rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 26rpx;
	background: rgba(255, 255, 255, 0.94);
	box-shadow: 0 14rpx 32rpx rgba(31, 31, 31, 0.06);
}

.guest-segment {
	display: flex;
	flex: 1;
	min-width: 0;
	box-sizing: border-box;
	height: 64rpx;
	padding: 4rpx;
	border-radius: 20rpx;
	background: #f7f8fa;
}

.guest-segment-item {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	min-width: 0;
	border-radius: 17rpx;
	color: $tinge-color;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 56rpx;
}

.guest-segment-item--active {
	background: $theme-color;
	color: #ffffff;
	box-shadow: 0 8rpx 18rpx rgba(255, 92, 141, 0.18);
}

.guest-calendar {
	width: 64rpx;
	height: 64rpx;
	flex-shrink: 0;
	margin-left: 14rpx;
	border-radius: 20rpx;
	background: #fff0f5;
}

.guest-status-row {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	width: 100%;
	margin-top: 18rpx;
	padding: 12rpx 6rpx;
	overflow: hidden;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 12rpx 28rpx rgba(31, 31, 31, 0.05);
}

.guest-status {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	min-width: 0;
	height: 58rpx;
	padding: 0 4rpx;
	color: #5c5c5c;
	font-size: 24rpx;
	font-weight: 700;
	line-height: 58rpx;
}

.guest-status--active {
	color: #252525;
}

.guest-empty {
	flex: 1;
	min-height: 0;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	margin-top: 18rpx;
	padding: 46rpx 34rpx 54rpx;
	border-radius: 30rpx;
	background: #ffffff;
	text-align: center;
}

.empty-icon {
	width: 132rpx;
	height: 132rpx;
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
	font-weight: 800;
	line-height: 42rpx;
}

.empty-desc {
	max-width: 480rpx;
	margin-top: 10rpx;
	color: $tinge-color;
	font-size: 24rpx;
	line-height: 36rpx;
}

.guest-login {
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	margin-top: 18rpx;
	padding: 20rpx 22rpx;
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 12rpx 28rpx rgba(31, 31, 31, 0.05);
}

.login-copy {
	min-width: 0;
	margin-right: 18rpx;
}

.login-title {
	color: #252525;
	font-size: 26rpx;
	font-weight: 800;
	line-height: 36rpx;
}

.login-desc {
	margin-top: 4rpx;
	color: $tinge-color;
	font-size: 22rpx;
	line-height: 32rpx;
}

.login-btn {
	width: 176rpx;
	flex-shrink: 0;
}
</style>
