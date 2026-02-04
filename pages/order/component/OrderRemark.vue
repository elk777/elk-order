<!--
 * @Author: elk
 * @Date: 2026-02-04 11:49:24
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-04 12:10:47
 * @FilePath: /hkt-applet/pages/order/component/OrderRemark.vue
 * @Description: 订单备注组件
-->
<template>
	<view class="order-remark-container pubFlex">
		<view class="order-remark-title">口味偏好：</view>
		<view :style="{ 'color': COLOURS['theme-color'] }" class="order-remark-content">
			{{ remark }}
		</view>
	</view>
</template>
<script setup>
import { COLOURS } from "@/config/index.js";
const props = defineProps({
	remark: {
		type: String,
		required: true,
	},
});
</script>
<style lang="scss" scoped>
.order-remark-container {
	width: 100%;
	padding: 10px;
	box-sizing: border-box;
	justify-content: left;
	.order-remark-title {
		font-size: 16px;
		font-weight: bold;
	}
	.order-remark-content {
		margin-left: 10px;
		font-size: 14px;
	}
}
</style>
