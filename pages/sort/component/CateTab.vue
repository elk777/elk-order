<!--
 * @Author: elk
 * @Date: 2025-09-10 16:36:55
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-22 17:00:13
 * @FilePath: /hkt-applet/pages/sort/component/CateTab.vue
 * @Description: 菜单分类组件
-->
<template>
	<view class="catetab-container">
		<up-cate-tab class="cate-tab" :current="0" :tabList="tabList" tabKeyName="title" itemKeyName="name">
			<template #tabItem="{ item }">
				<view>{{ item.title }}</view>
			</template>
			<template #pageItem="{ pageItem }">
				<view @click="cateDetails(pageItem)" class="w-100 cate-item">
					<!-- 图片 -->
					<up-image :src="pageItem.cover" width="100%" height="200px"></up-image>
					<!-- 标题 -->
					<view class="cate-title font-weight-600 publcTitleSize">{{ pageItem.name }}</view>
					<view class="pubFlex cate-base">
						<!-- 左侧 烹饪时间  右侧 饲养员 删除按钮 吃货 添加购物车按钮 -->
						<view class="pubFlex">
							<up-icon name="clock" size="22" color="#FF5C8D" />
							<view class="publcLabelSize cate-base-tiem">10分钟</view>
						</view>
						<view class="pubFlex">
							<up-icon
								v-if="isFeeder"
								size="32"
								name="share-square"
								@tap.stop="cateEdit(pageItem)"
								:color="COLOURS['theme-color']"
							></up-icon>
							<view style="margin-left: 5px">
								<up-icon
									v-if="isFeeder"
									class="cate-icon"
									size="30"
									name="close-circle-fill"
									@tap.stop="cateDelete(pageItem)"
									:color="COLOURS['theme-color']"
								></up-icon>
							</view>
							<up-icon
								v-if="!isFeeder"
								class="cate-icon"
								name="cart"
								customPrefix="lovers-icon"
								size="30"
								@tap.stop="cateAddCart(pageItem)"
								:color="COLOURS['theme-color']"
							>
								<up-badge type="warning" max="99" :value="1"></up-badge>
							</up-icon>
						</view>
					</view>
				</view>
			</template>
		</up-cate-tab>
	</view>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { ref, computed, onMounted } from "vue";
import { COLOURS } from "@/config/index.js";
import { useUserStore } from "@/stores/user.js";
import { useRecipeStore } from "@/stores/recipe.js";
const userStore = useUserStore();
const recipeStore = useRecipeStore();
const tabList = ref([]);

//计算属性： 根据用户类型判断图标icon的展示 0 是饲养员 1 是吃货
const isFeeder = computed(() => {
	return userStore.userType === 0;
});
onMounted(() => {
	getCateList();
});

/**
 * @description: 获取菜谱列表
 * @return {*}
 */
const getCateList = async () => {
	// 调用获取菜谱列表接口
	setTimeout(() => {
		tabList.value = [
			{
				title: "默认分类",
				children: [
					{
						id: 1,
						name: "水煮肉片",
						cover: "/static/images/head.jpeg",
						price: 88,
					},
				],
			},
			{
				title: "分类1",
				children: [
					{
						id: 2,
						name: "酸菜鱼",
						cover: "/static/images/head.jpeg",
						price: 99,
					},
				],
			},
		];
		recipeStore.setCateTotal(tabList.value.reduce((acc, cur) => acc + cur.children.length, 0));
	}, 100);
	// const res = await getRecipeList({
	// 	pageNum: 1,
	// 	pageSize: 10,
	// });
	// if (res.code === 200) {
	// 	tabList.value[0].children = res.data.records;
	// }
};

/**
 * @description: 菜谱详情跳转
 * @param {Object} item - 分类项
 * @return {void}
 */
const cateDetails = (item) => {
	// 点击跳转到菜谱详情页
	uni.navigateTo({
		url: "/pages/recipe/details?id=" + item.id,
	});
};

/**
 * @description: 编辑菜谱按钮
 * @return {*}
 */
const cateEdit = (item) => {
	// 点击跳转到编辑菜谱页
	uni.navigateTo({
		url: "/pages/recipe/redact?id=" + item.id + "&title=编辑菜谱",
	});
};

/**
 * @description: 删除菜谱按钮
 * @return {*}
 */
const cateDelete = (item) => {
	// 点击删除菜谱
	uni.showModal({
		title: "删除菜谱",
		content: "确定删除菜谱：" + item.name + "吗？",
		success: (res) => {
			if (res.confirm) {
				// 过滤出不等于id的元素
				tabList.value.forEach((tab) => {
					tab.children = tab.children.filter((item) => item.id !== id);
				});
				uni.showToast({
					title: "删除成功",
					icon: "none",
				});
			}
		},
	});
};

/**
 * @description: 添加购物车按钮
 * @return {*}
 */
const cateAddCart = (item) => {
	// 点击添加购物车
	uni.showToast({
		title: "添加购物车：" + item.name,
		icon: "none",
	});
};
</script>

<style lang="scss" scoped>
.catetab-container {
	width: 100%;
	height: calc(100vh - 320px);
	margin-top: 10px;
	:deep(.item-container > view:first-child) {
		width: 100%;
	}
	:deep(.item-title) {
		margin-bottom: 10px;
	}
	:deep(.u-image__image) {
		border-radius: 15px 15px 0 0 !important;
	}
	:deep(.item-container) {
		padding-bottom: 15px;
		border-radius: 15px;
		border: 1px solid #e5e5e5;
		box-shadow: 0 0 10px 5px $gray-color;
	}
	.cate-tab {
		height: calc(100vh - 320px);
		// 尝试使用 :deep() 语法
		:deep(.u-cate-tab__page-item:last-child) {
			min-height: 70vh !important;
		}
		.cate-title {
			margin: 15px 0 10px;
			padding: 0 12px;
		}
		.cate-icon {
			margin-left: 5px;
		}
		.cate-base {
			padding: 0 12px;
			justify-content: space-between;
			.cate-base-tiem {
				margin-left: 5px;
				color: $tinge-color;
			}
		}
	}
}
</style>
