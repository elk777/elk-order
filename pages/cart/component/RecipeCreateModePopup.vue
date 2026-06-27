<template>
	<up-popup :show="show" mode="bottom" round="28" :safeAreaInsetBottom="true" @close="emit('close')">
		<view class="create-mode-panel">
			<view class="panel-handle"></view>
			<view class="panel-head">
				<view>
					<view class="panel-title">选择创建方式</view>
					<view class="panel-desc">先选入口，再开始完善菜谱。</view>
				</view>
				<view class="panel-close pubFlex" @click="emit('close')">
					<up-icon name="close" size="18" color="#858B96"></up-icon>
				</view>
			</view>

			<view class="mode-list">
				<view class="mode-card mode-card--manual" @click="emit('select', 'manual')">
					<view class="mode-icon pubFlex">
						<up-icon name="edit-pen-fill" size="25" color="#FF5C8D"></up-icon>
					</view>
					<view class="mode-copy">
						<view class="mode-title">手动录入</view>
						<view class="mode-desc">沿用现在的新增菜谱流程。</view>
					</view>
					<up-icon name="arrow-right" size="16" color="#B7BBC4"></up-icon>
				</view>

				<view class="mode-card mode-card--ai" @click="emit('select', 'ai')">
					<view class="mode-icon pubFlex">
						<up-icon name="file-text-fill" size="25" color="#FF5C8D"></up-icon>
					</view>
					<view class="mode-copy">
						<view class="mode-title">灵感成菜</view>
						<view class="mode-desc">输入菜名或食材，生成可编辑草稿。</view>
					</view>
					<up-icon name="arrow-right" size="16" color="#B7BBC4"></up-icon>
				</view>

				<view class="mode-card mode-card--disabled" @click="emit('select', 'vision')">
					<view class="mode-icon mode-icon--disabled pubFlex">
						<up-icon name="camera-fill" size="25" color="#AEB3BD"></up-icon>
					</view>
					<view class="mode-copy">
						<view class="mode-title mode-title--disabled">拍照识菜</view>
						<view class="mode-desc">上传菜品照片生成菜谱。</view>
					</view>
					<view class="mode-badge">敬请期待</view>
				</view>
			</view>
		</view>
	</up-popup>
</template>

<script setup>
const emit = defineEmits(["close", "select"]);

defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});
</script>

<style lang="scss" scoped>
.create-mode-panel {
	box-sizing: border-box;
	padding: 18rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
	background: #ffffff;
}

.panel-handle {
	width: 72rpx;
	height: 8rpx;
	margin: 0 auto 26rpx;
	border-radius: 999rpx;
	background: #ebedf2;
}

.panel-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.panel-title {
	color: #202124;
	font-size: 20px;
	font-weight: 800;
	line-height: 1.25;
}

.panel-desc {
	margin-top: 8rpx;
	color: #858b96;
	font-size: 13px;
	line-height: 1.4;
}

.panel-close {
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: #f6f7fa;
}

.mode-list {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}

.mode-card {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	min-height: 112rpx;
	padding: 20rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 22rpx;
	background: #fff9fb;
}

.mode-card--ai {
	background: linear-gradient(135deg, #fff0f5 0%, #ffffff 100%);
	box-shadow: 0 12rpx 32rpx rgba(255, 92, 141, 0.12);
}

.mode-card--disabled {
	border-color: #eef0f4;
	background: #f7f8fb;
}

.mode-icon {
	flex-shrink: 0;
	width: 66rpx;
	height: 66rpx;
	border-radius: 22rpx;
	background: #ffffff;
}

.mode-icon--disabled {
	background: #ffffff;
}

.mode-copy {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.mode-title {
	color: #202124;
	font-size: 16px;
	font-weight: 800;
	line-height: 1.25;
}

.mode-title--disabled {
	color: #8f949e;
}

.mode-desc {
	margin-top: 8rpx;
	color: #777b84;
	font-size: 13px;
	line-height: 1.35;
}

.mode-badge {
	flex-shrink: 0;
	padding: 8rpx 14rpx;
	border-radius: 999rpx;
	background: #ffffff;
	color: #969ba5;
	font-size: 11px;
	font-weight: 700;
}
</style>
