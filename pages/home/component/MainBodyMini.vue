<!--
 * @Author: elk
 * @Date: 2025-09-04 14:32:36
 * @LastEditors: elk
 * @LastEditTime: 2026-06-11 20:50:00
 * @FilePath: /hkt-applet/pages/home/component/MainBodyMini.vue
 * @Description: 首页-中心内容mini版 - 通过侧边按钮切换模式
 *               左槽=饲养员位 / 右槽=吃货位（与首页 stage 上半区方位一致）。
 *               未登录：左右两侧都用 DefaultInviteAvatar；
 *               已登录：当前用户对应位渲染真实头像，对方位用 DefaultInviteAvatar。
-->
<template>
	<view class="body-mini pubFlex">
		<view class="kind-head-img">
			<up-image
				v-if="isKeeperSlotActive"
				shape="circle"
				width="30px"
				height="30px"
				:src="currentAvatar"
			></up-image>
			<DefaultInviteAvatar v-else />
		</view>
		<Love :isAnimated="false" :size="20" />
		<view class="kind-head-img">
			<up-image
				v-if="isFoodieSlotActive"
				shape="circle"
				width="30px"
				height="30px"
				:src="currentAvatar"
			></up-image>
			<DefaultInviteAvatar v-else />
		</view>
	</view>
</template>

<script setup>
import { computed } from "vue";
import Love from "@/components/Love/index.vue";
import DefaultInviteAvatar from "@/components/DefaultInviteAvatar/index.vue";
import { useUserStore } from "@/stores/user.js";

const userStore = useUserStore();
const defaultAvatar = "/static/images/head.jpeg";

// 已登录且 userType=0（饲养员）时，当前用户头像落到左槽（饲养员位）。
const isKeeperSlotActive = computed(
	() => userStore.isLogin && userStore.userType === 0,
);

// 已登录且 userType=1（吃货）时，当前用户头像落到右槽（吃货位）。
const isFoodieSlotActive = computed(
	() => userStore.isLogin && userStore.userType === 1,
);

// 头像 fallback：profile.avatar 为空时使用本地默认头像，避免 up-image 空 src 报错。
const currentAvatar = computed(
	() => userStore.profile.avatar || defaultAvatar,
);
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
