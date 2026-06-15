<!--
 * @Author: elk
 * @Date: 2026-02-09 14:03:58
 * @LastEditors: elk 
 * @LastEditTime: 2026-06-13 03:32:34
 * @FilePath: /hkt-applet/pages/my/component/FunList.vue
 * @Description: 功能列表模块
-->
<template>
	<up-card
		class="fun-list-container"
		margin="0"
		border-radius="16"
		:show-head="false"
		:head-border-bottom="false"
		:border="false"
	>
		<template #body>
			<view class="fun-list-body">
				<template v-for="fun in funList" :key="fun.id">
					<button v-if="fun.openType" class="fun-list-item open-button pubFlex" :open-type="fun.openType" hover-class="none">
						<view class="fun-list-left pubFlex">
							<view class="fun-icon-wrap pubFlex">
								<up-icon :color="COLOURS['theme-color']" :name="fun.icon" size="23" />
							</view>
							<view class="fun-list-name publcTextSize">{{ fun.name }}</view>
						</view>
						<view class="fun-arrow-wrap pubFlex">
							<up-icon name="arrow-right" class="fun-list-arrow" />
						</view>
					</button>
					<view v-else @click="navigateTo(fun)" class="fun-list-item pubFlex">
						<view class="fun-list-left pubFlex">
							<view class="fun-icon-wrap pubFlex">
								<up-icon :color="COLOURS['theme-color']" :name="fun.icon" size="23" />
							</view>
							<view class="fun-list-name publcTextSize">{{ fun.name }}</view>
						</view>
						<view class="fun-arrow-wrap pubFlex">
							<up-icon name="arrow-right" class="fun-list-arrow" />
						</view>
					</view>
				</template>
			</view>
		</template>
	</up-card>
</template>
<script setup>
import { ref } from "vue";
import { COLOURS } from "@/config/index.js";
import { requireLogin } from "@/utils/auth.js";
const funList = ref([
	{
		id: 0,
		name: "我的积分",
		icon: "coupon-fill",
		path: "/pages/my/integral",
		open: true,
	},
	{
		id: 1,
		name: "每日签到",
		icon: "calendar-fill",
		path: "/pages/my/attendance",
		open: true,
	},
	{
		id: 2,
		name: "烹饪日历",
		icon: "calendar",
		path: "/pages/my/calendar",
		open: true,
	},
	{
		id: 3,
		name: "意见反馈",
		icon: "chat-fill",
		path: "/pages/my/feedback",
		openType: "feedback",
	},
	{
		id: 4,
		name: "联系客服",
		icon: "kefu-ermai",
		path: "/pages/my/contact",
		openType: "contact",
	},
]);


/**
 * @description: 点击跳转
 * @param {*} path
 * @return {*}
 */
const navigateTo = (fun) => {
	if (fun.open) {
		requireLogin(() => {
			uni.navigateTo({
				url: fun.path,
			});
		}, {
			redirect: fun.path,
		});
	} else {
		uni.showToast({
			title: "功能暂未开放",
			icon: "none",
		});
	}
};
</script>
<style lang="scss" scoped>
.fun-list-container {
	display: block;

	:deep(.fun-list-container.u-card) {
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 16rpx !important;
		box-shadow: 0 16rpx 36rpx rgba(40, 40, 40, 0.04);
	}

	:deep(.u-card) {
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 16rpx !important;
		box-shadow: 0 16rpx 36rpx rgba(40, 40, 40, 0.04);
	}

	:deep(.u-card__body) {
		padding: 14rpx 22rpx !important;
	}
}

.fun-list-body {
	justify-content: space-between;
}

.fun-list-item {
	width: 100%;
	min-height: 104rpx;
	box-sizing: border-box;
	justify-content: space-between;
	padding: 14rpx 0;
	border-bottom: 1rpx solid #f1f2f5;

	.fun-list-left {
		justify-content: flex-start;
		min-width: 0;
	}

	.fun-icon-wrap {
		flex-shrink: 0;
		width: 54rpx;
		height: 54rpx;
		border-radius: 16rpx;
		background: #fff2f6;
	}

    .fun-list-name {
		min-width: 0;
		margin-left: 18rpx;
		overflow: hidden;
		color: #303133;
		font-size: 16px;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
    }

    &:last-child {
        border-bottom: none;
    }
}

.open-button {
	margin: 0;
	border: none;
	border-radius: 0;
	background: transparent;
	box-sizing: border-box;
	color: inherit;
	font-size: inherit;
	line-height: inherit;
	text-align: left;
}

.open-button::after {
	border: none;
}

.fun-arrow-wrap {
	flex-shrink: 0;
	width: 42rpx;
	height: 42rpx;
	border-radius: 50%;
}

.fun-list-arrow {
	font-size: 30rpx;
	color: #9ba0aa;
}
</style>
