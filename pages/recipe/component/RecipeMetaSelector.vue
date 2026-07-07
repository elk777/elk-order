<!--
 * @Author: elk
 * @Date: 2026-07-08
 * @FilePath: /hkt-applet/pages/recipe/component/RecipeMetaSelector.vue
 * @Description: 菜谱元信息分段选择组件
-->
<template>
	<view class="recipe-meta-selector">
		<view
			v-for="option in options"
			:key="option.value"
			class="meta-option"
			:class="{ 'meta-option--active': modelValue === option.value }"
			@click="selectOption(option.value)"
		>
			{{ option.label }}
		</view>
	</view>
</template>

<script setup>
defineProps({
	modelValue: {
		type: String,
		default: "",
	},
	options: {
		type: Array,
		required: true,
	},
});

const emit = defineEmits(["update:modelValue"]);

const selectOption = (value) => {
	emit("update:modelValue", value);
};
</script>

<style lang="scss" scoped>
.recipe-meta-selector {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	width: 100%;
	padding: 8rpx 0;
}

.meta-option {
	min-width: 128rpx;
	height: 50rpx;
	box-sizing: border-box;
	padding: 0 20rpx;
	border: 1rpx solid #ffd7e2;
	border-radius: 999rpx;
	background: #fff5f8;
	color: $theme-color;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 48rpx;
	text-align: center;
}

.meta-option--active {
	border-color: $theme-color;
	background: $theme-color;
	color: #ffffff;
	box-shadow: 0 8rpx 18rpx rgba(255, 92, 141, 0.2);
}
</style>
