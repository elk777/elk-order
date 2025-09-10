<template>
	<view class="navbarmini-container pdx-15" :style="{paddingTop: getUniTopNavHeight() + 'px', height: getUniTopNavHeight() * 2 + 'px'  }">
		<view class="navbarmini-title publcTitleSize">{{props.title}}</view>
	</view>
</template>

<script setup>
	import { defineProps } from 'vue'
	import { getUniTopNavHeight } from '@/utils/tool.js'
	
	const props = defineProps({
		title: {
			type: String,
			required: true
		}
	})
	
</script>

<style lang="scss" scoped>
	.navbarmini-container {
		width: 100%;
		background: linear-gradient(135deg, #FFE6EA 0%, #FFF5F5 100%);
		/* 假设包裹“发现”文字和下方椭圆的容器类为 discovery-wrapper */
		.navbarmini-title {
		  position: relative; /* 为绝对定位的椭圆元素提供参考 */
		  display: inline-block; /* 让容器宽度适应文字内容 */
		}
		/* 定义下方椭圆元素的样式，可通过伪元素实现，避免额外标签 */
		.navbarmini-title::after {
		  content: ""; /* 伪元素必须有内容，这里设为空 */
		  position: absolute; /* 绝对定位，方便调整位置 */
		  bottom: -8px; /* 距离文字底部的距离，可根据需求调整 */
		  left: 60%; /* 水平居中的第一步，让伪元素左边缘在容器中间 */
		  transform: translateX(-50%); /* 水平居中的第二步，让伪元素自身向左移动一半宽度，实现完全居中 */
		  width: 55px; /* 椭圆的宽度，可根据需求调整 */
		  height: 10px; /* 椭圆的高度，可根据需求调整，高度小于宽度才能呈现椭圆效果 */
		  background-color: #ffccd5; /* 椭圆的背景色，选择浅粉色，与整体风格匹配 */
		  border-radius: 5px; /* 圆角半径，设置为高度的一半，可让矩形变成椭圆 */
		}
	}
</style>