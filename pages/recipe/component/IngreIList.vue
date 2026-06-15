<!--
 * @Author: elk
 * @Date: 2025-09-12 15:40:09
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-16 18:13:08
 * @FilePath: /hkt-applet/pages/recipe/component/IngreIList.vue
 * @Description: 食材清单-List组件
-->
<template>
	<view v-for="(inger, index) in ingerProps.ingerList" :key="inger.id" class="ingeritem-container">
		<SerialStyle :index="index" :size="34" :fontSize="14" />
		<view class="ingredient-fields">
			<view class="ingredient-field ingredient-field--name">
				<up-input :clearable="true" placeholder="请输入食材" v-model="inger.ingreName" border="none"></up-input>
			</view>
			<view class="ingredient-field ingredient-field--amount">
				<up-input placeholder="请输入用量" v-model="inger.ingreDose" border="none"></up-input>
			</view>
		</view>
		<view class="ingredient-remove pubFlex" @click="$emit('removeInger', inger.id)" v-if="ingerProps.ingerList.length > 1">
			<up-icon name="close-circle" size="25" color="#FF5C8D"></up-icon>
		</view>
	</view>
</template>

<script setup>
import SerialStyle from "./SerialStyle.vue";
// 这里的ingerList不能通过 let ingerProps = ingerProps.ingerList 接一下会失去响应式
const ingerProps = defineProps({
	ingerList: {
		typeof: Array,
		require: true,
	},
});
</script>

<style lang="scss" scoped>
.ingeritem-container {
	display: flex;
	align-items: center;
	width: 100%;
	box-sizing: border-box;
	margin-top: 18rpx;
	padding: 16rpx;
	border: 1rpx solid #f0f1f5;
	border-radius: 16rpx;
	background: #fbfbfc;

	.ingredient-fields {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
	}

	.ingredient-field {
		box-sizing: border-box;
		min-width: 0;
		height: 70rpx;
		padding: 0 16rpx;
		border-radius: 14rpx;
		background: #ffffff;
	}

	.ingredient-field--name {
		flex: 1;
	}

	.ingredient-field--amount {
		width: 170rpx;
		margin-left: 14rpx;
	}

	.ingredient-remove {
		flex-shrink: 0;
		width: 58rpx;
		height: 58rpx;
		margin-left: 10rpx;
		border-radius: 50%;
		background: #fff2f6;
	}

	:deep(.u-input) {
		height: 70rpx;
	}

	:deep(.u-input__content__field-wrapper__field) {
		font-size: 14px;
	}
}
</style>
