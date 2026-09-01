<!--
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/pages-admin/feedback/detail.vue
 * @Description: 管理端反馈工单详情与处理（仅 H5）
-->
<template>
	<view class="admin-page">
		<view class="admin-shell">
			<view class="ad-head">
				<view class="ad-head-row">
					<view class="ad-back" @click="goList">
						<up-icon name="arrow-left" size="16px" color="#ffffff"></up-icon>
						<text class="ad-back-text">工单 #{{ ticketId }}</text>
					</view>
					<view v-if="ticket" class="ad-tag" :style="tagStyle(typeInfo)">{{ typeInfo.label }}</view>
				</view>
			</view>

			<view v-if="loading" class="ad-loading">加载中…</view>

			<view v-else-if="ticket" class="ad-body">
				<view class="det-sec">
					<view class="det-title">用户信息</view>
					<view class="det-user">
						<image v-if="ticket.user.avatar" class="det-ava" :src="ticket.user.avatar" mode="aspectFill" />
						<view v-else class="det-ava det-ava-text">{{ ticket.user.initial }}</view>
						<view>
							<text class="det-nick">{{ ticket.user.nickName }}</text>
							<text class="det-uuid">{{ ticket.user.uuid }}</text>
						</view>
					</view>
					<view class="det-kv">
						<text class="det-k">历史反馈</text>
						<text class="det-v">{{ ticket.userStats.totalCount }} 条</text>
					</view>
					<view class="det-kv">
						<text class="det-k">历史获补偿</text>
						<text class="det-v" :class="{ warn: ticket.userStats.rewardedWarning }">
							{{ ticket.userStats.rewardedCount }} 次{{ ticket.userStats.rewardedWarning ? " ⚠︎" : "" }}
						</text>
					</view>
					<view class="det-kv">
						<text class="det-k">今日提交</text>
						<text class="det-v">{{ ticket.userStats.todayCount }} 条</text>
					</view>
					<view class="det-kv">
						<text class="det-k">提交时间</text>
						<text class="det-v">{{ formatDateTime(ticket.createTime) || "—" }}</text>
					</view>
				</view>

				<view class="det-sec">
					<view class="det-title">问题描述</view>
					<view class="det-content">{{ ticket.content }}</view>
					<view v-if="ticket.images.length" class="det-shots">
						<image
							v-for="(image, index) in ticket.images"
							:key="image"
							class="det-shot"
							:src="image"
							mode="aspectFill"
							@click="previewShots(index)"
						/>
					</view>
					<view v-if="ticket.contact" class="det-kv det-contact">
						<text class="det-k">联系方式</text>
						<text class="det-v">{{ ticket.contact }}</text>
					</view>
				</view>

				<view v-if="!isPending" class="det-sec">
					<view class="det-title">处理结果</view>
					<view class="det-kv">
						<text class="det-k">状态</text>
						<text class="det-v">{{ statusInfo.label }}</text>
					</view>
					<view v-if="ticket.rewardPoints" class="det-kv">
						<text class="det-k">补偿积分</text>
						<text class="det-v theme">{{ ticket.rewardPoints }}</text>
					</view>
					<view class="det-kv">
						<text class="det-k">幂等键</text>
						<text class="det-v mono">feedback_reward:{{ ticket.id }}</text>
					</view>
					<view v-if="ticket.handleTime" class="det-kv">
						<text class="det-k">处理时间</text>
						<text class="det-v">{{ formatDateTime(ticket.handleTime) }}</text>
					</view>
					<view v-if="ticket.reply" class="det-reply">{{ ticket.reply }}</view>
				</view>
			</view>

			<view v-if="ticket" class="act-bar">
				<template v-if="isPending">
					<button class="act-btn act-line" @click="openSheet('reject')">驳回</button>
					<button class="act-btn act-ok" @click="openSheet('approve')">认证通过</button>
				</template>
				<button v-else class="act-btn act-line act-full" @click="goList">返回列表</button>
			</view>
		</view>

		<!-- 处理弹层：档位与驳回原因都是固定枚举，界面上不提供任何手填金额入口 -->
		<view v-if="sheet" class="sheet-mask" @click="closeSheet"></view>
		<view v-if="sheet" class="sheet">
			<view class="sheet-head">
				<text class="sheet-title">{{ sheet === "approve" ? "确认补偿" : "驳回原因" }}</text>
				<view class="sheet-close" @click="closeSheet">
					<up-icon name="close" size="14px" color="#9BA0AA"></up-icon>
				</view>
			</view>

			<template v-if="sheet === 'approve'">
				<view class="sheet-sub">{{ approveHint }}</view>
				<view v-if="needLevel" class="level-list">
					<view
						v-for="item in FEEDBACK_REWARD_LEVELS"
						:key="item.level"
						class="level-item"
						:class="{ on: sheetLevel === item.level }"
						@click="sheetLevel = item.level"
					>
						<view class="level-pts">
							<text class="level-pts-num">{{ item.points }}</text>
							<text class="level-pts-unit">积分</text>
						</view>
						<view class="level-info">
							<text class="level-name">{{ item.name }}</text>
							<text class="level-desc">{{ item.desc }}</text>
						</view>
						<view class="level-check">
							<up-icon
								v-if="sheetLevel === item.level"
								name="checkmark"
								size="12px"
								color="#ffffff"
							></up-icon>
						</view>
					</view>
				</view>
				<view class="preview">
					<text class="preview-label">用户将收到</text>
					<text class="preview-text">{{ approvePreview }}</text>
				</view>
				<button class="sheet-btn" :disabled="!canApprove" @click="handleApprove">确认发放并回复</button>
				<view class="sheet-foot">
					走 PointsService 事务 · 幂等键 feedback_reward:{{ ticketId }}<br />重复点击不会重复发放
				</view>
			</template>

			<template v-else>
				<view class="sheet-sub">原因会展示给用户，避免「石沉大海」的体感</view>
				<view class="reason-list">
					<view
						v-for="reason in FEEDBACK_REJECT_REASONS"
						:key="reason"
						class="reason-item"
						:class="{ on: sheetReason === reason }"
						@click="sheetReason = reason"
					>
						{{ reason }}
					</view>
				</view>
				<view class="preview">
					<text class="preview-label">用户将收到</text>
					<text class="preview-text">{{ rejectPreview }}</text>
				</view>
				<button class="sheet-btn" :disabled="!sheetReason" @click="handleReject">确认驳回</button>
			</template>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { FEEDBACK_STATUS, FEEDBACK_TYPE, getFeedbackStatusInfo, getFeedbackTypeInfo } from "@/config/index.js";
import { formatDateTime } from "@/utils/tool.js";
import {
	approveAdminFeedback,
	getAdminFeedbackDetail,
	getAdminToken,
	rejectAdminFeedback,
} from "@/apis/admin/index.js";
import { normalizeAdminTicket } from "@/apis/admin/normalize.js";
import {
	ADMIN_LOGIN_PAGE,
	FEEDBACK_REJECT_REASONS,
	FEEDBACK_REWARD_LEVELS,
	FEEDBACK_SUGGESTION_POINTS,
} from "@/apis/admin/constants.js";

const FEEDBACK_LIST_PAGE = "/pages-admin/feedback/list";

const ticketId = ref("");
const ticket = ref(null);
const loading = ref(true);
const sheet = ref("");
const sheetLevel = ref("");
const sheetReason = ref("");

const typeInfo = computed(() => getFeedbackTypeInfo(ticket.value?.type));
const statusInfo = computed(() => getFeedbackStatusInfo(ticket.value?.status));
const isPending = computed(() => Number(ticket.value?.status) === FEEDBACK_STATUS.PENDING);

/** 只有 bug 类需要选档位；建议类固定分值、其他类不给分，后端按类型推导 */
const needLevel = computed(() => Number(ticket.value?.type) === FEEDBACK_TYPE.BUG);
const canApprove = computed(() => !needLevel.value || !!sheetLevel.value);

const approveHint = computed(() =>
	needLevel.value
		? "档位为固定枚举，不支持手填金额 —— 防止误操作发出天文数字"
		: "该类型补偿分值由后端按工单类型固定推导，无需选择档位",
);

/** 预览分值仅用于让管理员确认后果，实际金额以后端推导结果为准 */
const previewPoints = computed(() => {
	const type = Number(ticket.value?.type);
	if (type === FEEDBACK_TYPE.BUG) {
		return FEEDBACK_REWARD_LEVELS.find((item) => item.level === sheetLevel.value)?.points || 0;
	}
	return type === FEEDBACK_TYPE.SUGGESTION ? FEEDBACK_SUGGESTION_POINTS : 0;
});

// 与后端 defaultApproveReply 保持一致：不发分时不能说「已发放」
const approvePreview = computed(() =>
	previewPoints.value > 0
		? `已确认为有效问题，感谢反馈！补偿积分已发放至你的账户～（本次 ${previewPoints.value} 积分）`
		: "已确认收到你的反馈，我们会在后续版本中跟进，感谢支持～",
);

const rejectPreview = computed(
	() => `感谢反馈～ 本次未通过核实，原因：${sheetReason.value || "—"}。如仍有问题欢迎补充细节再次提交。`,
);

onLoad((options) => {
	ticketId.value = options?.id ? String(options.id) : "";
	if (!getAdminToken()) {
		uni.reLaunch({ url: ADMIN_LOGIN_PAGE });
		return;
	}
	loadTicket();
});

/**
 * @description: 拉取工单详情
 * @return {Promise<void>}
 */
async function loadTicket() {
	if (!ticketId.value) {
		loading.value = false;
		uni.showToast({ title: "缺少工单 ID", icon: "none" });
		return;
	}
	loading.value = true;
	try {
		const data = await getAdminFeedbackDetail(ticketId.value);
		ticket.value = normalizeAdminTicket(data);
	} catch (error) {
		if (error?.code !== 401) {
			uni.showToast({ title: error?.message || "加载失败", icon: "none" });
		}
	} finally {
		loading.value = false;
	}
}

function openSheet(type) {
	sheetLevel.value = "";
	sheetReason.value = "";
	sheet.value = type;
}

function closeSheet() {
	sheet.value = "";
}

/**
 * 认证通过：发放补偿并把工单流转为终态。
 * @description 只传档位标识，不传金额。失败时保留弹层不清空选择，
 * 便于管理员看到「该工单已被处理」这类提示后直接刷新，而不是重新选一遍。
 * @return {Promise<void>}
 */
async function handleApprove() {
	if (!canApprove.value) return;
	try {
		const payload = needLevel.value ? { level: sheetLevel.value } : {};
		await approveAdminFeedback(ticketId.value, payload);
		closeSheet();
		uni.showToast({ title: "已发放补偿", icon: "success" });
		await loadTicket();
	} catch (error) {
		if (error?.code !== 401) {
			uni.showToast({ title: error?.message || "处理失败", icon: "none" });
		}
	}
}

/**
 * @description: 驳回工单，原因对用户可见
 * @return {Promise<void>}
 */
async function handleReject() {
	if (!sheetReason.value) return;
	try {
		await rejectAdminFeedback(ticketId.value, { reason: sheetReason.value });
		closeSheet();
		uni.showToast({ title: "已驳回", icon: "success" });
		await loadTicket();
	} catch (error) {
		if (error?.code !== 401) {
			uni.showToast({ title: error?.message || "处理失败", icon: "none" });
		}
	}
}

/**
 * @description: 标签配色
 * @param {Object} info 枚举展示信息
 * @return {Object} 行内样式
 */
function tagStyle(info) {
	return {
		color: info.color,
		background: info.bgColor,
	};
}

function previewShots(index) {
	uni.previewImage({
		urls: ticket.value.images,
		current: index,
	});
}

function goList() {
	// 详情多为列表点进来，能返回就返回，保留列表滚动位置；直达链接打开时兜底 reLaunch
	const pages = getCurrentPages();
	if (pages.length > 1) {
		uni.navigateBack();
		return;
	}
	uni.reLaunch({ url: FEEDBACK_LIST_PAGE });
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
	min-height: 100vh;
	padding-bottom: 76px;
	margin: 0 auto;
	box-sizing: border-box;
	background: #f7f7f8;
}

.ad-head {
	padding: 16px;
	background: linear-gradient(135deg, #ff7ba5 0, #ff5c8d 100%);
}

.ad-head-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.ad-back {
	display: flex;
	align-items: center;
	gap: 7px;
	cursor: pointer;
}

.ad-back-text {
	color: #ffffff;
	font-size: 16px;
	font-weight: 700;
}

.ad-tag {
	padding: 3px 9px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 600;
}

.ad-loading {
	padding: 60px 0;
	color: #c0c4cc;
	font-size: 13px;
	text-align: center;
}

.ad-body {
	padding: 12px;
}

.det-sec {
	padding: 14px;
	margin-bottom: 10px;
	border-radius: 14px;
	background: #ffffff;
	box-shadow: 0 6px 18px rgba(40, 40, 40, 0.04);
}

.det-title {
	margin-bottom: 12px;
	color: #303133;
	font-size: 13px;
	font-weight: 700;
}

.det-user {
	display: flex;
	align-items: center;
	gap: 9px;
	margin-bottom: 12px;
}

.det-ava {
	flex-shrink: 0;
	width: 38px;
	height: 38px;
	border-radius: 50%;
	background: #f4f6f9;
}

.det-ava-text {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #ff7ba5 0, #ff5c8d 100%);
	color: #ffffff;
	font-size: 15px;
	font-weight: 700;
}

.det-nick {
	display: block;
	color: #303133;
	font-size: 14px;
	font-weight: 700;
}

.det-uuid {
	display: block;
	margin-top: 2px;
	color: #9ba0aa;
	font-size: 11px;
}

.det-kv {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 7px 0;
	border-top: 1px solid #f5f6f8;
}

.det-contact {
	margin-top: 4px;
}

.det-k {
	color: #9ba0aa;
	font-size: 12px;
}

.det-v {
	color: #303133;
	font-size: 12px;
	font-weight: 600;

	&.warn {
		color: #e6952b;
	}

	&.theme {
		color: #ff5c8d;
	}

	&.mono {
		color: #9ba0aa;
		font-size: 11px;
	}
}

.det-content {
	color: #303133;
	font-size: 13px;
	line-height: 1.75;
	white-space: pre-wrap;
	word-break: break-word;
}

.det-shots {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 11px;
}

.det-shot {
	width: 76px;
	height: 100px;
	border-radius: 8px;
	background: #f4f6f9;
	cursor: zoom-in;
}

.det-reply {
	padding: 10px;
	margin-top: 10px;
	border-radius: 9px;
	background: #f8f9fb;
	color: #606266;
	font-size: 12.5px;
	line-height: 1.7;
}

.act-bar {
	position: fixed;
	right: 0;
	bottom: 0;
	left: 0;
	display: flex;
	gap: 10px;
	width: 100%;
	max-width: 560px;
	padding: 12px 16px;
	margin: 0 auto;
	border-top: 1px solid #f1f2f5;
	box-sizing: border-box;
	background: #ffffff;
}

.act-btn {
	flex: 1;
	height: 42px;
	border: none;
	border-radius: 12px;
	font-size: 14px;
	font-weight: 600;
	line-height: 42px;

	&::after {
		border: none;
	}
}

.act-line {
	border: 1px solid #e6e8eb;
	background: #ffffff;
	color: #606266;
	line-height: 40px;
}

.act-ok {
	background: linear-gradient(135deg, #ff7ba5 0, #ff5c8d 100%);
	color: #ffffff;
}

.act-full {
	flex: none;
	width: 100%;
}

.sheet-mask {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 10;
	background: rgba(0, 0, 0, 0.42);
}

.sheet {
	position: fixed;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 11;
	width: 100%;
	max-width: 560px;
	padding: 18px 16px 22px;
	margin: 0 auto;
	border-radius: 18px 18px 0 0;
	box-sizing: border-box;
	background: #ffffff;
}

.sheet-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.sheet-title {
	color: #303133;
	font-size: 16px;
	font-weight: 700;
}

.sheet-close {
	padding: 4px;
	cursor: pointer;
}

.sheet-sub {
	margin-top: 6px;
	color: #9ba0aa;
	font-size: 11.5px;
	line-height: 1.7;
}

.level-list {
	margin-top: 14px;
}

.level-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 11px 12px;
	margin-bottom: 9px;
	border: 1px solid #eef0f4;
	border-radius: 12px;
	background: #fbfbfc;
	cursor: pointer;

	&.on {
		border-color: #ff5c8d;
		background: #fff6f9;
	}
}

.level-pts {
	display: flex;
	flex-shrink: 0;
	flex-direction: column;
	align-items: center;
	width: 44px;
}

.level-pts-num {
	color: #ff5c8d;
	font-size: 18px;
	font-weight: 700;
}

.level-pts-unit {
	color: #c0c4cc;
	font-size: 10px;
}

.level-info {
	flex: 1;
	min-width: 0;
}

.level-name {
	display: block;
	color: #303133;
	font-size: 13.5px;
	font-weight: 700;
}

.level-desc {
	display: block;
	margin-top: 2px;
	color: #9ba0aa;
	font-size: 11px;
	line-height: 1.6;
}

.level-check {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border: 1px solid #e0e2e6;
	border-radius: 50%;
	background: #ffffff;
}

.level-item.on .level-check {
	border-color: #ff5c8d;
	background: #ff5c8d;
}

.reason-list {
	display: flex;
	flex-wrap: wrap;
	gap: 9px;
	margin-top: 14px;
}

.reason-item {
	padding: 8px 14px;
	border: 1px solid #eef0f4;
	border-radius: 999px;
	background: #fbfbfc;
	color: #606266;
	font-size: 12.5px;
	cursor: pointer;

	&.on {
		border-color: #ff5c8d;
		background: #fff1f5;
		color: #ff5c8d;
		font-weight: 600;
	}
}

.preview {
	padding: 11px 12px;
	margin-top: 14px;
	border-left: 3px solid #ff5c8d;
	border-radius: 10px;
	background: #f8f9fb;
}

.preview-label {
	display: block;
	margin-bottom: 5px;
	color: #ff5c8d;
	font-size: 10.5px;
	font-weight: 700;
}

.preview-text {
	display: block;
	color: #606266;
	font-size: 12.5px;
	line-height: 1.7;
}

.sheet-btn {
	width: 100%;
	height: 44px;
	margin-top: 16px;
	border: none;
	border-radius: 12px;
	background: linear-gradient(135deg, #ff7ba5 0, #ff5c8d 100%);
	color: #ffffff;
	font-size: 15px;
	font-weight: 600;
	line-height: 44px;

	&::after {
		border: none;
	}

	&[disabled] {
		background: #f0d5de;
		color: #ffffff;
	}
}

.sheet-foot {
	margin-top: 10px;
	color: #c0c4cc;
	font-size: 10.5px;
	line-height: 1.7;
	text-align: center;
}
</style>
