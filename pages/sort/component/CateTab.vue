<!--
 * @Author: elk
 * @Date: 2025-09-10 16:36:55
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-05 15:40:40
 * @FilePath: /hkt-applet/pages/sort/component/CateTab.vue
 * @Description: 菜单分类组件
-->
<template>
	<view class="catetab-container">
		<up-cate-tab class="cate-tab" :current="0" :tabList="tabList" tabKeyName="title" itemKeyName="title">
			<template #tabItem="{item}">
				<view>{{ item.title }}</view>
			</template>
			<template #pageItem="{ pageItem }">
				<view class="w-full">
					<up-cell-group :border="false">
						<up-cell :border="false">
							<template #icon>
								<up-image :src="pageItem.cover" width="100px" height="100px"></up-image>
							</template>
							<template v-slot:title>
								<view>
									{{ pageItem.title }}
								</view>
							</template>
							<template v-slot:label>
								<view class="h-100 pt-1">
									<text class="text-md text-red">￥{{ pageItem.price }}</text>
								</view>
							</template>
							<template v-slot:value>
								<up-number-box></up-number-box>
							</template>
						</up-cell>
					</up-cell-group>
				</view>
			</template>
		</up-cate-tab>
	</view>
</template>

<script setup>
import { ref } from "vue";

const tabList = ref([
	{
		title: "选项一",
		children: [
			{
				title: "水煮肉片",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 88,
			},
		],
	},
	{
		title: "选项二",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
	{
		title: "选项三",
		children: [
			{
				title: "水煮肉片",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 88,
			},
		],
	},
	{
		title: "选项四",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
	{
		title: "选项5",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
	{
		title: "选项6",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
	{
		title: "选项7",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
	{
		title: "选项8",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
	{
		title: "选项9",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
	{
		title: "选项10",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
	{
		title: "选项11",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
	{
		title: "选项12",
		children: [
			{
				title: "酸菜鱼",
				cover: "https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png",
				price: 99,
			},
		],
	},
]);
</script>

<style lang="scss" scoped>
.catetab-container {
	width: 100%;
	height: calc(100vh - 320px);
	margin-top: 10px;
	.cate-tab {
		height: calc(100vh - 320px);
		// 尝试使用 :deep() 语法
		// :deep(.u-cate-tab__page-item:last-child) {
		// 	min-height: 70vh !important;
		// }
	}
}
</style>