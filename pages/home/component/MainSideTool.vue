/**
 * @Description: 首页-侧边工具栏：皮肤切换、背景展示
 * @Author: elk
 * @Date: 2025-08-28 15:35:57
 * @LastEditors: 
 * @LastEditTime: 2025-08-28 15:35:57
 */

<template>
	<view class="side-tool pubColumnFlex" :style="{ paddingTop: getUniTopNavHeight() + 'px'  }">
		<view class="side-tool-btn pubFlex" @click="handleSubscribePanel">
			<up-icon name="bell-fill" size="25" color="#ff5c8d"></up-icon>
			<view v-if="needsAttention" class="subscribe-dot"></view>
		</view>
		<view @click="handelSkinPop" style="margin-bottom: 15px;">
			<up-image :width="w" :height="h" src='/static/images/home/skin.svg'></up-image>
		</view>
		<up-image @click="handelBodyMode" :width="w" :height="h"  src='/static/images/home/cut.svg'></up-image>
	</view>
</template>

<script setup>
	import { ref, watch } from "vue";
	import { useSkinPop, useBodyMode } from "@/hooks/home/sideTool";
	import { getUniTopNavHeight } from '@/utils/tool.js'
	import { requireLogin } from "@/utils/auth.js";
	import { useUserStore } from "@/stores/user.js";
	import { useSubscribeMessage } from "@/utils/subscribeMessage.js";

	const emit = defineEmits(["open-subscribe"]);
	const userStore = useUserStore();
	const skinPop = useSkinPop();
	const bodyMode = useBodyMode();
	const subscribeMessage = useSubscribeMessage();
	const needsAttention = subscribeMessage.needsAttention;
	const w = ref(45);
	const h = ref(45);

	watch(
		() => [userStore.isLogin, userStore.profile?.uuid],
		() => {
			subscribeMessage.loadSettings({ force: true });
		},
		{ immediate: true },
	);
	
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

	function handleSubscribePanel() {
		return requireLogin(
			() => {
				emit("open-subscribe");
				return true;
			},
			{
				message: "请先登录后开启消息通知",
			},
		);
	}
</script>

<style lang="scss">
	.side-tool {
		position: absolute;
		top: 5vh;
		right: 10px;
	}

	.side-tool-btn {
		position: relative;
		width: 45px;
		height: 45px;
		margin-bottom: 15px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.92);
		box-shadow: 0 10rpx 22rpx rgba(70, 88, 130, 0.12);
	}

	.subscribe-dot {
		position: absolute;
		right: 4px;
		top: 4px;
		width: 9px;
		height: 9px;
		border: 2px solid #ffffff;
		border-radius: 50%;
		background: #ff3b30;
	}
</style>
