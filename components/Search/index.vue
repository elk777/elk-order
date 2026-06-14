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
