<!--
 * @Author: elk
 * @Date: 2026-02-09 10:48:39
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 11:16:01
 * @FilePath: /hkt-applet/pages/my/component/User.vue
 * @Description: 用户信息模块
-->
<template>
	<view class="user-container pubFlex">
		<view class="user-info-left pubFlex">
			<view class="user-avatar">
				<up-avatar shape="circle" :src="userAvatar" size="75" />
			</view>
			<view v-if="userStore.isLogin" class="user-info">
				<view class="user-name publcTitleSize">{{ displayName }}</view>
				<view class="user-account pubFlex">
					<view class="user-account-prefix">用户ID</view>
					<view class="user-account-label font-weight-600">{{ userInfo.uuid }}</view>
					<view class="copy-id-btn pubFlex" @click="copyUserId">
						<up-icon size="18" :color="COLOURS['theme-color']" name="fingerprint"></up-icon>
					</view>
				</view>
				<view class="user-info-detail pubFlex">
					<view v-if="genderText" class="user-info-detail-item">{{ genderText }}</view>
					<view v-if="roleText" class="user-info-detail-item">{{ roleText }}</view>
				</view>
			</view>
			<view v-else class="user-info guest-info">
				<view class="user-name publcTitleSize">登录 / 注册</view>
				<view class="guest-desc">登录后查看积分、订单和情侣关系</view>
				<up-button
					class="guest-login-btn"
					size="small"
					shape="circle"
					:color="COLOURS['theme-color']"
					@click="handleLoginClick"
				>
					立即登录
				</up-button>
			</view>
		</view>
		<view v-if="userStore.isLogin" class="user-info-right">
			<view class="setting-btn pubFlex" @click="handleClickSetting">
				<up-icon size="28" :color="COLOURS['theme-color']" name="setting"></up-icon>
			</view>
		</view>
	</view>

    <UserEdit :show="showEdit" @close="() => showEdit = false" />
</template>

<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user.js";
import { COLOURS } from "@/config/index.js";
import { goLogin, requireLogin } from "@/utils/auth.js";

import UserEdit from "./UserEdit.vue";

const userStore = useUserStore();
const userInfo = computed(() => ({ ...userStore.profile }));
const displayName = computed(() => userInfo.value.nickName || "偏爱用户");
const userAvatar = computed(() => (userStore.isLogin ? userInfo.value.avatar : ""));
const genderText = computed(() => {
	if (userInfo.value.gender === 0) return "男";
	if (userInfo.value.gender === 1) return "女";
	return "";
});
const roleText = computed(() => {
	const userType = userInfo.value.userType ?? userStore.userType;
	if (userType === 0) return "饲养员";
	if (userType === 1) return "吃货";
	return "";
});

const showEdit = ref(false);

/**
 * @description: 复制用户ID
 * @return {*}
 */
const copyUserId = () => {
	if (!userInfo.value.uuid) {
		uni.showToast({
			title: "暂无用户ID",
			icon: "none",
		});
		return;
	}
    uni.setClipboardData({
        data: userInfo.value.uuid,
        success: () => {
            uni.showToast({
                title: "复制成功",
                icon: "success",
            });
        },
    });
};

/**
 * @description: 点击设置事件
 * @return {*}
 */
const handleClickSetting = () => {
	requireLogin(() => {
		showEdit.value = true;
	});
};

const handleLoginClick = () => {
	goLogin({
		message: "请先登录后查看个人信息",
	});
};
</script>

<style lang="scss" scoped>
.user-container {
	justify-content: space-between;
	padding: 10rpx 26rpx 0;
	box-sizing: border-box;

	.user-info-left {
		flex: 1;
		min-width: 0;
		justify-content: flex-start;
	}

	.user-avatar {
		flex-shrink: 0;
		margin-right: 22rpx;
		padding: 6rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.86);
		box-shadow: 0 14rpx 28rpx rgba(255, 92, 141, 0.12);
	}

	.user-info {
		flex: 1;
		min-width: 0;

		.user-name {
			color: #202124;
			font-size: 21px;
			line-height: 1.25;
		}

		.user-account {
			justify-content: flex-start;
			flex-wrap: wrap;
			margin: 8rpx 0 12rpx;
			color: $tinge-color;
			font-size: 14px;

			.user-account-prefix {
				flex-shrink: 0;
				margin-right: 8rpx;
				color: #707070;
				font-weight: 600;
			}

			.user-account-label {
				max-width: 260rpx;
				margin-right: 10rpx;
				overflow: hidden;
				color: $theme-color;
				font-size: 14px;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.copy-id-btn {
				flex-shrink: 0;
				width: 44rpx;
				height: 44rpx;
				border-radius: 50%;
				background: rgba(255, 255, 255, 0.78);
			}
		}

		.user-info-detail {
			justify-content: flex-start;
			min-width: 0;

			.user-info-detail-item {
				min-width: 72rpx;
				box-sizing: border-box;
				padding: 7rpx 22rpx;
				border-radius: 999rpx;
				background-color: rgba(255, 255, 255, 0.82);
				color: #707070;
				font-size: 14px;
				font-weight: 700;
				text-align: center;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;

				&:last-child {
					margin-left: 12rpx;
					color: #fff;
					background-color: $theme-color;
					box-shadow: 0 8rpx 18rpx rgba(255, 92, 141, 0.18);
				}
			}
		}
	}

	.guest-info {
		.user-name {
			color: #202124;
		}

		.guest-desc {
			margin: 8rpx 0 14rpx;
			color: $tinge-color;
			font-size: 13px;
			line-height: 1.45;
		}

		.guest-login-btn {
			width: 96px;
			height: 30px;
			margin: 0;
		}
	}

	.user-info-right {
		flex-shrink: 0;
		margin-left: 18rpx;
	}

	.setting-btn {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.78);
		box-shadow: 0 12rpx 26rpx rgba(255, 92, 141, 0.1);
	}
}
</style>
