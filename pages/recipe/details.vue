<!--
 * @Author: elk
 * @Date: 2026-01-13 15:32:10
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-19 14:28:50
 * @FilePath: /hkt-applet/pages/recipe/details.vue
 * @Description: 菜谱详情页
-->
<template>
	<view class="cate-details-container">
		<!-- 加载中骨架屏 -->
		<up-skeleton v-if="loading" :loading="true" :animate="true" rows="8" rowsHeight="50" :title="true"></up-skeleton>

		<!-- 菜谱内容 -->
		<view v-else class="details-content">
			<!-- 菜谱标题 -->
			<view class="cate-details-image">
				<!-- 图片 -->
				<up-image class="hero-image" width="100%" height="320px" :src="cateDetails.image" mode="aspectFill" />
				<!-- 一个上下渐变的背景 由白到黑 -->
				<view class="cate-details-bg"></view>
				<!-- 菜谱标识  制作时间 简易程度 在标题图片上面 -->
				<view class="cate-details-info">
					<view class="cate-details-title font-weight-600">{{ cateDetails.name }}</view>
					<view class="cate-details-info-item">
						<view class="meta-pill pubFlex">
							<up-icon name="clock" size="18" color="#FF5C8D" />
							<view class="cate-d-i-i-label">{{ cateDetails.time }}</view>
						</view>
						<view class="meta-pill pubFlex">
							<up-icon name="coupon" size="18" color="#FF5C8D" />
							<view class="cate-d-i-i-label">{{ cateDetails.level }}</view>
						</view>
					</view>
				</view>
			</view>
			<view class="details-body">
				<!-- 食材清单详情 -->
				<view class="cate-details-ingredients w-100">
					<view class="detail-section-head pubFlex">
						<DetailsTitle title="食材清单" />
						<view v-if="cateDetails.ingredients.length > 0" @click="visible = true" class="pubFlex detail-title-copy">
							<up-icon name="order" size="18" :color="COLOURS['theme-color']" />
							<view>生成购物清单</view>
						</view>
					</view>
					<view class="cate-ingre-content">
						<view
							v-if="cateDetails.ingredients.length === 0"
							class="empty-text publcTextSize"
						>
							暂无食材清单
						</view>
						<view
							v-else
							class="cate-ingre-item publcTextSize"
							v-for="(item, index) in cateDetails.ingredients"
							:key="index"
						>
							<view class="item-name-wrap">
								<view class="item-dot"></view>
								<view class="item-name">
									{{ item.name }}
								</view>
							</view>
							<view class="item-amount">
								{{ item.amount }}
							</view>
						</view>
					</view>
				</view>
				<!-- 制作步骤详情 -->
				<view class="cate-details-ingredients w-100">
					<view class="detail-section-head pubFlex">
						<DetailsTitle title="制作步骤" />
					</view>
					<view class="cate-ingre-content">
						<view
							v-if="cateDetails.steps.length === 0"
							class="empty-text publcTextSize"
						>
							暂无制作步骤
						</view>
						<view v-else class="cate-steps" v-for="(step, index) in cateDetails.steps" :key="index">
							<SerialStyle :index="index" :size="44" :fontSize="17" />
							<view class="step-card w-100">
								<view class="step-desc">{{ step.describe }}</view>
								<up-album v-if="step.images && step.images.length > 0" :rowCount="1" :urls="step.images" singleMode="aspectFill"></up-album>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
	<!-- 复制购物清单 -->
	<up-modal :show.sync="visible" title="购物清单">
		<view class="copy-ingre-content">
			<view
				class="copy-ingre-item publcTextSize pubFlex"
				v-for="(item, index) in cateDetails.ingredients"
				:key="index"
			>
				<view class="item-name">{{ item.name }}&nbsp;</view>
				<view class="item-amount">{{ item.amount }}</view>
			</view>
		</view>
		<template #confirmButton>
			<up-copy :content="copyContent">
				<up-button type="primary" :color="COLOURS['theme-color']" @click="copyIngredients">复制清单</up-button>
			</up-copy>
		</template>
	</up-modal>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { ref, onMounted } from "vue";
import DetailsTitle from "./component/DetailsTitle.vue";
import SerialStyle from "./component/SerialStyle.vue";
import { COLOURS } from "@/config/index.js";
import { usePageParams } from "@/hooks/usePageTitle.js";
import { getRecipeDetail } from "@/api/recipes.js";

// 复制购物清单弹框显隐
const visible = ref(false);
// 复制购物清单内容
const copyContent = ref("");
// 加载状态
const loading = ref(true);
// 菜谱详情
const cateDetails = ref({
	id: null,
	name: "",
	image: "",
	time: "",
	level: "",
	ingredients: [],
	steps: [],
});

// 页面参数
const params = usePageParams();

/**
 * @description: 加载菜谱详情
 * @return {*}
 */
const loadRecipeDetail = async () => {
	try {
		loading.value = true;

		// 获取页面参数中的菜谱 ID
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		const options = currentPage.options || {};
		const recipeId = options.id || params.value.id;

		if (!recipeId) {
			uni.showToast({
				title: "菜谱ID不存在",
				icon: "none",
			});
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
			return;
		}

		const res = await getRecipeDetail(recipeId);

		if (res.code === 200 && res.data) {
			const recipe = res.data;

			// 映射后端数据到前端格式
			cateDetails.value = {
				id: recipe.id,
				name: recipe.name || "未命名菜谱",
				image: recipe.cover || "/static/images/head.jpeg",
				time: recipe.cookTime || "未知",
				level: recipe.difficulty || "简单",
				// 后端返回的食材字段：name, amount
				ingredients: (recipe.ingredients || []).map((item) => ({
					name: item.name,
					amount: item.amount,
				})),
				// 后端返回的步骤字段：describe, images (数组)
				steps: (recipe.steps || []).map((item) => ({
					describe: item.describe || item.description || "",
					images: Array.isArray(item.images) ? item.images : [],
				})),
			};
		} else {
			throw new Error(res.message || "加载失败");
		}
	} catch (error) {
		console.error("加载菜谱详情失败:", error);
		uni.showToast({
			title: error.message || "加载失败",
			icon: "none",
		});

		// 加载失败返回上一页
		setTimeout(() => {
			uni.navigateBack();
		}, 1500);
	} finally {
		loading.value = false;
	}
};

/**
 * @description: 复制购物清单
 * @return {*}
 */
const copyIngredients = () => {
	copyContent.value = cateDetails.value.ingredients.map((item) => `${item.name}${item.amount}`).join("\n");
	visible.value = false;
};

// 页面加载时获取详情
onMounted(() => {
	loadRecipeDetail();
});
</script>

<style lang="scss" scoped>
.cate-details-container {
	width: 100%;
	min-height: 100vh;
	overflow-x: hidden;
	padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
	background:
		linear-gradient(180deg, #fff5f8 0, #f8f8f8 360rpx),
		#f8f8f8;

	.details-content {
		width: 100%;
	}

	.cate-details-image {
		position: relative;
		height: 320px;
		overflow: hidden;
		background: #f0f0f0;
	}

	.cate-details-bg {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 190px;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.72) 100%);
	}

	.cate-details-info {
		position: absolute;
		right: 28rpx;
		bottom: 34rpx;
		left: 28rpx;
		color: #fff;

		.cate-details-info-item {
			display: flex;
			align-items: center;
			margin-top: 18rpx;

			.cate-d-i-i-label {
				margin-left: 8rpx;
			}
		}

		.cate-details-title {
			font-size: 27px;
			line-height: 1.2;
			text-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.28);
		}

		.meta-pill {
			min-width: 0;
			height: 54rpx;
			box-sizing: border-box;
			padding: 0 16rpx;
			border: 1rpx solid rgba(255, 255, 255, 0.26);
			border-radius: 999rpx;
			background: rgba(255, 255, 255, 0.9);
			color: #303133;
			font-size: 14px;
			font-weight: 600;
			backdrop-filter: blur(8px);
		}

		.meta-pill + .meta-pill {
			margin-left: 14rpx;
		}
	}

	.details-body {
		position: relative;
		z-index: 1;
		box-sizing: border-box;
		width: 100%;
		margin-top: -26rpx;
		padding: 0 22rpx;
	}

	.cate-details-ingredients {
		box-sizing: border-box;
		margin-bottom: 22rpx;
		padding: 26rpx;
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.98);
		box-shadow: 0 16rpx 36rpx rgba(255, 92, 141, 0.07);

		.detail-section-head {
			justify-content: space-between;
			align-items: center;
		}

		.cate-ingre-content {
			margin-top: 24rpx;

			.cate-ingre-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				box-sizing: border-box;
				min-height: 72rpx;
				padding: 18rpx 0;
				border-bottom: 1rpx solid #eef0f4;
				color: #303133;
			}

			.cate-ingre-item:last-child {
				border-bottom: 0;
			}
		}

		.empty-text {
			padding: 34rpx 0;
			text-align: center;
			color: #909399;
		}

		.cate-steps {
			display: flex;
			align-items: flex-start;
			margin-bottom: 22rpx;
		}

		.cate-steps:last-child {
			margin-bottom: 0;
		}

		.detail-title-copy {
			flex-shrink: 0;
			height: 58rpx;
			box-sizing: border-box;
			padding: 0 18rpx;
			border-radius: 999rpx;
			background: #fff2f6;
			color: #303133;
			font-size: 14px;
			font-weight: 600;
		}

		.detail-title-copy > view {
			margin-left: 8rpx;
		}

		.item-name-wrap {
			display: flex;
			align-items: center;
			min-width: 0;
		}

		.item-dot {
			flex-shrink: 0;
			width: 12rpx;
			height: 12rpx;
			margin-right: 14rpx;
			border-radius: 50%;
			background: $theme-color;
			box-shadow: 0 0 0 8rpx rgba(255, 92, 141, 0.08);
		}

		.item-name {
			min-width: 0;
			overflow: hidden;
			color: #303133;
			font-size: 16px;
			font-weight: 600;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.item-amount {
			flex-shrink: 0;
			max-width: 220rpx;
			margin-left: 18rpx;
			overflow: hidden;
			color: #202124;
			font-size: 16px;
			font-weight: 700;
			text-align: right;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.step-card {
			box-sizing: border-box;
			padding: 20rpx;
			border: 1rpx solid #eef0f4;
			border-radius: 16rpx;
			background: #fbfbfc;
		}

		.step-desc {
			margin-bottom: 16rpx;
			color: #303133;
			font-size: 15px;
			font-weight: 600;
			line-height: 1.65;
		}
	}

	:deep(.u-album__row__wrapper) {
		width: 100% !important;
	}
	:deep(.u-album__row__wrapper > image) {
		width: 100% !important;
		height: 210px !important;
		border-radius: 16rpx !important;
	}
}
.copy-ingre-content {
	color: $tinge-color;

	.copy-ingre-item {
		justify-content: flex-start;
		padding: 10rpx 0;
		color: #303133;
	}
}
</style>
