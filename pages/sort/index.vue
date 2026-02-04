<!--
 * @Author: elk
 * @Date: 2025-07-23 20:44:15
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-04 15:44:40
 * @FilePath: /hkt-applet/pages/sort/index.vue
 * @Description: 排序页
-->
<template>
	<view class="sort-container">
		<NavbarMini :title="'菜单'" />
		<view class="sort-body">
			<view class="pubFlex">
				<view @click="toCateTab" style="margin-right: 5px" class="pubFlex">
					<u-icon name="setting" size="24" :color="COLOURS['theme-color']" />
					<view style="margin-left: 5px" class="publcTitleSize">分类管理</view>
				</view>
				<!-- 搜索框 -->
				<Search style="width: 75%; margin: 0 auto" />
			</view>
			<!-- 菜单分类 -->
			<CateTab />
		</view>

		<ShoppingCat />
		<Tabbar :current="1" />
	</view>
</template>

<script setup>
import Tabbar from "@/components/Tabbar/index.vue";
import Search from "@/components/Search/index.vue";
import NavbarMini from "@/components/NavbarMini/index.vue";
import CateTab from "@/pages/cart/component/CateTab.vue";
import ShoppingCat from "@/pages/cart/component/ShoppingCat.vue";
import { COLOURS } from "@/config/index.js";
/**
 * @description: 分类管理点击事件
 * @return {*}
 */
function toCateTab() {
	uni.navigateTo({
		url: "/pages/recipe/classify",
	});
}
</script>

<style lang="scss" scoped>
.sort-container {
	position: relative;
	box-sizing: border-box;
	.sort-body {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 11vh;
	}
}
</style>
