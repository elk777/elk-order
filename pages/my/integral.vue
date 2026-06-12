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
					<view class="stat-value">{{ estimateLevel }}</view>
					<view class="stat-label">亲密等级</view>
				</view>
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
						<view class="reward-text">+{{ item.points }}</view>
						<view class="reward-label">积分</view>
					</view>
					<up-icon name="arrow-right" size="16" color="#c7c7c7"></up-icon>
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
				<view class="benefit-item" v-for="item in benefits" :key="item.id" @click="showComingSoon">
					<view class="benefit-icon pubFlex" :class="item.className">
						<up-icon :name="item.icon" size="25" :color="item.iconColor"></up-icon>
					</view>
					<view class="benefit-title">{{ item.title }}</view>
					<view class="benefit-cost">{{ item.cost }}</view>
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
import { onShow } from "@dcloudio/uni-app";
import IntegralDetail from "./component/IntegralDetail.vue";
import { getPointsAccount } from "@/apis/points.js";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";

useAuthGuard();

const show = ref(false);
const pointsAccount = ref({
	totalPoints: 0,
	currentPoints: 0,
	usedPoints: 0,
});

const earnTasks = ref([
	{
		id: "checkin",
		title: "每日签到",
		desc: "连续签到奖励会逐步提升",
		points: "10-20",
		icon: "calendar-fill",
		className: "task-calendar",
		action: "attendance",
	},
	{
		id: "invite",
		title: "邀请绑定",
		desc: "邀请对方加入两个人的厨房",
		points: 30,
		icon: "share-square",
		className: "task-share",
		action: "soon",
	},
	{
		id: "recipe",
		title: "完成点餐",
		desc: "下单、做菜、完成订单都能获得奖励",
		points: 15,
		icon: "order",
		className: "task-order",
		action: "soon",
	},
]);

const benefits = ref([
	{
		id: "vip",
		title: "兑换会员",
		cost: "199 积分起",
		icon: "coupon-fill",
		iconColor: "#ff5c8d",
		className: "benefit-vip",
	},
	{
		id: "ai",
		title: "AI识菜",
		cost: "20 积分/次",
		icon: "camera-fill",
		iconColor: "#34b6a6",
		className: "benefit-ai",
	},
	{
		id: "lottery",
		title: "惊喜抽奖",
		cost: "50 积分/次",
		icon: "red-packet-fill",
		iconColor: "#ff8a3d",
		className: "benefit-lottery",
	},
	{
		id: "kitchen",
		title: "厨房装扮",
		cost: "80 积分起",
		icon: "gift-fill",
		iconColor: "#8b79ff",
		className: "benefit-kitchen",
	},
]);

const estimateLevel = computed(() => {
	const total = Number(pointsAccount.value.totalPoints || 0);
	if (total >= 1000) return "L4";
	if (total >= 500) return "L3";
	if (total >= 100) return "L2";
	return "L1";
});

onShow(() => {
	loadPointsAccount();
});

async function loadPointsAccount() {
	try {
		const res = await getPointsAccount();
		if (res?.code === 200 && res?.data) {
			pointsAccount.value = {
				totalPoints: res.data.totalPoints ?? 0,
				currentPoints: res.data.currentPoints ?? 0,
				usedPoints: res.data.usedPoints ?? 0,
			};
		}
	} catch (error) {
		console.warn("[integral] load points account failed", error);
	}
}

function handleTask(item) {
	if (item.action === "attendance") {
		goAttendance();
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
	justify-content: space-between;
	min-height: 108rpx;
	padding: 18rpx 0;
	border-bottom: 1rpx solid #f0f0f2;
	box-sizing: border-box;
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

.benefit-vip {
	background: #fff0f5;
}

.benefit-ai {
	background: #eaf9f6;
}

.benefit-lottery {
	background: #fff4e8;
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
