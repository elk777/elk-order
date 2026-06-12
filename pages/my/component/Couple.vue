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
				<view class="couple-invite-action">
					<up-button shape="circle" size="large" :color="COLOURS['theme-color']" type="primary" @click="handleBindClick">
						绑定情侣
					</up-button>
					<button
						v-if="canShareInvite"
						class="couple-share-btn"
						open-type="share"
						:data-role="inviteTargetRole"
						@click.stop
					></button>
				</view>
			</view>
			<view v-else class="couple-body-binding pubFlex">
				<view class="couple-body-item pubColumnFlex">
					<up-image
						shape="circle"
						width="55px"
						height="55px"
						:src="feederAvatar"
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
						:src="foodieAvatar"
					></up-image>
					<view class="couple-body-name">吃货</view>
				</view>
			</view>
		</template>
	</up-card>
</template>
<script setup>
import { computed, ref, watch } from "vue";
import { useUserStore } from "@/stores/user.js";
import { COLOURS } from "@/config/index.js";
import { requireLogin } from "@/utils/auth.js";
import { getActiveCouple } from "@/apis/couples.js";

import Love from "@/components/Love/index.vue";

const userStore = useUserStore();
const userInfo = computed(() => userStore.profile);
const defaultAvatar = "/static/images/head.jpeg";
const coupleInfo = ref(null);
const loadingCouple = ref(false);

const currentRoleType = computed(() => (userStore.isLogin ? userStore.userType : null));
const inviteTargetRole = computed(() => (currentRoleType.value === 1 ? "keeper" : "foodie"));
const canShareInvite = computed(() => userStore.isLogin && !userInfo.value.binding && !!userInfo.value.uuid);
const feederAvatar = computed(() => coupleInfo.value?.feeder?.avatar || defaultAvatar);
const foodieAvatar = computed(() => coupleInfo.value?.foodie?.avatar || defaultAvatar);

const handleBindClick = () => {
	requireLogin(() => {
		if (!userInfo.value.uuid) {
			uni.showToast({
				title: "暂无用户ID",
				icon: "none",
			});
		}
	}, {
		message: "请先登录后绑定情侣",
	});
};

const refreshCouple = async () => {
	if (!userStore.isLogin || !userInfo.value.binding || loadingCouple.value) {
		return;
	}

	loadingCouple.value = true;
	try {
		const res = await getActiveCouple();
		if (res?.code === 200 && res?.data) {
			coupleInfo.value = res.data;
		}
	} catch (error) {
		console.warn("[my] refresh couple failed", error);
	} finally {
		loadingCouple.value = false;
	}
};

watch(
	() => [userStore.isLogin, userInfo.value.binding],
	([isLogin, binding]) => {
		if (isLogin && binding) {
			refreshCouple();
		} else {
			coupleInfo.value = null;
		}
	},
	{ immediate: true },
);

defineExpose({
	refreshCouple,
});
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
	.couple-invite-action {
		position: relative;
	}
	.couple-share-btn {
		position: absolute;
		inset: 0;
		z-index: 2;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		background: transparent;
		opacity: 0;

		&::after {
			border: none;
		}
	}
}
.couple-body-binding {
	justify-content: center;
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
