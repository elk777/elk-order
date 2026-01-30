<!--
 * @Author: elk
 * @Date: 2026-01-29 14:46:34
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-30 11:17:12
 * @FilePath: /hkt-applet/pages/order/component/DateFiltering.vue
 * @Description: 日期筛选组件
-->
<template>
	<view v-if="orderStore.dateShow" class="date-filtering-container">
		<up-read-more
			closeText="展开"
			openText="收起"
			:color="COLOURS['theme-color']"
			:showHeight="200"
			ref="uReadMoreRef"
		>
			<uni-calendar lunar insert @change="handleChange"></uni-calendar>
		</up-read-more>
		<!-- <up-datetime-picker
            hasInput
            :show="show"
            v-model="value1"
            mode="datetime"
        ></up-datetime-picker> -->
	</view>
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

const orderStore = useOrderStore();


const show = ref(false);

/**
 * @description: 处理日期改变事件
 * @param {*} date 选中的日期
 * @return {*}
 */
const handleChange = (date) => {
	console.log("🚀 ~ handleChange ~ date:", date);
};
/**
 * @description: 处理确认事件
 * @param {*} date 选中的日期
 * @return {*}
 */
const handleConfirm = (date) => {
	console.log("🚀 ~ handleConfirm ~ date:", date);
};
</script>
<style lang="scss" scoped>
.date-filtering-container {
	width: 100%;
	height: 100%;
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
}
</style>
