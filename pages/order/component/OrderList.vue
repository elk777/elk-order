<!--
 * @Author: elk
 * @Date: 2026-01-30 14:08:19
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-30 15:44:35
 * @FilePath: /hkt-applet/pages/order/component/OrderList.vue
 * @Description: 订单列表组件
-->
<template>
	<view class="order-list-container">
		<up-tabs
			v-model:current="orderStore.orderType"
			:lineColor="COLOURS['theme-color']"
			:list="list"
			@click="click"
			:scrollable="false"
		>
		</up-tabs>
		<view v-if="orderList.length > 0">
			<view v-for="order in orderList" :key="order.id">
				{{ order.name }}
			</view>
		</view>
        <view style="margin-top: 50%" v-else>
            <up-empty
                text="暂无订单哦~"
                mode="order"
                textSize="16"
                iconSize="100"
                :iconColor="COLOURS['theme-color']"
            >
            </up-empty>
        </view>
	</view>
</template>
<script setup>
import { ref } from "vue";
import { useOrderStore } from "@/stores/order";
import { COLOURS } from "@/config/index.js";
const orderStore = useOrderStore();

const list = ref([
	{
		name: "全部",
	},
	{
		name: "待接单",
	},
	{
		name: "已接单",
	},
	{
		name: "烹饪中",
	},
	{
		name: "已完成",
	},
	{
		name: "已取消",
	},
]);
const orderList = ref([]);
</script>
<style scoped>
.order-list-container {
	width: 100%;
}
</style>
