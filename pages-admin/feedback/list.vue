<!--
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/pages-admin/feedback/list.vue
 * @Description: 管理端反馈工单列表（仅 H5）
-->
<template>
	<view class="admin-page">
		<view class="admin-shell">
			<view class="ad-head">
				<view class="ad-head-row">
					<text class="ad-title">反馈工单</text>
					<view class="ad-who" @click="handleLogout">
						<view class="ad-who-ava">{{ operatorInitial }}</view>
						<text class="ad-who-name">{{ operatorName }}</text>
						<up-icon name="arrow-right" size="12px" color="rgba(255,255,255,0.75)"></up-icon>
					</view>
				</view>
				<view class="ad-kpi">
					<view class="ad-kpi-item">
						<text class="ad-kpi-num">{{ stats.pendingCount }}</text>
						<text class="ad-kpi-label">待处理</text>
					</view>
					<view class="ad-kpi-item">
						<text class="ad-kpi-num">{{ stats.rewardedCount }}</text>
						<text class="ad-kpi-label">已补偿</text>
					</view>
					<view class="ad-kpi-item">
						<text class="ad-kpi-num">{{ stats.totalPoints }}</text>
						<text class="ad-kpi-label">累计积分</text>
					</view>
				</view>
			</view>

			<view class="ad-tabs">
				<view
					v-for="tab in TABS"
					:key="tab.value"
					class="ad-tab"
					:class="{ on: activeTab === tab.value }"
					@click="switchTab(tab.value)"
				>
					<text>{{ tab.label }}</text>
					<text class="ad-tab-num">{{ tabCount(tab.value) }}</text>
				</view>
			</view>

			<view class="ad-body">
				<view v-if="!ticketList.length && !loading" class="ad-empty">
					<up-icon name="bell" size="26px" color="#FF5C8D"></up-icon>
					<text class="ad-empty-text">{{ emptyText }}</text>
				</view>

				<view
					v-for="ticket in ticketList"
					:key="ticket.id"
					class="ad-item"
					:class="{ hot: isPendingTab }"
					@click="openDetail(ticket)"
				>
					<view class="ad-item-user">
						<image v-if="ticket.user.avatar" class="ad-ava" :src="ticket.user.avatar" mode="aspectFill" />
						<view v-else class="ad-ava ad-ava-text">{{ ticket.user.initial }}</view>
						<view class="ad-item-meta">
							<text class="ad-item-nick">{{ ticket.user.nickName }}</text>
							<text class="ad-item-sub">{{ ticket.user.uuid }} · {{ formatRelativeTime(ticket.createTime) }}</text>
						</view>
						<view class="ad-item-tags">
							<view class="ad-tag" :style="tagStyle(getFeedbackTypeInfo(ticket.type))">
								{{ getFeedbackTypeInfo(ticket.type).label }}
							</view>
							<view
								v-if="!isPendingTab"
								class="ad-tag"
								:style="tagStyle(getFeedbackStatusInfo(ticket.status))"
							>
								{{ getFeedbackStatusInfo(ticket.status).label }}
							</view>
						</view>
					</view>

					<view class="ad-item-content">{{ ticket.content }}</view>

					<view v-if="ticket.images.length" class="ad-item-shots">
						<image
							v-for="image in ticket.images"
							:key="image"
							class="ad-shot"
							:src="image"
							mode="aspectFill"
						/>
					</view>

					<view class="ad-item-foot">
						<text class="ad-item-no">工单 #{{ ticket.id }}</text>
						<text v-if="ticket.rewardPoints" class="ad-item-reward">已补偿 {{ ticket.rewardPoints }} 积分</text>
						<text v-else-if="isPendingTab" class="ad-item-todo">待核实 ›</text>
					</view>
				</view>

				<view v-if="loading" class="ad-more">加载中…</view>
				<view v-else-if="ticketList.length && !hasMore" class="ad-more">没有更多了</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onPullDownRefresh, onReachBottom, onShow } from "@dcloudio/uni-app";
import { getFeedbackStatusInfo, getFeedbackTypeInfo } from "@/config/index.js";
import { formatRelativeTime } from "@/utils/tool.js";
import {
	adminLogout,
	getAdminFeedbackList,
	getAdminFeedbackStats,
	getAdminProfile,
	getAdminToken,
} from "@/apis/admin/index.js";
import { normalizeAdminTicketList } from "@/apis/admin/normalize.js";
import { ADMIN_FEEDBACK_TAB, ADMIN_LOGIN_PAGE } from "@/apis/admin/constants.js";

const PAGE_SIZE = 10;

const TABS = [
	{ value: ADMIN_FEEDBACK_TAB.PENDING, label: "待处理" },
	{ value: ADMIN_FEEDBACK_TAB.HANDLED, label: "已处理" },
];

const activeTab = ref(ADMIN_FEEDBACK_TAB.PENDING);
const ticketList = ref([]);
const loading = ref(false);
const page = ref(1);
const total = ref(0);
const stats = ref({ pendingCount: 0, rewardedCount: 0, handledCount: 0, totalPoints: 0 });
const operator = ref(null);

const isPendingTab = computed(() => activeTab.value === ADMIN_FEEDBACK_TAB.PENDING);
const hasMore = computed(() => ticketList.value.length < total.value);
const operatorName = computed(() => operator.value?.nickName || operator.value?.username || "管理员");
const operatorInitial = computed(() => operatorName.value.slice(0, 1).toUpperCase());
const emptyText = computed(() =>
	isPendingTab.value ? "暂无待处理工单" : "还没有处理过的工单",
);

// 用 onShow 而非 onLoad：从详情页处理完工单返回时列表要反映最新状态
onShow(() => {
	if (!ensureLoggedIn()) return;
	operator.value = getAdminProfile();
	reload();
});

onPullDownRefresh(async () => {
	await reload();
	uni.stopPullDownRefresh();
});

onReachBottom(() => {
	if (loading.value || !hasMore.value) return;
	page.value += 1;
	loadTicketList();
});

/**
 * 无 token 直接回登录页。
 * @description 请求封装会在 401 时跳转，但那要等一次失败的往返；本地已知未登录时提前拦下更快。
 * @return {boolean} 是否已登录
 */
function ensureLoggedIn() {
	if (getAdminToken()) return true;
	uni.reLaunch({ url: ADMIN_LOGIN_PAGE });
	return false;
}

/**
 * @description: 重置分页并重新拉取列表与统计
 * @return {Promise<void>}
 */
async function reload() {
	page.value = 1;
	ticketList.value = [];
	total.value = 0;
	await Promise.all([loadTicketList(), loadStats()]);
}

/**
 * 拉取当前 tab 的工单分页。
 * @description 两个 tab 的差异只在查询条件：待处理传 status=0，已处理传 handled=1
 * 让后端用 status != 0 过滤。不传条件在前端筛掉待处理会让分页与 total 都失真。
 * @return {Promise<void>}
 */
async function loadTicketList() {
	loading.value = true;
	try {
		const params = { page: page.value, pageSize: PAGE_SIZE };
		if (isPendingTab.value) {
			params.status = ADMIN_FEEDBACK_TAB.PENDING;
		} else {
			params.handled = 1;
		}

		const data = await getAdminFeedbackList(params);
		const list = normalizeAdminTicketList(data?.list);
		ticketList.value = page.value === 1 ? list : ticketList.value.concat(list);
		total.value = Number(data?.total) || 0;
	} catch (error) {
		// 401 已由请求封装跳转处理，这里只提示其余错误
		if (error?.code !== 401) {
			uni.showToast({ title: error?.message || "加载失败", icon: "none" });
		}
		// 加载失败时回退页码，避免触底重试直接跳过一页
		if (page.value > 1) page.value -= 1;
	} finally {
		loading.value = false;
	}
}

/**
 * @description: 拉取顶部 KPI 与 tab 计数
 * @return {Promise<void>}
 */
async function loadStats() {
	try {
		const data = await getAdminFeedbackStats();
		stats.value = {
			pendingCount: Number(data?.pendingCount) || 0,
			rewardedCount: Number(data?.rewardedCount) || 0,
			handledCount: Number(data?.handledCount) || 0,
			totalPoints: Number(data?.totalPoints) || 0,
		};
	} catch (error) {
		console.warn("[admin] load stats failed", error);
	}
}

/**
 * @description: 读取 tab 上的计数
 * @param {number} tabValue tab 取值，见 ADMIN_FEEDBACK_TAB
 * @return {number} 该 tab 下的工单数
 */
function tabCount(tabValue) {
	return tabValue === ADMIN_FEEDBACK_TAB.PENDING ? stats.value.pendingCount : stats.value.handledCount;
}

function switchTab(tabValue) {
	if (activeTab.value === tabValue) return;
	activeTab.value = tabValue;
	reload();
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
	uni.navigateTo({ url: `/pages-admin/feedback/detail?id=${ticket.id}` });
}

/**
 * @description: 登出并回到登录页
 * @return {Promise<void>}
 */
async function handleLogout() {
	const confirmed = await new Promise((resolve) => {
		uni.showModal({
			title: "退出登录",
			content: `当前登录：${operatorName.value}`,
			confirmText: "退出",
			success: (res) => resolve(res.confirm),
			fail: () => resolve(false),
		});
	});
	if (!confirmed) return;
	await adminLogout();
	uni.reLaunch({ url: ADMIN_LOGIN_PAGE });
}
</script>

<style lang="scss" scoped>
/* 管理端跑在桌面浏览器上，rpx 会按视口宽度换算导致字号失控，因此统一用 px */
.admin-page {
	min-height: 100vh;
	background: #f7f7f8;
}

.admin-shell {
	max-width: 560px;
	margin: 0 auto;
	background: #f7f7f8;
}

.ad-head {
	padding: 18px 16px 16px;
	background: linear-gradient(135deg, #ff7ba5 0, #ff5c8d 100%);
}

.ad-head-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.ad-title {
	color: #ffffff;
	font-size: 18px;
	font-weight: 700;
}

.ad-who {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 8px 4px 4px;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.18);
	cursor: pointer;
}

.ad-who-ava {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.32);
	color: #ffffff;
	font-size: 10px;
	font-weight: 700;
}

.ad-who-name {
	color: #ffffff;
	font-size: 12px;
	font-weight: 600;
}

.ad-kpi {
	display: flex;
	margin-top: 16px;
}

.ad-kpi-item {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
	gap: 3px;
}

.ad-kpi-num {
	color: #ffffff;
	font-size: 20px;
	font-weight: 700;
}

.ad-kpi-label {
	color: rgba(255, 255, 255, 0.78);
	font-size: 11px;
}

.ad-tabs {
	display: flex;
	padding: 0 16px;
	background: #ffffff;
	box-shadow: 0 2px 10px rgba(40, 40, 40, 0.04);
}

.ad-tab {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 13px 0;
	margin-right: 24px;
	border-bottom: 2px solid transparent;
	color: #9ba0aa;
	font-size: 14px;
	cursor: pointer;

	&.on {
		border-bottom-color: #ff5c8d;
		color: #303133;
		font-weight: 700;
	}
}

.ad-tab-num {
	padding: 1px 6px;
	border-radius: 999px;
	background: #f2f3f5;
	color: #909399;
	font-size: 11px;
	font-weight: 600;
}

.ad-tab.on .ad-tab-num {
	background: #fff1f5;
	color: #ff5c8d;
}

.ad-body {
	padding: 12px 12px 24px;
}

.ad-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 60px 0;
}

.ad-empty-text {
	color: #9ba0aa;
	font-size: 13px;
}

.ad-item {
	padding: 14px;
	margin-bottom: 10px;
	border: 1px solid rgba(255, 92, 141, 0.08);
	border-radius: 14px;
	background: #ffffff;
	box-shadow: 0 6px 18px rgba(40, 40, 40, 0.04);
	cursor: pointer;

	/* 待处理项左侧描边，让「需要我动手的」在列表里一眼可见 */
	&.hot {
		border-left: 3px solid #ff5c8d;
	}
}

.ad-item-user {
	display: flex;
	align-items: center;
	gap: 9px;
	margin-bottom: 10px;
}

.ad-ava {
	flex-shrink: 0;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background: #f4f6f9;
}

.ad-ava-text {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #ff7ba5 0, #ff5c8d 100%);
	color: #ffffff;
	font-size: 13px;
	font-weight: 700;
}

.ad-item-meta {
	flex: 1;
	min-width: 0;
}

.ad-item-nick {
	display: block;
	overflow: hidden;
	color: #303133;
	font-size: 14px;
	font-weight: 700;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.ad-item-sub {
	display: block;
	margin-top: 2px;
	overflow: hidden;
	color: #9ba0aa;
	font-size: 11px;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.ad-item-tags {
	display: flex;
	flex-shrink: 0;
	gap: 6px;
}

.ad-tag {
	padding: 3px 9px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 600;
}

.ad-item-content {
	display: -webkit-box;
	overflow: hidden;
	color: #303133;
	font-size: 13px;
	line-height: 1.65;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.ad-item-shots {
	display: flex;
	gap: 6px;
	margin-top: 10px;
}

.ad-shot {
	width: 46px;
	height: 46px;
	border-radius: 8px;
	background: #f4f6f9;
}

.ad-item-foot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 10px;
	margin-top: 11px;
	border-top: 1px solid #f1f2f5;
}

.ad-item-no {
	color: #c0c4cc;
	font-size: 11px;
}

.ad-item-reward {
	color: #ff5c8d;
	font-size: 11px;
	font-weight: 700;
}

.ad-item-todo {
	color: #ff5c8d;
	font-size: 11px;
	font-weight: 600;
}

.ad-more {
	padding: 14px 0;
	color: #c0c4cc;
	font-size: 12px;
	text-align: center;
}
</style>
