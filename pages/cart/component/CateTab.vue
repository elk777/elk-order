<!--
 * @Author: elk
 * @Date: 2025-09-10 16:36:55
 * @LastEditors: elk
 * @LastEditTime: 2026-01-28 16:54:33
 * @FilePath: /hkt-applet/pages/cart/component/CateTab.vue
 * @Description: 菜单分类组件
-->
<template>
	<view class="catetab-container">
		<EmptyState
			v-if="isMenuEmpty"
			:icon="emptyState.icon"
			:title="emptyState.title"
			:desc="emptyState.desc"
			:actionText="emptyState.actionText"
			:actionIcon="emptyState.actionIcon"
			minHeight="calc(100vh - 320px)"
			@action="handleEmptyAction"
		/>
		<up-cate-tab v-else class="cate-tab" :current="0" :tabList="tabList" tabKeyName="title" itemKeyName="name">
			<template #tabItem="{ item }">
				<view>{{ item.title }} </view>
			</template>
			<template #itemList="{ item }">
				<view class="item-title">
					<text>{{ item.title }}</text>
				</view>
				<view class="item-container">
					<EmptyState
						v-if="!item.children || item.children.length === 0"
						icon="file-text"
						title="该分类暂无菜谱"
						desc="这个分类下还没有菜谱，下拉刷新可获取最新数据。"
						minHeight="280rpx"
						padding="56rpx 24rpx 64rpx"
						descMaxWidth="420rpx"
					/>
					<template v-else>
						<view v-for="pageItem in item.children" :key="pageItem.id" @click="cateDetails(pageItem)" class="w-100 cate-item">
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
									<view v-if="!isFeeder" style="position: relative">
										<up-icon
											class="cate-icon"
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
import { useUserStore } from "@/stores/user.js";
import { useRecipeStore } from "@/stores/recipe.js";
import { goLogin, requireLogin } from "@/utils/auth.js";
import { getRecipeCategories, getRecipes, deleteRecipe } from "@/api/recipes.js";
import { getCartList } from "@/api/cart.js";
const userStore = useUserStore();
const recipeStore = useRecipeStore();
const tabList = ref([]);
const cateLoading = ref(true);

//计算属性： 根据用户类型判断图标icon的展示 0 是饲养员 1 是吃货
const isFeeder = computed(() => {
	return userStore.userType === 0;
});

const recipeTotal = computed(() => {
	return tabList.value.reduce((total, tab) => {
		return total + (Array.isArray(tab.children) ? tab.children.length : 0);
	}, 0);
});

const isMenuEmpty = computed(() => {
	return !cateLoading.value && tabList.value.length === 0;
});

const emptyState = computed(() => {
	if (!userStore.isLogin) {
		return {
			icon: "account",
			title: "登录后查看专属菜单",
			desc: "登录后可以查看家里的菜谱，饲养员也能在这里创建菜单。",
			actionText: "去登录",
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
	console.log("CateTab mounted, loading menu list...");
	refreshMenu();
});

const getListData = (data) => {
	return Array.isArray(data) ? data : data?.list || data?.items || data?.categories || data?.recipes || [];
};

const normalizeRecipe = (recipe) => {
	return {
		...recipe,
		cover: recipe.cover || recipe.coverImage || recipe.image || "/static/images/head.jpeg",
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

/**
 * @description: 获取菜谱列表
 * @param {Object} [params] - 查询参数
 * @param {string} [params.keyword] - 搜索关键词
 * @return {*}
 */
const getCateList = async (params = {}) => {
	// 未登录时跳过数据加载
	if (!userStore.isLogin) {
		console.log("用户未登录，跳过菜谱列表加载");
		cateLoading.value = false;
		return;
	}

	try {
		console.log("开始获取菜谱列表, 参数:", params);
		cateLoading.value = true;
		const [categoryRes, recipeRes] = await Promise.all([getRecipeCategories(), getRecipes(params)]);

		console.log("分类列表响应:", categoryRes);
		console.log("菜谱列表响应:", recipeRes);

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

			console.log("菜谱列表加载成功，总数:", total, "分类数:", tabList.value.length);
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
		console.log("用户未登录，跳过购物车数据加载");
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
		goLogin({
			redirect: "/pages/sort/index",
			message: "请先登录后查看菜单",
		});
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
						console.log("开始删除菜谱:", item.id);
						const apiRes = await deleteRecipe(item.id);

						console.log("删除菜谱响应:", apiRes);

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

							console.log("删除成功，剩余菜谱总数:", total);
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
		min-height: 300px;
		// padding-bottom: 15px;
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
