<template>
	<view class="search-container">
		<up-search bgColor='#ffffff' placeholder='请输入关键字' v-model="value" shape="round"></up-search>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	const value = ref("");
</script>

<style>
</style>