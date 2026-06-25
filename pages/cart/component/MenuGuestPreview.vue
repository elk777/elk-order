<template>
	<view class="menu-guest-preview" @touchmove.stop.prevent="noop">
		<view class="preview-hero">
			<view class="preview-copy">
				<view class="preview-kicker">游客模式</view>
				<view class="preview-title">菜单预览</view>
				<view class="preview-desc">可先查看菜单页面内容，登录后同步家里的分类和菜谱。</view>
			</view>
			<view class="preview-icon pubFlex">
				<up-icon name="grid-fill" size="30" :color="COLOURS['theme-color']"></up-icon>
			</view>
		</view>

		<view class="preview-main">
			<view class="preview-tabs">
				<view
					v-for="category in previewCategories"
					:key="category.name"
					class="preview-tab"
					:class="{ 'preview-tab--active': category.active }"
				>
					<view class="preview-tab-name">{{ category.name }}</view>
					<view class="preview-tab-count">{{ category.count }}</view>
				</view>
			</view>

			<view class="preview-recipes">
				<view v-for="recipe in previewRecipes" :key="recipe.name" class="preview-recipe">
					<view class="recipe-thumb pubFlex">
						<up-icon :name="recipe.icon" size="24" :color="COLOURS['theme-color']"></up-icon>
					</view>
					<view class="recipe-copy">
						<view class="recipe-name">{{ recipe.name }}</view>
						<view class="recipe-meta">
							<up-icon name="clock" size="14" color="#FF5C8D"></up-icon>
							<text>{{ recipe.time }}</text>
						</view>
					</view>
					<view class="recipe-tag">{{ recipe.tag }}</view>
				</view>
			</view>
		</view>

		<view class="preview-login">
			<view class="login-copy">
				<view class="login-title">家庭菜单会在登录后同步</view>
				<view class="login-desc">由你自主授权后继续查看专属内容</view>
			</view>
			<up-button class="login-btn" size="small" shape="circle" plain :color="COLOURS['theme-color']" @click="emit('login')">
				登录查看
			</up-button>
		</view>
	</view>
</template>

<script setup>
import { COLOURS } from "@/config/index.js";

const emit = defineEmits(["login"]);

const previewCategories = [
	{ name: "家常菜", count: "8道", active: true },
	{ name: "快手菜", count: "6道", active: false },
	{ name: "收藏", count: "3道", active: false },
];

const previewRecipes = [
	{ name: "番茄炒蛋", time: "10分钟", tag: "示例", icon: "coupon" },
	{ name: "青菜汤", time: "15分钟", tag: "示例", icon: "file-text" },
	{ name: "鸡蛋羹", time: "12分钟", tag: "示例", icon: "order" },
];

const noop = () => {};
</script>

<style lang="scss" scoped>
.menu-guest-preview {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	padding: 34rpx 32rpx 30rpx;
}

.preview-hero {
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	padding: 4rpx 4rpx 22rpx;
}

.preview-copy {
	min-width: 0;
}

.preview-kicker {
	display: inline-flex;
	align-items: center;
	height: 40rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: #fff0f5;
	color: $theme-color;
	font-size: 22rpx;
	font-weight: 700;
	line-height: 40rpx;
}

.preview-title {
	margin-top: 14rpx;
	color: #252525;
	font-size: 38rpx;
	font-weight: 800;
	line-height: 52rpx;
}

.preview-desc {
	max-width: 480rpx;
	margin-top: 8rpx;
	color: $tinge-color;
	font-size: 24rpx;
	line-height: 36rpx;
}

.preview-icon {
	width: 86rpx;
	height: 86rpx;
	flex-shrink: 0;
	margin-left: 20rpx;
	border-radius: 28rpx;
	background: #fff0f5;
	box-shadow: 0 14rpx 30rpx rgba(255, 92, 141, 0.1);
}

.preview-main {
	display: flex;
	flex: 1;
	min-height: 0;
	overflow: hidden;
	border: 1rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 30rpx;
	background: rgba(255, 255, 255, 0.82);
	box-shadow: 0 14rpx 32rpx rgba(31, 31, 31, 0.04);
}

.preview-tabs {
	width: 168rpx;
	flex-shrink: 0;
	box-sizing: border-box;
	padding: 18rpx 12rpx;
	background: #fff7fa;
}

.preview-tab {
	box-sizing: border-box;
	margin-bottom: 14rpx;
	padding: 18rpx 14rpx;
	border-radius: 22rpx;
	color: $tinge-color;
}

.preview-tab--active {
	background: #ffffff;
	color: #252525;
	box-shadow: 0 10rpx 24rpx rgba(255, 92, 141, 0.08);
}

.preview-tab-name {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
}

.preview-tab-count {
	margin-top: 6rpx;
	color: inherit;
	font-size: 22rpx;
	line-height: 30rpx;
	opacity: 0.78;
}

.preview-recipes {
	flex: 1;
	min-width: 0;
	box-sizing: border-box;
	padding: 18rpx;
	background: #ffffff;
}

.preview-recipe {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	margin-bottom: 16rpx;
	padding: 18rpx;
	border-radius: 26rpx;
	background: #fffafd;
}

.preview-recipe:last-child {
	margin-bottom: 0;
}

.recipe-thumb {
	width: 78rpx;
	height: 78rpx;
	flex-shrink: 0;
	border-radius: 24rpx;
	background:
		linear-gradient(180deg, #fff5f8 0%, #ffffff 100%),
		#ffffff;
}

.recipe-copy {
	min-width: 0;
	flex: 1;
	margin-left: 18rpx;
}

.recipe-name {
	overflow: hidden;
	color: #252525;
	font-size: 28rpx;
	font-weight: 800;
	line-height: 40rpx;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.recipe-meta {
	display: flex;
	align-items: center;
	margin-top: 8rpx;
	color: $tinge-color;
	font-size: 22rpx;
	line-height: 30rpx;
}

.recipe-meta text {
	margin-left: 6rpx;
}

.recipe-tag {
	flex-shrink: 0;
	margin-left: 14rpx;
	padding: 6rpx 14rpx;
	border-radius: 999rpx;
	background: #fff0f5;
	color: $theme-color;
	font-size: 22rpx;
	line-height: 30rpx;
}

.preview-login {
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	margin-top: 22rpx;
	padding: 20rpx 22rpx;
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 12rpx 28rpx rgba(31, 31, 31, 0.05);
}

.login-copy {
	min-width: 0;
	margin-right: 18rpx;
}

.login-title {
	color: #252525;
	font-size: 26rpx;
	font-weight: 800;
	line-height: 36rpx;
}

.login-desc {
	margin-top: 4rpx;
	color: $tinge-color;
	font-size: 22rpx;
	line-height: 32rpx;
}

.login-btn {
	width: 176rpx;
	flex-shrink: 0;
}
</style>
