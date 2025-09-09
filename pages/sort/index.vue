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

		<Tabbar :current='1'/>
	</view>
</template>

<script setup>
	import Tabbar from '@/components/Tabbar/index.vue'
	import NavbarMini from '@/components/NavbarMini/index.vue'
	
</script>

<style lang="scss" scoped>
	.sort-container {
		
	}
</style>