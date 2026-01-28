<!--
 * @Author: elk
 * @Date: 2026-01-27 14:27:31
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-28 16:25:55
 * @FilePath: /hkt-applet/pages/cart/AffirmOrder.vue
 * @Description: 确认订单页
-->
<template>
	<view class="affirm-order-container">
		<!-- 菜品列表 -->
		<view class="order-section">
			<view class="section-title">选中的菜谱</view>
			<up-divider></up-divider>
			<CartList :readonly="true" />
		</view>

		<!-- 就餐时间 -->
		<view class="order-section">
			<view class="section-title">就餐方式</view>
			<view class="time-selector">
				<view
					v-for="item in timeOptions"
					:key="item.id"
					class="time-item"
					:class="{ active: timeValue === item.id }"
					@click="handleTimeClick(item)"
				>
					{{ item.title }}
				</view>
			</view>
			<!-- 预定日期 -->
			<view style="margin-top: 15px" class="target-section pubFlex" v-if="timeValue === 1">
				<view style="margin-bottom: 0px" class="section-title mdr-15">预定日期</view>
				<span class="target-date" @click="dateShow = true">{{ formattedDate }}</span>
				<up-datetime-picker
					closeOnClickOverlay
					v-model:show="dateShow"
					mode="date"
					format="YYYY-MM-DD"
					v-model="targetDate"
					:confirmColor="COLOURS['theme-color']"
					@confirm="handelConfirmDate"
					@close="dateShow = false"
					@cancel="dateShow = false"
				></up-datetime-picker>
			</view>
			<!-- 预定时间： 早餐 午餐 晚餐 -->
			<view class="target-section pubFlex" v-if="timeValue === 1">
				<view style="margin-bottom: 0px" class="section-title mdr-15">预定时间</view>
				<up-radio-group v-model="selectedDinnerTime" :options="timeOptionsDinner">
					<up-radio
						:activeColor="COLOURS['theme-color']"
						v-for="item in timeOptionsDinner"
						:key="item.id"
						:label="item.title"
						:name="item.title"
					>
						<template #icon>
							<up-icon :name="item.icon" size="24" />
						</template>
					</up-radio>
				</up-radio-group>
			</view>
		</view>

		<!-- 订单备注 -->
		<view class="order-section">
			<view class="section-title">订单备注</view>
			<up-textarea v-model="orderRemark" placeholder="请输入备注信息，如：不要辣、多放葱等" />
		</view>

		<!-- 底部下单按钮 -->
		<view class="order-footer">
			<view class="footer-left">
				<view class="total-label">总共{{ cartList.length }}道菜品</view>
			</view>
			<view class="footer-right">
				<up-button
					@click="submitOrder"
					:loading="submitting"
					:disabled="submitting || cartList.length === 0"
					shape="circle"
					color="#FF5C8D"
				>
					提交订单
				</up-button>
			</view>
		</view>
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
import CartList from "./component/CartList.vue";
import { useRecipeStore } from "@/stores/recipe.js";
import { COLOURS } from "@/config/index.js";
import { formatDate } from "@/utils/tool.js";

const recipeStore = useRecipeStore();
const cartList = computed(() => recipeStore.cartList);

// 计算总价
const totalPrice = computed(() => {
	return cartList.value.reduce((total, item) => {
		return total + item.price * item.quantity;
	}, 0);
});

// 就餐方式
const timeOptions = ref([
	{ id: 0, title: "立即就餐", code: "immediate" },
	{ id: 1, title: "预约就餐", code: "reservation" },
]);
// 预定时间 早餐 午餐 晚餐
const timeOptionsDinner = ref([
	{ id: 0, title: "早餐", icon: "/static/images/sort/breakfast.svg" },
	{ id: 1, title: "午餐", icon: "/static/images/sort/lunch.svg" },
	{ id: 2, title: "晚餐", icon: "/static/images/sort/supper.svg" },
]);
// 预约就餐 预定时间-默认早餐
const selectedDinnerTime = ref("早餐");
// 就餐时间 预约就餐
const timeValue = ref(0);
// 就餐方式 默认立即就餐
const selectedTime = ref("立即就餐");
// 预约就餐 预定日期-选择日期控件显隐
const dateShow = ref(false);
// 当前日期：动态获取当前日期
// const targetDate = ref(new Date().toLocaleDateString());
const targetDate = ref(Date.now());

// 计算属性：格式化日期
const formattedDate = computed(() => {
	return formatDate(targetDate.value);
});

// 订单备注
const orderRemark = ref("");

// 提交状态
const submitting = ref(false);

/**
 * @description: 处理自定义点击事件
 * @param {*} e
 * @return {*}
 */
const handleTimeClick = (item) => {
	console.log("🚀 ~ handleTimeClick ~ item:", item);
	timeValue.value = item.id;
	selectedTime.value = item.title;
};

/**
 * @description: 处理确认日期选择事件
 * @param {*} e  事件对象
 * @return {*}
 */
const handelConfirmDate = (date) => {
	console.log("🚀 ~ handelConfirmDate ~ date:", date);
	targetDate.value = date.value;
	dateShow.value = false;
};

// 提交订单
const submitOrder = async () => {
	if (cartList.value.length === 0) {
		uni.showToast({
			title: "购物车为空，请先添加商品",
			icon: "none",
		});
		return;
	}
	submitting.value = true;
	try {
		// 构建订单数据
		const orderData = {
			cartList: cartList.value,
			totalPrice: totalPrice.value,
			totalQuantity: cartList.value.reduce((sum, item) => sum + item.quantity, 0),
			dineWay: selectedTime.value,
			remark: orderRemark.value,
		};

		// 预约就餐时添加额外参数
		if (timeValue.value === 1) {
			orderData.reservationDate = formattedDate.value;
			orderData.reservationTime = selectedDinnerTime.value;
		}

		console.log("🚀 ~ submitOrder ~ orderData:", orderData);
		return;
		// 调用提交订单接口
		// const result = await api.submitOrder(orderData);
		// 模拟提交成功
		setTimeout(() => {
			uni.showToast({
				title: "订单提交成功",
				icon: "success",
			});

			// 清空购物车
			recipeStore.clearCart();

			// 跳转到订单列表页面
			setTimeout(() => {
				uni.navigateTo({
					url: "/pages/order/index",
				});
			}, 1500);
		}, 1500);
	} catch (error) {
		console.error("提交订单失败:", error);
		uni.showToast({
			title: "提交订单失败，请重试",
			icon: "none",
		});
	} finally {
		submitting.value = false;
	}
};

// 页面初始化
onMounted(() => {
	// 检查购物车是否为空
	if (cartList.value.length === 0) {
		uni.showToast({
			title: "购物车为空，请先添加商品",
			icon: "none",
		});

		// 3秒后返回上一页
		setTimeout(() => {
			uni.navigateBack();
		}, 2000);
	}
});
</script>

<style lang="scss" scoped>
.affirm-order-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 0 15px;
	:deep(.u-radio__icon-wrap) {
		border: none;
	}
	.order-section {
		background-color: #fff;
		margin-bottom: 15px;
		padding: 15px;
		.section-title {
			font-size: 16px;
			font-weight: 600;
			margin-bottom: 15px;
			color: #333;
		}
		.target-section {
			justify-content: flex-start;
			margin-bottom: 15px;
			.target-date {
				color: $tinge-color;
			}
		}
	}

	.time-selector {
		display: flex;
		gap: 15px;
		.time-item {
			padding: 10px 20px;
			border-radius: 30px;
			font-size: 14px;
			font-weight: 500;
			background-color: $light-color;
			color: #333333;
			&.active {
				background-color: $theme-color;
				color: #ffffff;
			}
		}
	}

	.order-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 60px;
		background-color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 15px 15px;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
		.footer-left {
			display: flex;
			align-items: baseline;
			.total-label {
				font-size: 14px;
				color: #666;
			}
			.total-price {
				font-size: 20px;
				font-weight: bold;
				color: #ff5c8d;
				margin-left: 5px;
			}
		}
		.footer-right {
			width: 120px;
		}
	}
}
</style>
