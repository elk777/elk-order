<template>
	<view class="search-container">
		<up-search
			bgColor='#ffffff'
			placeholder='搜索菜品名称'
			v-model="value"
			shape="round"
			@search="handleSearch"
			@custom="handleSearch"
			@clear="handleClear"
		></up-search>
	</view>
</template>

<script setup>
	import { ref } from 'vue';

	const emit = defineEmits(['search', 'clear']);
	const value = ref("");

	const handleSearch = (keyword) => {
		emit('search', keyword || value.value);
	};

	const handleClear = () => {
		value.value = "";
		emit('clear');
	};
</script>

<style lang="scss" scoped>
	.search-container {
		width: 95%;
		margin: 0 auto;
	}
</style>
