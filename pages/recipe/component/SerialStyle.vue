<!--
 * @Author: elk
 * @Date: 2026-01-16 14:06:08
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-16 18:14:19
 * @FilePath: /hkt-applet/pages/recipe/component/SerialStyle.vue
 * @Description: 有序列表组件
-->
<template>
	<view :style="computedStyles" class="serial-number">{{ index + 1 }}</view>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({
    // 序号
	index: {
		type: Number,
		default: 1,
	},
    // 序号大小
	size: {
		type: Number,
		default: 30,
	},
    // 序号字体大小
	fontSize: {
		type: Number,
		default: 14,
	},
});
/**
 * @description: 计算css样式
 * @return {*}
 */
const computedStyles = computed(() => {
	return {
		"--serial-size": `${props.size}px`,
		"--serial-font-size": `${props.fontSize}px`,
	};
});
</script>
<style lang="scss" scoped>
.serial-number {
	/* 设置宽度和高度，使元素为正方形，从而形成圆形 */
	width: var(--serial-size);
	height: var(--serial-size);
	margin-right: 10px;
	/* 背景颜色设置为粉色 */
	background-color: $theme-color;
	/* 文字颜色设置为白色 */
	color: white;
	/* 使元素变成圆形（ border-radius 为宽度/高度的 50% ） */
	border-radius: 50%;
	/* 让文字水平居中 */
	text-align: center;
	/* 让文字垂直居中（通过行高等于高度实现） */
	line-height: var(--serial-size);
	/* 可以根据需要设置字体大小等样式 */
	font-size: var(--serial-font-size);
	font-weight: 600;
}
</style>
