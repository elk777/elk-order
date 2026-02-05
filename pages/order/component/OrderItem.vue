<!--
 * @Author: elk
 * @Date: 2026-02-03 11:07:58
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-05 15:34:03
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
				<view
					:style="{ backgroundColor: colorOpacity, color: color[orderStatusInfo.color] }"
					class="order-header-right font-weight-600"
				>
					{{ orderStatusInfo.label }}
				</view>
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
				<view v-if="orderActionBtn" class="order-footer-right pubFlex">
					<up-button @tap.stop="handleClickClose" plain shape="circle" type="info" size="small">{{ orderStatusInfo.close }}</up-button>
					<view style="margin-left: 5px">
						<up-button
							@tap.stop="handleClickSubmit"
							plain
							shape="circle"
							type="primary"
							size="small"
							:color="color[orderStatusInfo.color]"
							>{{ orderStatusInfo.submit }}</up-button
						>
					</view>
				</view>
			</view>
		</template>
	</up-card>
</template>
<script setup>
import { ref, computed } from "vue";
import { color, colorToRgba } from "@/uni_modules/uview-plus";
import { COLOURS, ORDER_STATUS_INFO } from "@/config/index.js";
import CateList from "@/components/CateList/index.vue";
import OrderRemark from "./OrderRemark.vue";

const props = defineProps({
	order: {
		type: Object,
		required: true,
	},
});
// 订单状态信息
const orderStatusInfo = computed(() => {
	return ORDER_STATUS_INFO.find((item) => item.value === props.order.orderStatus);
});
// 颜色透明度
const colorOpacity = computed(() => {
	return colorToRgba(color[orderStatusInfo.value.color], 0.2);
});
// 订单对应操作按钮
const orderActionBtn = computed(() => {
	return orderStatusInfo.value.submit || orderStatusInfo.value.close;
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

/**
 * @description: 点击关闭订单事件
 * @return {*}
 */
const handleClickClose = () => {
	uni.showModal({
		title: "提示",
		content: "确定关闭订单吗？",
		success: (res) => {
			if (res.confirm) {
				// orderStore.closeOrder(props.order.id).then(() => {
				// 	uni.showToast({
				// 		title: "关闭订单成功",
				// 		icon: "success",
				// 	});
				// });
			}
		},
	});
};

/**
 * @description: 点击提交订单事件
 * @return {*}
 */
const handleClickSubmit = () => {
	uni.showModal({
		title: "提示",
		content: "确定提交订单吗？",
		success: (res) => {
			if (res.confirm) {
				// orderStore.submitOrder(props.order.id).then(() => {
				// 	uni.showToast({
				// 		title: "提交订单成功",
				// 		icon: "success",
				// 	});
				// });
			}
		},
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
	.order-header-right {
		padding: 5px 10px;
		border-radius: 50px;
	}
}
.order-footer-container {
	justify-content: space-between;
}
</style>
