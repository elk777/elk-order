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
							<view v-if="getBadgeCount(fun)" class="fun-badge pubFlex">
								{{ getBadgeCount(fun) > 99 ? "99+" : getBadgeCount(fun) }}
							</view>
							<up-icon name="arrow-right" class="fun-list-arrow" />
						</view>
					</view>
				</template>
			</view>
		</template>
	</up-card>
</template>
<script setup>
import { reactive, ref, watch } from "vue";
import { COLOURS } from "@/config/index.js";
import { requireLogin } from "@/utils/auth.js";
import { getMyFeedbackList } from "@/apis/feedback.js";
import { countUnreadFeedback, normalizeFeedbackList } from "@/utils/feedback.js";
import { useUserStore } from "@/stores/user.js";

/** 角标只看最近 20 条工单：未读提醒是时效性提示，翻更早的历史没有意义 */
const BADGE_LOOKUP_PAGE_SIZE = 20;

const userStore = useUserStore();
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
		name: "我的反馈",
		icon: "list",
		path: "/pages/my/feedback/list",
		open: true,
		badgeKey: "feedbackUnread",
	},
	{
		// 不再用 openType="feedback" 打开微信原生反馈：那条通道的数据落在微信官方后台，
		// 拿不回自家库，也就没法接工单核实与积分补偿闭环
		id: 4,
		name: "意见反馈",
		icon: "chat-fill",
		path: "/pages/my/feedback/index",
		open: true,
	},
	{
		id: 5,
		name: "联系客服",
		icon: "kefu-ermai",
		path: "/pages/my/contact",
		openType: "contact",
	},
]);

// 各入口的未读角标数量，key 与 funList 项的 badgeKey 对应
const badgeCounts = reactive({
	feedbackUnread: 0,
});

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

/**
 * @description: 读取入口对应的未读角标数量
 * @param {Object} fun 功能项
 * @return {number} 未读数量，无角标返回 0
 */
const getBadgeCount = (fun) => (fun.badgeKey ? badgeCounts[fun.badgeKey] || 0 : 0);

/**
 * 刷新「我的反馈」未读角标。
 * 【为什么已读态放前端】后端 feedback 表没有 isRead 字段，用户端响应也刻意精简掉了内部字段。
 * 「用户看过没看过」是纯客户端展示态，为它加一列、加一个已读上报接口的收益远小于成本，
 * 因此用本地存储记录已看过的工单 id，与列表里 status===3 的工单比对得出未读数。
 * @return {Promise<void>}
 */
const refreshFeedbackBadge = async () => {
	// 未登录不请求：/feedback/mine 需要鉴权，硬发只会触发 401 与多余的登录跳转
	if (!userStore.isLogin) {
		badgeCounts.feedbackUnread = 0;
		return;
	}

	try {
		const res = await getMyFeedbackList({ page: 1, pageSize: BADGE_LOOKUP_PAGE_SIZE });
		if (res?.code !== 200) return;
		badgeCounts.feedbackUnread = countUnreadFeedback(normalizeFeedbackList(res.data?.list));
	} catch (error) {
		// 角标是锦上添花的提示，失败只记日志，不打扰用户
		console.warn("[my] refresh feedback badge failed", error);
	}
};

watch(() => userStore.isLogin, () => refreshFeedbackBadge(), { immediate: true });

defineExpose({
	refreshFeedbackBadge,
});
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
	display: flex;
	align-items: center;
	justify-content: flex-end;
	min-width: 42rpx;
	height: 42rpx;
	border-radius: 50%;
}

.fun-badge {
	min-width: 34rpx;
	height: 34rpx;
	padding: 0 10rpx;
	margin-right: 10rpx;
	border-radius: 999rpx;
	box-sizing: border-box;
	background: #ff3b30;
	color: #ffffff;
	font-size: 21rpx;
	font-weight: 700;
}

.fun-list-arrow {
	font-size: 30rpx;
	color: #9ba0aa;
}
</style>
