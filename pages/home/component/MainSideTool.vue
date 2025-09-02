/**
 * @Description: 首页-侧边工具栏：皮肤切换、背景展示
 * @Author: elk
 * @Date: 2025-08-28 15:35:57
 * @LastEditors: 
 * @LastEditTime: 2025-08-28 15:35:57
 */

<template>
	<view class="side-tool pubColumnFlex">
		<view @click="handelSkinPop" style="margin-bottom: 15px;">
			<up-image :width="w" :height="h" src='/static/images/home/skin.svg'></up-image>
		</view>
		<up-image :width="w" :height="h"  src='/static/images/home/cut.svg'></up-image>
	</view>
</template>

<script setup>
	import { ref } from "vue";
	import { useSkinPop } from "@/hooks/home/sideTool";
	const skinPop = useSkinPop();
	const w = ref(45);
	const h = ref(45);
	
	/**
	 * @description: 打开皮肤弹出框
	 * @param {:type} 
	 * @return {:type} 
	 */
	function handelSkinPop() {
		skinPop.open();
	}
</script>

<style lang="scss">
	.side-tool {
		position: absolute;
		top: 5vh;
		right: 10px;
	}
</style>