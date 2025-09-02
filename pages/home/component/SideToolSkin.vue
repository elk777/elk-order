/**
* @Description: 侧边导航栏-皮肤弹出框
* @Author: elk
* @Date: 2025-08-28 16:13:58
* @LastEditors:
* @LastEditTime: 2025-08-28 16:13:58
*/

<template>
	<view class="skin-pop">
		<up-popup :pageInline='true' :indicator="false" :show="show" @close="close" mode="top">
			<view class="skin-pop-container">
				<view style="padding: 10px 0 0 15px;">挑选一张你喜欢的壁纸吧~</view>
				<!-- 本地图片列表 -->
				<view style="width: 100vw;">
					<up-scroll-list :indicator='false'>
						<view class="pop-imags" v-for="(item, index) in list" :key="index">
							<up-image :width="100" :height="200" :src="item.thumb"></up-image>
						</view>
					</up-scroll-list>
				</view>
				<!-- 自定义图片上传 -->
				<view class="pubFlex skin-pop-upload">
					<up-image width="30" height="20" src="/static/images/home/img.svg"></up-image>
					<view>自定义上传</view>
				</view>
			</view>
		</up-popup>
	</view>
</template>

<script setup>
	import {
		ref
	} from "vue"
	import {
		useSkinPop
	} from '@/hooks/home/sideTool.js';

	const list = ref([{
			thumb: "https://cdn.uviewui.com/uview/goods/1.jpg"
		},
		{
			thumb: "https://cdn.uviewui.com/uview/goods/2.jpg"
		},
		{
			thumb: "https://cdn.uviewui.com/uview/goods/3.jpg"
		},
		{
			thumb: "https://cdn.uviewui.com/uview/goods/4.jpg"
		},
		{
			thumb: "https://cdn.uviewui.com/uview/goods/5.jpg"
		}
	]);


	const skinPop = useSkinPop();
	let show = skinPop.isOpen;

	function close() {
		skinPop.close();
	}

	function open() {}
</script>

<style lang="scss" scoped>
	.skin-pop {
		width: 100%;
		height: 100%;
		
		.pop-reset {
			display: block;
		}
		.pop-imags {
			margin: 15px 20px;
		}
		.skin-pop-upload {
			justify-content: flex-end;
			color: $theme-color;
			padding-right: 15px;
		}
	}
</style>