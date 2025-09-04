/**
* @Description: 首页-中心内容mini版 - 通过侧边按钮切换模式
* @Author: elk
* @Date: 2025-09-04 14:32:58
* @LastEditors:
* @LastEditTime: 2025-09-04 14:32:58
*/
<template>
	<view class="body-mini pubFlex">
		<view class="kind-head-img">
			<up-image shape='circle' width="30px" height="30px"
				src='https://cdn.uviewui.com/uview/album/1.jpg'></up-image>
		</view>
		<view class="love-bounce">
			<up-image width="20px" height="20px" :src='imgPath'></up-image>
		</view>
		<view class="kind-head-unselected">
			<span class="unselected-plus"></span>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	const imgPath = ref('/static/images/aixin.png')
</script>

<style lang="scss" scoped>
	.body-mini {
		margin-right:  10px;
		.love-bounce {
			margin:  0 10px;
		}
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
				background-image: url('/static/images/add.svg');
				background-size: 55%;
				background-repeat: no-repeat;
			}
		}
	}
</style>