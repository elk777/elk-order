<!--
 * @Author: elk
 * @Date: 2026-02-09 12:15:16
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 16:12:05
 * @FilePath: /hkt-applet/pages/my/component/Couple.vue
 * @Description: 情侣信息模块
-->
<template>
	<up-card
		class="couple-container"
		margin="0"
		border-radius="16"
		:head-border-bottom="false"
		:border="false"
	>
		<template #head>
			<view class="couple-relation pubFlex">
				<view class="couple-title-icon pubFlex">
					<up-icon size="21" name="heart" :color="COLOURS['theme-color']"></up-icon>
				</view>
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
					<view class="couple-avatar-wrap">
						<up-image
							shape="circle"
							width="62px"
							height="62px"
							:src="leftRole?.avatar || defaultAvatar"
						></up-image>
					</view>
					<view class="couple-body-name">{{ leftRole?.label || '' }}</view>
				</view>
				<view class="couple-body-love pubFlex">
					<Love :isAnimated="true" :size="28" />
				</view>
				<view class="couple-body-item pubColumnFlex">
					<view class="couple-avatar-wrap">
						<up-image
							shape="circle"
							width="62px"
							height="62px"
							:src="rightRole?.avatar || defaultAvatar"
						></up-image>
					</view>
					<view class="couple-body-name">{{ rightRole?.label || '' }}</view>
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
import { buildCoupleRoleSlots, ROLE_LABELS, ROLE_TYPES } from "@/utils/coupleDisplay.js";
import { withDefaultMediaUrl } from "@/utils/media.js";

import Love from "@/components/Love/index.vue";

const userStore = useUserStore();
const userInfo = computed(() => userStore.profile);
const defaultAvatar = "/static/images/head.jpeg";
const coupleInfo = ref(null);
const loadingCouple = ref(false);

const currentRoleType = computed(() => (userStore.isLogin ? userStore.userType : null));
const inviteTargetRole = computed(() => (currentRoleType.value === 1 ? "keeper" : "foodie"));
const canShareInvite = computed(() => userStore.isLogin && !userInfo.value.binding && !!userInfo.value.uuid);
const coupleRoleSlots = computed(() => buildCoupleRoleSlots({
	coupleInfo: coupleInfo.value,
	currentUser: userInfo.value,
	currentRoleType: currentRoleType.value,
	defaultAvatar,
}));

const currentUserRole = computed(() => {
	if (currentRoleType.value === ROLE_TYPES.foodie) {
		return {
			avatar: withDefaultMediaUrl(userInfo.value.avatar, defaultAvatar),
			label: ROLE_LABELS[ROLE_TYPES.foodie],
		};
	}

	return {
		avatar: withDefaultMediaUrl(userInfo.value.avatar, defaultAvatar),
		label: ROLE_LABELS[ROLE_TYPES.keeper],
	};
});

const partnerRole = computed(() => {
	if (currentRoleType.value === ROLE_TYPES.foodie) {
		return {
			avatar: coupleRoleSlots.value?.keeper?.avatar || defaultAvatar,
			label: ROLE_LABELS[ROLE_TYPES.keeper],
		};
	}

	return {
		avatar: coupleRoleSlots.value?.foodie?.avatar || defaultAvatar,
		label: ROLE_LABELS[ROLE_TYPES.foodie],
	};
});

const leftRole = computed(() => {
	if (!userInfo.value.binding) return null;
	if (!coupleRoleSlots.value) return currentUserRole.value;
	return currentRoleType.value === ROLE_TYPES.foodie ? coupleRoleSlots.value.foodie : coupleRoleSlots.value.keeper;
});

const rightRole = computed(() => {
	if (!userInfo.value.binding) return null;
	if (!coupleRoleSlots.value) return partnerRole.value;
	return currentRoleType.value === ROLE_TYPES.foodie ? coupleRoleSlots.value.keeper : coupleRoleSlots.value.foodie;
});

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
.couple-container {
	display: block;
	margin-bottom: 22rpx;

	:deep(.couple-container.u-card) {
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 16rpx !important;
		box-shadow: 0 16rpx 36rpx rgba(255, 92, 141, 0.07);
	}

	:deep(.u-card) {
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 16rpx !important;
		box-shadow: 0 16rpx 36rpx rgba(255, 92, 141, 0.07);
	}

	:deep(.u-card__head) {
		padding: 24rpx 26rpx 8rpx !important;
	}

	:deep(.u-card__body) {
		padding: 20rpx 26rpx 30rpx !important;
	}
}

.couple-relation {
	justify-content: flex-start;

	.couple-title-icon {
		width: 42rpx;
		height: 42rpx;
		border-radius: 50%;
		background: #fff2f6;
	}

	.couple-relation-text {
		margin-left: 10rpx;
		color: #202124;
		font-size: 18px;
	}
}

.couple-body {
	min-height: 190rpx;
	justify-content: center;
	border-radius: 16rpx;
	background: linear-gradient(180deg, #fff8fa 0%, #ffffff 100%);

	.couple-body-text {
		margin-bottom: 22rpx;
		color: #707070;
		font-size: 14px;
		font-weight: 600;
	}

	.couple-invite-action {
		position: relative;
		min-width: 240rpx;
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
		width: 128rpx;
		height: 128rpx;
		margin: 0 36rpx;
		border-radius: 50%;
		background: linear-gradient(180deg, #fff5f8, #ffffff);
	}

	.couple-body-item {
		min-width: 160rpx;

		.couple-avatar-wrap {
			padding: 6rpx;
			border-radius: 50%;
			background: #fff2f6;
			box-shadow: 0 12rpx 26rpx rgba(255, 92, 141, 0.1);
		}

		.couple-body-name {
			min-width: 96rpx;
			box-sizing: border-box;
			margin-top: 22rpx;
			padding: 8rpx 26rpx;
			border-radius: 999rpx;
			background-color: $theme-color;
			color: #fff;
			font-size: 15px;
			font-weight: 700;
			text-align: center;
			box-shadow: 0 8rpx 18rpx rgba(255, 92, 141, 0.16);
		}
	}
}
</style>
