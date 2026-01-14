<!--
 * @Author: elk
 * @Date: 2026-01-13 15:32:10
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-14 16:21:54
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
			<DetailsTitle title="食材清单" />
			<view class="cate-ingre-content">
				<view
					class="cate-ingre-item publcTextSize pubFlex"
					v-for="(item, index) in cateDetails.steps"
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
				<view
					class="cate-ingre-item publcTextSize pubFlex"
					v-for="(item, index) in cateDetails.steps"
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
	</view>
</template>
<script setup>
import DetailsTitle from "./component/DetailsTitle.vue";
import { ref } from "vue";
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
			name: "鱼香肉丝",
			amount: "200g",
		},
		{
			name: "盐",
			amount: "1勺",
		},
	],
});
</script>

<style lang="scss" scoped>
.cate-details-container {
	width: 100%;
	height: 100vh;
	background-color: $gray-color;
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
	}
}
</style>
