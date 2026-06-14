<!--
 * @Author: elk
 * @Date: 2026-01-23 15:15:27
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-27 12:24:29
 * @FilePath: /hkt-applet/pages/sort/component/CartPopup.vue
 * @Description: 购物车弹窗组件
-->
<template>
	<view v-if="shouldRender" class="cart-popup-container" :class="{ 'cart-popup-container--active': isActive }">
		<view class="cart-sheet" @tap.stop="noop">
			<view class="cart-sheet-grabber"></view>
			<view class="popup-header pubFlex">
				<view class="header-copy">
					<view class="header-title">已选商品</view>
					<view class="header-desc">共 {{ recipeStore.cartTotal }} 份，确认后可申请投喂</view>
				</view>
				<view v-if="cartShow" @tap="clearCart" class="header-btn pubFlex">
					<up-icon name="trash" size="18" :color="COLOURS['theme-color']"></up-icon>
					<text>清空</text>
				</view>
			</view>
			<view class="popup-content">
				<scroll-view v-if="cartShow" scroll-y class="cart-scroll" :style="{ height: cartScrollHeight }">
					<CartList />
				</scroll-view>
				<view v-else class="cart-empty">
					<up-empty iconSize="75" mode="car" />
				</view>
			</view>
		</view>
	</view>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { COLOURS } from "@/config/index.js";
import { useRecipeStore } from "@/stores/recipe.js";
import CartList from "./CartList.vue";
const recipeStore = useRecipeStore();
const HIDE_ANIMATION_MS = 220;
let hideTimer = null;
const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});
const shouldRender = ref(props.show);
const isActive = ref(false);
const cartShow = computed(() => recipeStore.cartTotal > 0);
const cartScrollHeight = computed(() => {
	const itemCount = Math.max(recipeStore.cartList.length, 1);
	const height = Math.min(itemCount * 168, 460);
	return `${height}rpx`;
});
const noop = () => {};

watch(
	() => props.show,
	(show) => {
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}

		if (show) {
			shouldRender.value = true;
			isActive.value = false;
			nextTick(() => {
				if (props.show) {
					isActive.value = true;
				}
			});
			return;
		}

		if (!shouldRender.value) {
			isActive.value = false;
			return;
		}

		isActive.value = false;
		hideTimer = setTimeout(() => {
			shouldRender.value = false;
			hideTimer = null;
		}, HIDE_ANIMATION_MS);
	},
	{ immediate: true },
);

onBeforeUnmount(() => {
	if (hideTimer) {
		clearTimeout(hideTimer);
		hideTimer = null;
	}
});

/**
 * @description: 清空购物车
 * @return {*}
 */
const clearCart = () => {
	uni.showModal({
		title: "清空购物车",
		content: "确定清空购物车吗？",
		success: (res) => {
			if (res.confirm) {
				recipeStore.clearCart();
			}
		},
	});
};
</script>
<style lang="scss" scoped>
.cart-popup-container {
	position: absolute;
	left: 0;
	right: 0;
	bottom: calc(100% + 10rpx);
	z-index: 20;
	pointer-events: none;

	.cart-sheet {
		position: relative;
		z-index: 1;
		width: 100%;
		max-height: 48vh;
		overflow: hidden;
		box-sizing: border-box;
		border: 1rpx solid rgba(255, 92, 141, 0.1);
		border-radius: 34rpx;
		background:
			linear-gradient(180deg, rgba(255, 245, 248, 0.98) 0%, #ffffff 42%),
			#ffffff;
		box-shadow: 0 20rpx 52rpx rgba(31, 31, 31, 0.14);
		opacity: 0;
		pointer-events: auto;
		transform: translateY(28rpx) scale(0.98);
		transform-origin: bottom center;
		transition:
			opacity 220ms ease,
			transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.cart-sheet-grabber {
		width: 72rpx;
		height: 8rpx;
		margin: 16rpx auto 8rpx;
		border-radius: 999rpx;
		background: rgba(255, 92, 141, 0.18);
	}

	.popup-header {
		padding: 8rpx 28rpx 18rpx;
		justify-content: space-between;

		.header-copy {
			min-width: 0;
		}

		.header-title {
			color: #252525;
			font-size: 30rpx;
			font-weight: 700;
			line-height: 42rpx;
		}

		.header-desc {
			margin-top: 4rpx;
			color: $tinge-color;
			font-size: 23rpx;
			line-height: 32rpx;
		}

		.header-btn {
			flex-shrink: 0;
			height: 52rpx;
			margin-left: 18rpx;
			padding: 0 18rpx;
			border-radius: 999rpx;
			background: #fff0f5;
			color: $theme-color;
			font-size: 24rpx;
			font-weight: 600;

			text {
				margin-left: 6rpx;
			}
		}
	}

	.popup-content {
		padding: 0 20rpx 22rpx;
		box-sizing: border-box;
	}

	.cart-scroll {
		max-height: calc(48vh - 138rpx);
	}

	.cart-empty {
		padding: 38rpx 0 52rpx;
	}
}

.cart-popup-container--active {
	.cart-sheet {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}
</style>
