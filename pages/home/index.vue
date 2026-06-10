<template>
	<view class="home-page">
		<view class="home-content" :style="layoutStyle">
			<view class="hero" :style="{ backgroundImage: `url(${bgPath})` }">
				<view class="hero-mask"></view>
				<view class="hero-top"></view>
				<MainSideToolVue />
				<view class="hero-stage">
					<view v-show="isStageVisible" class="stage-cluster">
						<view class="role-node keeper-node" @click="handleStageRole(stageRoles.keeper)">
							<view class="role-avatar pubFlex" :class="{ 'role-avatar-invite': !stageRoles.keeper.active }">
								<up-image
									v-if="stageRoles.keeper.active"
									shape="circle"
									width="52px"
									height="52px"
									:src="stageRoles.keeper.avatar"
								></up-image>
								<DefaultInviteAvatar v-else size="52px" />
							</view>
							<view class="role-badge">{{ stageRoles.keeper.label }}</view>
						</view>
						<view class="food-orbit">
							<view class="orbit-item pubFlex" :class="item.className" v-for="item in orbitFoods" :key="item.id">
								<image :src="item.icon" mode="aspectFit" />
							</view>
						</view>
						<view class="stage-love pubFlex">
							<Love :isAnimated="false" :size="26" />
						</view>
						<view class="food-spark spark-one"></view>
						<view class="food-spark spark-two"></view>
						<view class="food-spark spark-three"></view>
						<view class="role-node foodie-node" @click="handleStageRole(stageRoles.foodie)">
							<view class="role-avatar pubFlex" :class="{ 'role-avatar-invite': !stageRoles.foodie.active }">
								<up-image
									v-if="stageRoles.foodie.active"
									shape="circle"
									width="52px"
									height="52px"
									:src="stageRoles.foodie.avatar"
								></up-image>
								<DefaultInviteAvatar v-else size="52px" />
							</view>
							<view class="role-badge">{{ stageRoles.foodie.label }}</view>
						</view>
					</view>
				</view>
				<view v-show="isStageVisible" class="dining-memory-card">
					<view class="memory-label">我们在一起吃饭已经</view>
					<view class="memory-days">
						<text class="memory-number">{{ diningMemory.days }}</text>
						<text class="memory-unit">天</text>
					</view>
					<view class="memory-date">{{ diningMemory.dateText }}</view>
				</view>
			</view>

			<view class="home-main">
				<view class="home-slogan">
					<view class="slogan-copy">
						<view class="slogan-title">偏爱：你，和你点的那份</view>
						<view class="slogan-subtitle">{{ welcomeText }}</view>
					</view>
					<view v-if="!isStageVisible" class="relationship-mini">
						<MainBodyMiniVue />
					</view>
				</view>

				<MainBtnTypeVue />

				<view class="quick-grid">
					<view class="quick-card" v-for="item in quickActions" :key="item.id" @click="handleQuickAction(item)">
						<view class="quick-icon pubFlex" :class="item.iconClass">
							<image v-if="item.icon" :src="item.icon" mode="aspectFit" />
							<up-icon v-else :name="item.iconName" color="#ffffff" size="24" />
						</view>
						<view class="quick-title">{{ item.title }}</view>
					</view>
				</view>
			</view>
		</view>

		<Tabbar :current="0" />
		<SideToolSkinVue />
	</view>
</template>

<script setup>
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import Tabbar from '@/components/Tabbar/index.vue';
import MainBtnTypeVue from './component/MainBtnType.vue';
import MainSideToolVue from './component/MainSideTool.vue';
import SideToolSkinVue from './component/SideToolSkin.vue';
import MainBodyMiniVue from './component/MainBodyMini.vue';
import DefaultInviteAvatar from '@/components/DefaultInviteAvatar/index.vue';
import Love from '@/components/Love/index.vue';
import { useHomeSkin } from '@/hooks/home/useHomeSkin.js';
import { useBodyMode } from '@/hooks/home/sideTool.js';
import { getBottomSpacing, getUniTopNavHeight } from '@/utils/tool.js';
import { useUserStore } from '@/stores/user.js';
import { requireLogin } from '@/utils/auth.js';

const userStore = useUserStore();
const homeSkin = useHomeSkin();
const bgPath = homeSkin.bgPath;
const bodyMode = useBodyMode();
const isStageVisible = bodyMode.isBody;
const defaultAvatar = '/static/images/head.jpeg';
const defaultDiningStartDate = '2026-06-05';
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const layoutStyle = computed(() => {
	const safeTop = getCapsuleSafeBottom() + 10;
	const bottomSpace = getBottomSpacing();

	return {
		height: `calc(100vh - ${bottomSpace}px)`,
		'--home-safe-top': `${safeTop}px`,
		'--home-tool-top': `${safeTop + 4}px`,
	};
});

const welcomeText = computed(() => {
	if (!userStore.isLogin) return '两个人的点餐灵感站';
	return userStore.userType ? '今天负责开心吃饭' : '今天负责认真投喂';
});

const diningMemory = computed(() => {
	const today = dayjs();
	const start = getDiningStartDate();
	const days = Math.max(today.diff(start, 'day') + 1, 1);

	return {
		days,
		dateText: `${today.format('YYYY/MM/DD')} 周${weekDays[today.day()]}`,
	};
});

const currentRoleType = computed(() => (userStore.isLogin ? userStore.userType : null));

const stageRoles = computed(() => {
	const avatar = userStore.profile.avatar || defaultAvatar;
	const isLoggedIn = userStore.isLogin;
	const isKeeper = currentRoleType.value === 0;
	const isFoodie = currentRoleType.value === 1;

	return {
		keeper: {
			type: 0,
			active: isKeeper,
			avatar,
			label: isKeeper ? '我是饲养员' : (isLoggedIn ? '邀请饲养员' : '饲养员'),
		},
		foodie: {
			type: 1,
			active: isFoodie,
			avatar,
			label: isFoodie ? '我是吃货' : (isLoggedIn ? '邀请吃货' : '吃货'),
		},
	};
});

const orbitFoods = [
	{
		id: 'breakfast',
		icon: '/static/images/sort/breakfast.svg',
		className: 'item-breakfast',
	},
	{
		id: 'lunch',
		icon: '/static/images/sort/lunch.svg',
		className: 'item-lunch',
	},
	{
		id: 'supper',
		icon: '/static/images/sort/supper.svg',
		className: 'item-supper',
	},
	{
		id: 'cart',
		icon: '/static/images/sort/cart.svg',
		className: 'item-cart',
	},
	{
		id: 'feed',
		icon: '/static/images/home/feed.png',
		className: 'item-feed',
	},
	{
		id: 'eat',
		icon: '/static/images/home/eat.svg',
		className: 'item-eat',
	},
];

const quickActions = [
	{
		id: 'today',
		title: '今天吃啥',
		icon: '/static/images/home/eat.svg',
		iconClass: 'quick-meal',
		url: '/pages/sort/index',
		tab: true,
	},
	{
		id: 'points',
		title: '获取积分',
		icon: '/static/images/home/inte.svg',
		iconClass: 'quick-points',
		url: '/pages/my/integral',
	},
	{
		id: 'guest',
		title: '好友做客',
		iconName: 'heart-fill',
		iconClass: 'quick-guest',
	},
	{
		id: 'next',
		title: '敬请期待',
		iconName: 'more-dot-fill',
		iconClass: 'quick-next',
	},
];

onShow(() => {
	bodyMode.show();
	homeSkin.initHomeSkin(true);
});

function handleInvite() {
	uni.showToast({
		title: '邀请功能准备中',
		icon: 'none',
	});
}

function handleStageRole(role) {
	return requireLogin(() => {
		if (role.active) return true;
		handleInvite();
		return true;
	}, {
		message: '请先登录后选择身份',
	});
}

function handleQuickAction(item) {
	if (!item.url) {
		uni.showToast({
			title: '功能准备中',
			icon: 'none',
		});
		return;
	}

	if (item.tab) {
		uni.switchTab({ url: item.url });
		return;
	}

	uni.navigateTo({ url: item.url });
}

function getCapsuleSafeBottom() {
	try {
		const menuButton = uni.getMenuButtonBoundingClientRect?.();
		if (menuButton?.bottom) return menuButton.bottom;
	} catch {
		// 部分端没有胶囊 API，回退到状态栏高度。
	}

	return getUniTopNavHeight() + 54;
}

function getDiningStartDate() {
	const profile = userStore.profile || {};
	const dateValue = profile.diningStartDate || profile.anniversaryDate || profile.bindingDate || profile.bindDate || defaultDiningStartDate;
	const parsedDate = dayjs(dateValue);

	return parsedDate.isValid() ? parsedDate : dayjs(defaultDiningStartDate);
}

</script>

<style lang="scss" scoped>
	.home-page {
		position: relative;
		width: 100%;
		height: 100vh;
		background: #fff8f2;
		overflow: hidden;
	}

	.home-content {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		overflow: hidden;
	}

	.hero {
		position: relative;
		flex: 1 1 auto;
		min-height: 0;
		padding: 0 24rpx;
		box-sizing: border-box;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		overflow: hidden;
	}

	.hero-mask {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(246, 205, 165, 0.34) 0%, rgba(255, 238, 222, 0.76) 69%, #fff8f2 100%),
			radial-gradient(circle at 35% 34%, rgba(255, 255, 255, 0.6), transparent 35%),
			radial-gradient(circle at 78% 54%, rgba(255, 201, 218, 0.34), transparent 30%);
	}

	.hero-top {
		position: relative;
		z-index: 6;
		height: var(--home-safe-top);
	}

	:deep(.side-tool) {
		position: absolute;
		top: var(--home-tool-top);
		right: 24rpx;
		z-index: 8;
		padding-top: 0 !important;
		gap: 22rpx;
	}

	:deep(.side-tool > view),
	:deep(.side-tool > image),
	:deep(.side-tool .u-image) {
		margin-bottom: 0 !important;
		border-radius: 50%;
		// box-shadow: 0 10rpx 22rpx rgba(70, 88, 130, 0.18);
	}

	.hero-stage {
		position: relative;
		z-index: 2;
		width: 100%;
		height: calc(100% - var(--home-safe-top));
		min-height: 0;
		margin-top: 0;
	}

	.stage-cluster {
		position: absolute;
		left: 0;
		right: 0;
		top: 35%;
		height: 700rpx;
		transform: translateY(-40%);
	}

	.role-node {
		position: absolute;
		z-index: 5;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 180rpx;
	}

	.keeper-node {
		left: 42rpx;
		top: 0rpx;
	}

	.foodie-node {
		right: 30rpx;
		bottom: 8rpx;
	}

	.role-avatar {
		width: 116rpx;
		height: 116rpx;
		border-radius: 50%;
		// box-shadow: 0 16rpx 34rpx rgba(126, 82, 74, 0.17);
		box-sizing: border-box;
		overflow: hidden;
	}

	.role-avatar-invite {
		box-shadow: none;
		overflow: visible;
	}

	.role-badge {
		min-width: 176rpx;
		height: 58rpx;
		margin-top: 12rpx;
		padding: 0 22rpx;
		box-sizing: border-box;
		border-radius: 999rpx;
		background: rgba(111, 72, 70, 0.52);
		color: #ffffff;
		font-size: 25rpx;
		font-weight: 700;
		line-height: 58rpx;
		text-align: center;
		box-shadow: 0 8rpx 18rpx rgba(103, 62, 58, 0.16);
		backdrop-filter: blur(10rpx);
	}

	.food-orbit {
		position: absolute;
		left: 145rpx;
		right: 80rpx;
		top: 170rpx;
		height: 320rpx;
		z-index: 2;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 218, 153, 0.7);
		border-left-color: transparent;
		transform: rotate(-25deg);
		box-shadow: 0 0 32rpx rgba(255, 134, 126, 0.22);
	}

	.food-orbit::before {
		content: "";
		position: absolute;
		inset: 22rpx;
		border-radius: 50%;
		border: 12rpx solid rgba(255, 164, 191, 0.22);
		border-left-color: transparent;
	}

	.stage-love {
		position: absolute;
		left: 50%;
		top: 54%;
		z-index: 4;
		width: 68rpx;
		height: 68rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.82);
		box-shadow: 0 10rpx 22rpx rgba(255, 92, 141, 0.18);
		transform: translate(-50%, -50%);
	}

	.stage-love :deep(.love-bounce) {
		margin: 0;
	}

	.orbit-item {
		position: absolute;
		width: 68rpx;
		height: 68rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.78);
		box-shadow: 0 9rpx 24rpx rgba(133, 76, 60, 0.14);
		transform: rotate(21deg);
	}

	.orbit-item image {
		width: 44rpx;
		height: 44rpx;
	}

	.item-breakfast {
		left: 94rpx;
		top: -28rpx;
	}

	.item-lunch {
		left: 40rpx;
		bottom: 64rpx;
	}

	.item-supper {
		right: 16rpx;
		top: 64rpx;
	}

	.item-cart {
		right: 80rpx;
		bottom: -12rpx;
	}

	.item-feed {
		left: 182rpx;
		top: 30rpx;
	}

	.item-eat {
		right: 150rpx;
		bottom: 64rpx;
	}

	.food-spark {
		position: absolute;
		z-index: 2;
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #ffffff;
		box-shadow:
			22rpx -16rpx 0 rgba(255, 255, 255, 0.68),
			-18rpx 20rpx 0 rgba(255, 255, 255, 0.52);
	}

	.spark-one {
		left: 304rpx;
		top: 188rpx;
	}

	.spark-two {
		right: 188rpx;
		top: 296rpx;
	}

	.spark-three {
		right: 84rpx;
		bottom: 138rpx;
	}

	.home-main {
		position: relative;
		top: -45rpx;
		z-index: 3;
		margin-top: -40rpx;
		flex: 0 0 auto;
		padding: 0 24rpx 24rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, #fff8f2 0%, #fffaf7 100%);
	}

	.dining-memory-card {
		position: absolute;
		left: 35rpx;
		bottom: 120rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 330rpx;
		color: #ffffff;
		text-shadow: 0 4rpx 14rpx rgba(92, 66, 66, 0.26);
		pointer-events: none;
	}

	.memory-label {
		font-size: 30rpx;
		font-weight: 700;
		line-height: 1.2;
	}

	.memory-days {
		display: flex;
		align-items: baseline;
		margin-top: 4rpx;
		line-height: 1;
	}

	.memory-number {
		font-size: 82rpx;
		font-weight: 800;
	}

	.memory-unit {
		margin-left: 8rpx;
		font-size: 30rpx;
		font-weight: 700;
	}

	.memory-date {
		margin-top: 8rpx;
		font-size: 30rpx;
		font-weight: 700;
		line-height: 1.2;
	}

	.home-slogan {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		// min-height: 88rpx;
		padding: 0 0 18rpx;
		box-sizing: border-box;
		// overflow: hidden;
	}

	.slogan-copy {
		flex: 1 1 auto;
		min-width: 0;
		padding-right: 20rpx;
	}

	.slogan-title {
		color: #392f2c;
		font-size: 30rpx;
		font-weight: 700;
		line-height: 1.3;
	}

	.slogan-subtitle {
		margin-top: 6rpx;
		color: #8f7772;
		font-size: 22rpx;
		line-height: 1.35;
	}

	.relationship-mini {
		flex: 0 0 206rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 206rpx;
		min-width: 0;
		height: 76rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.relationship-mini :deep(.body-mini) {
		margin-right: 0;
	}

	.quick-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 16rpx;
		margin-top: 20rpx;
	}

	.quick-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 122rpx;
		padding: 14rpx 8rpx 12rpx;
		box-sizing: border-box;
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.93);
		box-shadow: 0 12rpx 28rpx rgba(128, 76, 70, 0.1);
	}

	.quick-icon {
		width: 56rpx;
		height: 56rpx;
		border-radius: 18rpx;
		color: #ffffff;
		font-size: 34rpx;
	}

	.quick-icon image {
		width: 42rpx;
		height: 42rpx;
	}

	.quick-meal {
		background: linear-gradient(180deg, #ffe3e1, #ffc5c3);
	}

	.quick-points,
	.quick-guest {
		background: linear-gradient(180deg, #ff8a86, #e94d47);
	}

	.quick-next {
		background: linear-gradient(180deg, #b8b8b8, #777b80);
		font-size: 40rpx;
		line-height: 1;
	}

	.quick-title {
		width: 100%;
		margin-top: 12rpx;
		color: #3d3635;
		font-size: 24rpx;
		font-weight: 700;
		line-height: 1.2;
		text-align: center;
	}
</style>
