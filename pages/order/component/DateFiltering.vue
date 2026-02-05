<!--
 * @Author: elk
 * @Date: 2026-01-29 14:46:34
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-05 14:33:39
 * @FilePath: /hkt-applet/pages/order/component/DateFiltering.vue
 * @Description: 日期筛选组件
-->
<template>
	<!-- <view v-if="orderStore.dateShow" class="date-filtering-container">
		<up-read-more
			closeText="展开"
			openText="收起"
			:color="COLOURS['theme-color']"
			:showHeight="200"
			ref="uReadMoreRef"
		>
			<uni-calendar lunar insert @change="handleChange"></uni-calendar>
		</up-read-more>
	</view> -->
	<up-popup :show="orderStore.dateShow" @close="orderStore.setDateShow()" safeAreaInsetTop mode="top">
		<uni-calendar lunar insert @change="handleChange"></uni-calendar>
		<view :style="{ top: topNavHeight + 10 + 'px' }" class="clear-filter" @click="handleConfirm"
			>清除筛选</view
		>
	</up-popup>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { ref } from "vue";
import { COLOURS } from "@/config/index.js";
import { useOrderStore } from "@/stores/order.js";
import { getUniTopNavHeight } from "@/utils/tool.js";
const orderStore = useOrderStore();

const topNavHeight = getUniTopNavHeight();
/**
 * @description: 处理日期改变事件
 * @param {*} date 选中的日期
 * @return {*}
 */
const handleChange = (date) => {
	orderStore.setSelectedDate(date.fulldate);
	orderStore.setDateShow();
};
/**
 * @description: 清除筛选
 * @return {*}
 */
const handleConfirm = () => {
	orderStore.setSelectedDate('');
	orderStore.setDateShow();
};
</script>
<style lang="scss" scoped>
.date-filtering-container {
	width: 100%;
	height: auto;
}
.clear-filter {
	position: absolute;
	left: 18px;
	padding: 5px 10px;
	background-color: $light-color;
	color: $tinge-color;
	border-radius: 50px;
}
:deep(.uni-calendar-item--checked) {
	background-color: $theme-color;
}
:deep(.uni-calendar-item--isDay) {
	background-color: $theme-color;
	color: #fff !important;
}
:deep(.uni-calendar-item--isDay-text) {
	color: $theme-color;
}
</style>
