<!--
 * @Author: elk
 * @Date: 2025-07-23 20:44:15
 * @LastEditors: elk
 * @LastEditTime: 2026-06-13 13:47:50
 * @FilePath: /hkt-applet/pages/sort/index.vue
 * @Description: 排序页
-->
<template>
	<view class="sort-container">
		<NavbarMini :title="'菜单'" />
		<view class="sort-body">
			<view class="pubFlex">
				<view v-if="isFeeder" @click="toCateTab" style="margin-right: 5px" class="pubFlex">
					<u-icon name="setting" size="24" :color="COLOURS['theme-color']" />
					<view style="margin-left: 5px" class="publcTitleSize">分类管理</view>
				</view>
				<!-- 搜索框 -->
				<Search style="width: 75%; margin: 0 auto" @search="handleSearch" @clear="handleSearchClear" />
			</view>
			<!-- 菜单分类 -->
			<CateTab ref="cateTabRef" />
		</view>

		<ShoppingCat />
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

const userStore = useUserStore();
const cateTabRef = ref(null);

// 计算属性：根据用户类型判断是否为饲养员（0=饲养员, 1=吃货）
const isFeeder = computed(() => {
	return userStore.userType === 0;
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
	console.log("sort/index onShow, 刷新菜单数据...");
	refreshMenu();
});

onPullDownRefresh(async () => {
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
</script>

<style lang="scss" scoped>
.sort-container {
	position: relative;
	box-sizing: border-box;
	.sort-body {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 11vh;
	}
}
</style>
