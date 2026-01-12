<!--
 * @Author: elk
 * @Date: 2025-09-12 15:40:09
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-12 14:11:53
 * @FilePath: /hkt-applet/pages/recipe/component/IngreIList.vue
 * @Description: 食材清单-List组件
-->
<template>
	<view v-for="(inger,index) in ingerProps.ingerList" :key="inger.id" class="ingeritem-container pubFlex">
		<view class="pubFlex" style="width: 100%;">
			<view class="badge">
				{{index + 1}}
			</view>
			<up-input :clearable='true' placeholder="请输入食材" v-model="inger.ingreName"></up-input>
		</view>
		<view class="inger-right">
			<up-input placeholder="请输入用量" v-model="inger.ingreDose"></up-input>
		</view>
		<view @click="$emit('removeInger',inger.id)" v-if="ingerProps.ingerList.length > 1">
			<up-icon name="close-circle" size="25" color="#FF5C8D"></up-icon>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		defineProps,
		toRefs,
		onMounted
	} from 'vue'
	// 这里的ingerList不能通过 let ingerProps = ingerProps.ingerList 接一下会失去响应式
	const ingerProps = defineProps({
		ingerList: {
			typeof: Array,
			require: true
		},
	})
	
</script>

<style lang="scss" scoped>
	.ingeritem-container {
		margin-top: 12px;
		padding: 12px;
		border-radius: 10px;
		border: 1px solid #f0f0f0;
		background-color: #fafafa;

		.badge {
			/* 设置宽度和高度，使元素为正方形，从而形成圆形 */
			width: 30px;
			height: 30px;
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
			line-height: 30px;
			/* 可以根据需要设置字体大小等样式 */
			font-size: 14px;
			font-weight: 600;
		}

		.inger-right {
			margin:0 10px;
		}
	}
</style>