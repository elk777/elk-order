<!--
 * @Author: elk
 * @Date: 2026-01-30 14:08:19
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-05 15:44:12
 * @FilePath: /hkt-applet/pages/order/component/OrderList.vue
 * @Description: 订单列表组件
-->
<template>
	<view class="order-list-container">
		<up-tabs
			v-model:current="orderStore.orderStatus"
			:lineColor="COLOURS['theme-color']"
			:list="ORDER_STATUS_INFO"
			keyName="label"
			@click="orderStore.setOrderStatus"
			:scrollable="false"
		>
		</up-tabs>
		<view class="order-list-content" v-if="orderStore.filterOrderList.length > 0">
			<view v-for="order in orderStore.filterOrderList" :key="order.id">
				<OrderItem :order="order" />
			</view>
		</view>
		<view style="margin-top: 50%" v-else>
			<up-empty text="暂无订单哦~" mode="order" textSize="16" iconSize="100" :iconColor="COLOURS['theme-color']">
			</up-empty>
		</view>
	</view>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useOrderStore } from "@/stores/order";
import { COLOURS, ORDER_STATUS_INFO } from "@/config/index.js";
import OrderItem from "./OrderItem.vue";
const orderStore = useOrderStore();

onMounted(async () => {
	console.log("🚀 ~ orderStore.orderStatus: 执行接口");
	await orderStore.getOrderList();
});
</script>
<style lang="scss" scoped>
.order-list-container {
	width: 100%;
	margin-top: 10px;
	.order-list-content {
		position: absolute;
		width: 100%;
		height: calc(100vh - 300px);
		overflow: auto;
	}
}
</style>
