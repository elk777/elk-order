/**
 * @Description: 底部导航页-菜单
 * @Author: elk
 * @Date: 2025-09-09 15:27:42
 * @LastEditors: 
 * @LastEditTime: 2025-09-09 15:27:42
 */

<template>
	<view class="sort-container" >
		<NavbarMini :title="'菜单'" />
		<view class="sort-body">
			<!-- 搜索框 -->
			<Search style="width: 95%; margin: 0 auto;" />
			<!-- 菜单分类 -->
			<CateTab />
		</view>
		
		<Tabbar :current='1'/>
	</view>
</template>

<script setup>
	import Tabbar from '@/components/Tabbar/index.vue'
	import Search  from '@/components/Search/index.vue'
	import NavbarMini from '@/components/NavbarMini/index.vue'
	import CateTab from './component/CateTab.vue';
	
</script>

<style lang="scss" scoped>
	.sort-container {
		position: relative;
		.sort-body {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 11vh;
		}
	}
</style>