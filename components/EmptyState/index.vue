<template>
	<view class="empty-state pubColumnFlex" :style="{ minHeight, padding }">
		<view class="empty-state-icon pubFlex" :style="{ background: iconBgColor }">
			<up-icon :name="icon" size="48" :color="iconColor || COLOURS['theme-color']"></up-icon>
		</view>
		<view class="empty-state-title">{{ title }}</view>
		<view class="empty-state-desc" :style="{ maxWidth: descMaxWidth }">{{ desc }}</view>
		<up-button
			v-if="actionText"
			class="empty-state-btn"
			:color="buttonColor || COLOURS['theme-color']"
			shape="circle"
			@click="emit('action')"
			>
			<!-- :icon="actionIcon" -->
			{{ actionText }}
		</up-button>
	</view>
</template>

<script setup>
import { COLOURS } from "@/config/index.js";

defineProps({
	icon: {
		type: String,
		default: "empty-list",
	},
	title: {
		type: String,
		default: "",
	},
	desc: {
		type: String,
		default: "",
	},
	actionText: {
		type: String,
		default: "",
	},
	actionIcon: {
		type: String,
		default: "",
	},
	minHeight: {
		type: String,
		default: "auto",
	},
	padding: {
		type: String,
		default: "120rpx 56rpx 160rpx",
	},
	buttonColor: {
		type: String,
		default: "",
	},
	iconColor: {
		type: String,
		default: "",
	},
	iconBgColor: {
		type: String,
		default: "#fff5f5",
	},
	descMaxWidth: {
		type: String,
		default: "560rpx",
	},
});

const emit = defineEmits(["action"]);
</script>

<style lang="scss" scoped>
.empty-state {
	width: 100%;
	box-sizing: border-box;
	align-items: center;
	justify-content: center;
	text-align: center;
}

.empty-state-icon {
	width: 128rpx;
	height: 128rpx;
	margin-bottom: 32rpx;
	justify-content: center;
	border-radius: 50%;
}

.empty-state-title {
	margin-bottom: 16rpx;
	color: #303133;
	font-size: 34rpx;
	font-weight: 600;
	line-height: 48rpx;
}

.empty-state-desc {
	width: 100%;
	margin-bottom: 48rpx;
	color: #707070;
	font-size: 26rpx;
	line-height: 40rpx;
}

.empty-state-btn {
	width: 320rpx;
}
</style>
