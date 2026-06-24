<!--
 * @Author: elk
 * @Date: 2026-01-23 16:52:57
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-27 14:39:04
 * @FilePath: /hkt-applet/pages/cart/component/CartList.vue
 * @Description: 购物车列表组件
-->
<template>
	<view class="cart-list-wrap">
		<view v-for="item in cartList" :key="item.id" class="cart-list-container">
			<view class="cart-list-item pubFlex">
				<view class="cart-item-left pubFlex">
					<up-image class="cart-cover" :radius="12" width="112rpx" height="112rpx" :src="item.cover || defaultCover" mode="aspectFill"></up-image>
					<view class="item-left-content">
						<view class="cart-list-item-name">{{ item.name }}</view>
						<template v-if="readonly">
							<view class="quantity-display">x{{ item.quantity }}</view>
						</template>
						<template v-else>
							<view class="quantity-control">
								<up-number-box v-model="item.quantity" @change="(event) => valChange(item, event)"></up-number-box>
							</view>
						</template>
					</view>
				</view>
				<view v-if="!readonly" @click="deleteCart(item)" class="cart-item-right pubFlex">
					<up-icon name="trash" size="21" :color="COLOURS['theme-color']"></up-icon>
				</view>
			</view>
		</view>
	</view>
</template>
<script setup>
import { computed } from "vue";
import { COLOURS } from "@/config/index.js";
import { useRecipeStore } from "@/stores/recipe.js";
import { withDefaultMediaUrl } from "@/utils/media.js";

defineProps({
	readonly: {
		type: Boolean,
		default: false,
	},
});

const recipeStore = useRecipeStore();
const defaultCover = "/static/images/head.jpeg";
const cartList = computed(() => {
	return recipeStore.cartList.map((item) => ({
		...item,
		cover: withDefaultMediaUrl(item.cover, defaultCover),
	}));
});

/**
 * @description: 删除购物车项
 * @param {Object} item - 购物车项
 * @return {*}
 */
const deleteCart = (item) => {
	recipeStore.deleteCart(item);
};

const valChange = async (item, event) => {
	const quantity = event?.value ?? event;
	try {
		await recipeStore.updateCartQuantity(item, quantity);
	} catch (error) {
		uni.showToast({
			title: error?.message || "更新购物车数量失败",
			icon: "none",
		});
		await recipeStore.loadCartList();
	}
};
</script>
<style lang="scss" scoped>
.cart-list-wrap {
	width: 100%;
	box-sizing: border-box;
}

.cart-list-container {
	padding: 0 0 16rpx;

	&:last-child {
		padding-bottom: 0;
	}

	.cart-list-item {
		justify-content: space-between;
		padding: 18rpx;
		box-sizing: border-box;
		border-radius: 26rpx;
		background: #ffffff;
		box-shadow: 0 10rpx 26rpx rgba(31, 31, 31, 0.06);
	}

	.cart-item-left {
		flex: 1;
		min-width: 0;
		justify-content: flex-start;
	}

	.cart-cover {
		flex-shrink: 0;
		overflow: hidden;
	}

	.item-left-content {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
	}

	.cart-list-item-name {
		max-width: 100%;
		overflow: hidden;
		color: #252525;
		font-size: 29rpx;
		font-weight: 700;
		line-height: 40rpx;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.quantity-control {
		margin-top: 18rpx;

		:deep(.u-number-box__minus),
		:deep(.u-number-box__plus),
		:deep(.u-number-box__input) {
			background: #f7f8fa;
		}

		:deep(.u-number-box__minus),
		:deep(.u-number-box__plus) {
			width: 52rpx;
			height: 44rpx;
			border-radius: 12rpx;
		}

		:deep(.u-number-box__input) {
			width: 56rpx !important;
			height: 44rpx !important;
			margin: 0 4rpx;
			border-radius: 12rpx;
			color: #252525;
			font-weight: 600;
		}
	}

	.cart-item-right {
		width: 50rpx;
		height: 50rpx;
		flex-shrink: 0;
		margin-left: 18rpx;
		border-radius: 50%;
		background: #fff5f8;
	}
}

.quantity-display {
	display: inline-flex;
	align-items: center;
	margin-top: 16rpx;
	padding: 4rpx 16rpx;
	border-radius: 999rpx;
	background: #fff5f8;
	color: $theme-color;
	font-size: 26rpx;
	font-weight: 600;
}
</style>
