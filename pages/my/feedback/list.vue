<!--
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/pages/my/feedback/list.vue
 * @Description: 我的反馈-工单列表
-->
<template>
	<z-paging
		ref="pagingRef"
		v-model="ticketList"
		:default-page-size="PAGE_SIZE"
		bg-color="linear-gradient(180deg, #fff6f9 0, #fdf8f9 300rpx, #f7f7f8 560rpx)"
		@query="queryTicketList"
	>
		<view class="feedback-list">
			<view
				v-for="ticket in ticketList"
				:key="ticket.id"
				class="ticket-card"
				@click="openDetail(ticket)"
			>
				<view class="ticket-tags">
					<view class="ticket-tag" :style="tagStyle(getFeedbackTypeInfo(ticket.type))">
						{{ getFeedbackTypeInfo(ticket.type).label }}
					</view>
					<view class="ticket-tag" :style="tagStyle(getFeedbackStatusInfo(ticket.status))">
						{{ getFeedbackStatusInfo(ticket.status).label }}
					</view>
				</view>
				<view class="ticket-content">{{ ticket.content }}</view>
				<view v-if="ticket.images.length" class="ticket-shots">
					<image
						v-for="(image, index) in ticket.images"
						:key="image"
						class="ticket-shot"
						:src="image"
						mode="aspectFill"
						@click.stop="previewShots(ticket, index)"
					/>
				</view>
				<view v-if="ticket.reply" class="reply-box">
					<view class="reply-label">官方回复</view>
					<view class="reply-text">{{ ticket.reply }}</view>
				</view>
				<view class="ticket-foot">
					<text class="ticket-time">#{{ ticket.id }} · {{ formatRelativeTime(ticket.createTime) }}</text>
					<view v-if="ticket.rewardPoints" class="reward-pill">
						<up-icon name="integral" size="12" :color="COLOURS['theme-color']"></up-icon>
						<text class="reward-pill-text">已补偿 {{ ticket.rewardPoints }} 积分</text>
					</view>
				</view>
			</view>
		</view>
		<template #empty>
			<EmptyState
				icon="empty-list"
				title="还没有提交过反馈"
				desc="遇到问题随时告诉我们，核实后会补偿积分"
				actionText="去反馈"
				@action="goSubmit"
			/>
		</template>
	</z-paging>
</template>

<script setup>
import { ref } from "vue";
import EmptyState from "@/components/EmptyState/index.vue";
import { COLOURS, getFeedbackStatusInfo, getFeedbackTypeInfo } from "@/config/index.js";
import { getMyFeedbackList } from "@/apis/feedback.js";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";
import { useUserStore } from "@/stores/user.js";
import { formatRelativeTime } from "@/utils/tool.js";
import { cacheFeedbackTicket, markFeedbackTicketsSeen, normalizeFeedbackList } from "@/utils/feedback.js";

useAuthGuard();

const PAGE_SIZE = 10;

const userStore = useUserStore();
const pagingRef = ref(null);
const ticketList = ref([]);

/**
 * @description: 分页查询我的反馈，由 z-paging 在下拉刷新与触底加载时驱动
 * @param {number} pageNo 页码，从 1 开始
 * @param {number} pageSize 每页条数
 * @return {Promise<void>}
 */
async function queryTicketList(pageNo, pageSize) {
	// 未登录时直接给空列表：/feedback/mine 需要鉴权，硬发请求只会换来 401 和一次多余的登录跳转
	if (!userStore.isLogin) {
		pagingRef.value?.complete([]);
		return;
	}

	try {
		const res = await getMyFeedbackList({ page: pageNo, pageSize });
		if (res?.code !== 200) {
			throw new Error(res?.message || "加载失败");
		}
		const list = normalizeFeedbackList(res.data?.list);
		// 列表已内联展示官方回复与补偿积分，看到即视为已读，「我的」入口角标随之清除
		markFeedbackTicketsSeen(list);
		pagingRef.value?.completeByTotal(list, Number(res.data?.total) || 0);
	} catch (error) {
		console.warn("[feedback] load list failed", error);
		// 传 false 让 z-paging 保留已加载数据并展示加载失败态，而不是把列表清空
		pagingRef.value?.complete(false);
		uni.showToast({
			title: error?.message || "加载失败",
			icon: "none",
		});
	}
}
/**
 * @description: 标签配色，类型与状态两种标签共用一套结构
 * @param {Object} info 枚举展示信息，来自 config 的 FEEDBACK_*_INFO
 * @return {Object} 行内样式
 */
function tagStyle(info) {
	return {
		color: info.color,
		background: info.bgColor,
	};
}

function openDetail(ticket) {
	// 用户端没有 /feedback/:id，详情页靠这份缓存免请求渲染；缓存未命中时详情页会自行兜底查询
	cacheFeedbackTicket(ticket);
	uni.navigateTo({
		url: `/pages/my/feedback/detail?id=${ticket.id}`,
	});
}

function previewShots(ticket, index) {
	uni.previewImage({
		urls: ticket.images,
		current: index,
	});
}

function goSubmit() {
	uni.redirectTo({
		url: "/pages/my/feedback/index",
	});
}
</script>
<style lang="scss" scoped>
.feedback-list {
	padding: 24rpx 26rpx 44rpx;
}

.ticket-card {
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

.ticket-content {
	display: -webkit-box;
	overflow: hidden;
	color: #303133;
	font-size: 28rpx;
	font-weight: 500;
	line-height: 1.65;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.ticket-shots {
	display: flex;
	gap: 12rpx;
	margin-top: 18rpx;
}

.ticket-shot {
	width: 104rpx;
	height: 104rpx;
	border-radius: 16rpx;
	background: #f4f6f9;
}
.reply-box {
	padding: 20rpx 22rpx;
	margin-top: 20rpx;
	border-left: 5rpx solid $theme-color;
	border-radius: 20rpx;
	background: #f8f9fb;
}

.reply-label {
	margin-bottom: 8rpx;
	color: $theme-color;
	font-size: 21rpx;
	font-weight: 700;
}

.reply-text {
	color: #606266;
	font-size: 25rpx;
	line-height: 1.7;
}

.ticket-foot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 18rpx;
	margin-top: 20rpx;
	border-top: 1rpx solid #f1f2f5;
}

.ticket-time {
	color: #c0c4cc;
	font-size: 22rpx;
}

.reward-pill {
	display: flex;
	align-items: center;
	gap: 8rpx;
	height: 42rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: #fff1f5;
}

.reward-pill-text {
	color: $theme-color;
	font-size: 22rpx;
	font-weight: 700;
}
</style>
