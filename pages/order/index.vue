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
			<EmptyState
				v-else
				icon="order"
				title="登录后查看订单记录"
				desc="厨房订单、我的订单和进度状态会统一展示在这里。"
				actionText="去登录"
				actionIcon="account"
				minHeight="calc(100vh - 12vh - 120rpx)"
				padding="160rpx 64rpx 180rpx"
				@action="handleLoginClick"
			/>
		</view>
		<Tabbar :current="2" />
	</view>
</template>

<script setup>
import { onShow } from "@dcloudio/uni-app";
import Tabbar from "@/components/Tabbar/index.vue";
import NavbarMini from "@/components/NavbarMini/index.vue";
import OrderClassification from "./component/OrderClassification.vue";
import DateFiltering from "./component/DateFiltering.vue";
import OrderList from "./component/OrderList.vue";
import EmptyState from "@/components/EmptyState/index.vue";
import { goLogin } from "@/utils/auth.js";
import { useUserStore } from "@/stores/user.js";
import { useOrderStore } from "@/stores/order.js";

const userStore = useUserStore();
const orderStore = useOrderStore();

const handleLoginClick = () => {
	goLogin({
		redirect: "/pages/order/index",
		message: "请先登录后查看订单",
	});
};

onShow(() => {
	if (userStore.isLogin) {
		orderStore.getOrderList(true);
	}
});
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
}

</style>
