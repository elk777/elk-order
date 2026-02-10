<!--
 * @Author: elk
 * @Date: 2026-02-09 12:15:16
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 16:12:05
 * @FilePath: /hkt-applet/pages/my/component/Couple.vue
 * @Description: 情侣信息模块
-->
<template>
	<up-card class="couple-container" :head-border-bottom="false" :border="false">
		<template #head>
			<view class="couple-relation pubFlex">
				<up-icon size="24" name="heart" :color="COLOURS['theme-color']"></up-icon>
				<view class="couple-relation-text publcTitleSize">情侣关系</view>
			</view>
		</template>
		<template #body>
			<view v-if="!userInfo.binding" class="couple-body pubColumnFlex">
				<view class="couple-body-text">准备好了吗？ 开启两个人的厨房</view>
				<view>
					<up-button shape="circle" size="large" :color="COLOURS['theme-color']" type="primary"
						>绑定情侣</up-button
					>
				</view>
			</view>
			<view v-else class="couple-body-binding pubFlex">
				<view class="couple-body-item pubColumnFlex">
					<up-image
						shape="circle"
						width="55px"
						height="55px"
						src="https://cdn.uviewui.com/uview/album/1.jpg"
					></up-image>
					<view class="couple-body-name">饲养员</view>
				</view>
				<view class="couple-body-love">
					<Love :isAnimated="true" :size="25" />
				</view>
				<view class="couple-body-item pubColumnFlex">
					<up-image
						shape="circle"
						width="55px"
						height="55px"
						src="https://cdn.uviewui.com/uview/album/1.jpg"
					></up-image>
					<view class="couple-body-name">吃货</view>
				</view>
			</view>
		</template>
	</up-card>
</template>
<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user.js";
import { COLOURS } from "@/config/index.js";

import Love from "@/components/Love/index.vue";
const userStore = useUserStore();
const userInfo = computed(() => userStore.profile);
</script>
<style lang="scss" scoped>
.couple-relation {
	justify-content: start;
	.couple-relation-text {
		margin-left: 5px;
	}
}
.couple-body {
	justify-content: start;
	.couple-body-text {
		margin-bottom: 20px;
	}
}
.couple-body-binding {
	.couple-body-love {
		margin: 0 30px;
	}
	.couple-body-item {
		.couple-body-name {
			margin-top: 30rpx;
			background-color: $theme-color;
			text-align: center;
			border-radius: 25rpx;
			padding: 5rpx 25rpx;
			color: #fff;
		}
	}
}
</style>
