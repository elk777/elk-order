<!--
 * @Author: elk
 * @Date: 2025-09-04 14:32:36
 * @LastEditors: elk
 * @LastEditTime: 2026-06-10 17:02:17
 * @FilePath: /hkt-applet/pages/home/component/MainBodyMini.vue
 * @Description: 首页-中心内容mini版 - 通过侧边按钮切换模式
-->
<template>
	<view class="body-mini pubFlex">
		<view class="kind-head-img">
			<up-image
				shape="circle"
				width="30px"
				height="30px"
				src="https://cdn.uviewui.com/uview/album/1.jpg"
			></up-image>
		</view>
		<Love :isAnimated="false" :size="20" />
		<DefaultInviteAvatar />
	</view>
</template>

<script setup>
import Love from "@/components/Love/index.vue";
import DefaultInviteAvatar from "@/components/DefaultInviteAvatar/index.vue";
</script>

<style lang="scss" scoped>
.body-mini {
	width: 188rpx;
	height: 68rpx;
	margin-right: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	// overflow: hidden;
}

.body-mini :deep(.love-bounce) {
	margin: 0;
}
</style>
