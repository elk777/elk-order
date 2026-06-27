<!--
 * @Author: elk
 * @Date: 2025-09-11 14:32:34
 * @LastEditors: elk
 * @LastEditTime: 2026-01-27 14:35:11
 * @FilePath: /hkt-applet/pages/cart/component/ShoppingCat.vue
 * @Description: 购物车-底部组件
-->

<template>
	<view v-if="userStore.isLogin" class="cat-container" :style="{ bottom: getBottomSpacing() + 10 + 'px' }" @tap.stop="noop">
		<view v-if="showCart" class="cat-outside-mask" @tap="closeCartPopup" @touchmove.stop.prevent="noop"></view>
		<!-- 饲养员 - 吃货 -->
		<view class="cat-breeder pubFlex" @tap.stop="handleBarTap">
			<view @tap.stop="handelCart" class="cat-breeder-left pubFlex">
				<view class="cart-icon pubFlex">
					<up-icon size="26" :name="userStore.userType ? cartPath : storePath"></up-icon>
				</view>
				<view class="cart-name">{{ cartName }}<span class="cart-number">{{ total }}</span></view>
			</view>
			<view v-if="!userStore.userType" class="cat-breeder-right pubFlex">
				<view class="cart-action-wrap" @tap.stop="noop">
					<up-button class="cart-action-btn" @click="handelAddRedact" shape="circle" :color="COLOURS['theme-color']"
						>添加菜谱</up-button
					>
				</view>
				<!-- <view style="margin: 0 15px;" >
					<up-button shape='circle' :color="COLOURS['theme-color']" :plain='true'>菜谱排序</up-button>
				</view> -->
			</view>
			<view v-else class="cat-breeder-right pubFlex">
				<view class="cart-action-wrap" @tap.stop="noop">
					<up-button class="cart-action-btn" @click="handelApplyFeed" shape="circle" color="#FF5C8D">申请投喂</up-button>
				</view>
			</view>
		</view>

		<!-- 购物车弹窗 -->
		<CartPopup :show="showCart" ref="cartPopup" />
		<RecipeCreateModePopup :show="createModeShow" @close="createModeShow = false" @select="handleCreateModeSelect" />
	</view>
</template>

<script setup>
import { getBottomSpacing } from "@/utils/tool.js";
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user.js";
import { COLOURS } from "@/config/index.js";
import { useRecipeStore } from "@/stores/recipe.js";
import { requireLogin } from "@/utils/auth.js";
import CartPopup from "./CartPopup.vue";
import RecipeCreateModePopup from "./RecipeCreateModePopup.vue";

const userStore = useUserStore();
const recipeStore = useRecipeStore();

// 购物车弹窗是否显示
const showCart = ref(false);
const createModeShow = ref(false);

const noop = () => {};

// 购物车名称
const cartName = computed(() => {
	return userStore.userType ? "订单数：" : "菜谱数：";
});
// 购物车总数量
const total = computed(() => {
	return userStore.userType ? recipeStore.cartTotal : recipeStore.cateTotal;
});

const storePath = ref(`/static/images/sort/store.svg`);
const cartPath = ref(`/static/images/sort/cart.svg`);

/**
 * @description: 购物车弹窗关闭事件
 * @return {*}
 */
const closeCartPopup = () => {
	showCart.value = false;
};

const handleBarTap = () => {
	if (showCart.value) {
		closeCartPopup();
	}
};

/**
 * @description: 购物车按钮事件
 * @return {*}
 */
const handelCart = () => {
	return requireLogin(() => {
		// 当用户为吃货时，点击购物车按钮，关闭弹窗
		if (userStore.userType) {
			if (total.value === 0) {
				uni.showToast({
					title: "您的购物车为空",
					icon: "none",
				});
				return;
			}
			showCart.value = !showCart.value;
			return;
		}
	});
};
/**
 * @description: 添加菜谱按钮事件
 * @param {:type}
 * @return {:type}
 */
const handelAddRedact = () => {
	requireLogin(() => {
		closeCartPopup();
		createModeShow.value = true;
	}, {
		redirect: "/pages/sort/index",
	});
};

const handleCreateModeSelect = (mode) => {
	createModeShow.value = false;
	if (mode === "manual") {
		uni.navigateTo({
			url: "/pages/recipe/redact?title=新增菜谱",
		});
		return;
	}
	if (mode === "ai") {
		uni.navigateTo({
			url: "/pages/recipe/ai-generate",
		});
		return;
	}
	uni.showToast({
		title: "拍照识菜还在准备中",
		icon: "none",
	});
};

/**
 * @description: 申请投喂按钮事件
 * @return {*}
 */
const handelApplyFeed = () => {
	const url = "/pages/cart/AffirmOrder";
	closeCartPopup();
	// 购物车为空时，提醒用户
	if (total.value === 0) {
		uni.showToast({
			title: "请先添加菜谱喲",
			icon: "none",
		});
		return;
	}

	requireLogin(() => {
		// 跳转确认订单页面
		uni.navigateTo({
			url,
		});
	}, {
		redirect: url,
	});
};

defineExpose({
	closeCartPopup,
});
</script>

<style lang="scss" scoped>
.cat-container {
	position: fixed;
	left: 22rpx;
	right: 22rpx;
	z-index: 9;
	height: 72px;
	box-sizing: border-box;
	padding: 12rpx 14rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.1);
	border-radius: 32rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 16rpx 42rpx rgba(31, 31, 31, 0.1);
	backdrop-filter: blur(10px);

	.cat-outside-mask {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 1;
		background: rgba(255, 255, 255, 0.01);
	}

	.cat-breeder-left {
		flex: 1;
		min-width: 0;
		justify-content: flex-start;
		padding-left: 8rpx;
		box-sizing: border-box;

		.cart-icon {
			width: 54rpx;
			height: 54rpx;
			flex-shrink: 0;
			border-radius: 18rpx;
			background: #fff0f5;
		}

		.cart-name {
			margin-left: 18rpx;
			color: #252525;
			font-size: 28rpx;
			font-weight: 700;
			white-space: nowrap;
		}

		.cart-number {
			margin-left: 10rpx;
			font-size: 42rpx;
			font-weight: 600;
			color: $theme-color;
		}
	}

	.cat-breeder {
		position: relative;
		z-index: 3;
		width: 100%;
		height: 100%;
		justify-content: space-between;
	}

	.cat-breeder-right {
		flex-shrink: 0;
	}

	.cart-action-wrap {
		margin-left: 16rpx;
	}

	.cart-action-btn {
		min-width: 156rpx;
		height: 58rpx;
	}
}
</style>
