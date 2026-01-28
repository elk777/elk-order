<!--
 * @Author: elk
 * @Date: 2026-01-23 16:52:57
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-27 14:39:04
 * @FilePath: /hkt-applet/pages/cart/component/CartList.vue
 * @Description: 购物车列表组件
-->
<template>
	<view v-for="item in cartList" :key="item.id" class="cart-list-container">
		<view class="cart-list-item pubFlex">
			<view class="cart-item-left pubFlex">
				<up-image :radius="5" width="100" height="100" :src="item.cover" mode="aspectFill"></up-image>
				<view class="pubColumnFlex item-left-content">
					<view class="cart-list-item-name">{{ item.name }}</view>
					<template v-if="readonly">
						<view class="quantity-display">x{{ item.quantity }}</view>
					</template>
					<template v-else>
						<up-number-box v-model="item.quantity" @change="valChange"></up-number-box>
					</template>
				</view>
			</view>
			<view v-if="!readonly" class="cart-item-right">
				<up-icon @click="deleteCart(item)" name="trash" size="24" :color="COLOURS['theme-color']"></up-icon>
			</view>
		</view>
	</view>
</template>
<script setup>
import { computed, watch } from "vue";
import { COLOURS } from "@/config/index.js";
import { useRecipeStore } from "@/stores/recipe.js";

const props = defineProps({
	readonly: {
		type: Boolean,
		default: false
	}
});

const recipeStore = useRecipeStore();
const cartList = computed(() => recipeStore.cartList);

/**
 * @description: 删除购物车项
 * @param {Object} item - 购物车项
 * @return {*}
 */
const deleteCart = (item) => {
    recipeStore.deleteCart(item);
}
</script>
<style lang="scss" scoped>
.cart-list-container {
    padding: 0px 15px;
    .cart-list-item {
        justify-content: space-between;
        margin-bottom: 20px;
        .item-left-content {
            margin-left: 20px;
            align-items: start;
        }
    }
}

.quantity-display {
    font-size: 28rpx;
    color: #666666;
    margin-top: 10rpx;
    font-weight: 500;
}
</style>
