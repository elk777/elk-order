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
	position: relative; /* 为绝对定位的椭圆元素提供参考 */
	display: inline-block; /* 让容器宽度适应文字内容 */
	font-size: 40rpx;
	padding-left: 16px;
}
.title-container::after {
	content: ""; /* 伪元素必须有内容，这里设为空 */
	position: absolute; /* 绝对定位，方便调整位置 */
	bottom: 5px; /* 距离文字底部的距离，可根据需求调整 */
	left: 0%; /* 水平居中的第一步，让伪元素左边缘在容器中间 */
	transform: translateX(-50%); /* 水平居中的第二步，让伪元素自身向左移动一半宽度，实现完全居中 */
	width: 5px; /* 椭圆的宽度，可根据需求调整 */
	height: 20px; /* 椭圆的高度，可根据需求调整，高度小于宽度才能呈现椭圆效果 */
	background-color: $theme-color; /* 椭圆的背景色，选择浅粉色，与整体风格匹配 */
	border-radius: 5px; /* 圆角半径，设置为高度的一半，可让矩形变成椭圆 */
}
</style>
