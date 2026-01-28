<!--
 * @Author: elk
 * @Date: 2026-01-23 15:15:27
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-27 12:24:29
 * @FilePath: /hkt-applet/pages/sort/component/CartPopup.vue
 * @Description: 购物车弹窗组件
-->
<template>
	<view class="cart-popup-container">
		<up-popup v-model:show="isShow" :overlay="true">
			<view class="popup-header pubFlex">
				<view class="header-title publcTextSize">已选商品</view>
				<view v-if="cartShow" @click="clearCart" class="header-btn pubFlex">
					<up-icon name="trash" size="24" :color="COLOURS['theme-color']"></up-icon>
					清空
				</view>
			</view>
			<up-divider></up-divider>
			<view class="popup-content">
				<CartList v-if="cartShow" />
				<up-empty iconSize="75" v-else mode="car" />
			</view>
		</up-popup>
	</view>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { computed } from "vue";
import { COLOURS } from "@/config/index.js";
import { useRecipeStore } from "@/stores/recipe.js";
import CartList from "./CartList.vue";
const recipeStore = useRecipeStore();
const emit = defineEmits(["update:show", "close"]);
const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});
const isShow = computed({
	get: () => props.show,
	set: (val) => {
		emit("update:show", val);
	},
});
const cartShow = computed(() => recipeStore.cartTotal > 0);


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
/**
 * @description: 关闭弹窗
 * @return {*}
 */
const closePopup = () => {
	isShow.value = false;
	emit("close");
};
</script>
<style lang="scss" scoped>
.cart-popup-container {
	.popup-header {
		padding: 0px 15px;
		justify-content: space-between;
		.header-title {
			color: $tinge-color;
		}
		.header-btn {
			color: $theme-color;
		}
	}
	:deep(.u-divider) {
		margin-top: -10px;
		margin-bottom: 10px;
	}
	:deep(.u-transition) {
		bottom: 155px !important;
	}
}
</style>
