<template>
	<view class="subscribe-panel-host" :class="{ active: show }">
		<up-popup
			:show="show"
			mode="center"
			round="20"
			:zIndex="PANEL_Z_INDEX"
			:overlayStyle="overlayStyle"
			:overlayOpacity="0.58"
			:safeAreaInsetBottom="false"
			@close="handleClose"
		>
			<view class="subscribe-panel">
				<view class="panel-head">
					<view class="panel-icon pubFlex" :class="{ active: isEnabled }">
						<up-icon :name="isEnabled ? 'bell-fill' : 'bell'" size="28" color="#ffffff"></up-icon>
						<view v-if="!isEnabled" class="panel-dot"></view>
					</view>
					<view class="panel-copy">
						<view class="panel-title">消息通知</view>
						<view class="panel-subtitle">
							{{ panelSubtitle }}
						</view>
					</view>
				</view>

				<view class="status-card" :class="{ active: isEnabled, partial: hasPendingTemplates }">
					<view class="status-title">{{ statusTitle }}</view>
					<view class="status-desc">
						{{ statusDesc }}
					</view>
				</view>

				<view class="keep-row" @click="toggleKeepAlive">
					<view class="keep-checkbox pubFlex" :class="{ checked: keepAliveDraft }">
						<up-icon v-if="keepAliveDraft" name="checkbox-mark" size="14" color="#ffffff"></up-icon>
					</view>
					<view class="keep-copy">
						<view class="keep-title">总是保持</view>
						<view class="keep-desc">后续从消息入口继续补充额度，签到和订单操作不会再打断授权。</view>
					</view>
				</view>

				<view class="template-list">
					<view class="template-chip" v-for="item in templates" :key="item.type">
						{{ item.title }}
					</view>
				</view>

				<view class="panel-actions">
					<view class="panel-btn panel-btn-ghost pubFlex" @click="handleClose">稍后再说</view>
					<view class="panel-btn panel-btn-primary pubFlex" :class="{ disabled: loading }" @tap.stop="handleAuthorize">
						{{ authorizeButtonText }}
					</view>
				</view>
			</view>
		</up-popup>
	</view>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useSubscribeMessage } from "@/utils/subscribeMessage.js";

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["close", "authorized"]);
const subscribeMessage = useSubscribeMessage();
const PANEL_Z_INDEX = 12000;
const overlayStyle = {
	position: "fixed",
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	width: "100vw",
	height: "100vh",
	"min-height": "100vh",
};
const {
	settings,
	loading,
	isEnabled,
	isFullyEnabled,
	templates,
	loadSettings,
	savePreference,
	authorizeAll,
} = subscribeMessage;
const keepAliveDraft = ref(true);
const acceptedTypes = computed(() => settings.value.acceptedTypes || []);
const acceptedCount = computed(() => acceptedTypes.value.length);
const hasPendingTemplates = computed(() => acceptedCount.value > 0 && !isFullyEnabled.value);
const templateUnavailable = computed(() => {
	const lastResult = settings.value.lastResult || {};
	return lastResult.error === "template_unavailable"
		|| Object.values(lastResult).includes("unavailable");
});
const panelSubtitle = computed(() => {
	if (isFullyEnabled.value) return "关键提醒已开启，可随时补充额度";
	if (hasPendingTemplates.value) return "还有通知模板未开启，可从这里继续补充";
	return "开启后才能收到对方的订阅提醒";
});
const statusTitle = computed(() => {
	if (isFullyEnabled.value) return "通知可用";
	if (hasPendingTemplates.value) return "部分通知已开启";
	return templateUnavailable.value ? "模板待配置" : "通知未授权";
});
const statusDesc = computed(() => {
	if (isFullyEnabled.value) return "签到、订餐和订单进度会尽量推送给对方。";
	if (hasPendingTemplates.value) return `已开启 ${acceptedCount.value}/${templates.length} 项，业务操作不会弹授权，未开启项可能收不到微信提醒。`;
	if (templateUnavailable.value) return "微信后台还没有返回可订阅模板，业务会继续照常执行。";
	return "红点表示订阅消息还不可用，业务会继续照常执行。";
});
const authorizeButtonText = computed(() => {
	if (loading.value) return "授权中...";
	if (hasPendingTemplates.value) return "继续开启";
	return isFullyEnabled.value ? "重新授权" : "开启通知";
});

watch(
	() => props.show,
	async (visible) => {
		if (!visible) return;
		await loadSettings({ force: true });
		keepAliveDraft.value = settings.value.keepAlive !== false;
	},
	{ immediate: true },
);

function toggleKeepAlive() {
	keepAliveDraft.value = !keepAliveDraft.value;
}

function handleAuthorize() {
	if (loading.value) return;
	authorizeAll({
		keepAlive: keepAliveDraft.value,
		showToast: true,
	}).then(() => {
		emit("authorized");
	});
}

async function handleClose() {
	await savePreference({
		keepAlive: keepAliveDraft.value,
	});
	emit("close");
}
</script>

<style lang="scss" scoped>
.subscribe-panel-host {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 12000;
	width: 0;
	height: 0;
}

.subscribe-panel-host.active {
	right: 0;
	bottom: 0;
	width: 100vw;
	height: 100vh;
}

.subscribe-panel {
	width: 620rpx;
	padding: 34rpx 30rpx 28rpx;
	box-sizing: border-box;
	border-radius: 28rpx;
	background: #fffaf7;
	box-shadow: 0 20rpx 60rpx rgba(90, 54, 60, 0.18);
}

.panel-head {
	display: flex;
	align-items: center;
}

.panel-icon {
	position: relative;
	flex: 0 0 82rpx;
	width: 82rpx;
	height: 82rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #a7a9ad 0%, #6f747b 100%);
	box-shadow: 0 12rpx 28rpx rgba(90, 54, 60, 0.14);
}

.panel-icon.active {
	background: linear-gradient(135deg, #ff5c8d 0%, #ff8fad 100%);
}

.panel-dot {
	position: absolute;
	right: 8rpx;
	top: 8rpx;
	width: 18rpx;
	height: 18rpx;
	border: 4rpx solid #fffaf7;
	border-radius: 50%;
	background: #ff3b30;
}

.panel-copy {
	flex: 1;
	min-width: 0;
	margin-left: 22rpx;
}

.panel-title {
	color: #332426;
	font-size: 34rpx;
	font-weight: 800;
	line-height: 1.2;
}

.panel-subtitle {
	margin-top: 8rpx;
	color: #8a6f70;
	font-size: 23rpx;
	line-height: 1.45;
}

.status-card {
	margin-top: 28rpx;
	padding: 22rpx 24rpx;
	box-sizing: border-box;
	border: 2rpx solid rgba(255, 92, 141, 0.1);
	border-radius: 20rpx;
	background: rgba(255, 255, 255, 0.82);
}

.status-card.active {
	border-color: rgba(255, 92, 141, 0.22);
	background: rgba(255, 244, 248, 0.95);
}

.status-title {
	color: #3f2d2f;
	font-size: 27rpx;
	font-weight: 800;
	line-height: 1.2;
}

.status-desc {
	margin-top: 8rpx;
	color: #7d6669;
	font-size: 23rpx;
	line-height: 1.45;
}

.keep-row {
	display: flex;
	align-items: flex-start;
	margin-top: 24rpx;
	padding: 18rpx 0;
}

.keep-checkbox {
	flex: 0 0 36rpx;
	width: 36rpx;
	height: 36rpx;
	margin-top: 4rpx;
	border: 2rpx solid rgba(255, 92, 141, 0.34);
	border-radius: 10rpx;
	box-sizing: border-box;
	background: #ffffff;
}

.keep-checkbox.checked {
	border-color: #ff5c8d;
	background: #ff5c8d;
}

.keep-copy {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.keep-title {
	color: #3f2d2f;
	font-size: 27rpx;
	font-weight: 800;
	line-height: 1.2;
}

.keep-desc {
	margin-top: 7rpx;
	color: #8a6f70;
	font-size: 22rpx;
	line-height: 1.45;
}

.template-list {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 8rpx;
}

.template-chip {
	max-width: 100%;
	padding: 10rpx 16rpx;
	box-sizing: border-box;
	border-radius: 999rpx;
	background: rgba(255, 92, 141, 0.08);
	color: #6f4d52;
	font-size: 21rpx;
	font-weight: 700;
	line-height: 1.2;
}

.panel-actions {
	display: flex;
	align-items: center;
	gap: 18rpx;
	margin-top: 30rpx;
}

.panel-btn {
	flex: 1;
	height: 76rpx;
	border-radius: 999rpx;
	font-size: 26rpx;
	font-weight: 800;
}

.panel-btn-ghost {
	color: #8a6f70;
	background: #ffffff;
	border: 2rpx solid rgba(138, 111, 112, 0.16);
}

.panel-btn-primary {
	color: #ffffff;
	background: linear-gradient(135deg, #ff5c8d 0%, #ff8fad 100%);
	box-shadow: 0 12rpx 26rpx rgba(255, 92, 141, 0.22);
}

.panel-btn.disabled {
	opacity: 0.72;
}
</style>
