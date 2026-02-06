<!--
 * @Author: elk
 * @Date: 2026-02-06 10:19:54
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-06 10:32:51
 * @FilePath: /hkt-applet/pages/order/component/OrderStatus.vue
 * @Description: 订单状态组件
-->
<template>
	<view
		:style="{ backgroundColor: colorOpacity, color: color[orderStatusInfo.color] }"
		class="order-status-container font-weight-600"
	>
		{{ orderStatusInfo.label }}
	</view>
</template>
<script setup>
import { computed } from "vue";
import { color, colorToRgba } from "@/uni_modules/uview-plus";
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
// 颜色透明度
const colorOpacity = computed(() => {
	return colorToRgba(color[orderStatusInfo.value.color], 0.2);
});
</script>
<style lang="scss" scoped>
.order-status-container {
	padding: 5px 10px;
	border-radius: 50px;
}
</style>
