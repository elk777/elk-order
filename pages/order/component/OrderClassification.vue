<!--
 * @Author: elk
 * @Date: 2026-01-29 14:06:37
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-05 14:49:40
 * @FilePath: /hkt-applet/pages/order/component/OrderClassification.vue
 * @Description: 订单分类组件
-->
<template>
	<view class="order-classification-container">
		<view class="order-summary-card">
			<view class="summary-copy">
				<view class="summary-title">
					一个记录了 <text>{{ totalOrders }}</text> 个订单
				</view>
				<view class="summary-desc">{{ summaryDesc }}</view>
			</view>
			<view class="summary-icon pubFlex">
				<up-icon name="order" size="26" :color="COLOURS['theme-color']"></up-icon>
			</view>
		</view>
		<view class="order-toolbar pubFlex">
			<view class="order-classification-subsection">
				<up-subsection
					mode="button"
					:list="list"
					:current="orderStore.orderSort"
					bgColor="transparent"
					activeColor="#ffffff"
					inactiveColor="#707070"
					@change="orderStore.setOrderSort"
				></up-subsection>
			</view>
			<view class="date-filter-btn pubFlex" @tap="orderStore.setDateShow">
				<up-icon size="23" name="calendar-fill" :color="COLOURS['theme-color']"></up-icon>
			</view>
		</view>
	</view>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { ref, computed, onMounted } from "vue";
import { COLOURS } from "@/config/index.js";
import { useOrderStore } from "@/stores/order.js";
import { useUserStore } from "@/stores/user.js";

const orderStore = useOrderStore();
const userStore = useUserStore();

const list = ref([
    {
        name: "厨房订单",
        value: 0,
    },
    {
        name: "我的订单",
        value: 1,
    }
]);

// 根据用户类型设置初始选中项
const initialSort = computed(() => {
	// userType: 0=饲养员（厨房订单），1=吃货（我的订单）
	return userStore.userType === 0 ? 0 : 1;
});

// 订单总数（从订单列表中获取）
const totalOrders = computed(() => orderStore.orderList.length);
const summaryDesc = computed(() => {
	if (orderStore.selectedDate) {
		return `${orderStore.selectedDate} 的订单记录`;
	}
	return userStore.userType === 0 ? "厨房订单与进度状态" : "我的投喂申请与进度";
});

onMounted(() => {
	// 设置初始分类
	orderStore.setOrderSort(initialSort.value);
});
</script>

<style lang="scss" scoped>
.order-classification-container {
	width: 100%;
	box-sizing: border-box;
}

.order-summary-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	margin-bottom: 18rpx;
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
	font-weight: 700;
	line-height: 48rpx;

	text {
		color: $theme-color;
		font-size: 40rpx;
		font-weight: 800;
	}
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

.order-toolbar {
	justify-content: space-between;
	box-sizing: border-box;
	padding: 12rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 26rpx;
	background: rgba(255, 255, 255, 0.94);
	box-shadow: 0 14rpx 32rpx rgba(31, 31, 31, 0.06);
	backdrop-filter: blur(8px);
}

.order-classification-subsection {
	flex: 1;
	min-width: 0;

	:deep(.u-subsection) {
		height: 64rpx;
		padding: 4rpx;
		border-radius: 20rpx;
		background: #f7f8fa;
	}

	:deep(.u-subsection--button__bar) {
		border-radius: 17rpx !important;
		background-color: $theme-color;
		box-shadow: 0 8rpx 18rpx rgba(255, 92, 141, 0.18);
	}

	:deep(.u-subsection__item) {
		height: 56rpx;
	}

	:deep(.u-subsection__item__text) {
		font-size: 26rpx;
		font-weight: 700;
	}
}

.date-filter-btn {
	width: 64rpx;
	height: 64rpx;
	flex-shrink: 0;
	margin-left: 14rpx;
	border-radius: 20rpx;
	background: #fff0f5;
}

</style>
