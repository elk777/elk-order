<!--
 * @Author: elk
 * @Date: 2026-06-12
 * @FilePath: /hkt-applet/pages/my/attendance.vue
 * @Description: 每日签到页面
-->
<template>
	<view class="attendance-page">
		<view class="hero">
			<view class="hero-copy">
				<view class="hero-title">每日一签，情意绵绵</view>
				<view class="hero-subtitle">两个人都签到，今天的厨房更有仪式感</view>
			</view>
			<view class="hero-bubbles">
				<view class="bubble bubble-left">♡</view>
				<view class="bubble bubble-right">✓</view>
			</view>
		</view>

		<view class="partner-card">
			<view class="avatar-wrapper" :class="{ checked: selfStatus.checked }">
				<up-avatar shape="circle" :src="selfStatus.avatar" size="68" />
			</view>
			<view class="partner-love pubColumnFlex">
				<up-icon name="heart-fill" size="22" color="#ff5c8d"></up-icon>
				<view class="partner-days">{{ overview.bothCheckedDays || 0 }}</view>
			</view>
			<view v-if="hasPartner" class="avatar-wrapper" :class="{ checked: partnerStatus.checked }">
				<up-avatar shape="circle" :src="partnerStatus.avatar" size="68" />
			</view>
			<view v-else class="avatar-placeholder">
				<up-icon name="plus-circle" size="40" color="#d4d4d4"></up-icon>
				<view class="placeholder-text">待绑定</view>
			</view>
		</view>

		<view class="calendar-card">
			<view class="calendar-head pubFlex">
				<view class="month-arrow pubFlex" @click="changeMonth(-1)">
					<up-icon name="arrow-left" size="16" color="#ff5c8d"></up-icon>
				</view>
				<view class="month-title">{{ currentYear }}年{{ currentMonth }}月</view>
				<view class="month-arrow pubFlex" @click="changeMonth(1)">
					<up-icon name="arrow-right" size="16" color="#ff5c8d"></up-icon>
				</view>
			</view>

			<view class="week-row">
				<view class="week-cell" v-for="item in weekDays" :key="item">{{ item }}</view>
			</view>
			<view class="date-grid">
				<view
					class="date-cell"
					v-for="day in calendarDays"
					:key="day.key"
					:class="{
						placeholder: !day.date,
						today: day.isToday,
						self: day.selfChecked,
						partner: day.partnerChecked,
						both: day.bothChecked,
					}"
				>
					<template v-if="day.date">
						<view class="heart-mark pubFlex">
							<up-icon
								name="heart-fill"
								size="17"
								:color="day.bothChecked ? '#ff5c8d' : (day.selfChecked || day.partnerChecked) ? '#ffaac4' : '#ffd4df'"
							></up-icon>
						</view>
						<view class="date-number">{{ day.day }}</view>
					</template>
				</view>
			</view>
		</view>

		<view class="stats-card">
			<view class="stat-item">
				<view class="stat-icon pubFlex">
					<up-icon name="calendar" size="26" color="#ff5c8d"></up-icon>
				</view>
				<view class="stat-content">
					<view class="stat-value">{{ overview.consecutiveDays || 0 }}</view>
					<view class="stat-label">连续签到</view>
				</view>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<view class="stat-icon pubFlex">
					<up-icon name="checkbox-mark" size="26" color="#ff5c8d"></up-icon>
				</view>
				<view class="stat-content">
					<view class="stat-value">{{ overview.monthCheckedDays || 0 }}</view>
					<view class="stat-label">本月已签</view>
				</view>
			</view>
		</view>

		<view class="action-row">
			<view
				class="primary-action pubFlex"
				:class="{ disabled: selfStatus.checked || isCheckinLoading }"
				@click="handleCheckin"
			>
				{{ isCheckinLoading ? "签到中..." : selfStatus.checked ? "今日已签到" : "立即签到" }}
			</view>
			<view class="secondary-action pubFlex" :class="{ disabled: !canRemindPartner }" @click="handleRemind">
				提醒TA来签到
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { checkinPoints, getCheckinOverview, remindPartnerCheckin } from "@/apis/points.js";
import { useUserStore } from "@/stores/user.js";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";

useAuthGuard();

const userStore = useUserStore();
const defaultAvatar = "/static/images/head.jpeg";
const today = new Date();
const currentDate = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const isCheckinLoading = ref(false);
const overview = ref({
	self: {},
	partner: {},
	records: [],
	consecutiveDays: 0,
	monthCheckedDays: 0,
	bothCheckedDays: 0,
	todayReward: 10,
});
const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);
const hasPartner = computed(() => !!overview.value.partner?.id);
const selfStatus = computed(() => ({
	nickName: overview.value.self?.nickName || userStore.profile.nickName || "我",
	avatar: overview.value.self?.avatar || userStore.profile.avatar || defaultAvatar,
	checked: !!overview.value.self?.checked,
}));
const partnerStatus = computed(() => ({
	nickName: overview.value.partner?.nickName || "TA",
	avatar: overview.value.partner?.avatar || defaultAvatar,
	checked: !!overview.value.partner?.checked,
}));
const canRemindPartner = computed(() => hasPartner.value && !partnerStatus.value.checked);

const calendarDays = computed(() => {
	const year = currentYear.value;
	const month = currentMonth.value;
	const first = new Date(year, month - 1, 1);
	const daysInMonth = new Date(year, month, 0).getDate();
	const firstWeekday = (first.getDay() + 6) % 7;
	const recordsMap = new Map((overview.value.records || []).map((item) => [item.date, item]));
	const cells = [];

	for (let i = 0; i < firstWeekday; i += 1) {
		cells.push({ key: `empty-${i}`, date: "" });
	}

	for (let day = 1; day <= daysInMonth; day += 1) {
		const date = `${year}-${pad(month)}-${pad(day)}`;
		const record = recordsMap.get(date) || {};
		const isToday =
			year === today.getFullYear() &&
			month === today.getMonth() + 1 &&
			day === today.getDate();
		cells.push({
			key: date,
			date,
			day,
			isToday,
			selfChecked: !!record.selfChecked,
			partnerChecked: !!record.partnerChecked,
			bothChecked: !!record.selfChecked && !!record.partnerChecked,
		});
	}

	return cells;
});

onShow(() => {
	loadOverview();
});

async function loadOverview(year = currentYear.value, month = currentMonth.value) {
	try {
		const res = await getCheckinOverview({
			year,
			month,
		});
		if (res?.code === 200 && res?.data) {
			overview.value = res.data;
		}
	} catch (error) {
		console.warn("[attendance] load overview failed", error);
	}
}

async function handleCheckin() {
	if (selfStatus.value.checked || isCheckinLoading.value) return;
	isCheckinLoading.value = true;
	try {
		const res = await checkinPoints();
		if (res?.code === 200) {
			uni.showToast({
				title: "签到成功",
				icon: "success",
			});
			await loadOverview();
			return;
		}
		console.error("[attendance] checkin failed:", res);
		uni.showToast({
			title: res?.message || "签到失败",
			icon: "none",
		});
	} catch (error) {
		console.error("[attendance] checkin error:", error);
		const errorMsg = error?.data?.message || error?.message || "签到失败，请稍后重试";
		// 如果是已签到错误，刷新页面状态
		if (errorMsg.includes("已签到")) {
			await loadOverview();
		}
		uni.showToast({
			title: errorMsg,
			icon: "none",
		});
	} finally {
		isCheckinLoading.value = false;
	}
}

async function handleRemind() {
	if (!canRemindPartner.value) return;
	try {
		const res = await remindPartnerCheckin();
		if (res?.code === 200) {
			uni.showToast({
				title: "已提醒TA",
				icon: "success",
			});
			return;
		}
		uni.showToast({
			title: res?.message || "提醒失败",
			icon: "none",
		});
	} catch (error) {
		uni.showToast({
			title: error?.message || "提醒失败",
			icon: "none",
		});
	}
}

function changeMonth(step) {
	const next = new Date(currentYear.value, currentDate.value.getMonth() + step, 1);
	currentDate.value = next;
	loadOverview(next.getFullYear(), next.getMonth() + 1);
}

function pad(value) {
	return String(value).padStart(2, "0");
}
</script>

<style lang="scss" scoped>
.attendance-page {
	min-height: 100vh;
	padding: 28rpx 26rpx 44rpx;
	box-sizing: border-box;
	background: linear-gradient(180deg, #fff0f7 0%, #fff9fb 42%, #f7f7f8 100%);
	color: #2b1c25;
}

.hero {
	position: relative;
	min-height: 130rpx;
	padding: 22rpx 210rpx 18rpx 12rpx;
	box-sizing: border-box;
}

.hero-title {
	font-size: 38rpx;
	font-weight: 900;
	letter-spacing: 0;
}

.hero-subtitle {
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #7d6472;
	line-height: 1.45;
}

.hero-bubbles {
	position: absolute;
	top: 10rpx;
	right: 8rpx;
	width: 200rpx;
	height: 130rpx;
}

.bubble {
	position: absolute;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.85);
	box-shadow: 0 14rpx 32rpx rgba(255, 92, 141, 0.16);
	color: #ff5c8d;
	font-size: 44rpx;
	font-weight: 900;
	text-align: center;
	line-height: 100rpx;
}

.bubble-left {
	left: 0;
	bottom: 0;
}

.bubble-right {
	right: 0;
	top: 0;
}

.partner-card,
.calendar-card {
	border-radius: 30rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 14rpx 38rpx rgba(255, 92, 141, 0.1);
}

.partner-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 44rpx;
	margin: 45rpx 0;
}

.avatar-wrapper {
	position: relative;
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	box-sizing: border-box;
	overflow: hidden;
}

.avatar-wrapper.checked {
	border: 4rpx solid #ff5c8d;
	box-shadow: 0 0 18rpx rgba(255, 92, 141, 0.4);
}

.avatar-wrapper :deep(.u-avatar) {
	width: 100% !important;
	height: 100% !important;
}

.avatar-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	background: #f5f5f5;
	border: 2rpx dashed #d4d4d4;
}

.placeholder-text {
	margin-top: 4rpx;
	font-size: 18rpx;
	color: #999;
	transform: scale(0.85);
}

.partner-love {
	min-width: 110rpx;
}

.partner-days {
	margin-top: 6rpx;
	color: #ff5c8d;
	font-size: 32rpx;
	font-weight: 900;
}

.calendar-card {
	margin-top: 18rpx;
	padding: 24rpx 18rpx 26rpx;
	border: 4rpx solid #ff78a5;
}

.calendar-head {
	justify-content: space-between;
	padding: 0 8rpx 18rpx;
}

.month-title {
	font-size: 34rpx;
	font-weight: 900;
	color: #ffffff;
}

.calendar-head {
	margin: -24rpx -18rpx 18rpx;
	padding: 22rpx 30rpx;
	border-radius: 22rpx 22rpx 38rpx 38rpx;
	background: linear-gradient(135deg, #ff5c8d, #ff7f9a);
}

.month-arrow {
	width: 52rpx;
	height: 52rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.85);
}

.week-row,
.date-grid {
	display: grid;
	grid-template-columns: repeat(7, minmax(0, 1fr));
}

.week-cell {
	height: 48rpx;
	color: #6a2947;
	font-size: 25rpx;
	font-weight: 800;
	text-align: center;
	line-height: 48rpx;
}

.date-grid {
	row-gap: 14rpx;
	margin-top: 6rpx;
}

.date-cell {
	position: relative;
	height: 92rpx;
	margin: 0 5rpx;
	border: 2rpx solid #ffe1e9;
	border-radius: 16rpx;
	background: linear-gradient(180deg, #fff8fb, #ffffff);
	box-sizing: border-box;
	text-align: center;
}

.date-cell.placeholder {
	border: none;
	background: transparent;
}

.date-cell.today {
	border-color: #ff5c8d;
}

.date-cell.both {
	background: linear-gradient(180deg, #fff0f6, #ffffff);
}

.heart-mark {
	position: absolute;
	top: -15rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 42rpx;
	height: 38rpx;
}

.date-number {
	padding-top: 30rpx;
	font-size: 26rpx;
	font-weight: 800;
}

.date-cell.today .date-number {
	color: #ff5c8d;
}

.stats-card {
	display: flex;
	align-items: center;
	justify-content: space-around;
	margin-top: 18rpx;
	padding: 24rpx 30rpx;
	border-radius: 30rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 14rpx 38rpx rgba(255, 92, 141, 0.1);
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.stat-icon {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #fff0f6, #ffffff);
}

.stat-content {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.stat-value {
	font-size: 32rpx;
	font-weight: 900;
	color: #ff5c8d;
	line-height: 1;
}

.stat-label {
	font-size: 22rpx;
	color: #8c6376;
	line-height: 1;
}

.stat-divider {
	width: 2rpx;
	height: 44rpx;
	background: linear-gradient(180deg, rgba(255, 92, 141, 0), rgba(255, 92, 141, 0.2), rgba(255, 92, 141, 0));
}

.action-row {
	display: flex;
	gap: 18rpx;
	margin-top: 20rpx;
}

.primary-action,
.secondary-action {
	flex: 1;
	height: 92rpx;
	border-radius: 999rpx;
	font-size: 30rpx;
	font-weight: 900;
}

.primary-action {
	background: linear-gradient(135deg, #ff5c8d, #ff7f9a);
	color: #ffffff;
	box-shadow: 0 12rpx 26rpx rgba(255, 92, 141, 0.24);
}

.secondary-action {
	background: #ffffff;
	color: #ff5c8d;
	border: 2rpx solid #ffd4df;
	box-sizing: border-box;
}

.primary-action.disabled,
.secondary-action.disabled {
	opacity: 0.55;
}
</style>
