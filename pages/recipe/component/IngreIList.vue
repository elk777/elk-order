<!--
 * @Author: elk
 * @Date: 2025-09-12 15:40:09
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-16 18:13:08
 * @FilePath: /hkt-applet/pages/recipe/component/IngreIList.vue
 * @Description: 食材清单-List组件
-->
<template>
	<view v-for="(inger, index) in ingerProps.ingerList" :key="inger.id" class="ingeritem-container pubFlex">
		<view class="pubFlex" style="width: 100%">
			<SerialStyle :index="index" :size="30" :fontSize="14" />
			<up-input :clearable="true" placeholder="请输入食材" v-model="inger.ingreName"></up-input>
		</view>
		<view class="inger-right">
			<up-input placeholder="请输入用量" v-model="inger.ingreDose"></up-input>
		</view>
		<view @click="$emit('removeInger', inger.id)" v-if="ingerProps.ingerList.length > 1">
			<up-icon name="close-circle" size="25" color="#FF5C8D"></up-icon>
		</view>
	</view>
</template>

<script setup>
import { ref, defineProps, toRefs, onMounted } from "vue";
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
	margin-top: 12px;
	padding: 12px;
	border-radius: 10px;
	border: 1px solid #f0f0f0;
	background-color: #fafafa;

	.inger-right {
		margin: 0 10px;
	}
}
</style>
