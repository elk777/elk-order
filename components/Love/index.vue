<!--
 * @Author: elk
 * @Date: 2026-02-10 15:49:06
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 16:09:34
 * @FilePath: /hkt-applet/components/Love/index.vue
 * @Description: 通用爱心组件
-->
<template>
	<view class="love-bounce" :class="{ 'love-bounce-dy': isAnimated }">
		<up-image :width="size" :height="size" :src="imgPath"></up-image>
	</view>
</template>
<script setup>
import { ref } from "vue";
const imgPath = ref("/static/images/aixin.png");

const props = defineProps({
	size: {
		type: Number,
		default: 20,
	},
	isAnimated: {
		type: Boolean,
		default: true,
	},
});
</script>
<style lang="scss" scoped>
.love-bounce {
	margin: 0 30rpx;
}
.love-bounce-dy {
	animation: love-bounce 5s ease-in-out infinite;
}
@keyframes love-bounce {
	0%,
	100% {
		transform: translateY(0);
	}

	50% {
		transform: translateY(-10px);
	}
}
</style>
