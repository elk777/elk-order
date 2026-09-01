<!--
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/pages/my/feedback/detail.vue
 * @Description: 我的反馈-工单详情
-->
<template>
	<view class="feedback-detail-page">
		<template v-if="ticket">
			<view class="detail-card">
				<view class="ticket-tags">
					<view class="ticket-tag" :style="tagStyle(typeInfo)">{{ typeInfo.label }}</view>
					<view class="ticket-tag" :style="tagStyle(statusInfo)">{{ statusInfo.label }}</view>
				</view>
				<view class="detail-content">{{ ticket.content }}</view>
				<view v-if="ticket.images.length" class="detail-shots">
					<image
						v-for="(image, index) in ticket.images"
						:key="image"
						class="detail-shot"
						:src="image"
						mode="aspectFill"
						@click="previewShots(index)"
					/>
				</view>
				<view class="detail-foot">
					<text class="detail-time">
						工单号 #{{ ticket.id }} · {{ formatRelativeTime(ticket.createTime) }}
					</text>
				</view>
			</view>

			<view v-if="showRewardCard" class="reward-card">
				<view class="reward-icon pubFlex">
					<up-icon name="gift-fill" size="20" color="#ffffff"></up-icon>
				</view>
				<view class="reward-body">
					<view class="reward-label">问题已核实，补偿积分</view>
					<view class="reward-value">
						+{{ ticket.rewardPoints }}<text class="reward-unit"> 积分</text>
					</view>
				</view>
			</view>

			<view v-if="ticket.reply" class="detail-card">
				<view class="card-title">官方回复</view>
				<view class="reply-row">
					<view class="reply-avatar pubFlex">官</view>
					<view class="reply-content">{{ ticket.reply }}</view>
				</view>
			</view>
			<view class="detail-card">
				<view class="card-title">处理进度</view>
				<view
					v-for="(step, index) in progressSteps"
					:key="step.key"
					class="step"
					:class="{ 'step--active': step.active, 'step--last': index === progressSteps.length - 1 }"
				>
					<view class="step-dot pubFlex">
						<up-icon v-if="step.active" name="checkmark" size="10" color="#ffffff"></up-icon>
					</view>
					<view class="step-body">
						<view class="step-title">{{ step.title }}</view>
						<view class="step-desc">{{ step.desc }}</view>
					</view>
				</view>
			</view>
		</template>

		<EmptyState
			v-else-if="!loading"
			icon="empty-data"
			title="没有找到这条反馈"
			desc="它可能已被删除，返回列表刷新后再试"
			actionText="返回列表"
			@action="goList"
		/>
	</view>
</template>
<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import EmptyState from "@/components/EmptyState/index.vue";
import { FEEDBACK_STATUS, getFeedbackStatusInfo, getFeedbackTypeInfo } from "@/config/index.js";
import { getMyFeedbackList } from "@/apis/feedback.js";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";
import { useUserStore } from "@/stores/user.js";
import { formatDateTime, formatRelativeTime } from "@/utils/tool.js";
import {
	cacheFeedbackTicket,
	getCachedFeedbackTicket,
	isFeedbackHandled,
	markFeedbackTicketsSeen,
	normalizeFeedbackList,
} from "@/utils/feedback.js";

useAuthGuard();

/** 兜底查询的分页参数，覆盖最近 100 条工单，足够定位任意一条用户自己的反馈 */
const LOOKUP_PAGE_SIZE = 20;
const LOOKUP_MAX_PAGES = 5;

const userStore = useUserStore();
const ticket = ref(null);
const loading = ref(true);

const typeInfo = computed(() => getFeedbackTypeInfo(ticket.value?.type));
const statusInfo = computed(() => getFeedbackStatusInfo(ticket.value?.status));
const showRewardCard = computed(
	() => ticket.value?.status === FEEDBACK_STATUS.REWARDED && ticket.value?.rewardPoints > 0,
);

const progressSteps = computed(() => {
	const current = ticket.value;
	if (!current) return [];

	const handled = isFeedbackHandled(current);
	const isRewarded = current.status === FEEDBACK_STATUS.REWARDED;
	return [
		{
			key: "submitted",
			title: "已提交",
			desc: `${formatRelativeTime(current.createTime)} · 已进入工单队列`,
			active: true,
		},
		{
			key: "verify",
			title: current.status === FEEDBACK_STATUS.REJECTED ? "已驳回" : "人工核实",
			desc: resolveVerifyDesc(current),
			active: handled,
		},
		{
			key: "reward",
			title: "补偿发放",
			desc: resolveRewardDesc(current),
			active: isRewarded,
		},
	];
});

onLoad((options) => {
	loadTicket(options?.id);
});

/**
 * @description: 载入工单详情，优先用列表页写入的缓存
 * @param {string} id 工单 id
 * @return {Promise<void>}
 */
async function loadTicket(id) {
	const ticketId = id ? String(id) : "";
	if (!ticketId) {
		loading.value = false;
		return;
	}

	const cached = getCachedFeedbackTicket(ticketId);
	if (cached) {
		applyTicket(cached);
		loading.value = false;
		return;
	}

	await lookupTicket(ticketId);
}

/**
 * 缓存未命中时的兜底查询。
 * 小程序冷启动、开发者工具热重载都会清空内存缓存，此时只能从分页接口里把这条工单找回来。
 * @param {string} ticketId 工单 id
 * @return {Promise<void>}
 */
async function lookupTicket(ticketId) {
	if (!userStore.isLogin) {
		loading.value = false;
		return;
	}

	loading.value = true;
	try {
		for (let page = 1; page <= LOOKUP_MAX_PAGES; page += 1) {
			const res = await getMyFeedbackList({ page, pageSize: LOOKUP_PAGE_SIZE });
			if (res?.code !== 200) break;

			const list = normalizeFeedbackList(res.data?.list);
			const matched = list.find((item) => item.id === ticketId);
			if (matched) {
				cacheFeedbackTicket(matched);
				applyTicket(matched);
				return;
			}
			// 最后一页不满一页说明已经翻到底，再翻只是空请求
			if (list.length < LOOKUP_PAGE_SIZE) break;
		}
	} catch (error) {
		console.warn("[feedback] lookup detail failed", error);
	} finally {
		loading.value = false;
	}
}

function applyTicket(current) {
	ticket.value = current;
	// 打开详情即视为看过处理结果，与列表页共用同一套本地已读态
	markFeedbackTicketsSeen([current]);
}

/**
 * @description: 人工核实节点的说明文案
 * @param {Object} current 工单
 * @return {string} 节点说明
 */
function resolveVerifyDesc(current) {
	if (!isFeedbackHandled(current)) return "排队中，通常 24 小时内处理";

	const handleTimeText = current.handleTime ? `${formatDateTime(current.handleTime)} · ` : "";
	if (current.status === FEEDBACK_STATUS.REJECTED) return `${handleTimeText}未通过核实`;
	return `${handleTimeText}已确认为有效问题`;
}

/**
 * @description: 补偿发放节点的说明文案
 * @param {Object} current 工单
 * @return {string} 节点说明
 */
function resolveRewardDesc(current) {
	if (current.status === FEEDBACK_STATUS.REWARDED) return `${current.rewardPoints} 积分已到账`;
	if (current.status === FEEDBACK_STATUS.REJECTED) return "本次未发放补偿";
	return "核实通过后自动发放";
}

function tagStyle(info) {
	return {
		color: info.color,
		background: info.bgColor,
	};
}

function previewShots(index) {
	uni.previewImage({
		urls: ticket.value?.images || [],
		current: index,
	});
}

function goList() {
	// 详情通常由列表打开，返回上一页即可；直接进入详情时兜底换页到列表
	uni.navigateBack({
		fail: () => {
			uni.redirectTo({ url: "/pages/my/feedback/list" });
		},
	});
}
</script>
<style lang="scss" scoped>
.feedback-detail-page {
	min-height: 100vh;
	padding: 24rpx 26rpx 44rpx;
	box-sizing: border-box;
	background: linear-gradient(180deg, #fff6f9 0, #fdf8f9 300rpx, #f7f7f8 560rpx), #f7f7f8;
}

.detail-card {
	padding: 26rpx;
	margin-bottom: 20rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 16rpx 34rpx rgba(40, 40, 40, 0.04);
}

.ticket-tags {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.ticket-tag {
	height: 44rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 44rpx;
}

.detail-content {
	color: #303133;
	font-size: 28rpx;
	line-height: 1.8;
}

.detail-shots {
	display: flex;
	gap: 16rpx;
	margin-top: 20rpx;
}

.detail-shot {
	width: 124rpx;
	height: 124rpx;
	border-radius: 16rpx;
	background: #f4f6f9;
}
.detail-foot {
	padding-top: 18rpx;
	margin-top: 20rpx;
	border-top: 1rpx solid #f1f2f5;
}

.detail-time {
	color: #c0c4cc;
	font-size: 22rpx;
}

.reward-card {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 26rpx;
	margin-bottom: 20rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.18);
	border-radius: 28rpx;
	background: linear-gradient(145deg, #fff5f8, #ffffff);
	box-shadow: 0 16rpx 34rpx rgba(255, 92, 141, 0.08);
}

.reward-icon {
	flex-shrink: 0;
	width: 80rpx;
	height: 80rpx;
	border-radius: 26rpx;
	background: linear-gradient(145deg, #ff5c8d 0%, #ff7ca5 55%, #ffc0cc 100%);
}

.reward-body {
	flex: 1;
	min-width: 0;
}

.reward-label {
	color: #606266;
	font-size: 26rpx;
}

.reward-value {
	margin-top: 4rpx;
	color: $theme-color;
	font-size: 42rpx;
	font-weight: 700;
	line-height: 1.2;
}

.reward-unit {
	font-size: 24rpx;
	font-weight: 600;
}
.card-title {
	margin-bottom: 18rpx;
	color: #9ba0aa;
	font-size: 22rpx;
	font-weight: 700;
	letter-spacing: 1rpx;
}

.reply-row {
	display: flex;
	gap: 18rpx;
}

.reply-avatar {
	flex-shrink: 0;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: linear-gradient(145deg, #ff5c8d 0%, #ff7ca5 55%, #ffc0cc 100%);
	color: #ffffff;
	font-size: 24rpx;
	font-weight: 700;
}

.reply-content {
	flex: 1;
	min-width: 0;
	color: #606266;
	font-size: 26rpx;
	line-height: 1.8;
}

.step {
	position: relative;
	display: flex;
	gap: 22rpx;
	padding-bottom: 36rpx;
}

.step::before {
	position: absolute;
	left: 18rpx;
	top: 44rpx;
	bottom: 0;
	width: 3rpx;
	background: #edeef1;
	content: "";
}

.step--last {
	padding-bottom: 0;
}

.step--last::before {
	display: none;
}
.step-dot {
	position: relative;
	z-index: 1;
	flex-shrink: 0;
	width: 38rpx;
	height: 38rpx;
	margin-top: 2rpx;
	border-radius: 50%;
	background: #edeef1;
}

.step--active .step-dot {
	background: linear-gradient(145deg, #ff5c8d 0%, #ff7ca5 55%, #ffc0cc 100%);
	box-shadow: 0 0 0 6rpx rgba(255, 92, 141, 0.13);
}

.step-body {
	flex: 1;
	min-width: 0;
}

.step-title {
	color: #c0c4cc;
	font-size: 27rpx;
	font-weight: 600;
}

.step--active .step-title {
	color: #303133;
}

.step-desc {
	margin-top: 6rpx;
	color: #c0c4cc;
	font-size: 23rpx;
	line-height: 1.6;
}

.step--active .step-desc {
	color: #9ba0aa;
}
</style>
