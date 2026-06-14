<!--
 * @Author: elk
 * @Date: 2025-07-21 21:58:48
 * @LastEditors: elk
 * @LastEditTime: 2026-02-09 14:05:06
 * @FilePath: /hkt-applet/pages/my/index.vue
 * @Description: 我的页面
-->
<template>
	<view class="my-container" :style="layoutStyle">
		<view class="my-header">
			<NavbarMini />
			<!-- 用户信息模块 -->
			<User class="user-container" />
		</view>
		<view class="my-content">
			<!-- 邀请绑定模块 -->
			<Couple ref="coupleRef" />
			<!-- 功能列表模块 -->
			<FunList />
		</view>
		<!-- 底部tabbar模块 -->
		<Tabbar :current="3" />
	</view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShareAppMessage, onShow } from "@dcloudio/uni-app";
import NavbarMini from "@/components/NavbarMini/index.vue";
import Tabbar from "@/components/Tabbar/index.vue";
import User from "./component/User.vue";
import Couple from "./component/Couple.vue";
import FunList from "./component/FunList.vue";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";
import { useUserStore } from "@/stores/user.js";
import { buildInviteShareMessage } from "@/utils/invite.js";
import { getBottomSpacing } from "@/utils/tool.js";

useAuthGuard();

const userStore = useUserStore();
const coupleRef = ref(null);
const currentRoleType = computed(() => (userStore.isLogin ? userStore.userType : null));
const layoutStyle = computed(() => ({
	"--my-bottom-space": `${getBottomSpacing()}px`,
}));

onShow(() => {
	coupleRef.value?.refreshCouple?.();
});

onShareAppMessage((res) => {
	return buildInviteShareMessage({
		uuid: userStore.profile.uuid,
		userType: currentRoleType.value,
		targetRole: res?.target?.dataset?.role,
	});
});
</script>

<style lang="scss" scoped>
.my-container {
	min-height: 100vh;
	box-sizing: border-box;
	overflow-x: hidden;
	padding-bottom: calc(var(--my-bottom-space) + 24rpx);
	background-color: $light-color;

	.my-header {
		padding-bottom: 28rpx;
		background: linear-gradient(135deg, #FFE6EA 0%, #FFF5F5 100%);
	}

	.user-container {
		width: 100%;
		box-sizing: border-box;
	}

	.my-content {
		padding-top: 20rpx;
	}
}
</style>
