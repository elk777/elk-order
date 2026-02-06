<!--
 * @Author: elk
 * @Date: 2026-02-03 11:07:58
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-06 10:48:45
 * @FilePath: /hkt-applet/pages/order/component/OrderItem.vue
 * @Description: 订单项组件
-->
<template>
	<up-card @click="handleClickOrder">
		<template #head>
			<view class="order-header-container pubFlex">
				<view class="order-header-left pubFlex">
					<up-image
						width="45"
						height="45"
						shape="circle"
						:src="order.userAvatar"
						mode="aspectFill"
						class="order-avatar"
					></up-image>
					<view :style="{ color: COLOURS['theme-color'] }" class="order-user-name font-weight-600">{{
						order.orderUser
					}}</view>
				</view>
				<OrderStatus :status="order.orderStatus" />
			</view>
		</template>
		<template #body>
			<CateList :imageSize="50" :cateList="order.orderList" readonly></CateList>
			<up-divider />
			<OrderRemark :remark="order.remark" />
		</template>
		<template #foot>
			<view class="order-footer-container pubFlex">
				<view class="order-footer-left">
					{{ order.orderTime }}
				</view>
				<OrderButton :status="order.orderStatus" />
			</view>
		</template>
	</up-card>
</template>
<script setup>
import { COLOURS } from "@/config/index.js";
import CateList from "@/components/CateList/index.vue";
import OrderRemark from "./OrderRemark.vue";
import OrderButton from "./OrderButton.vue";
import OrderStatus from "./OrderStatus.vue";

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
.order-header-container {
	justify-content: space-between;
	.order-header-left {
		.order-user-name {
			margin-left: 10px;
		}
	}
}
.order-footer-container {
	justify-content: space-between;
}
</style>
