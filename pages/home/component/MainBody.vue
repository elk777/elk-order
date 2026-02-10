<!--
 * @Author: elk
 * @Date: 2025-08-06 21:16:08
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 16:27:20
 * @FilePath: /hkt-applet/pages/home/component/MainBody.vue
 * @Description: 首页-中心内容
-->
<template>
	<view class="mainbody-container pubColumnFlex">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: getUniTopNavHeight() + 'px' }"></view>
		<!-- 左右 饲养员  吃货 -->
		<view class="kind pubFlex">
			<view class="kind-head pubColumnFlex">
				<view v-if="userStore.token" class="kind-head-img">
					<up-image
						shape="circle"
						width="50px"
						height="50px"
						src="https://cdn.uviewui.com/uview/album/1.jpg"
					></up-image>
				</view>
				<view v-else class="kind-head-unselected">
					<span class="unselected-plus"></span>
				</view>
				<view class="kind-name publcLabelSize">
					{{ foramtCrveUserType }}
				</view>
			</view>
			<Love />
			<view class="kind-head pubColumnFlex">
				<view class="kind-head-unselected">
					<span class="unselected-plus"></span>
				</view>
				<view class="kind-name publcLabelSize"> 吃货 </view>
			</view>
		</view>
		<!-- 吃饭时间  日历-->
		<view class="calendar">
			<view>我们在一起吃饭已经</view>
			<view class="calendar-days"><span class="calendar-days-span publcTitleSize">13</span>天</view>
			<view>2025/08/06 周三</view>
		</view>
		<!-- 邀请另一半开通按钮 -->
		<view class="invite">
			<up-button
				custom-style="border-color: #fff "
				class="invite-btn"
				:plain="false"
				color="rgba(0,0,0,.15)"
				:icon="sofaIcon"
				shape="circle"
				>邀请另一半开通</up-button
			>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from "vue";
import { getUniTopNavHeight } from "@/utils/tool.js";
import { useUserStore } from "@/stores/user.js";

import Love from "@/components/Love/index.vue";

const userStore = useUserStore();
const sofaIcon = ref("/static/images/love-sofa.svg");

// 格式化当前账户类型展示
const foramtCrveUserType = computed(() => {
	return userStore.userType ? "吃货" : "饲养员";
});
</script>

<style lang="scss" scoped>
.mainbody-container {
	color: #ffffff;
	padding: 0 20rpx;
	.kind {
		.kind-head {
		}

		.kind-head-img {
			border-radius: 50%;
			padding: 1px;
			border: 1px solid;
		}

		.kind-head-unselected {
			position: relative;
			width: 50px;
			height: 50px;
			padding: 1px;
			border: 1px solid $theme-color;
			background-color: #fff;
			border-radius: 50%;

			.unselected-plus {
				position: absolute;
				top: 10px;
				left: 10px;
				width: 100%;
				height: 100%;
				z-index: 1;
				background-image: url("/static/images/add.svg");
				background-repeat: no-repeat;
			}
		}

		.kind-name {
			width: 130rpx;
			margin-top: 30rpx;
			background-color: #ffffff;
			text-align: center;
			border-radius: 25rpx;
			padding: 10rpx 0rpx;
			color: $theme-color;
		}
	}
	.calendar {
		margin: 30rpx 0;
		text-align: center;

		.calendar-days {
			margin: 30rpx 0;
		}

		.calendar-days-span {
			font-size: 52rpx;
		}
	}

	.invite {
		width: 450rpx;
		margin: 0 auto;
		.invite-btn {
			:deep(.u-button) {
				border-color: #ffffff !important;
			}
		}
	}
}
</style>
