<!--
 * @Author: elk
 * @Date: 2026-02-10 18:16:48
 * @LastEditors: elk
 * @LastEditTime: 2026-06-12 21:20:00
 * @FilePath: /hkt-applet/pages/my/integral.vue
 * @Description: 用户积分界面
-->
<template>
	<view class="integral-page">
		<view class="points-hero">
			<view class="hero-top pubFlex">
				<view>
					<view class="hero-eyebrow">偏爱积分</view>
					<view class="hero-title">把每一次投喂都攒成奖励</view>
				</view>
				<view class="hero-icon pubFlex">
					<up-icon name="integral-fill" size="30" color="#ff5c8d"></up-icon>
				</view>
			</view>

			<view class="points-balance">
				<view class="balance-label">当前可用</view>
				<view class="balance-value">{{ pointsAccount.currentPoints }}</view>
				<view class="balance-actions pubFlex">
					<view class="detail-btn pubFlex" @click="handleIntegralDetail">
						<up-icon name="list-dot" size="16" color="#ffffff"></up-icon>
						<text>积分明细</text>
					</view>
					<view class="checkin-btn pubFlex" @click="goAttendance">
						<up-icon name="calendar-fill" size="16" color="#ff5c8d"></up-icon>
						<text>今日签到</text>
					</view>
				</view>
			</view>

			<view class="points-stats pubFlex">
				<view class="stat-item">
					<view class="stat-value">{{ pointsAccount.totalPoints }}</view>
					<view class="stat-label">累计获得</view>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<view class="stat-value">{{ pointsAccount.usedPoints }}</view>
					<view class="stat-label">累计使用</view>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<view class="stat-value">{{ intimacyLevelCode }}</view>
					<view class="stat-label">亲密等级</view>
				</view>
			</view>
		</view>

		<view class="intimacy-card">
			<view class="intimacy-head pubFlex">
				<view>
					<view class="intimacy-title">{{ intimacyLevelName }}</view>
					<view class="intimacy-subtitle">{{ intimacySubtitle }}</view>
				</view>
				<view class="intimacy-growth">{{ intimacy.totalGrowth || 0 }}</view>
			</view>
			<view class="intimacy-progress">
				<view class="intimacy-progress__bar" :style="{ width: (intimacy.progress || 0) + '%' }"></view>
			</view>
			<view class="intimacy-foot pubFlex">
				<text>{{ intimacy.level?.code || "L0" }}</text>
				<text>{{ intimacyProgressText }}</text>
			</view>
		</view>

		<view class="section-block">
			<view class="section-head pubFlex">
				<view>
					<view class="section-title">今日赚分任务</view>
					<view class="section-subtitle">签到、邀请、下单都能慢慢攒</view>
				</view>
				<view class="section-badge">每日刷新</view>
			</view>
			<view class="task-list">
				<view class="task-item pubFlex" v-for="item in earnTasks" :key="item.id" @click="handleTask(item)">
					<view class="task-icon pubFlex" :class="item.className">
						<up-icon :name="item.icon" size="24" color="#ffffff"></up-icon>
					</view>
					<view class="task-main">
						<view class="task-title">{{ item.title }}</view>
						<view class="task-desc">{{ item.desc }}</view>
					</view>
					<view class="task-reward">
						<view class="reward-text">{{ item.pointsText }}</view>
						<view class="reward-label">积分</view>
					</view>
					<up-icon name="arrow-right" size="16" color="#c7c7c7"></up-icon>
					<button
						v-if="isInviteShareTask(item)"
						class="task-share-button"
						open-type="share"
						:data-role="inviteTargetRole"
						@click.stop
					></button>
				</view>
			</view>
		</view>

		<view class="section-block">
			<view class="section-head pubFlex">
				<view>
					<view class="section-title">积分可兑换</view>
					<view class="section-subtitle">先放能力入口，后续接兑换流程</view>
				</view>
				<view class="section-link" @click="showComingSoon">全部</view>
			</view>
			<view class="benefit-grid">
				<view class="benefit-item" v-for="item in benefits" :key="item.id" @click="handleBenefit(item)">
					<view class="benefit-icon pubFlex" :class="item.className">
						<up-icon :name="item.icon" size="25" :color="item.iconColor"></up-icon>
					</view>
					<view class="benefit-title">{{ item.title }}</view>
					<view class="benefit-cost">{{ item.cost }} 积分/次</view>
				</view>
			</view>
		</view>

		<view class="section-block record-block">
			<view class="section-head pubFlex">
				<view>
					<view class="section-title">最近明细</view>
					<view class="section-subtitle">收支变化会记录在这里</view>
				</view>
				<view class="section-link" @click="handleIntegralDetail">查看</view>
			</view>
			<view class="record-preview pubFlex" @click="handleIntegralDetail">
				<view class="record-icon pubFlex">
					<up-icon name="file-text-fill" size="22" color="#ff5c8d"></up-icon>
				</view>
				<view class="record-main">
					<view class="record-title">积分流水</view>
					<view class="record-desc">签到、邀请、兑换等记录统一查看</view>
				</view>
				<up-icon name="arrow-right" size="17" color="#c7c7c7"></up-icon>
			</view>
		</view>

		<IntegralDetail :show.sync="show" @update:show="close" ref="integralDetailRef" />
	</view>
</template>
<script>
export default {
	options: { styleIsolation: "shared" },
};
</script>
<script setup>
import { computed, ref } from "vue";
import { onShareAppMessage, onShow } from "@dcloudio/uni-app";
import IntegralDetail from "./component/IntegralDetail.vue";
import { getPointsOverview } from "@/apis/points.js";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";
import { useUserStore } from "@/stores/user.js";
import { buildInviteShareMessage } from "@/utils/invite.js";

useAuthGuard();

const userStore = useUserStore();
const show = ref(false);
const pointsAccount = ref({
	totalPoints: 0,
	currentPoints: 0,
	usedPoints: 0,
});
const intimacy = ref({
	totalGrowth: 0,
	progress: 0,
	remainingGrowth: 100,
	isMaxLevel: false,
	level: { code: "L0", name: "等待贴贴" },
	nextLevel: { code: "L1", name: "刚刚贴贴", min: 0 },
});

const earnTasks = ref([]);

const benefits = ref([]);

const currentRoleType = computed(() => (userStore.isLogin ? userStore.userType : null));
const inviteTargetRole = computed(() => (currentRoleType.value === 1 ? "keeper" : "foodie"));
const intimacyLevelCode = computed(() => intimacy.value.level?.code || "L0");
const intimacyLevelName = computed(() => intimacy.value.level?.name || "等待贴贴");
const intimacySubtitle = computed(() => {
	if (intimacy.value.isMaxLevel) return "已达到当前最高亲密等级";
	if (intimacy.value.level?.level === 0) return "绑定后开启两个人的亲密等级";
	return `下一等级 ${intimacy.value.nextLevel?.name || ""}`;
});
const intimacyProgressText = computed(() => {
	if (intimacy.value.isMaxLevel) return "满格啦";
	if (intimacy.value.level?.level === 0) return "等待绑定";
	return `还差 ${intimacy.value.remainingGrowth || 0} 成长值`;
});

onShow(() => {
	loadOverview();
});

onShareAppMessage((res) => {
	return buildInviteShareMessage({
		uuid: userStore.profile.uuid,
		userType: currentRoleType.value,
		targetRole: res?.target?.dataset?.role || inviteTargetRole.value,
	});
});

async function loadOverview() {
	try {
		const res = await getPointsOverview();
		if (res?.code === 200 && res?.data) {
			pointsAccount.value = {
				totalPoints: res.data.account?.totalPoints ?? 0,
				currentPoints: res.data.account?.currentPoints ?? 0,
				usedPoints: res.data.account?.usedPoints ?? 0,
			};
			intimacy.value = normalizeIntimacy(res.data.intimacy);
			earnTasks.value = normalizeTasks(res.data.tasks);
			benefits.value = normalizeBenefits(res.data.benefits);
		}
	} catch (error) {
		console.warn("[integral] load overview failed", error);
	}
}

function handleTask(item) {
	const action = resolveTaskAction(item);
	if (action === "attendance" || action === "checkin") {
		goAttendance();
		return;
	}
	if (action === "invite") {
		handleInviteTask();
		return;
	}
	if (action === "order") {
		goOrderTask();
		return;
	}
	showComingSoon();
}

function resolveTaskAction(item = {}) {
	return item.action || item.id || "";
}

function isInviteShareTask(item = {}) {
	return (
		resolveTaskAction(item) === "invite" &&
		userStore.isLogin &&
		!userStore.profile?.binding &&
		!!userStore.profile?.uuid
	);
}

function handleInviteTask() {
	if (!userStore.isLogin) {
		uni.showToast({
			title: "请先登录后邀请绑定",
			icon: "none",
		});
		return;
	}
	if (userStore.profile?.binding) {
		uni.showToast({
			title: "已完成绑定",
			icon: "none",
		});
		return;
	}
	if (!userStore.profile?.uuid) {
		uni.showToast({
			title: "暂无用户ID",
			icon: "none",
		});
		return;
	}
	uni.showToast({
		title: "点击邀请任务发送给对方",
		icon: "none",
	});
}

function goOrderTask() {
	uni.switchTab({
		url: "/pages/sort/index",
	});
}

function handleBenefit(item) {
	if (item.id === "ai-text") {
		uni.navigateTo({ url: "/pages/recipe/ai-generate" });
		return;
	}
	if (item.id === "kitchen-skin") {
		uni.switchTab({ url: "/pages/home/index" });
		uni.showToast({ title: "在首页右侧工具栏选择装扮", icon: "none" });
		return;
	}
	showComingSoon();
}

function goAttendance() {
	uni.navigateTo({
		url: "/pages/my/attendance",
	});
}

function handleIntegralDetail() {
	show.value = true;
}

function close() {
	show.value = false;
}

function showComingSoon() {
	uni.showToast({
		title: "功能即将开放",
		icon: "none",
	});
}

function normalizeIntimacy(value = {}) {
	return {
		totalGrowth: Number(value.totalGrowth || 0),
		progress: Math.max(0, Math.min(100, Number(value.progress || 0))),
		remainingGrowth: Number(value.remainingGrowth || 0),
		isMaxLevel: !!value.isMaxLevel,
		level: value.level || { code: "L0", name: "等待贴贴", level: 0 },
		nextLevel: value.nextLevel || null,
	};
}

function normalizeTasks(list = []) {
	const iconMap = {
		checkin: { icon: "calendar-fill", className: "task-calendar" },
		invite: { icon: "share-square", className: "task-share" },
		order: { icon: "order", className: "task-order" },
	};
	return list.map((item) => ({
		...item,
		icon: iconMap[item.id]?.icon || "coupon-fill",
		className: iconMap[item.id]?.className || "task-calendar",
		pointsText: item.pointsText || "+0",
	}));
}

function normalizeBenefits(list = []) {
	const iconMap = {
		"ai-text": { icon: "file-text-fill", iconColor: "#34b6a6", className: "benefit-ai" },
		"ai-image": { icon: "camera-fill", iconColor: "#34b6a6", className: "benefit-ai" },
		"kitchen-skin": { icon: "gift-fill", iconColor: "#8b79ff", className: "benefit-kitchen" },
	};
	return list.map((item) => ({
		...item,
		icon: iconMap[item.id]?.icon || "coupon-fill",
		iconColor: iconMap[item.id]?.iconColor || "#ff5c8d",
		className: iconMap[item.id]?.className || "benefit-ai",
	}));
}
</script>

<style lang="scss" scoped>
.integral-page {
	min-height: 100vh;
	padding: 26rpx 30rpx 52rpx;
	box-sizing: border-box;
	background: #f7f7f8;
	color: #202124;
}

.points-hero {
	position: relative;
	overflow: hidden;
	padding: 34rpx 34rpx 30rpx;
	border-radius: 26rpx;
	background: linear-gradient(145deg, #ff5c8d 0%, #ff7ca5 55%, #ffc0cc 100%);
	box-shadow: 0 20rpx 46rpx rgba(255, 92, 141, 0.22);
	color: #ffffff;
}

.points-hero::before {
	content: "";
	position: absolute;
	top: -78rpx;
	right: -46rpx;
	width: 220rpx;
	height: 220rpx;
	border: 28rpx solid rgba(255, 255, 255, 0.18);
	border-radius: 50%;
}

.points-hero::after {
	content: "";
	position: absolute;
	left: 36rpx;
	bottom: -68rpx;
	width: 170rpx;
	height: 170rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.12);
}

.hero-top,
.points-balance,
.points-stats {
	position: relative;
	z-index: 1;
}

.hero-top {
	justify-content: space-between;
	align-items: flex-start;
}

.hero-eyebrow {
	font-size: 24rpx;
	opacity: 0.82;
}

.hero-title {
	margin-top: 8rpx;
	font-size: 34rpx;
	font-weight: 800;
}

.hero-icon {
	width: 72rpx;
	height: 72rpx;
	border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.92);
}

.points-balance {
	margin-top: 42rpx;
}

.balance-label {
	font-size: 24rpx;
	opacity: 0.84;
}

.balance-value {
	margin-top: 4rpx;
	font-size: 78rpx;
	font-weight: 900;
	line-height: 1;
}

.balance-actions {
	gap: 18rpx;
	margin-top: 28rpx;
}

.detail-btn,
.checkin-btn {
	gap: 8rpx;
	height: 58rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	box-sizing: border-box;
	font-size: 24rpx;
	line-height: 58rpx;
}

.detail-btn {
	background: rgba(255, 255, 255, 0.2);
	color: #ffffff;
}

.checkin-btn {
	background: #ffffff;
	color: #ff5c8d;
}

.detail-btn::after,
.checkin-btn::after {
	border: none;
}

.detail-btn:active,
.checkin-btn:active,
.task-item:active,
.benefit-item:active,
.record-preview:active {
	opacity: 0.82;
}

.points-stats {
	justify-content: space-between;
	margin-top: 34rpx;
	padding: 24rpx 18rpx 0;
	border-top: 1rpx solid rgba(255, 255, 255, 0.32);
}

.stat-item {
	flex: 1;
	text-align: center;
}

.stat-value {
	font-size: 30rpx;
	font-weight: 800;
}

.stat-label {
	margin-top: 6rpx;
	font-size: 22rpx;
	opacity: 0.78;
}

.stat-divider {
	width: 1rpx;
	height: 48rpx;
	background: rgba(255, 255, 255, 0.34);
}

.section-block {
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
	border-radius: 22rpx;
	background: #ffffff;
	box-shadow: 0 8rpx 26rpx rgba(30, 34, 42, 0.05);
}

.intimacy-card {
	margin-top: 24rpx;
	padding: 26rpx 24rpx;
	border-radius: 22rpx;
	background: #ffffff;
	box-shadow: 0 8rpx 26rpx rgba(30, 34, 42, 0.05);
}

.intimacy-head {
	justify-content: space-between;
	align-items: flex-start;
}

.intimacy-title {
	font-size: 31rpx;
	font-weight: 900;
	color: #2b1c25;
}

.intimacy-subtitle {
	margin-top: 8rpx;
	font-size: 23rpx;
	color: #8c8f96;
}

.intimacy-growth {
	min-width: 84rpx;
	padding: 10rpx 16rpx;
	border-radius: 999rpx;
	background: #fff1f5;
	color: #ff5c8d;
	font-size: 26rpx;
	font-weight: 900;
	text-align: center;
	box-sizing: border-box;
}

.intimacy-progress {
	overflow: hidden;
	height: 14rpx;
	margin-top: 24rpx;
	border-radius: 999rpx;
	background: #f3eef1;
}

.intimacy-progress__bar {
	height: 100%;
	border-radius: inherit;
	background: linear-gradient(90deg, #ff5c8d, #ff9db8);
	transition: width 0.2s ease;
}

.intimacy-foot {
	justify-content: space-between;
	margin-top: 14rpx;
	color: #9b8b94;
	font-size: 22rpx;
}

.section-head {
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 22rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 800;
}

.section-subtitle {
	margin-top: 6rpx;
	font-size: 23rpx;
	color: #8c8f96;
}

.section-badge,
.section-link {
	font-size: 23rpx;
	color: #ff5c8d;
}

.section-badge {
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	background: #fff1f5;
}

.task-list {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}

.task-item {
	position: relative;
	justify-content: space-between;
	min-height: 108rpx;
	padding: 18rpx 0;
	border-bottom: 1rpx solid #f0f0f2;
	box-sizing: border-box;
}

.task-share-button {
	position: absolute;
	inset: 0;
	z-index: 2;
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	background: transparent;
	opacity: 0;
}

.task-share-button::after {
	border: none;
}

.task-item:last-child {
	border-bottom: none;
}

.task-icon {
	width: 72rpx;
	height: 72rpx;
	flex: 0 0 72rpx;
	border-radius: 22rpx;
}

.task-calendar {
	background: linear-gradient(135deg, #ff5c8d, #ff8eb0);
}

.task-share {
	background: linear-gradient(135deg, #ff9f52, #ffc069);
}

.task-order {
	background: linear-gradient(135deg, #34b6a6, #65d7c7);
}

.task-main {
	flex: 1;
	min-width: 0;
	margin-left: 20rpx;
}

.task-title {
	font-size: 28rpx;
	font-weight: 800;
}

.task-desc {
	margin-top: 8rpx;
	font-size: 23rpx;
	color: #8c8f96;
	line-height: 1.35;
}

.task-reward {
	min-width: 86rpx;
	margin-right: 12rpx;
	text-align: right;
}

.reward-text {
	font-size: 27rpx;
	font-weight: 900;
	color: #ff5c8d;
}

.reward-label {
	margin-top: 4rpx;
	font-size: 20rpx;
	color: #a0a3aa;
}

.benefit-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 18rpx;
}

.benefit-item {
	min-height: 172rpx;
	padding: 22rpx;
	border-radius: 20rpx;
	background: #fafafa;
	box-sizing: border-box;
}

.benefit-icon {
	width: 62rpx;
	height: 62rpx;
	border-radius: 20rpx;
}

.benefit-ai {
	background: #eaf9f6;
}

.benefit-kitchen {
	background: #f1efff;
}

.benefit-title {
	margin-top: 18rpx;
	font-size: 27rpx;
	font-weight: 800;
}

.benefit-cost {
	margin-top: 8rpx;
	font-size: 22rpx;
	color: #8c8f96;
}

.record-block {
	margin-bottom: 20rpx;
}

.record-preview {
	min-height: 96rpx;
	padding-top: 4rpx;
}

.record-icon {
	width: 70rpx;
	height: 70rpx;
	flex: 0 0 70rpx;
	border-radius: 22rpx;
	background: #fff1f5;
}

.record-main {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.record-title {
	font-size: 28rpx;
	font-weight: 800;
}

.record-desc {
	margin-top: 8rpx;
	font-size: 23rpx;
	color: #8c8f96;
}
</style>
