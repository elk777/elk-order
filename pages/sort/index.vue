<!--
 * @Author: elk
 * @Date: 2025-07-23 20:44:15
 * @LastEditors: elk
 * @LastEditTime: 2026-06-13 13:47:50
 * @FilePath: /hkt-applet/pages/sort/index.vue
 * @Description: 排序页
-->
<template>
	<view class="sort-container" :class="{ 'sort-container--guest': !userStore.isLogin }" :style="layoutStyle" @tap="closeFloatingCart">
		<NavbarMini :title="'菜单'" />
		<view class="sort-body">
			<view class="sort-toolbar pubFlex" :class="{ 'sort-toolbar--guest': !isFeeder }">
				<view v-if="isFeeder" @click="toCateTab" class="sort-manage pubFlex">
					<view class="sort-manage-icon pubFlex">
						<u-icon name="setting" size="21" :color="COLOURS['theme-color']" />
					</view>
					<view class="sort-manage-text">分类管理</view>
				</view>
				<!-- 搜索框 -->
				<Search class="sort-search" @search="handleSearch" @clear="handleSearchClear" />
			</view>
			<!-- 菜单分类 -->
			<CateTab ref="cateTabRef" />
		</view>

		<ShoppingCat v-if="userStore.isLogin" ref="shoppingCatRef" />
		<Tabbar :current="1" />
	</view>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app";
import Tabbar from "@/components/Tabbar/index.vue";
import Search from "@/components/Search/index.vue";
import NavbarMini from "@/components/NavbarMini/index.vue";
import CateTab from "@/pages/cart/component/CateTab.vue";
import ShoppingCat from "@/pages/cart/component/ShoppingCat.vue";
import { COLOURS } from "@/config/index.js";
import { requireLogin } from "@/utils/auth.js";
import { useUserStore } from "@/stores/user.js";
import { getBottomSpacing, getCustomNavbarHeight } from "@/utils/tool.js";

const userStore = useUserStore();
const cateTabRef = ref(null);
const shoppingCatRef = ref(null);
const layoutStyle = computed(() => ({
	"--sort-bottom-space": `${getBottomSpacing()}px`,
	"--sort-navbar-height": `${getCustomNavbarHeight()}px`,
	"--sort-action-space": `${userStore.isLogin ? 92 : 0}px`,
}));

// 计算属性：根据用户类型判断是否为饲养员（0=饲养员, 1=吃货）
const isFeeder = computed(() => {
	return userStore.isLogin && userStore.userType === 0;
});

/**
 * @description: 页面显示时刷新菜单数据
 * @return {*}
 */
const refreshMenu = async (params = {}) => {
	if (!cateTabRef.value) {
		await nextTick();
	}
	if (cateTabRef.value) {
		await cateTabRef.value.refreshMenu(params);
	} else {
		console.warn("cateTabRef 尚未准备好");
	}
};

onShow(() => {
	refreshMenu();
});

onPullDownRefresh(async () => {
	if (!userStore.isLogin) {
		uni.stopPullDownRefresh();
		return;
	}

	try {
		await refreshMenu();
	} finally {
		uni.stopPullDownRefresh();
	}
});

/**
 * @description: 分类管理点击事件
 * @return {*}
 */
function toCateTab() {
	const url = "/pages/recipe/classify";
	requireLogin(() => {
		uni.navigateTo({
			url,
		});
	}, {
		redirect: url,
	});
}

/**
 * @description: 处理搜索
 * @param {string} keyword - 搜索关键词
 * @return {*}
 */
function handleSearch(keyword) {
	const trimmedKeyword = (keyword || "").trim();
	if (trimmedKeyword) {
		refreshMenu({ keyword: trimmedKeyword });
		return;
	}
	refreshMenu();
}

/**
 * @description: 处理搜索清空
 * @return {*}
 */
function handleSearchClear() {
	refreshMenu();
}

function closeFloatingCart() {
	shoppingCatRef.value?.closeCartPopup?.();
}
</script>

<style lang="scss" scoped>
.sort-container {
	min-height: 100vh;
	box-sizing: border-box;
	overflow-x: hidden;
	padding-bottom: calc(var(--sort-bottom-space) + var(--sort-action-space) + 16px);
	background:
		linear-gradient(180deg, #fff5f8 0, #f8f8f8 210rpx),
		#f8f8f8;

	.sort-body {
		width: 100%;
		box-sizing: border-box;
		padding: 0 22rpx;
	}

	.sort-toolbar {
		position: relative;
		z-index: 2;
		width: 100%;
		box-sizing: border-box;
		justify-content: space-between;
		margin-top: -8rpx;
		margin-bottom: 18rpx;
		padding: 14rpx;
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 28rpx;
		background: rgba(255, 255, 255, 0.92);
		box-shadow: 0 16rpx 36rpx rgba(255, 92, 141, 0.08);
		backdrop-filter: blur(8px);
	}

	.sort-toolbar--guest {
		padding-left: 18rpx;
		padding-right: 18rpx;
	}

	.sort-manage {
		flex-shrink: 0;
		justify-content: flex-start;
		min-width: 190rpx;
		height: 72rpx;
		padding: 0 18rpx;
		box-sizing: border-box;
		border-radius: 999rpx;
		background: #fff5f8;
	}

	.sort-manage-icon {
		width: 42rpx;
		height: 42rpx;
		border-radius: 50%;
		background: #ffffff;
	}

	.sort-manage-text {
		margin-left: 10rpx;
		color: #252525;
		font-size: 30rpx;
		font-weight: 700;
		white-space: nowrap;
	}

	.sort-search {
		flex: 1;
		min-width: 0;
		margin: 0 0 0 18rpx;
	}

	.sort-toolbar--guest .sort-search {
		margin-left: 0;
	}
}

.sort-container--guest {
	height: 100vh;
	min-height: 100vh;
	overflow: hidden;
	padding-bottom: var(--sort-bottom-space);

	.sort-body {
		height: calc(100vh - var(--sort-navbar-height) - var(--sort-bottom-space));
		overflow: hidden;
	}
}
</style>
