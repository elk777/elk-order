<template>
	<view class="search-container">
		<up-search bgColor='#ffffff' placeholder='搜索菜品名称' v-model="value" shape="round"></up-search>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	const value = ref("");
</script>

<style lang="scss" scoped>
	.search-container {
		width: 95%;
		margin: 0 auto;
	}
</style>