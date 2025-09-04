/**
 * @Description: 首页-侧边工具栏：皮肤切换、背景展示
 * @Author: elk
 * @Date: 2025-08-28 15:35:57
 * @LastEditors: 
 * @LastEditTime: 2025-08-28 15:35:57
 */

<template>
	<view class="side-tool pubColumnFlex" :style="{ paddingTop: getUniTopNavHeight() + 'px'  }">
		<view @click="handelSkinPop" style="margin-bottom: 15px;">
			<up-image :width="w" :height="h" src='/static/images/home/skin.svg'></up-image>
		</view>
		<up-image @click="handelBodyMode" :width="w" :height="h"  src='/static/images/home/cut.svg'></up-image>
	</view>
</template>

<script setup>
	import { ref } from "vue";
	import { useSkinPop, useBodyMode } from "@/hooks/home/sideTool";
	import { getUniTopNavHeight } from '@/utils/tool.js'
	const skinPop = useSkinPop();
	const bodyMode = useBodyMode();
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
	
	/**
	 * @description: 切换body模式
	 * @param {:type} 
	 * @return {:type} 
	 */
	function handelBodyMode() {
		bodyMode.cut();
	}
</script>

<style lang="scss">
	.side-tool {
		position: absolute;
		top: 5vh;
		right: 10px;
	}
</style>