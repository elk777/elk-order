<template>
	<view class="order-details-container">
		<!-- 加载状态 -->
		<up-loading-page v-if="loading" />

		<!-- 订单详情 -->
		<view v-else-if="orderStore.orderDetails">
			<!-- 下单步骤 -->
			<up-card :show-head="false" :show-foot="false" :head-border-bottom="false" :foot-border-top="false">
				<template #body>
					<up-steps dot direction="column" :activeColor="COLOURS['theme-color']" :current="currentStep">
						<up-steps-item title="下单成功" :desc="formatTime(orderStore.orderDetails.orderTime)">
						</up-steps-item>
						<up-steps-item
							title="开始烹饪"
							:desc="
								orderStore.orderDetails.makingTime
									? formatTime(orderStore.orderDetails.makingTime)
									: '等待制作'
							"
						></up-steps-item>
						<up-steps-item
							title="烹饪完成"
							:desc="
								orderStore.orderDetails.completionTime
									? formatTime(orderStore.orderDetails.completionTime)
									: '未完成'
							"
						></up-steps-item>
					</up-steps>
				</template>
			</up-card>

			<!-- 订单信息 -->
			<up-card
				:show-head="false"
				:show-foot="false"
				:head-border-bottom="false"
				:foot-border-top="false"
				style="margin-top: 15px"
			>
				<template #body>
					<view class="order-info">
						<view class="order-info-title publcTitleSize font-weight-600">订单信息</view>
						<view class="info-item">
							<text class="info-label">订单编号：</text>
							<text class="info-value">{{ orderStore.orderDetails.id }}</text>
						</view>
						<view class="info-item">
							<text class="info-label">下单用户：</text>
							<view class="user-info">
								<up-image
									:src="orderStore.orderDetails.userAvatar"
									mode="aspectFill"
									width="40"
									height="40"
									radius="20"
								></up-image>
								<text style="margin-left: 10px">{{ orderStore.orderDetails.orderUser }}</text>
							</view>
						</view>
						<view class="info-item">
							<text class="info-label">订单状态：</text>
                            <OrderStatus class="info-value" :status="orderStore.orderDetails.orderStatus" />
						</view>
						<view class="info-item" v-if="orderStore.orderDetails.remark">
							<text class="info-label">口味偏好：</text>
							<text class="info-value">{{ orderStore.orderDetails.remark }}</text>
						</view>
					</view>
				</template>
			</up-card>

			<!-- 菜谱信息 -->
			<up-card
				:show-head="false"
				:show-foot="false"
				:head-border-bottom="false"
				:foot-border-top="false"
				style="margin-top: 15px"
			>
				<template #body>
					<view class="recipe-info">
						<view class="recipe-title publcTitleSize font-weight-600">菜谱信息</view>
						<CateList imageSize="80" readonly :cateList="orderStore.orderDetails.orderList" />
					</view>
				</template>
			</up-card>
		</view>

		<!-- 订单不存在 -->
		<view v-else class="empty-container">
			<up-empty text="订单不存在" mode="order" textSize="16" iconSize="100" :iconColor="COLOURS['theme-color']">
			</up-empty>
		</view>


        <!-- 底部按钮 -->
         <view :style="{ paddingBottom: bottomSpacing + 'px' }" class="bottom-button-container">
            <OrderButton :status="orderStore.orderDetails.orderStatus" />
         </view>

	</view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { COLOURS } from "@/config/index.js";
import { getBottomSpacing } from '@/utils/tool.js'
import { useOrderStore } from "@/stores/order.js";
import { usePageParams } from "@/hooks/usePageTitle.js";

import CateList from "@/components/CateList/index.vue";
import OrderStatus from "./component/OrderStatus.vue";
import OrderButton from "./component/OrderButton.vue";

const orderStore = useOrderStore();
const params = usePageParams();
const loading = ref(true);

const bottomSpacing = computed(() => getBottomSpacing() - 50)

// 计算订单 ID
const orderId = computed(() => params.value.id);

// 计算当前步骤
const currentStep = computed(() => {
	if (!orderStore.orderDetails) return 0;
	const status = orderStore.orderDetails.orderStatus;
	switch (status) {
		case 1: // 待接单
			return 0;
		case 2: // 已接单
			return 0;
		case 3: // 烹饪中
			return 1;
		case 4: // 已完成
			return 2;
		default:
			return 0;
	}
});

// 获取订单详情
const getOrderDetails = async (id) => {
	loading.value = true;
	try {
		// 确保订单列表已加载
		if (orderStore.orderList.length === 0) {
			await orderStore.getOrderList();
		}
		// 根据 ID 获取订单详情
		orderStore.getOrderById(id);
	} catch (error) {
		console.error("获取订单详情失败:", error);
	} finally {
		loading.value = false;
	}
};

// 格式化时间
const formatTime = (time) => {
	if (!time) return "";
	// 这里可以添加时间格式化逻辑
	return time;
};

onMounted(() => {
	if (orderId.value) {
		getOrderDetails(orderId.value);
	}
});
</script>

<style lang="scss" scoped>
.order-details-container {
	width: 100%;
	box-sizing: border-box;
	min-height: 100vh;
	background-color: #f5f5f5;
}

.empty-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 80vh;
}

.order-info {
	.order-info-title {
		margin-bottom: 15px;
	}
	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
		border-bottom: 1px solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}
	}

	.info-label {
		font-size: 14px;
		color: #666;
	}

	.info-value {
		font-size: 14px;
		color: #333;
	}

	.user-info {
		display: flex;
		align-items: center;
	}
}

.recipe-info {
	.recipe-title {
		margin-bottom: 15px;
	}
}
.bottom-button-container {
    width: 100%;
    box-sizing: border-box;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px 15px 0 15px;
    background-color: #fff;
}
</style>
