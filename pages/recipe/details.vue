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
		<!-- 菜谱标题 -->
		<view class="cate-details-image">
			<!-- 图片 -->
			<up-image width="100%" height="300px" :src="cateDetails.image" mode="aspectFill" />
			<!-- 一个上下渐变的背景 由白到黑 -->
			<view class="cate-details-bg"></view>
			<!-- 菜谱标识  制作时间 简易程度 在标题图片上面 -->
			<view class="cate-details-info">
				<view class="cate-details-title font-weight-600">{{ cateDetails.name }}</view>
				<view class="pubFlex cate-details-info-item">
					<view class="cate-details-time pubFlex">
						<up-icon name="clock" size="22" color="#FF5C8D" />
						<view class="cate-d-i-i-label">{{ cateDetails.time }}</view>
					</view>
					<view class="cate-details-level pubFlex">
						<up-icon name="coupon" size="22" color="#FF5C8D" />
						<view class="cate-d-i-i-label">{{ cateDetails.level }}</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 食材清单详情 -->
		<view class="cate-details-ingredients w-100">
			<view class="pubFlex" style="justify-content: space-between">
				<DetailsTitle title="食材清单" />
				<view @click="visible = true" class="pubFlex detail-title-copy">
					<up-icon name="order" size="22" :color="COLOURS['theme-color']" />
					生成购物清单</view
				>
			</view>
			<view class="cate-ingre-content">
				<view
					class="cate-ingre-item publcTextSize pubFlex"
					v-for="(item, index) in cateDetails.ingredients"
					:key="index"
				>
					<view class="item-name">
						{{ item.name }}
					</view>
					<view class="item-amount">
						{{ item.amount }}
					</view>
				</view>
			</view>
		</view>
		<!-- 制作步骤详情 -->
		<view class="cate-details-ingredients w-100">
			<DetailsTitle title="制作步骤" />
			<view class="cate-ingre-content">
				<view class="cate-steps" v-for="(step, index) in cateDetails.steps" :key="index">
					<SerialStyle :index="index" :size="45" :fontSize="18" />
					<view class="w-100">
						<view style="margin-bottom: 10px">{{ step.describe }}</view>
						<up-album :rowCount="1" :urls="step.images" singleMode="aspectFill"></up-album>
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
import { ref } from "vue";
import DetailsTitle from "./component/DetailsTitle.vue";
import SerialStyle from "./component/SerialStyle.vue";
import { COLOURS } from "@/config/index.js";
import { usePageParams } from "@/hooks/usePageTitle.js";
// 复制购物清单弹框显隐
const visible = ref(false);
// 复制购物清单内容
const copyContent = ref("");
// 菜谱详情
const cateDetails = ref({
	id: 1,
	name: "鱼香肉丝",
	image: "/static/images/head.jpeg",
	time: "10分钟",
	level: "简单",
	ingredients: [
		{
			name: "鱼香肉丝",
			amount: "200g",
		},
		{
			name: "盐",
			amount: "1勺",
		},
		{
			name: "味精",
			amount: "1勺",
		},
		{
			name: "料酒",
			amount: "1勺",
		},
		{
			name: "油",
			amount: "2勺",
		},
	],
	steps: [
		{
			describe: "鱼香肉丝",
			images: ["/static/images/head.jpeg", "/static/images/head.jpeg"],
		},
		{
			describe: "盐",
			images: ["/static/images/head.jpeg"],
		},
	],
});
// 页面参数
const params = usePageParams();
/**
 * @description: 复制购物清单
 * @return {*}
 */
const copyIngredients = () => {
	copyContent.value = cateDetails.value.ingredients.map((item) => `${item.name}${item.amount}`).join("\n");
	visible.value = false;
};
</script>

<style lang="scss" scoped>
.cate-details-container {
	width: 100%;
	height: 100vh;
	background-color: $light-color;
	.cate-details-image {
		position: relative;
	}
	.cate-details-bg {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 85px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
	}
	.cate-details-info {
		position: absolute;
		left: 20px;
		bottom: 15px;
		color: #fff;
		width: 100%;
		.cate-details-info-item {
			margin-top: 10px;
			width: 280rpx;
			justify-content: space-between;
			.cate-d-i-i-label {
				margin-left: 5px;
			}
		}
		.cate-details-title {
			font-size: 24px;
		}
		.cate-details-time {
			font-size: 16px;
		}
		.cate-details-level {
			font-size: 16px;
		}
	}

	.cate-details-ingredients {
		box-sizing: border-box;
		margin-top: 15px;
		padding: 20px;
		background-color: #ffffff;
		.cate-ingre-content {
			margin-top: 20px;
			.cate-ingre-item {
				justify-content: space-between;
				padding: 12px 0;
				border-bottom: 1px solid $gray-color;
			}
		}

		.cate-steps {
			display: flex;
			margin-bottom: 30px;
		}
		.detail-title-copy {
			padding: 5px 10px;
			border-radius: 30px;
			background-color: $light-color;
		}
	}

	:deep(.u-album__row__wrapper) {
		width: 100% !important;
	}
	:deep(.u-album__row__wrapper > image) {
		width: 100% !important;
		height: 200px !important;
		border-radius: 15px !important;
	}
}
.copy-ingre-content {
	color: $tinge-color;
}
</style>
