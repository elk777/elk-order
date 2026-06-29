<template>
	<view class="home-page">
		<view class="home-content" :style="layoutStyle">
			<view class="hero">
				<image
					v-if="!isVideoSkin && imagePath"
					class="hero-image"
					:src="imagePath"
					mode="aspectFill"
					@error="handleSkinMediaError"
				/>
				<video
					v-if="isVideoSkin && videoPath"
					class="hero-video"
					style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%;"
					:src="videoPath"
					:poster="videoPoster"
					:autoplay="true"
					:loop="true"
					:muted="true"
					:controls="false"
					:show-center-play-btn="false"
					:show-play-btn="false"
					:enable-progress-gesture="false"
					object-fit="cover"
					playsinline
					webkit-playsinline
					@error="handleSkinMediaError"
				></video>
				<view class="hero-mask"></view>
				<view class="hero-top"></view>
				<MainSideToolVue @open-subscribe="handleOpenSubscribePanel" />
				<view class="hero-stage">
					<view v-show="isStageVisible" class="stage-cluster">
						<view class="role-node keeper-node" @click="handleStageRole(stageRoles.keeper)">
							<view
								class="role-avatar pubFlex"
								:class="{ 'role-avatar-invite': !stageRoles.keeper.active && !userStore.profile.binding }"
							>
								<up-image
									v-if="stageRoles.keeper.showAvatar"
									shape="circle"
									width="52px"
									height="52px"
									:src="stageRoles.keeper.avatar"
								></up-image>
								<DefaultInviteAvatar v-else size="52px" />
							</view>
							<view class="role-badge">{{ stageRoles.keeper.label }}</view>
							<!-- 已登录且未绑定饲养员时（当前用户多为吃货），叠加透明转发按钮拉起微信好友面板。 -->
							<button
								v-if="canInviteKeeper"
								class="invite-share-btn"
								open-type="share"
								data-role="keeper"
								@click.stop
							></button>
						</view>
						<view class="food-orbit">
							<view class="orbit-spin">
								<view
									class="orbit-item"
									:class="item.className"
									v-for="item in orbitFoods"
									:key="item.id"
								>
									<view class="orbit-item-inner pubFlex">
										<image :src="item.icon" mode="aspectFit" />
									</view>
								</view>
							</view>
							<view class="stage-love pubFlex">
								<Love
									:isAnimated="true"
									:size="26"
									animation-duration="4.2s"
									animation-distance="-6rpx"
								/>
							</view>
						</view>
						<view class="food-spark spark-one"></view>
						<view class="food-spark spark-two"></view>
						<view class="food-spark spark-three"></view>
						<view class="role-node foodie-node" @click="handleStageRole(stageRoles.foodie)">
							<view
								class="role-avatar pubFlex"
								:class="{ 'role-avatar-invite': !stageRoles.foodie.active && !userStore.profile.binding }"
							>
								<up-image
									v-if="stageRoles.foodie.showAvatar"
									shape="circle"
									width="52px"
									height="52px"
									:src="stageRoles.foodie.avatar"
								></up-image>
								<DefaultInviteAvatar v-else size="52px" />
							</view>
							<view class="role-badge">{{ stageRoles.foodie.label }}</view>
							<!-- 已登录且未绑定吃货时（当前用户多为饲养员），叠加透明转发按钮拉起微信好友面板。 -->
							<button
								v-if="canInviteFoodie"
								class="invite-share-btn"
								open-type="share"
								data-role="foodie"
								@click.stop
							></button>
						</view>
					</view>
				</view>
				<view v-if="showDiningMemory" class="dining-memory-card">
					<view class="memory-label">我们在一起吃饭已经</view>
					<view class="memory-days">
						<text class="memory-number">{{ diningMemory.days }}</text>
						<text class="memory-unit">天</text>
					</view>
					<view class="memory-date">{{ diningMemory.dateText }}</view>
				</view>
				<view v-else-if="showGuestMemory" class="guest-memory-card" @click="handleGuestMemoryLogin">
					<view class="guest-card-title">等你来开饭</view>
					<view class="guest-card-subtitle">登录后记录一起吃饭的每一天</view>
					<view class="guest-card-dots">
						<view></view>
						<view></view>
						<view></view>
					</view>
				</view>
			</view>

			<view class="home-main">
				<view class="home-slogan">
					<view class="slogan-copy">
						<view class="slogan-title">偏爱：你，和你点的那份</view>
						<view class="slogan-subtitle">{{ welcomeText }}</view>
					</view>
					<view v-if="!isStageVisible" class="relationship-mini">
						<MainBodyMiniVue
							:binding="userStore.profile.binding"
							:role-slots="coupleRoleSlots"
						/>
					</view>
				</view>

				<MainBtnTypeVue />

				<view class="quick-grid">
					<view
						class="quick-card"
						v-for="item in quickActions"
						:key="item.id"
						@click="handleQuickAction(item)"
					>
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
		<FirstLoginGuideVue :show="showFirstLoginGuide" @finish="handleFirstLoginGuideFinish" />
		<SubscribeMessagePanel
			:show="showSubscribePanel"
			@close="showSubscribePanel = false"
			@authorized="handleSubscribeAuthorized"
		/>
	</view>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
import { onShow, onShareAppMessage } from "@dcloudio/uni-app";
import dayjs from "dayjs";
import Tabbar from "@/components/Tabbar/index.vue";
import MainBtnTypeVue from "./component/MainBtnType.vue";
import MainSideToolVue from "./component/MainSideTool.vue";
import SideToolSkinVue from "./component/SideToolSkin.vue";
import FirstLoginGuideVue from "./component/FirstLoginGuide.vue";
import SubscribeMessagePanel from "./component/SubscribeMessagePanel.vue";
import MainBodyMiniVue from "./component/MainBodyMini.vue";
import DefaultInviteAvatar from "@/components/DefaultInviteAvatar/index.vue";
import Love from "@/components/Love/index.vue";
import { useHomeSkin } from "@/hooks/home/useHomeSkin.js";
import { useBodyMode } from "@/hooks/home/sideTool.js";
import { useSubscribeMessage } from "@/utils/subscribeMessage.js";
import { getBottomSpacing, getCapsuleSafeBottom } from "@/utils/tool.js";
import { useUserStore } from "@/stores/user.js";
import { requireLogin } from "@/utils/auth.js";
import { buildInviteShareMessage, consumePendingInvite } from "@/utils/invite.js";
import { getUserProfile } from "@/apis/user.js";
import { getActiveCouple } from "@/apis/couples.js";
import { buildCoupleRoleSlots, ROLE_LABELS, ROLE_TYPES } from "@/utils/coupleDisplay.js";
import { withDefaultMediaUrl } from "@/utils/media.js";

const userStore = useUserStore();
const homeSkin = useHomeSkin();
const subscribeMessage = useSubscribeMessage();
const bgPath = homeSkin.bgPath;
const isVideoSkin = homeSkin.isVideoSkin;
const bodyMode = useBodyMode();
const isStageVisible = bodyMode.isBody;
const defaultAvatar = "/static/images/head.jpeg";
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
const coupleInfo = ref(null);
const showFirstLoginGuide = ref(false);
const showSubscribePanel = ref(false);
const skinFallbackNotified = ref(false);
const FIRST_LOGIN_GUIDE_STORAGE_PREFIX = "FIRST_LOGIN_GUIDE_V1_DONE";
let firstLoginGuideTimer = null;

const layoutStyle = computed(() => {
	const safeTop = getCapsuleSafeBottom() + 10;
	const bottomSpace = getBottomSpacing();

	return {
		height: `calc(100vh - ${bottomSpace}px)`,
		"--home-safe-top": `${safeTop}px`,
		"--home-tool-top": `${safeTop + 4}px`,
		"--home-skin-extension": "230rpx",
		"--home-stage-shift": "46rpx",
	};
});

const videoPath = computed(() => (isVideoSkin.value ? bgPath.value : ""));
const imagePath = computed(() => (!isVideoSkin.value ? bgPath.value : ""));
const videoPoster = computed(() => homeSkin.selectedSkin.value?.thumb || "");

const welcomeText = computed(() => {
	if (!userStore.isLogin) return "两个人的点餐灵感站";
	return userStore.userType ? "今天负责开心吃饭" : "今天负责认真投喂";
});

const diningMemory = computed(() => {
	const today = dayjs();
	const start = getDiningStartDate();
	const days = Math.max(today.diff(start, "day") + 1, 1);

	return {
		days,
		dateText: `${today.format("YYYY/MM/DD")} 周${weekDays[today.day()]}`,
	};
});

const showDiningMemory = computed(() => userStore.isLogin && isStageVisible.value);
const showGuestMemory = computed(() => !userStore.isLogin && isStageVisible.value);

const currentRoleType = computed(() => (userStore.isLogin ? userStore.userType : null));
const coupleRoleSlots = computed(() => buildCoupleRoleSlots({
	coupleInfo: coupleInfo.value,
	currentUser: userStore.profile,
	currentRoleType: currentRoleType.value,
	defaultAvatar,
}));

const stageRoles = computed(() => {
	const isLoggedIn = userStore.isLogin;
	const isKeeper = currentRoleType.value === ROLE_TYPES.keeper;
	const isFoodie = currentRoleType.value === ROLE_TYPES.foodie;
	const isBound = !!userStore.profile.binding;
	const hasCoupleInfo = !!(coupleRoleSlots.value && isBound);
	const keeperSlot = coupleRoleSlots.value?.keeper;
	const foodieSlot = coupleRoleSlots.value?.foodie;

	return {
		keeper: {
			type: ROLE_TYPES.keeper,
			active: isKeeper,
			showAvatar: isKeeper || isBound,
			avatar: hasCoupleInfo ? keeperSlot.avatar : (isKeeper ? withDefaultMediaUrl(userStore.profile.avatar, defaultAvatar) : defaultAvatar),
			label: isKeeper ? "我是饲养员" : (isBound ? ROLE_LABELS[ROLE_TYPES.keeper] : isLoggedIn ? "邀请饲养员" : ROLE_LABELS[ROLE_TYPES.keeper]),
		},
		foodie: {
			type: ROLE_TYPES.foodie,
			active: isFoodie,
			showAvatar: isFoodie || isBound,
			avatar: hasCoupleInfo ? foodieSlot.avatar : (isFoodie ? withDefaultMediaUrl(userStore.profile.avatar, defaultAvatar) : defaultAvatar),
			label: isFoodie ? "我是吃货" : (isBound ? ROLE_LABELS[ROLE_TYPES.foodie] : isLoggedIn ? "邀请吃货" : ROLE_LABELS[ROLE_TYPES.foodie]),
		},
	};
});

// 已登录、未绑定且自己不是吃货时（即饲养员或未选身份），才展示"邀请吃货"转发按钮。
const canInviteFoodie = computed(() => userStore.isLogin && !userStore.profile.binding && currentRoleType.value !== 1);

// 已登录、未绑定且自己不是饲养员时（即吃货或未选身份），才展示"邀请饲养员"转发按钮。
const canInviteKeeper = computed(() => userStore.isLogin && !userStore.profile.binding && currentRoleType.value !== 0);

const orbitFoods = [
	{
		id: "breakfast",
		icon: "/static/images/home/orbit-rice.svg",
		className: "item-breakfast",
	},
	{
		id: "lunch",
		icon: "/static/images/home/orbit-noodle.svg",
		className: "item-lunch",
	},
	{
		id: "supper",
		icon: "/static/images/home/orbit-bento.svg",
		className: "item-supper",
	},
	{
		id: "cart",
		icon: "/static/images/home/orbit-drink.svg",
		className: "item-cart",
	},
	{
		id: "feed",
		icon: "/static/images/home/orbit-pan.svg",
		className: "item-feed",
	},
	{
		id: "eat",
		icon: "/static/images/home/orbit-dessert.svg",
		className: "item-eat",
	},
];

const quickActions = [
	{
		id: "today",
		title: "今天吃啥",
		icon: "/static/images/home/eat.svg",
		iconClass: "quick-meal",
		url: "/pages/sort/index",
		tab: true,
	},
	{
		id: "points",
		title: "获取积分",
		icon: "/static/images/home/inte.svg",
		iconClass: "quick-points",
		url: "/pages/my/integral",
		authRequired: true,
		loginMessage: "请先登录后查看积分",
	},
	{
		id: "guest",
		title: "好友做客",
		iconName: "heart-fill",
		iconClass: "quick-guest",
	},
	{
		id: "next",
		title: "敬请期待",
		iconName: "more-dot-fill",
		iconClass: "quick-next",
	},
];

watch(isVideoSkin, (videoMode) => {
	if (videoMode) {
		bodyMode.hide();
	}
}, { immediate: true });

watch(bgPath, () => {
	skinFallbackNotified.value = false;
});

const refreshProfileOnShow = async () => {
	if (userStore.isLogin) {
		try {
			const res = await getUserProfile();
			// 请求层对业务错误码（code !== 200）正常 resolve，需显式判 code。
			if (res?.code === 200 && res?.data) {
				userStore.setProfile(res.data);
			} else {
				console.warn("[home] 用户资料响应异常:", res);
			}
		} catch (error) {
			// 刷新失败保持本地缓存即可，避免每次 onShow 都用 toast 打扰用户。
			console.warn("[home] refresh profile failed", error);
		}
	}
};

const loadCoupleOnShow = async () => {
	if (userStore.isLogin && userStore.profile.binding) {
		try {
			const res = await getActiveCouple();
			if (res?.code === 200 && res?.data) {
				coupleInfo.value = res.data;
			}
		} catch (error) {
			console.warn("[home] load couple failed", error);
		}
	} else {
		coupleInfo.value = null;
	}
};

onShow(async () => {
	// 壁纸初始化和资料刷新互不依赖，可并行执行；资料刷新仍需早于邀请码消费。
	await Promise.all([
		homeSkin.initHomeSkin(true),
		refreshProfileOnShow(),
	]);
	if (isVideoSkin.value) {
		bodyMode.hide();
	} else {
		bodyMode.show();
	}
	// 已登录用户从分享卡片进入首页时，尝试消费暂存的邀请码完成绑定。
	await consumePendingInvite();
	await loadCoupleOnShow();

	scheduleFirstLoginGuide();
});

onUnmounted(() => {
	clearFirstLoginGuideTimer();
});

// 转发分享卡片，携带当前用户邀请码，好友点击进入即可完成相互绑定。
// 根据点击源（data-role）区分文案：饲养员邀请吃货 / 吃货邀请饲养员；fallback 取当前用户身份。
onShareAppMessage((res) => {
	return buildInviteShareMessage({
		uuid: userStore.profile.uuid,
		userType: currentRoleType.value,
		targetRole: res?.target?.dataset?.role,
	});
});

function handleInvite() {
	uni.showToast({
		title: "邀请功能准备中",
		icon: "none",
	});
}

function handleGuestMemoryLogin() {
	return requireLogin(() => true, {
		message: "请先登录后记录吃饭天数",
	});
}

async function handleSkinMediaError() {
	const currentSkin = homeSkin.selectedSkin.value;
	if (!currentSkin || currentSkin.id === "warm-kitchen") return;

	await homeSkin.fallbackToDefaultSkin();
	if (!skinFallbackNotified.value) {
		skinFallbackNotified.value = true;
		uni.showToast({
			title: "壁纸加载失败，已使用默认背景",
			icon: "none",
		});
	}
}

function handleStageRole(role) {
	return requireLogin(
		() => {
			if (role.active || userStore.profile.binding) return true;
			handleInvite();
			return true;
		},
		{
			message: "请先登录后选择身份",
		},
	);
}

function handleQuickAction(item) {
	if (!item.url) {
		uni.showToast({
			title: "功能准备中",
			icon: "none",
		});
		return;
	}

	const navigate = () => {
		if (item.tab) {
			uni.switchTab({ url: item.url });
			return;
		}

		uni.navigateTo({ url: item.url });
	};

	if (item.authRequired) {
		return requireLogin(navigate, {
			redirect: item.url,
			message: item.loginMessage || "请先登录",
		});
	}

	return navigate();
}

function handleOpenSubscribePanel() {
	showSubscribePanel.value = true;
}

function handleSubscribeAuthorized() {
	subscribeMessage.loadSettings({ force: true });
}

function getFirstLoginGuideStorageKey() {
	const profile = userStore.profile || {};
	return `${FIRST_LOGIN_GUIDE_STORAGE_PREFIX}_${profile.uuid || profile.id || "current"}`;
}

function hasCompletedFirstLoginGuide() {
	try {
		return !!uni.getStorageSync(getFirstLoginGuideStorageKey());
	} catch (error) {
		console.warn("[home] read first login guide state failed", error);
		return false;
	}
}

function markFirstLoginGuideComplete() {
	try {
		uni.setStorageSync(getFirstLoginGuideStorageKey(), {
			done: true,
			time: Date.now(),
		});
	} catch (error) {
		console.warn("[home] save first login guide state failed", error);
	}
}

function clearFirstLoginGuideTimer() {
	if (!firstLoginGuideTimer) return;
	clearTimeout(firstLoginGuideTimer);
	firstLoginGuideTimer = null;
}

function scheduleFirstLoginGuide() {
	clearFirstLoginGuideTimer();
	if (!userStore.isLogin || hasCompletedFirstLoginGuide()) {
		showFirstLoginGuide.value = false;
		return;
	}

	firstLoginGuideTimer = setTimeout(() => {
		firstLoginGuideTimer = null;
		if (userStore.isLogin && !hasCompletedFirstLoginGuide()) {
			showFirstLoginGuide.value = true;
		}
	}, 650);
}

function handleFirstLoginGuideFinish() {
	markFirstLoginGuideComplete();
	showFirstLoginGuide.value = false;
}

function getDiningStartDate() {
	const profile = userStore.profile || {};
	const dateValue = profile.createTime || profile.create_time;
	const parsedDate = dayjs(dateValue);

	return parsedDate.isValid() ? parsedDate : dayjs();
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
	margin-bottom: calc(-1 * var(--home-skin-extension));
	padding: 0 24rpx var(--home-skin-extension);
	box-sizing: border-box;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	overflow: hidden;
}

.hero-image,
.hero-video {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 0;
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
	pointer-events: none;
}

.hero-image {
	display: block;
}

.hero-mask {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 1;
	background:
		linear-gradient(180deg, rgba(246, 205, 165, 0.1) 0%, rgba(255, 238, 222, 0.1) 69%, #fff8f2 100%),
		radial-gradient(circle at 35% 34%, rgba(255, 255, 255, 0.1), transparent 35%),
		radial-gradient(circle at 78% 54%, rgba(255, 201, 218, 0.1), transparent 0%);
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
	height: calc(100% - var(--home-safe-top) - var(--home-skin-extension));
	min-height: 0;
	margin-top: 0;
}

.stage-cluster {
	position: absolute;
	left: 0;
	right: 0;
	top: 39%;
	height: 660rpx;
	transform: translateY(-40%) translateY(var(--home-stage-shift));
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
	left: 38rpx;
	top: 4rpx;
}

.foodie-node {
	right: 26rpx;
	bottom: 70rpx;
}

// 透明转发按钮覆盖整个吃货节点，点击直接拉起微信好友面板。
.invite-share-btn {
	position: absolute;
	inset: 0;
	z-index: 6;
	margin: 0;
	padding: 0;
	width: 100%;
	height: 100%;
	background: transparent;
	opacity: 0;

	&::after {
		border: none;
	}
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
	left: 178rpx;
	right: 112rpx;
	top: 144rpx;
	height: 292rpx;
	z-index: 2;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 218, 153, 0.7);
	border-left-color: transparent;
	transform: rotate(-25deg);
	transform-origin: center;
	box-shadow: 0 0 32rpx rgba(255, 134, 126, 0.22);
	animation: orbitBreath 5.6s ease-in-out infinite;
}

.food-orbit::before {
	content: "";
	position: absolute;
	inset: 22rpx;
	border-radius: 50%;
	border: 12rpx solid rgba(255, 164, 191, 0.22);
	border-left-color: transparent;
}

.orbit-spin {
	position: absolute;
	inset: 0;
	z-index: 3;
	transform-origin: center;
	animation: orbitClockwise 20s linear infinite;
}

.stage-love {
	position: absolute;
	left: 50%;
	top: 50%;
	z-index: 5;
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	background: transparent;
	transform: translate(-50%, -50%) rotate(25deg);
	pointer-events: none;
}

.stage-love :deep(.love-bounce) {
	margin: 0;
}

.orbit-item {
	position: absolute;
	width: 76rpx;
	height: 76rpx;
	transform: translate(-50%, -50%);
}

.orbit-item-inner {
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.78);
	box-shadow: 0 9rpx 24rpx rgba(133, 76, 60, 0.14);
	animation: orbitCounter 20s linear infinite;
}

.orbit-item image {
	width: 52rpx;
	height: 52rpx;
}

.item-breakfast {
	left: 19%;
	top: 18%;
}

.item-lunch {
	left: 20%;
	top: 76%;
}

.item-supper {
	left: 82%;
	top: 22%;
}

.item-cart {
	left: 82%;
	top: 76%;
}

.item-feed {
	left: 48%;
	top: 10%;
}

.item-eat {
	left: 50%;
	top: 88%;
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
	animation: sparkTwinkle 3.6s ease-in-out infinite;
}

.spark-one {
	left: 330rpx;
	top: 164rpx;
}

.spark-two {
	right: 212rpx;
	top: 264rpx;
	animation-delay: -1.2s;
}

.spark-three {
	right: 92rpx;
	bottom: 168rpx;
	animation-delay: -2.1s;
}

@keyframes orbitBreath {
	0%,
	100% {
		transform: rotate(-25deg) scale(1);
	}

	50% {
		transform: rotate(-25deg) scale(1.015);
	}
}

@keyframes orbitClockwise {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

@keyframes orbitCounter {
	0% {
		transform: rotate(25deg) scale(1);
	}

	50% {
		transform: rotate(-155deg) scale(1.04);
	}

	100% {
		transform: rotate(-335deg) scale(1);
	}
}

@keyframes sparkTwinkle {
	0%,
	100% {
		opacity: 0.72;
		transform: scale(0.9);
	}

	50% {
		opacity: 1;
		transform: scale(1.18);
	}
}

.home-main {
	position: relative;
	top: -22rpx;
	z-index: 3;
	margin-top: -22rpx;
	flex: 0 0 auto;
	padding: 0 24rpx 42rpx;
	box-sizing: border-box;
	background: linear-gradient(180deg, transparent 0, transparent 176rpx, #fff8f2 176rpx, #fffaf7 100%);
}

.home-slogan,
:deep(.mainbtntype-container),
.quick-grid {
	position: relative;
	z-index: 1;
}

.dining-memory-card {
	position: absolute;
	left: 42rpx;
	bottom: calc(116rpx + var(--home-skin-extension) - var(--home-stage-shift));
	z-index: 2;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 360rpx;
	color: #ffffff;
	text-align: center;
	text-shadow: 0 4rpx 14rpx rgba(92, 66, 66, 0.26);
	pointer-events: none;
}

.guest-memory-card {
	position: absolute;
	left: 54rpx;
	bottom: calc(116rpx + var(--home-skin-extension) - var(--home-stage-shift));
	z-index: 2;
	width: 362rpx;
	padding: 24rpx 28rpx 22rpx;
	box-sizing: border-box;
	border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.48);
	box-shadow: 0 12rpx 30rpx rgba(100, 72, 72, 0.12);
	backdrop-filter: blur(14rpx);
}

.guest-card-title {
	color: #4a332f;
	font-size: 30rpx;
	font-weight: 800;
	line-height: 1.28;
	text-shadow: 0 2rpx 8rpx rgba(255, 255, 255, 0.5);
}

.guest-card-subtitle {
	margin-top: 8rpx;
	color: #a66668;
	font-size: 23rpx;
	font-weight: 600;
	line-height: 1.4;
}

.guest-card-dots {
	display: flex;
	align-items: center;
	margin-top: 16rpx;
}

.guest-card-dots view {
	width: 10rpx;
	height: 10rpx;
	margin-right: 10rpx;
	border-radius: 50%;
	background: #ff5c8d;
	opacity: 0.88;
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
	font-size: 78rpx;
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
	padding: 0 0 16rpx;
	box-sizing: border-box;
	// overflow: hidden;
}

.slogan-copy {
	flex: 1 1 auto;
	min-width: 0;
	max-width: 470rpx;
	padding: 12rpx 18rpx 14rpx;
	box-sizing: border-box;
	border-radius: 18rpx;
	background: rgba(255, 247, 240, 0.35);
	box-shadow: 0 10rpx 26rpx rgba(92, 62, 58, 0.12);
	backdrop-filter: blur(12rpx);
}

.slogan-title {
	color: #4a332f;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 1.3;
	text-shadow: 0 2rpx 8rpx rgba(255, 255, 255, 0.58);
}

.slogan-subtitle {
	margin-top: 6rpx;
	color: #9a635d;
	font-size: 22rpx;
	line-height: 1.35;
	text-shadow: 0 2rpx 8rpx rgba(255, 255, 255, 0.52);
}

.relationship-mini {
	flex: 0 0 232rpx;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	width: 232rpx;
	min-width: 0;
	height: 76rpx;
	box-sizing: border-box;
	padding-right: 8rpx;
	overflow: visible;
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
