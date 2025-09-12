/**
 * @Description: 购物车组件
 * @Author: elk
 * @Date: 2025-09-11 14:32:37
 * @LastEditors: 
 * @LastEditTime: 2025-09-11 14:32:37
 */

<template>
	<view class="cat-container" :style="{ bottom: getBottomSpacing() + 'px'}">
		<!-- 饲养员 -->
		<view class="cat-breeder pubFlex">
			<view class="cat-breeder-left pubFlex">
				<up-icon size='30' :name="userStore.userType ? cartPath :  storePath"></up-icon>
				<view class="cart-name">
					{{cartName}}<span class="cart-number">1</span>
				</view>
			</view>
			<view v-if='!userStore.userType' class="cat-breeder-right pubFlex">
				<up-button @click="handelAddRedact" shape='circle' :color="COLOURS['theme-color']">添加菜谱</up-button>
				<view style="margin: 0 15px;" >
					<up-button shape='circle' :color="COLOURS['theme-color']" :plain='true'>菜谱排序</up-button>
				</view>
			</view>
			<view v-else class="cat-breeder-right pubFlex">
				<view style="margin: 0 15px;" >
					<up-button shape='circle' color='#FF5C8D'>立即下单</up-button>
				</view>
			</view>
		</view>
		<!-- 吃货 -->
	</view>
</template>

<script setup>
	import { getBottomSpacing } from '@/utils/tool.js'
	import { ref, computed } from 'vue'
	import { useUserStore } from '@/stores/user.js'
	import { COLOURS } from '@/config/index.js'
	const userStore = useUserStore();
	
	const cartName = computed(() =>  {
		return userStore.userType ? '订单数：' : '菜谱数：'
	})
	
	
	
	const storePath = ref(`/static/images/sort/store.svg`)
	const cartPath = ref(`/static/images/sort/cart.svg`)
	
	
	/**
	 * @description: 添加菜谱按钮事件
	 * @param {:type} 
	 * @return {:type} 
	 */
	const handelAddRedact = () => {
		uni.navigateTo({
			url: '/pages/recipe/redact'
		});
	}
</script>

<style lang="scss" scoped>
	.cat-container {
		position:  fixed;
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