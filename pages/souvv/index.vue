<template>
	<view>
		<NavbarMini :title="'订单'" />
		<Tabbar  :current='2'/>
	</view>
</template>

<script setup>
	import Tabbar from '@/components/Tabbar/index.vue';
	import NavbarMini from '@/components/NavbarMini/index.vue';
</script>

<style>
</style>