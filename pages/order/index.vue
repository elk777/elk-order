<!--
 * @Author: elk
 * @Date: 2025-07-21 21:55:54
 * @LastEditors: elk 
 * @LastEditTime: 2026-06-06 21:39:12
 * @FilePath: /hkt-applet/pages/order/index.vue
 * @Description: 订单页面
-->
<template>
	<view class="order-container">
		<NavbarMini :title="'订单'" />
		<view class="order-body">
			<template v-if="userStore.isLogin">
				<!-- 订单分类组件 -->
				<OrderClassification />
				<!-- 日期筛选组件 -->
				<DateFiltering />
				<!-- 订单列表组件 -->
				<OrderList />
			</template>
			<view v-else class="order-login-state pubColumnFlex">
				<view class="order-login-icon pubFlex">
					<up-icon name="order" size="48" :color="COLOURS['theme-color']"></up-icon>
				</view>
				<view class="order-login-title">登录后查看订单记录</view>
				<view class="order-login-desc">厨房订单、我的订单和进度状态会统一展示在这里。</view>
				<up-button
					class="order-login-btn"
					:color="COLOURS['theme-color']"
					shape="circle"
					@click="handleLoginClick"
				>
					去登录
				</up-button>
			</view>
		</view>
		<Tabbar :current="2" />
	</view>
</template>

<script setup>
import Tabbar from "@/components/Tabbar/index.vue";
import NavbarMini from "@/components/NavbarMini/index.vue";
import OrderClassification from "./component/OrderClassification.vue";
import DateFiltering from "./component/DateFiltering.vue";
import OrderList from "./component/OrderList.vue";
import { COLOURS } from "@/config/index.js";
import { goLogin } from "@/utils/auth.js";
import { useUserStore } from "@/stores/user.js";

const userStore = useUserStore();

const handleLoginClick = () => {
	goLogin({
		redirect: "/pages/order/index",
		message: "请先登录后查看订单",
	});
};
</script>

<style lang="scss" scoped>
.order-container {
	position: relative;
	box-sizing: border-box;
	.order-body {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 12vh;
	}

	.order-login-state {
		width: 100%;
		min-height: calc(100vh - 12vh - 120rpx);
		padding: 160rpx 64rpx 180rpx;
		box-sizing: border-box;
		align-items: center;
		text-align: center;
		background: #ffffff;
	}

	.order-login-icon {
		width: 128rpx;
		height: 128rpx;
		margin-bottom: 32rpx;
		justify-content: center;
		background: #fff5f5;
		border-radius: 50%;
	}

	.order-login-title {
		margin-bottom: 16rpx;
		color: #303133;
		font-size: 34rpx;
		font-weight: 600;
		line-height: 48rpx;
	}

	.order-login-desc {
		width: 100%;
		max-width: 520rpx;
		margin-bottom: 48rpx;
		color: #707070;
		font-size: 26rpx;
		line-height: 40rpx;
	}

	.order-login-btn {
		width: 320rpx;
	}
}

</style>
