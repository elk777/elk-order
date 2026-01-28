<!--
 * @Author: elk
 * @Date: 2025-09-11 14:32:34
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-27 14:35:11
 * @FilePath: /hkt-applet/pages/cart/component/ShoppingCat.vue
 * @Description: 购物车-底部组件
-->

<template>
	<view class="cat-container" :style="{ bottom: getBottomSpacing() + 'px' }">
		<!-- 饲养员 - 吃货 -->
		<view class="cat-breeder pubFlex">
			<view @click="handelCart" class="cat-breeder-left pubFlex">
				<up-icon size="30" :name="userStore.userType ? cartPath : storePath"></up-icon>
				<view class="cart-name">
					{{ cartName }}<span class="cart-number">{{ total }}</span></view
				>
			</view>
			<view v-if="!userStore.userType" class="cat-breeder-right pubFlex">
				<view style="margin: 0 15px">
					<up-button @click="handelAddRedact" shape="circle" :color="COLOURS['theme-color']"
						>添加菜谱</up-button
					>
				</view>
				<!-- <view style="margin: 0 15px;" >
					<up-button shape='circle' :color="COLOURS['theme-color']" :plain='true'>菜谱排序</up-button>
				</view> -->
			</view>
			<view v-else class="cat-breeder-right pubFlex">
				<view style="margin: 0 15px">
					<up-button @click="handelApplyFeed" shape="circle" color="#FF5C8D">申请投喂</up-button>
				</view>
			</view>
		</view>

		<!-- 购物车弹窗 -->
		<CartPopup v-model:show="showCart" @close="closeCartPopup" ref="cartPopup" />
	</view>
</template>

<script setup>
import { getBottomSpacing } from "@/utils/tool.js";
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user.js";
import { COLOURS } from "@/config/index.js";
import { useRecipeStore } from "@/stores/recipe.js";
import CartPopup from "./CartPopup.vue";

const userStore = useUserStore();
const recipeStore = useRecipeStore();

// 购物车弹窗是否显示
const showCart = ref(false);


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
/**
 * @description: 购物车按钮事件
 * @return {*}
 */
const handelCart = () => {
	// 当用户为吃货时，点击购物车按钮，关闭弹窗
	if (userStore.userType) {
		if (total.value === 0) {
			uni.showToast({
				title: "您的购物车为空",
				icon: "none",
			});
			return;
		}
		showCart.value = true;
		return;
	}
};
/**
 * @description: 添加菜谱按钮事件
 * @param {:type}
 * @return {:type}
 */
const handelAddRedact = () => {
	uni.navigateTo({
		url: "/pages/recipe/redact?title=新增菜谱",
	});
};

/**
 * @description: 申请投喂按钮事件
 * @return {*}
 */
const handelApplyFeed = () => {
	// 购物车为空时，提醒用户
	if (total.value === 0) {
		uni.showToast({
			title: "请先添加菜谱喲",
			icon: "none",
		});
		return;
	}
	// 跳转确认订单页面
	uni.navigateTo({
		url: "/pages/cart/AffirmOrder",
	});
};
</script>

<style lang="scss" scoped>
.cat-container {
	position: fixed;
	width: 100%;
	height: 70px;
	line-height: 70px;
	background-color: #fff;
	box-shadow: #f0f0f0 0px 0px 20px 10px;
	.cat-breeder-left {
		margin-left: 15px;
		.cart-name {
			margin-left: 15px;
		}
		.cart-number {
			font-size: 42rpx;
			font-weight: 600;
			color: $theme-color;
		}
	}
	.cat-breeder {
		width: 100%;
		justify-content: space-between;
	}
}
</style>
