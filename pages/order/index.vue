<!--
 * @Author: elk
 * @Date: 2025-07-21 21:55:54
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-30 14:25:54
 * @FilePath: /hkt-applet/pages/order/index.vue
 * @Description: 订单页面
-->
<template>
	<view class="order-container">
		<NavbarMini :title="'订单'" />
		<!-- 订单分类组件 -->
		<OrderClassification class="order-classification" />
		<!-- 日期筛选组件 -->
		<DateFiltering />
		<!-- 订单列表组件 -->
		<OrderList />
		<Tabbar :current="2" />
	</view>
</template>

<script setup>
import Tabbar from "@/components/Tabbar/index.vue";
import NavbarMini from "@/components/NavbarMini/index.vue";
import OrderClassification from "./component/OrderClassification.vue";
import DateFiltering from "./component/DateFiltering.vue";
import OrderList from "./component/OrderList.vue";

</script>

<style lang="scss" scoped>
.order-container {
	position: relative;
	box-sizing: border-box;
	.order-classification {
		position: absolute;
		top: 12vh;
	}
}

</style>
