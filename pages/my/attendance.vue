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
			<view class="hero-icons">
				<view class="hero-icon hero-icon-primary pubFlex">
					<up-icon name="heart-fill" size="28" color="#ffffff"></up-icon>
				</view>
				<view class="hero-icon hero-icon-secondary pubFlex">
					<up-icon name="checkmark-circle-fill" size="24" color="#ff5c8d"></up-icon>
				</view>
			</view>
		</view>

		<view class="partner-card">
			<view class="avatar-block">
				<view class="avatar-wrapper" :class="{ checked: selfStatus.checked }">
					<view class="avatar-inner">
						<up-avatar shape="circle" :src="selfStatus.avatar" size="68" />
					</view>
					<view class="status-dot pubFlex" :class="{ active: selfStatus.checked }">
						<up-icon name="checkmark" size="10" color="#ffffff"></up-icon>
					</view>
				</view>
			</view>
			<view class="partner-love">
				<view class="partner-love-icon pubFlex">
					<up-icon name="heart-fill" size="18" color="#ff5c8d"></up-icon>
				</view>
				<view class="partner-days">{{ overview.bothCheckedDays || 0 }}</view>
			</view>
			<view class="avatar-block">
				<view v-if="hasPartner" class="avatar-wrapper" :class="{ checked: partnerStatus.checked }">
					<view class="avatar-inner">
						<up-avatar shape="circle" :src="partnerStatus.avatar" size="68" />
					</view>
					<view class="status-dot pubFlex" :class="{ active: partnerStatus.checked }">
						<up-icon name="checkmark" size="10" color="#ffffff"></up-icon>
					</view>
				</view>
				<view v-else class="avatar-placeholder pubFlex">
					<up-icon name="plus-circle" size="34" color="#c9c9c9"></up-icon>
				</view>
			</view>
		</view>

		<view class="calendar-card">
			<view class="calendar-head">
				<view class="month-arrow pubFlex" @click="changeMonth(-1)">
					<up-icon name="arrow-left" size="16" color="#ff5c8d"></up-icon>
				</view>
				<view class="month-copy">
					<view class="month-title">{{ currentYear }}年{{ currentMonth }}月</view>
					<view class="month-subtitle">点亮每一次同签</view>
				</view>
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
						<view class="date-number">{{ day.day }}</view>
						<view class="heart-mark pubFlex">
							<up-icon
								name="heart-fill"
								size="13"
								:color="day.bothChecked ? '#ff5c8d' : (day.selfChecked || day.partnerChecked) ? '#ffaac4' : '#ffd4df'"
							></up-icon>
						</view>
						<view class="today-tag" v-if="day.isToday">今</view>
					</template>
				</view>
			</view>
		</view>

		<view class="stats-card">
			<view class="stat-item">
				<view class="stat-icon pubFlex">
					<up-icon name="calendar-fill" size="22" color="#ff5c8d"></up-icon>
				</view>
				<view class="stat-content">
					<view class="stat-value">{{ overview.consecutiveDays || 0 }}</view>
					<view class="stat-label">连续签到</view>
				</view>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<view class="stat-icon pubFlex">
					<up-icon name="checkmark-circle-fill" size="22" color="#ff5c8d"></up-icon>
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
import { withDefaultMediaUrl } from "@/utils/media.js";

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
	avatar: withDefaultMediaUrl(overview.value.self?.avatar || userStore.profile.avatar, defaultAvatar),
	checked: !!overview.value.self?.checked,
}));
const partnerStatus = computed(() => ({
	nickName: overview.value.partner?.nickName || "TA",
	avatar: withDefaultMediaUrl(overview.value.partner?.avatar, defaultAvatar),
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

	const trailingCount = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
	for (let i = 0; i < trailingCount; i += 1) {
		cells.push({ key: `tail-${i}`, date: "" });
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
	background:
		linear-gradient(140deg, rgba(255, 236, 244, 0.92) 0%, rgba(255, 249, 251, 0.72) 46%, rgba(247, 247, 248, 0.96) 100%),
		#fff9fb;
	color: #2b1c25;
}

.hero {
	position: relative;
	min-height: 132rpx;
	padding: 18rpx 190rpx 18rpx 4rpx;
	box-sizing: border-box;
}

.hero-title {
	font-size: 40rpx;
	font-weight: 900;
	letter-spacing: 0;
	line-height: 1.18;
}

.hero-subtitle {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #7d6472;
	line-height: 1.45;
}

.hero-icons {
	position: absolute;
	top: 8rpx;
	right: 0;
	width: 178rpx;
	height: 126rpx;
}

.hero-icon {
	position: absolute;
	box-sizing: border-box;
	border-radius: 50%;
	box-shadow: 0 16rpx 34rpx rgba(255, 92, 141, 0.16);
}

.hero-icon-primary {
	right: 0;
	top: 4rpx;
	width: 92rpx;
	height: 92rpx;
	background: linear-gradient(135deg, #ff5c8d 0%, #ff8fad 100%);
}

.hero-icon-secondary {
	left: 8rpx;
	bottom: 0;
	width: 78rpx;
	height: 78rpx;
	border: 2rpx solid rgba(255, 92, 141, 0.1);
	background: rgba(255, 255, 255, 0.92);
}

.partner-card,
.calendar-card {
	border: 2rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 14rpx 34rpx rgba(255, 92, 141, 0.08);
}

.partner-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 44rpx;
	margin: 18rpx 0;
}

.avatar-block {
	display: flex;
	justify-content: center;
	width: 120rpx;
}

.avatar-wrapper {
	position: relative;
	width: 76rpx;
	height: 76rpx;
	border-radius: 50%;
	border: 3rpx solid #f1eef0;
	box-sizing: border-box;
	padding: 3rpx;
	background: #ffffff;
	flex-shrink: 0;
}

.avatar-wrapper.checked {
	border-color: #ff5c8d;
	box-shadow: 0 0 18rpx rgba(255, 92, 141, 0.34);
}

.avatar-inner {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	overflow: hidden;
}

.avatar-inner :deep(.u-avatar) {
	width: 100% !important;
	height: 100% !important;
}

.avatar-inner :deep(.u-avatar__image) {
	width: 100% !important;
	height: 100% !important;
	border-radius: 50% !important;
}

.status-dot {
	position: absolute;
	right: -2rpx;
	bottom: -2rpx;
	width: 28rpx;
	height: 28rpx;
	border: 3rpx solid #ffffff;
	border-radius: 50%;
	background: #d6d6d6;
	box-sizing: border-box;
}

.status-dot.active {
	background: linear-gradient(135deg, #ff5c8d 0%, #ff8fad 100%);
}

.avatar-placeholder {
	width: 76rpx;
	height: 76rpx;
	border-radius: 50%;
	background: #f7f7f7;
	border: 2rpx dashed #d4d4d4;
	box-sizing: border-box;
}

.partner-love {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-width: 130rpx;
}

.partner-love-icon {
	width: 44rpx;
	height: 44rpx;
	border-radius: 50%;
	background: #fff1f6;
}

.partner-days {
	margin-top: 4rpx;
	color: #ff5c8d;
	font-size: 34rpx;
	font-weight: 900;
	line-height: 1;
}

.calendar-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 18rpx;
	padding: 16rpx 4rpx 18rpx;
	border-bottom: 2rpx solid #fff0f5;
}

.calendar-card {
	margin-top: 18rpx;
	padding: 20rpx 18rpx 24rpx;
}

.month-title {
	font-size: 34rpx;
	font-weight: 900;
	color: #2b1c25;
	line-height: 1.2;
}

.month-copy {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
	min-width: 0;
}

.month-subtitle {
	margin-top: 6rpx;
	color: #9a7485;
	font-size: 20rpx;
	line-height: 1.2;
}

.month-arrow {
	flex-shrink: 0;
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: #fff3f7;
	box-shadow: inset 0 0 0 2rpx rgba(255, 92, 141, 0.1);
}

.week-row,
.date-grid {
	display: grid;
	grid-template-columns: repeat(7, minmax(0, 1fr));
}

.week-cell {
	height: 42rpx;
	color: #8a5168;
	font-size: 25rpx;
	font-weight: 800;
	text-align: center;
	line-height: 42rpx;
}

.date-grid {
	gap: 10rpx;
	margin-top: 8rpx;
}

.date-cell {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 82rpx;
	border: 2rpx solid #ffe7ee;
	border-radius: 18rpx;
	background: #fffafb;
	box-sizing: border-box;
	text-align: center;
}

.date-cell.placeholder {
	border: none;
	background: transparent;
}

.date-cell.today {
	border-color: #ff8eb0;
	background: #fff3f7;
}

.date-cell.both {
	border-color: rgba(255, 92, 141, 0.28);
	background: linear-gradient(180deg, #fff5f8 0%, #ffeaf1 100%);
	box-shadow: inset 0 -6rpx 14rpx rgba(255, 92, 141, 0.05);
}

.date-cell.self,
.date-cell.partner {
	background: #fff7fa;
}

.heart-mark {
	position: absolute;
	left: 8rpx;
	top: 8rpx;
	width: 24rpx;
	height: 24rpx;
}

.date-number {
	font-size: 26rpx;
	font-weight: 800;
	color: #2b1c25;
	line-height: 1;
}

.date-cell.today .date-number {
	color: #ff5c8d;
}

.today-tag {
	position: absolute;
	right: 9rpx;
	bottom: 8rpx;
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	background: #ffffff;
	color: #ff5c8d;
	font-size: 17rpx;
	font-weight: 800;
	line-height: 28rpx;
}

.stats-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 18rpx;
	padding: 22rpx 28rpx;
	border: 2rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 26rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 14rpx 34rpx rgba(255, 92, 141, 0.08);
}

.stat-item {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	gap: 14rpx;
}

.stat-icon {
	flex-shrink: 0;
	width: 54rpx;
	height: 54rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #fff0f6 0%, #ffffff 100%);
	box-shadow: inset 0 0 0 2rpx rgba(255, 92, 141, 0.08);
}

.stat-content {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
	min-width: 0;
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
	line-height: 1.2;
}

.stat-divider {
	width: 2rpx;
	height: 50rpx;
	margin: 0 22rpx;
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
	height: 86rpx;
	border-radius: 999rpx;
	font-size: 29rpx;
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
