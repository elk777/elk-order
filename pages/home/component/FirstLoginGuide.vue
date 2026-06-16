<template>
	<up-popup
		:show="show"
		mode="center"
		round="24"
		:closeOnClickOverlay="false"
		:safeAreaInsetBottom="false"
		@close="handleSkip"
	>
		<view class="guide-panel">
			<view class="guide-head pubFlex">
				<view class="guide-brand">
					<view class="guide-eyebrow">偏爱厨房新手引导</view>
					<view class="guide-title">{{ currentStep.title }}</view>
				</view>
				<view class="guide-close pubFlex" @click="handleSkip">
					<up-icon name="close" color="#8f6772" size="18"></up-icon>
				</view>
			</view>

			<view class="guide-visual">
				<view class="guide-icon pubFlex" :class="currentStep.iconClass">
					<up-icon :name="currentStep.icon" color="#ffffff" size="34"></up-icon>
				</view>
				<view class="guide-line"></view>
			</view>

			<view class="guide-copy">
				<view class="guide-desc">{{ currentStep.desc }}</view>
				<view class="guide-points">
					<view class="guide-point" v-for="point in currentStep.points" :key="point">
						<view class="point-dot"></view>
						<view>{{ point }}</view>
					</view>
				</view>
			</view>

			<view class="guide-progress pubFlex">
				<view
					v-for="(_, index) in guideSteps"
					:key="index"
					class="progress-dot"
					:class="{ 'progress-dot--active': index === activeIndex }"
				></view>
			</view>

			<view class="guide-actions">
				<view class="secondary-action pubFlex" @click="handleSecondary">
					{{ secondaryText }}
				</view>
				<view class="primary-action pubFlex" @click="handlePrimary">
					{{ primaryText }}
					<up-icon v-if="!isLastStep" name="arrow-right" color="#ffffff" size="16"></up-icon>
				</view>
			</view>
		</view>
	</up-popup>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["finish"]);

const guideSteps = [
	{
		title: "先选好今天的身份",
		desc: "这里有两种默契分工：饲养员负责准备菜单，吃货负责开心点单。",
		icon: "account-fill",
		iconClass: "guide-icon--role",
		points: ["选身份后首页会展示你的专属入口", "绑定另一半后，两个人的位置和头像会自动同步"],
	},
	{
		title: "从菜单到订单一气呵成",
		desc: "想吃什么直接进菜单，加入购物车后下单，对方就能在订单里接单、烹饪和完成。",
		icon: "shopping-cart-fill",
		iconClass: "guide-icon--menu",
		points: ["菜单页负责挑菜和下单", "订单页记录待接单、烹饪中和已完成状态"],
	},
	{
		title: "把日常饭点攒成回忆",
		desc: "你还可以维护菜谱、邀请另一半、签到拿积分，让每一次吃饭都有一点被认真记录的感觉。",
		icon: "heart-fill",
		iconClass: "guide-icon--memory",
		points: ["菜谱支持分类、食材和制作步骤", "我的页可以看情侣关系、积分和每日签到"],
	},
];

const activeIndex = ref(0);
const currentStep = computed(() => guideSteps[activeIndex.value]);
const isLastStep = computed(() => activeIndex.value === guideSteps.length - 1);
const primaryText = computed(() => (isLastStep.value ? "开始使用" : "下一步"));
const secondaryText = computed(() => (activeIndex.value === 0 ? "跳过" : "上一步"));

watch(
	() => props.show,
	(value) => {
		if (value) {
			activeIndex.value = 0;
		}
	},
);

const finish = () => {
	emit("finish");
};

const handleSkip = () => {
	finish();
};

const handleSecondary = () => {
	if (activeIndex.value === 0) {
		finish();
		return;
	}
	activeIndex.value -= 1;
};

const handlePrimary = () => {
	if (isLastStep.value) {
		finish();
		return;
	}
	activeIndex.value += 1;
};
</script>

<style lang="scss" scoped>
.guide-panel {
	width: 640rpx;
	max-width: calc(100vw - 56rpx);
	box-sizing: border-box;
	padding: 30rpx 30rpx 28rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.1);
	border-radius: 24rpx;
	background:
		linear-gradient(180deg, #fff8fa 0%, #ffffff 46%, #fff7f1 100%),
		#ffffff;
	box-shadow: 0 28rpx 70rpx rgba(80, 48, 58, 0.18);
}

.guide-head {
	align-items: flex-start;
	justify-content: space-between;
}

.guide-brand {
	min-width: 0;
	padding-right: 24rpx;
}

.guide-eyebrow {
	color: #ff5c8d;
	font-size: 13px;
	font-weight: 700;
	line-height: 1.2;
}

.guide-title {
	margin-top: 10rpx;
	color: #202124;
	font-size: 22px;
	font-weight: 800;
	line-height: 1.22;
}

.guide-close {
	flex-shrink: 0;
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: rgba(255, 242, 246, 0.92);
}

.guide-visual {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 176rpx;
	margin: 28rpx 0 22rpx;
	overflow: hidden;
	border-radius: 20rpx;
	background:
		linear-gradient(135deg, rgba(255, 92, 141, 0.12), rgba(255, 184, 115, 0.14)),
		#fff7f3;
}

.guide-line {
	position: absolute;
	right: 38rpx;
	bottom: 34rpx;
	left: 38rpx;
	height: 12rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.75);
}

.guide-icon {
	position: relative;
	z-index: 1;
	width: 104rpx;
	height: 104rpx;
	border-radius: 32rpx;
	box-shadow: 0 18rpx 36rpx rgba(255, 92, 141, 0.18);
}

.guide-icon--role {
	background: linear-gradient(135deg, #ff7aa7, #ff5c8d);
}

.guide-icon--menu {
	background: linear-gradient(135deg, #ff9f5c, #ff6f61);
}

.guide-icon--memory {
	background: linear-gradient(135deg, #ff6f91, #ff5c8d);
}

.guide-copy {
	min-height: 190rpx;
}

.guide-desc {
	color: #44474d;
	font-size: 15px;
	font-weight: 600;
	line-height: 1.62;
}

.guide-points {
	margin-top: 20rpx;
	padding: 18rpx 20rpx;
	border-radius: 18rpx;
	background: #fbfbfc;
}

.guide-point {
	display: flex;
	align-items: flex-start;
	color: #60636b;
	font-size: 14px;
	font-weight: 600;
	line-height: 1.45;
}

.guide-point + .guide-point {
	margin-top: 14rpx;
}

.point-dot {
	flex-shrink: 0;
	width: 12rpx;
	height: 12rpx;
	margin: 13rpx 14rpx 0 0;
	border-radius: 50%;
	background: #ff5c8d;
	box-shadow: 0 0 0 8rpx rgba(255, 92, 141, 0.08);
}

.guide-progress {
	justify-content: center;
	margin: 26rpx 0 24rpx;
}

.progress-dot {
	width: 14rpx;
	height: 14rpx;
	margin: 0 7rpx;
	border-radius: 999rpx;
	background: #e8e9ee;
	transition: width 0.2s ease, background 0.2s ease;
}

.progress-dot--active {
	width: 38rpx;
	background: #ff5c8d;
}

.guide-actions {
	display: flex;
	align-items: center;
	width: 100%;
}

.secondary-action,
.primary-action {
	height: 82rpx;
	box-sizing: border-box;
	border-radius: 999rpx;
	font-size: 15px;
	font-weight: 800;
}

.secondary-action {
	flex-shrink: 0;
	width: 188rpx;
	color: #8f6772;
	background: #fff2f6;
}

.primary-action {
	flex: 1;
	margin-left: 18rpx;
	color: #ffffff;
	background: linear-gradient(135deg, #ff6f9f, #ff5c8d);
	box-shadow: 0 14rpx 28rpx rgba(255, 92, 141, 0.22);
}

.primary-action :deep(.u-icon) {
	margin-left: 8rpx;
}
</style>
