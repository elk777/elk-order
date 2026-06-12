<!--
 * @Author: elk
 * @Date: 2026-06-13
 * @FilePath: /hkt-applet/pages/my/cooking-calendar.vue
 * @Description: 烹饪日历页面
-->
<template>
	<view class="cooking-calendar-page">
		<view class="hero">
			<view class="hero-copy">
				<view class="hero-title">烹饪日历</view>
				<view class="hero-subtitle">记录每一次用心烹饪的时刻</view>
			</view>
			<view class="hero-icons">
				<view class="hero-icon hero-icon-primary pubFlex">
					<up-icon name="calendar-fill" size="28" color="#ffffff"></up-icon>
				</view>
				<view class="hero-icon hero-icon-secondary pubFlex">
					<up-icon name="grid-fill" size="24" color="#ff5c8d"></up-icon>
				</view>
			</view>
		</view>

		<view class="overview-card">
			<view class="stat-item stat-primary">
				<view class="stat-icon pubFlex">
					<up-icon name="calendar-fill" size="24" color="#ff5c8d"></up-icon>
				</view>
				<view class="stat-content">
					<view class="stat-value">{{ overview.totalCookings || 0 }}</view>
					<view class="stat-label">本月烹饪</view>
				</view>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<view class="stat-icon pubFlex">
					<up-icon name="grid-fill" size="24" color="#ff5c8d"></up-icon>
				</view>
				<view class="stat-content">
					<view class="stat-value">{{ overview.totalDishes || 0 }}</view>
					<view class="stat-label">菜品种类</view>
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
					<view class="month-subtitle">点击日期查看烹饪明细</view>
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
						'has-cooking': day.count > 0,
					}"
					@click="handleDateClick(day)"
				>
					<template v-if="day.date">
						<view class="date-number">{{ day.day }}</view>
						<view class="date-marker" v-if="day.count > 0">
							<up-icon name="checkmark-circle-fill" size="11" color="#ffffff"></up-icon>
							<text>{{ day.count }}</text>
						</view>
						<view class="today-tag" v-else-if="day.isToday">今</view>
					</template>
				</view>
			</view>
		</view>

		<!-- 日期详情弹窗 -->
		<up-popup :show="showDayDetail" mode="center" round="20" @close="closeDayDetail">
			<view class="day-detail-popup">
				<view class="popup-header">
					<view class="popup-title">{{ selectedDateDisplay }}</view>
					<view class="popup-close" @click="closeDayDetail">
						<up-icon name="close" size="20" color="#ffffff"></up-icon>
					</view>
				</view>
				<view class="popup-body">
					<view class="popup-summary">
						<view class="popup-summary-icon pubFlex">
							<up-icon name="calendar-fill" size="18" color="#ff5c8d"></up-icon>
						</view>
						<view class="popup-summary-text">
							当天共烹饪 <text class="highlight">{{ dayDetail.totalCount }}</text> 次
						</view>
					</view>
					<view class="cooking-list" v-if="dayDetail.cookings.length > 0">
						<view class="cooking-item" v-for="item in dayDetail.cookings" :key="item.id">
							<view class="cooking-thumb" v-if="item.thumbnail">
								<image :src="item.thumbnail" mode="aspectFill" />
							</view>
							<view class="cooking-thumb cooking-thumb-empty" v-else>
								<up-icon name="photo" size="24" color="#d4d4d4"></up-icon>
							</view>
							<view class="cooking-info">
								<view class="cooking-name">{{ item.dishName }}</view>
								<view class="cooking-time">{{ formatTime(item.cookTime) }}</view>
							</view>
						</view>
					</view>
					<view class="empty-state" v-else>
						<up-icon name="empty-data" size="60" color="#d4d4d4"></up-icon>
						<view class="empty-text">暂无烹饪记录</view>
					</view>
				</view>
			</view>
		</up-popup>
	</view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getCookingCalendarOverview, getCookingDayDetail } from "@/apis/cooking.js";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";

useAuthGuard();

const today = new Date();
const currentDate = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const overview = ref({
	totalCookings: 0,
	totalDishes: 0,
	records: [],
});
const showDayDetail = ref(false);
const selectedDate = ref("");
const dayDetail = ref({
	totalCount: 0,
	cookings: [],
});
const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);

const selectedDateDisplay = computed(() => {
	if (!selectedDate.value) return "";
	const [, month, day] = selectedDate.value.split("-");
	return `${month}月${day}日`;
});

const calendarDays = computed(() => {
	const year = currentYear.value;
	const month = currentMonth.value;
	const first = new Date(year, month - 1, 1);
	const daysInMonth = new Date(year, month, 0).getDate();
	const firstWeekday = (first.getDay() + 6) % 7;

	// 构建记录map
	const recordsMap = new Map();
	for (const record of overview.value.records || []) {
		recordsMap.set(record.date, record);
	}

	const cells = [];

	// 填充前置空白
	for (let i = 0; i < firstWeekday; i += 1) {
		cells.push({ key: `empty-${i}`, date: "" });
	}

	// 填充日期
	for (let day = 1; day <= daysInMonth; day += 1) {
		const date = `${year}-${pad(month)}-${pad(day)}`;
		const record = recordsMap.get(date);
		const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate();
		cells.push({
			key: date,
			date,
			day,
			isToday,
			count: record?.count || 0,
			dishes: record?.dishes || [],
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
		const res = await getCookingCalendarOverview({ year, month });
		if (res?.code === 200 && res?.data) {
			overview.value = res.data;
		}
	} catch (error) {
		console.warn("[cooking-calendar] load overview failed", error);
	}
}

async function handleDateClick(day) {
	if (!day.date) return;
	selectedDate.value = day.date;
	showDayDetail.value = true;
	try {
		const res = await getCookingDayDetail({ date: day.date });
		if (res?.code === 200 && res?.data) {
			dayDetail.value = res.data;
		}
	} catch (error) {
		console.warn("[cooking-calendar] load day detail failed", error);
		dayDetail.value = { totalCount: 0, cookings: [] };
	}
}

function closeDayDetail() {
	showDayDetail.value = false;
}

function changeMonth(step) {
	const next = new Date(currentYear.value, currentDate.value.getMonth() + step, 1);
	currentDate.value = next;
	loadOverview(next.getFullYear(), next.getMonth() + 1);
}

function formatTime(isoString) {
	const date = new Date(isoString);
	const hour = String(date.getHours()).padStart(2, "0");
	const minute = String(date.getMinutes()).padStart(2, "0");
	return `${hour}:${minute}`;
}

function pad(value) {
	return String(value).padStart(2, "0");
}
</script>

<style lang="scss" scoped>
.cooking-calendar-page {
	min-height: 100vh;
	padding: 28rpx 26rpx 48rpx;
	box-sizing: border-box;
	background:
		linear-gradient(140deg, rgba(255, 236, 244, 0.92) 0%, rgba(255, 249, 251, 0.7) 46%, rgba(247, 247, 248, 0.96) 100%),
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
	font-size: 42rpx;
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

.overview-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 28rpx;
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
	width: 56rpx;
	height: 56rpx;
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
	font-size: 34rpx;
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
	height: 52rpx;
	margin: 0 22rpx;
	background: linear-gradient(180deg, rgba(255, 92, 141, 0), rgba(255, 92, 141, 0.2), rgba(255, 92, 141, 0));
}

.calendar-card {
	margin-top: 18rpx;
	padding: 20rpx 18rpx 24rpx;
	border: 2rpx solid rgba(255, 92, 141, 0.1);
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 16rpx 36rpx rgba(255, 92, 141, 0.1);
}

.calendar-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 18rpx;
	padding: 16rpx 4rpx 18rpx;
	border-bottom: 2rpx solid #fff0f5;
}

.month-copy {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
	min-width: 0;
}

.month-title {
	font-size: 34rpx;
	font-weight: 900;
	color: #2b1c25;
	line-height: 1.2;
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

.week-row {
	display: grid;
	grid-template-columns: repeat(7, minmax(0, 1fr));
	margin-bottom: 10rpx;
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
	display: grid;
	grid-template-columns: repeat(7, minmax(0, 1fr));
	gap: 10rpx;
}

.date-cell {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 84rpx;
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

.date-cell.has-cooking {
	border-color: rgba(255, 92, 141, 0.28);
	background: linear-gradient(180deg, #fff5f8 0%, #ffeaf1 100%);
	box-shadow: inset 0 -6rpx 14rpx rgba(255, 92, 141, 0.05);
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

.date-marker {
	position: absolute;
	right: 8rpx;
	bottom: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2rpx;
	min-width: 34rpx;
	height: 28rpx;
	padding: 0 7rpx;
	box-sizing: border-box;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ff5c8d 0%, #ff7f9a 100%);
	color: #ffffff;
	font-size: 17rpx;
	font-weight: 800;
	line-height: 28rpx;
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

/* 弹窗样式 */
.day-detail-popup {
	width: 600rpx;
	max-height: 80vh;
	background: #ffffff;
	border-radius: 28rpx;
	overflow: hidden;
}

.popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 32rpx;
	background: linear-gradient(135deg, #ff5c8d, #ff7f9a);
}

.popup-title {
	font-size: 32rpx;
	font-weight: 900;
	color: #ffffff;
}

.popup-close {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.28);
}

.popup-body {
	padding: 28rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.popup-summary {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	margin-bottom: 24rpx;
	font-size: 28rpx;
	color: #666;
	text-align: center;
}

.popup-summary-icon {
	width: 46rpx;
	height: 46rpx;
	border-radius: 50%;
	background: #fff1f6;
}

.popup-summary .highlight {
	font-size: 32rpx;
	font-weight: 900;
	color: #ff5c8d;
}

.cooking-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.cooking-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 18rpx;
	border: 2rpx solid #fff0f5;
	border-radius: 20rpx;
	background: #fffafb;
}

.cooking-thumb {
	width: 82rpx;
	height: 82rpx;
	border-radius: 16rpx;
	overflow: hidden;
	flex-shrink: 0;
}

.cooking-thumb image {
	width: 100%;
	height: 100%;
}

.cooking-thumb-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff0f5;
}

.cooking-info {
	flex: 1;
	min-width: 0;
}

.cooking-name {
	font-size: 28rpx;
	font-weight: 800;
	color: #2b1c25;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.cooking-time {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: #9a7485;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
}

.empty-text {
	margin-top: 16rpx;
	font-size: 24rpx;
	color: #999;
}
</style>
