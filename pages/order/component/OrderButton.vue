<!--
 * @Author: elk
 * @Date: 2026-02-06 09:25:43
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-06 11:09:29
 * @FilePath: /hkt-applet/pages/order/component/OrderButton.vue
 * @Description: 订单操作按钮组件
-->
<template>
	<view v-if="orderActionBtn" class="order-button-container pubFlex">
		<view :style="{ width: '50%' }">
			<up-button @tap.stop="handleClickClose" plain shape="circle" type="info" size="small">{{
				orderStatusInfo.close
			}}</up-button>
		</view>
		<view style="margin-left: 5px; width: 50%">
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
</template>

<script setup>
import { computed } from "vue";
import { color } from "@/uni_modules/uview-plus";
import { ORDER_STATUS_INFO } from "@/config/index.js";
const props = defineProps({
	status: {
		type: Number,
		default: 0,
	},
});

// 订单状态信息
const orderStatusInfo = computed(() => {
	return ORDER_STATUS_INFO.find((item) => item.value === props.status);
});
// 订单对应操作按钮
const orderActionBtn = computed(() => {
	return orderStatusInfo.value.submit || orderStatusInfo.value.close;
});

/**
 * @description: 点击关闭订单按钮
 * @return {*}
 */
const handleClickClose = () => {};
/**
 * @description: 点击确认操作按钮
 * @return {*}
 */
const handleClickSubmit = () => {};
</script>

<style lang="scss" scoped>
.order-button-container {
}
</style>
