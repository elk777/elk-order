<!--
 * @Author: elk
 * @Date: 2025-07-21 21:55:54
 * @LastEditors: elk 
 * @LastEditTime: 2026-06-06 21:39:12
 * @FilePath: /hkt-applet/pages/order/index.vue
 * @Description: 订单页面
-->
<template>
	<view class="order-container" :class="{ 'order-container--guest': !userStore.isLogin }" :style="layoutStyle">
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
			<view v-else class="order-guest-panel">
				<OrderGuestPreview @login="handleLoginClick" />
			</view>
		</view>
		<Tabbar :current="2" />
	</view>
</template>

<script setup>
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import Tabbar from "@/components/Tabbar/index.vue";
import NavbarMini from "@/components/NavbarMini/index.vue";
import OrderClassification from "./component/OrderClassification.vue";
import DateFiltering from "./component/DateFiltering.vue";
import OrderList from "./component/OrderList.vue";
import OrderGuestPreview from "./component/OrderGuestPreview.vue";
import { goLogin } from "@/utils/auth.js";
import { useUserStore } from "@/stores/user.js";
import { useOrderStore } from "@/stores/order.js";
import { getBottomSpacing, getCustomNavbarHeight } from "@/utils/tool.js";

const userStore = useUserStore();
const orderStore = useOrderStore();
const layoutStyle = computed(() => ({
	"--order-bottom-space": `${getBottomSpacing()}px`,
	"--order-navbar-height": `${getCustomNavbarHeight()}px`,
}));

const handleLoginClick = () => {
	goLogin({
		redirect: "/pages/order/index",
		message: "登录后可查看专属订单",
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
	min-height: 100vh;
	box-sizing: border-box;
	overflow-x: hidden;
	padding-bottom: calc(var(--order-bottom-space) + 86px);
	background:
		linear-gradient(180deg, #fff5f8 0, #f8f8f8 220rpx),
		#f8f8f8;

	.order-body {
		width: 100%;
		box-sizing: border-box;
		padding: 0 22rpx;
	}
}

.order-container--guest {
	height: 100vh;
	min-height: 100vh;
	overflow: hidden;
	padding-bottom: var(--order-bottom-space);

	.order-body {
		height: calc(100vh - var(--order-navbar-height) - var(--order-bottom-space));
		overflow: hidden;
	}

	.order-guest-panel {
		position: relative;
		height: 100%;
		overflow: hidden;
		box-sizing: border-box;
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 36rpx;
		background:
			radial-gradient(circle at 18% 10%, rgba(255, 92, 141, 0.08), transparent 34%),
			linear-gradient(180deg, #ffffff 0%, #fffafd 100%);
		box-shadow: 0 18rpx 42rpx rgba(255, 92, 141, 0.08);
		touch-action: none;
	}

	.order-guest-panel::before,
	.order-guest-panel::after {
		content: "";
		position: absolute;
		width: 220rpx;
		height: 220rpx;
		border-radius: 50%;
		background: rgba(255, 92, 141, 0.06);
	}

	.order-guest-panel::before {
		top: -90rpx;
		right: -70rpx;
	}

	.order-guest-panel::after {
		left: -90rpx;
		bottom: -80rpx;
	}
}
</style>
