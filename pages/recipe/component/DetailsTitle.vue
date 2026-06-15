<!--
 * @Author: elk
 * @Date: 2026-01-14 16:17:31
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-14 16:21:28
 * @FilePath: /hkt-applet/pages/recipe/component/DetailsTitle.vue
 * @Description: 菜谱详情标题组件
-->
<template>
	<view class="publcTitleSize title-container">
		{{ title }}
	</view>
</template>
<script setup>
defineProps({
	title: {
		type: String,
        required: true,
	},
});
</script>
<style lang="scss" scoped>
.title-container {
	position: relative;
	display: inline-flex;
	align-items: center;
	min-height: 44rpx;
	padding-left: 18rpx;
	color: #202124;
	font-size: 19px;
	line-height: 1.2;
}
.title-container::after {
	content: "";
	position: absolute;
	top: 50%;
	left: 0;
	width: 6rpx;
	height: 32rpx;
	border-radius: 999rpx;
	background-color: $theme-color;
	transform: translateY(-50%);
}
</style>
