<template>
	<view class="search-container">
		<up-search
			bgColor='#ffffff'
			placeholder='搜索菜品名称'
			v-model="value"
			shape="round"
			height="36"
			@search="handleSearch"
			@custom="handleSearch"
			@change="handleInputChange"
			@clear="handleClear"
		></up-search>
	</view>
</template>

<script setup>
	import { onUnmounted, ref } from 'vue';

	const emit = defineEmits(['search', 'clear']);
	const value = ref("");
	let searchTimer = null;

	const clearSearchTimer = () => {
		if (searchTimer) {
			clearTimeout(searchTimer);
			searchTimer = null;
		}
	};

	const handleSearch = (keyword) => {
		clearSearchTimer();
		emit('search', keyword || value.value);
	};

	const handleInputChange = (keyword) => {
		clearSearchTimer();
		// 搜索框输入频率高，延迟触发可避免菜单接口被每个字符连续刷新。
		searchTimer = setTimeout(() => {
			searchTimer = null;
			emit('search', keyword || value.value);
		}, 400);
	};

	const handleClear = () => {
		clearSearchTimer();
		value.value = "";
		emit('clear');
	};

	onUnmounted(() => {
		clearSearchTimer();
	});
</script>

<style lang="scss" scoped>
	.search-container {
		width: 100%;
		margin: 0;

		:deep(.u-search) {
			padding: 0;
		}

		:deep(.u-search__content) {
			border: 1rpx solid rgba(255, 92, 141, 0.08);
			box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.9);
		}
	}
</style>
