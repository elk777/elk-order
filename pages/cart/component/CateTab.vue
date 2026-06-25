<!--
 * @Author: elk
 * @Date: 2025-09-10 16:36:55
 * @LastEditors: elk
 * @LastEditTime: 2026-01-28 16:54:33
 * @FilePath: /hkt-applet/pages/cart/component/CateTab.vue
 * @Description: 菜单分类组件
-->
<template>
	<view
		class="catetab-container"
		:class="{ 'catetab-container--empty': isMenuEmpty, 'catetab-container--guest': isGuestEmpty }"
	>
		<view v-if="isGuestEmpty" class="menu-empty-panel menu-empty-panel--guest">
			<MenuGuestPreview @login="handleGuestLogin" />
		</view>
		<view v-else-if="isMenuEmpty" class="menu-empty-panel">
			<EmptyState
				:icon="emptyState.icon"
				:title="emptyState.title"
				:desc="emptyState.desc"
				:actionText="emptyState.actionText"
				:actionIcon="emptyState.actionIcon"
				minHeight="100%"
				padding="96rpx 48rpx 112rpx"
				descMaxWidth="500rpx"
				iconBgColor="linear-gradient(145deg, #fff0f5 0%, #ffffff 100%)"
				@action="handleEmptyAction"
			/>
		</view>
		<up-cate-tab v-else class="cate-tab" :current="0" :tabList="tabList" tabKeyName="title" itemKeyName="name">
			<template #tabItem="{ item }">
				<view class="tab-item-text">{{ item.title }}</view>
			</template>
			<template #itemList="{ item }">
				<view class="item-title">
					<text>{{ item.title }}</text>
					<text class="item-title-count">{{ getCategoryRecipeCount(item) }} 道</text>
				</view>
				<view class="item-container">
					<EmptyState
						v-if="!item.children || item.children.length === 0"
						class="category-empty"
						icon="file-text"
						title="该分类暂无菜谱"
						desc="这个分类下还没有菜谱，下拉刷新可获取最新数据。"
						minHeight="420rpx"
						padding="72rpx 28rpx 84rpx"
						descMaxWidth="420rpx"
						iconBgColor="#fff5f8"
					/>
					<template v-else>
						<view v-for="pageItem in item.children" :key="pageItem.id" @click="cateDetails(pageItem)" class="w-100 cate-item">
							<!-- 图片 -->
							<up-image :src="pageItem.cover" width="100%" height="320rpx" mode="aspectFill"></up-image>
							<!-- 标题 -->
							<view class="cate-title font-weight-600 publcTitleSize">{{ pageItem.name }}</view>
							<view class="pubFlex cate-base">
								<!-- 左侧 烹饪时间  右侧 饲养员 删除按钮 吃货 添加购物车按钮 -->
								<view class="pubFlex cate-time">
									<view class="cate-time-icon pubFlex">
										<up-icon name="clock" size="18" color="#FF5C8D" />
									</view>
									<view class="publcLabelSize cate-base-time">{{ getRecipeCookTime(pageItem) }}</view>
								</view>
								<view class="pubFlex cate-actions">
									<up-icon
										v-if="isFeeder && isRecipeManageable(pageItem)"
										class="cate-action-icon"
										size="32"
										name="share-square"
										@tap.stop="cateEdit(pageItem)"
										:color="COLOURS['theme-color']"
									></up-icon>
									<view v-if="isFeeder && isRecipeManageable(pageItem)" class="cate-action-icon">
										<up-icon
											size="30"
											name="close-circle-fill"
											@tap.stop="cateDelete(pageItem)"
											:color="COLOURS['theme-color']"
										></up-icon>
									</view>
									<view v-if="!isFeeder" class="cate-cart-action">
										<up-icon
											name="cart"
											customPrefix="lovers-icon"
											size="30"
											@tap.stop="cateAddCart(pageItem)"
											:color="COLOURS['theme-color']"
										>
										</up-icon>
										<up-badge
											v-if="recipeStore.getCartQuantity(pageItem.id) > 0"
											:offset="[-1, -1]"
											:absolute="true"
											type="error"
											max="99"
											:value="recipeStore.getCartQuantity(pageItem.id)"
										></up-badge>
									</view>
								</view>
							</view>
						</view>
					</template>
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
import EmptyState from "@/components/EmptyState/index.vue";
import MenuGuestPreview from "@/pages/cart/component/MenuGuestPreview.vue";
import { useUserStore } from "@/stores/user.js";
import { useRecipeStore } from "@/stores/recipe.js";
import { goLogin, requireLogin } from "@/utils/auth.js";
import { getRecipeCategories, getRecipes, deleteRecipe } from "@/api/recipes.js";
import { getCartList } from "@/api/cart.js";
import { withDefaultMediaUrl } from "@/utils/media.js";
const userStore = useUserStore();
const recipeStore = useRecipeStore();
const tabList = ref([]);
const cateLoading = ref(true);

//计算属性： 根据用户类型判断图标icon的展示 0 是饲养员 1 是吃货
const isFeeder = computed(() => {
	return userStore.isLogin && userStore.userType === 0;
});

const recipeTotal = computed(() => {
	return tabList.value.reduce((total, tab) => {
		return total + (Array.isArray(tab.children) ? tab.children.length : 0);
	}, 0);
});

const isMenuEmpty = computed(() => {
	return !cateLoading.value && tabList.value.length === 0;
});

const isGuestEmpty = computed(() => {
	return isMenuEmpty.value && !userStore.isLogin;
});

const emptyState = computed(() => {
	if (!userStore.isLogin) {
		return {
			icon: "account",
			title: "菜单预览",
			desc: "可先查看菜单页面内容，登录后同步家里的分类和菜谱。",
			actionText: "登录查看",
			actionIcon: "account",
		};
	}

	if (isFeeder.value) {
		return {
			icon: "file-text",
			title: "还没有创建分类",
			desc: "先创建分类，再添加常做菜，菜单页就能展示给吃货选择。",
			actionText: "分类管理",
			actionIcon: "setting",
		};
	}

	return {
		icon: "empty-list",
		title: "菜单还没准备好",
		desc: "饲养员创建菜谱后，你就可以在这里选择想吃的菜。",
		actionText: "刷新菜单",
		actionIcon: "reload",
	};
});

onMounted(() => {
	refreshMenu();
});

const getListData = (data) => {
	return Array.isArray(data) ? data : data?.list || data?.items || data?.categories || data?.recipes || [];
};

const normalizeRecipe = (recipe) => {
	return {
		...recipe,
		cover: withDefaultMediaUrl(recipe.cover || recipe.coverImage || recipe.image, "/static/images/head.jpeg"),
	};
};

const normalizeCategory = (category) => {
	return {
		...category,
		title: category.title || category.name || category.categoryName || "未分类",
		name: category.name || category.title || category.categoryName || "未分类",
		children: [],
	};
};

const getRecipeCategoryKey = (recipe) => {
	return String(recipe.categoryId || recipe.category?.id || recipe.category_id || "uncategorized");
};

const getCategoryKey = (category) => {
	return String(category.id || category.categoryId || category.value || category.name || "uncategorized");
};

const buildGroups = (categories, recipes) => {
	const groups = categories.map(normalizeCategory);
	const groupMap = new Map(groups.map((group) => [getCategoryKey(group), group]));

	recipes.map(normalizeRecipe).forEach((recipe) => {
		const categoryKey = getRecipeCategoryKey(recipe);
		const fallbackName = recipe.category?.name || recipe.categoryName || "未分类";

		if (!groupMap.has(categoryKey)) {
			const fallbackGroup = {
				id: categoryKey,
				title: fallbackName,
				name: fallbackName,
				children: [],
			};
			groups.push(fallbackGroup);
			groupMap.set(categoryKey, fallbackGroup);
		}

		groupMap.get(categoryKey).children.push(recipe);
	});

	return groups;
};

const getTotalFromGroups = (groups) => {
	return groups.reduce((sum, tab) => {
		return sum + (Array.isArray(tab.children) ? tab.children.length : 0);
	}, 0);
};

const getCategoryRecipeCount = (category) => {
	return Array.isArray(category?.children) ? category.children.length : 0;
};

const getRecipeCookTime = (recipe) => {
	return recipe?.cookTime || recipe?.cook_time || "10分钟";
};

const isRecipeManageable = (recipe) => {
	return recipe?.canManage !== false;
};

/**
 * @description: 获取菜谱列表
 * @param {Object} [params] - 查询参数
 * @param {string} [params.keyword] - 搜索关键词
 * @return {*}
 */
const getCateList = async (params = {}) => {
	// 未登录时跳过数据加载
	if (!userStore.isLogin) {
		cateLoading.value = false;
		return;
	}

	try {
		cateLoading.value = true;
		const [categoryRes, recipeRes] = await Promise.all([getRecipeCategories(), getRecipes(params)]);

		if (categoryRes.code !== 200) {
			throw new Error(categoryRes.message || "获取分类失败");
		}

		if (recipeRes.code !== 200) {
			throw new Error(recipeRes.message || "获取菜单失败");
		}

		if (Array.isArray(getListData(categoryRes.data)) && Array.isArray(getListData(recipeRes.data))) {
			const normalizedList = buildGroups(getListData(categoryRes.data), getListData(recipeRes.data));
			tabList.value = normalizedList;

			// 计算总菜谱数量
			const total = getTotalFromGroups(tabList.value);

			recipeStore.setCateTotal(total);
		} else {
			console.warn("菜单响应格式异常:", { categoryRes, recipeRes });
			tabList.value = [];
			recipeStore.setCateTotal(0);
		}
	} catch (error) {
		console.error("获取菜谱列表失败:", error);
		uni.showToast({
			title: error.message || "获取菜单失败",
			icon: "none",
		});
		tabList.value = [];
		recipeStore.setCateTotal(0);
	} finally {
		cateLoading.value = false;
	}
};

const refreshMenu = async (params = {}) => {
	await getCateList(params);
	if (!isFeeder.value) {
		await getCartTotal();
	}
};
/**
 * @description: 当角色为吃货时，获取购物车总数量
 * @return {*}
 */
const getCartTotal = async () => {
	// 未登录时跳过购物车数据加载
	if (!userStore.isLogin) {
		return;
	}

	try {
		const res = await getCartList();

		if (res.code === 200 && res.data) {
			const list = res.data.list || res.data;
			const total = res.data.cartTotal;

			// 将后端数据映射为前端格式并同步到 store
			if (Array.isArray(list)) {
				const mappedList = list.map((item) => ({
					id: item.recipe?.id || item.recipeId,
					cartItemId: item.id,
					quantity: item.quantity,
					...(item.recipe || {}),
				}));
				recipeStore.setCartList(mappedList);
			} else {
				recipeStore.setCartList([]);
			}

			recipeStore.setCartTotal(total || 0);
		} else {
			recipeStore.setCartTotal(0);
		}
	} catch (error) {
		console.error("获取购物车数量失败:", error);
		// 静默失败，不影响用户浏览菜单
		recipeStore.setCartTotal(0);
	}
};

const handleEmptyAction = () => {
	if (!userStore.isLogin) {
		handleGuestLogin();
		return;
	}

	if (isFeeder.value) {
		const url = "/pages/recipe/classify";
		requireLogin(() => {
			uni.navigateTo({
				url,
			});
		}, {
			redirect: url,
		});
		return;
	}

	refreshMenu();
};

const handleGuestLogin = () => {
	goLogin({
		redirect: "/pages/sort/index",
		message: "登录后可查看专属菜单",
	});
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
	const url = "/pages/recipe/redact?id=" + item.id + "&title=编辑菜谱";
	// 点击跳转到编辑菜谱页
	requireLogin(() => {
		uni.navigateTo({
			url,
		});
	}, {
		redirect: url,
	});
};

/**
 * @description: 删除菜谱按钮
 * @param {Object} item - 菜谱项
 * @return {*}
 */
const cateDelete = (item) => {
	// 点击删除菜谱
	requireLogin(() => {
		uni.showModal({
			title: "删除菜谱",
			content: "确定删除菜谱：" + item.name + "吗？",
			success: async (res) => {
				if (res.confirm) {
					try {
						const apiRes = await deleteRecipe(item.id);

						if (apiRes.code === 200) {
							// 从 tabList 中移除该菜谱
							tabList.value.forEach((tab) => {
								if (Array.isArray(tab.children)) {
									tab.children = tab.children.filter((child) => child.id !== item.id);
								}
							});

							// 更新菜谱总数
							const total = getTotalFromGroups(tabList.value);
							recipeStore.setCateTotal(total);

							uni.showToast({
								title: "删除成功",
								icon: "success",
							});
						}
					} catch (error) {
						console.error("删除菜谱失败:", error);
						uni.showToast({
							title: error.message || "删除失败",
							icon: "none",
						});
					}
				}
			},
		});
	});
};

/**
 * @description: 添加购物车按钮
 * @return {*}
 */
const cateAddCart = async (item) => {
	return requireLogin(async () => {
		// 点击添加购物车
		try {
			await recipeStore.addCart({
				id: item.id,
				name: item.name,
				cover: "/static/images/head.jpeg",
				price: item.price,
				quantity: 1,
			});
			uni.showToast({
				title: "添加购物车：" + item.name,
				icon: "none",
			});
		} catch (error) {
			uni.showToast({
				title: recipeStore.errorMessage,
				icon: "none",
			});
		}
	});
};

// 暴露给父组件调用，支持搜索功能
defineExpose({
	getCateList,
	getCartTotal,
	refreshMenu,
});
</script>

<style lang="scss" scoped>
.catetab-container {
	width: 100%;
	height: calc(
		100vh - var(--sort-navbar-height, 96px) - var(--sort-bottom-space, 0px) -
			var(--sort-action-space, 0px) - 132rpx
	);
	min-height: 760rpx;
	margin-top: 0;
	box-sizing: border-box;

	.menu-empty-panel {
		position: relative;
		height: 100%;
		overflow: hidden;
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 36rpx;
		background:
			radial-gradient(circle at 18% 10%, rgba(255, 92, 141, 0.08), transparent 34%),
			linear-gradient(180deg, #ffffff 0%, #fffafd 100%);
		box-shadow: 0 18rpx 42rpx rgba(255, 92, 141, 0.08);
	}

	.menu-empty-panel::before,
	.menu-empty-panel::after {
		content: "";
		position: absolute;
		width: 220rpx;
		height: 220rpx;
		border-radius: 50%;
		background: rgba(255, 92, 141, 0.06);
	}

	.menu-empty-panel::before {
		top: -90rpx;
		right: -70rpx;
	}

	.menu-empty-panel::after {
		left: -90rpx;
		bottom: -80rpx;
	}

	:deep(.item-container > view:first-child) {
		width: 100%;
	}
	:deep(.item-title) {
		margin-bottom: 18rpx;
	}
	:deep(.u-image__image) {
		border-radius: 28rpx 28rpx 0 0 !important;
	}
	:deep(.item-container) {
		min-height: 420rpx;
		overflow: hidden;
		border-radius: 30rpx;
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		background: #ffffff;
		box-shadow: 0 16rpx 38rpx rgba(31, 31, 31, 0.06);
	}

	.cate-tab {
		height: 100%;

		:deep(.u-cate-tab) {
			height: 100%;
		}

		:deep(.u-cate-tab__wrap) {
			border-radius: 30rpx;
			background: rgba(255, 255, 255, 0.7);
		}

		:deep(.u-cate-tab__view) {
			width: 172rpx;
			background: #fff7fa;
		}

		:deep(.u-cate-tab__item) {
			height: 112rpx;
			background: transparent;
			color: #707070;
			font-size: 28rpx;
			font-weight: 500;
		}

		:deep(.u-cate-tab__item-active) {
			color: #252525;
			font-size: 30rpx;
			font-weight: 700;
			background: #ffffff;
		}

		:deep(.u-cate-tab__item-active::before) {
			width: 8rpx;
			height: 40rpx;
			top: 36rpx;
			border-left: none;
			border-radius: 0 999rpx 999rpx 0;
			background: linear-gradient(180deg, #ff7aa6 0%, #ff5c8d 100%);
		}

		:deep(.u-cate-tab__right-box) {
			background: #ffffff;
		}

		:deep(.u-cate-tab__page-view) {
			padding: 20rpx 18rpx 150rpx;
			background: #ffffff;
		}

		:deep(.u-cate-tab__page-item) {
			margin-bottom: 24rpx;
			padding: 18rpx;
			border-radius: 30rpx;
			background: #fffafd;
		}

		:deep(.u-cate-tab__page-item:last-child) {
			min-height: 70vh !important;
		}

		.tab-item-text {
			max-width: 128rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.item-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			color: #252525;
			font-size: 30rpx;
			font-weight: 700;
			line-height: 44rpx;
		}

		.item-title-count {
			flex-shrink: 0;
			margin-left: 16rpx;
			padding: 4rpx 14rpx;
			border-radius: 999rpx;
			background: #ffffff;
			color: $tinge-color;
			font-size: 22rpx;
			font-weight: 500;
		}

		.category-empty {
			border-radius: 26rpx;
			background: #ffffff;
		}

		.cate-item {
			overflow: hidden;
			border-radius: 28rpx;
			background: #ffffff;
			box-shadow: 0 14rpx 34rpx rgba(31, 31, 31, 0.08);
		}

		.cate-title {
			margin: 20rpx 0 12rpx;
			padding: 0 22rpx;
			color: #252525;
			line-height: 44rpx;
		}

		.cate-base {
			padding: 0 22rpx 24rpx;
			justify-content: space-between;
			.cate-time {
				justify-content: flex-start;
				min-width: 0;
			}
			.cate-time-icon {
				width: 42rpx;
				height: 42rpx;
				border-radius: 50%;
				background: #fff0f5;
			}
			.cate-base-time {
				margin-left: 10rpx;
				color: $tinge-color;
				font-size: 24rpx;
			}
			.cate-actions {
				flex-shrink: 0;
			}
			.cate-action-icon,
			.cate-cart-action {
				position: relative;
				width: 52rpx;
				height: 52rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 50%;
				background: #fff5f8;
			}
			.cate-action-icon + .cate-action-icon {
				margin-left: 14rpx;
			}
		}
	}
}

.catetab-container--guest {
	height: calc(100vh - var(--sort-navbar-height, 96px) - var(--sort-bottom-space, 0px) - 116rpx);
	min-height: 0;
	overflow: hidden;

	.menu-empty-panel--guest {
		height: 100%;
		touch-action: none;
	}
}
</style>
