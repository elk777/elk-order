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
					用户ID：<span class="user-account-label font-weight-600">{{ userInfo.uuId }}</span>
					<up-icon @click="copyUserId" size="20" :color="COLOURS['theme-color']" name="fingerprint"></up-icon>
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
			<up-icon @click="handleClickSetting" size="30" :color="COLOURS['theme-color']" name="setting"></up-icon>
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
	if (!userInfo.value.uuId) {
		uni.showToast({
			title: "暂无用户ID",
			icon: "none",
		});
		return;
	}
    uni.setClipboardData({
        data: userInfo.value.uuId,
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
	padding: 0 15px;
	.user-avatar {
		margin-right: 10px;
	}
	.user-info {
		min-width: 0;
		.user-account {
			color: $tinge-color;
			margin: 3px 0;
			.user-account-label {
				color: $theme-color;
                margin-right: 10px;
			}
		}
		.user-info-detail {
			justify-content: start;
			.user-info-detail-item {
				padding: 2px 12px;
				border-radius: 50px;
				background-color: $light-color;
				color: $tinge-color;
				&:last-child {
					margin-left: 10px;
					color: #fff;
					background-color: $theme-color;
				}
			}
		}
	}
	.guest-info {
		.user-name {
			color: #333333;
		}
		.guest-desc {
			margin: 5px 0 8px;
			color: $tinge-color;
			font-size: 13px;
			line-height: 1.3;
		}
		.guest-login-btn {
			width: 96px;
			height: 30px;
			margin: 0;
		}
	}
}
</style>
