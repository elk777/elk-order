<!--
 * @Author: elk
 * @Date: 2026-02-09 10:48:39
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-09 16:25:11
 * @FilePath: /hkt-applet/pages/my/component/User.vue
 * @Description: 用户信息模块
-->
<template>
	<view class="user-container pubFlex">
		<view class="user-info-left pubFlex">
			<view class="user-avatar">
				<up-avatar shape="circle" :src="userInfo.avatar" size="75" />
			</view>
			<view class="user-info">
				<view class="user-name publcTitleSize">{{ userInfo.nickName }}</view>
				<view class="user-account pubFlex">
					用户ID：<span class="user-account-label font-weight-600">{{ userInfo.uuId }}</span>
					<up-icon @click="copyUserId" size="20" :color="COLOURS['theme-color']" name="fingerprint"></up-icon>
				</view>
				<view class="user-info-detail pubFlex">
					<view class="user-info-detail-item">{{ userInfo.gender === 0 ? "男" : "女" }}</view>
					<view class="user-info-detail-item">{{ userInfo.userType === 0 ? "饲养员" : "吃货" }}</view>
				</view>
			</view>
		</view>
		<view class="user-info-right">
			<up-icon @click="handleClickSetting" size="30" :color="COLOURS['theme-color']" name="setting"></up-icon>
		</view>
	</view>

    <UserEdit :show="showEdit" @close="() => showEdit = false" />
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user.js";
import { COLOURS } from "@/config/index.js";

import UserEdit from "./UserEdit.vue";
const userInfo = ref(useUserStore().profile);

const showEdit = ref(false);

/**
 * @description: 复制用户ID
 * @return {*}
 */
const copyUserId = () => {
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
    showEdit.value = true;
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
	.user-name {
	}
}
</style>
