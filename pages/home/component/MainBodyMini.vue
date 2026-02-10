<!--
 * @Author: elk
 * @Date: 2025-09-04 14:32:36
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 16:28:23
 * @FilePath: /hkt-applet/pages/home/component/MainBodyMini.vue
 * @Description: 首页-中心内容mini版 - 通过侧边按钮切换模式
-->
<template>
	<view class="body-mini pubFlex">
		<view class="kind-head-img">
			<up-image
				shape="circle"
				width="30px"
				height="30px"
				src="https://cdn.uviewui.com/uview/album/1.jpg"
			></up-image>
		</view>
		<Love :isAnimated="false" />
		<view class="kind-head-unselected">
			<span class="unselected-plus"></span>
		</view>
	</view>
</template>

<script setup>
import { ref } from "vue";
import Love from "@/components/Love/index.vue";
</script>

<style lang="scss" scoped>
.body-mini {
	margin-right: 10px;
	.kind-head-unselected {
		position: relative;
		width: 30px;
		height: 30px;
		padding: 1px;
		border: 1px solid $theme-color;
		background-color: #fff;
		border-radius: 50%;
		.unselected-plus {
			position: absolute;
			top: 7px;
			left: 7px;
			width: 100%;
			height: 100%;
			z-index: 1;
			background-image: url("/static/images/add.svg");
			background-size: 55%;
			background-repeat: no-repeat;
		}
	}
}
</style>
