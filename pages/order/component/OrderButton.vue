<!--
 * @Author: elk
 * @Date: 2026-02-06 09:25:43
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-06 11:09:29
 * @FilePath: /hkt-applet/pages/order/component/OrderButton.vue
 * @Description: 订单操作按钮组件
-->
<template>
	<view v-if="actions.length" class="order-button-container pubFlex" :class="{ 'order-button-container--block': block }">
		<view
			v-for="(action, index) in actions"
			:key="action.type"
			class="order-button-item"
			:style="{ marginLeft: index === 0 ? '0' : '5px' }"
		>
			<up-button
				@tap.stop="handleClickAction(action)"
				plain
				shape="circle"
				:size="block ? 'normal' : 'small'"
				:type="resolveButtonType(action)"
				:color="resolveButtonColor(action)"
				:loading="loadingAction === action.type"
				:disabled="!!loadingAction"
				>{{ action.text }}</up-button>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from "vue";
import { color } from "@/uni_modules/uview-plus";
import { COLOURS, ORDER_ACTION_TYPE, getOrderActions } from "@/config/index.js";
import { useOrderStore } from "@/stores/order.js";
import { useRecipeStore } from "@/stores/recipe.js";

const props = defineProps({
	orderId: {
		type: [String, Number],
		default: "",
	},
	status: {
		type: Number,
		default: 0,
	},
	viewType: {
		type: Number,
		default: null,
	},
	block: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["success"]);
const orderStore = useOrderStore();
const recipeStore = useRecipeStore();
const loadingAction = ref("");

const currentViewType = computed(() => (props.viewType === null ? orderStore.orderSort : props.viewType));
const actions = computed(() => getOrderActions(currentViewType.value, props.status));

const resolveButtonType = (action) => (action.primary ? "primary" : "info");

const resolveButtonColor = (action) => {
	if (!action.primary) return undefined;
	return color[action.color] || action.color || COLOURS["theme-color"];
};

const confirmAction = (action) => {
	if (!action.confirmText) return Promise.resolve(true);
	return new Promise((resolve) => {
		uni.showModal({
			title: "提示",
			content: action.confirmText,
			confirmColor: COLOURS["theme-color"],
			success: (res) => resolve(res.confirm),
			fail: () => resolve(false),
		});
	});
};

const getSuccessText = (action) => {
	if (action.type === ORDER_ACTION_TYPE.REJECT) return "已拒绝接单";
	if (action.type === ORDER_ACTION_TYPE.ACCEPT) return "已接单";
	if (action.type === ORDER_ACTION_TYPE.START_COOKING) return "已开始烹饪";
	if (action.type === ORDER_ACTION_TYPE.COMPLETE_COOKING) return "烹饪已完成";
	if (action.type === ORDER_ACTION_TYPE.CANCEL) return "订单已取消";
	if (action.type === ORDER_ACTION_TYPE.REORDER) return "已加入购物车";
	return "操作成功";
};

const handleClickAction = async (action) => {
	if (loadingAction.value) return;
	if (!props.orderId) {
		uni.showToast({ title: "订单ID不能为空", icon: "none" });
		return;
	}
	const confirmed = await confirmAction(action);
	if (!confirmed) return;

	loadingAction.value = action.type;
	try {
		if (action.type === ORDER_ACTION_TYPE.REORDER) {
			await orderStore.reorderOrder(props.orderId);
			await recipeStore.loadCartList();
			uni.showToast({ title: getSuccessText(action), icon: "success" });
			setTimeout(() => {
				uni.navigateTo({ url: "/pages/cart/AffirmOrder" });
			}, 600);
		} else {
			await orderStore.changeOrderStatus(props.orderId, action.nextStatus);
			uni.showToast({ title: getSuccessText(action), icon: "success" });
		}
		emit("success", action);
	} catch (error) {
		uni.showToast({
			title: error.message || "操作失败，请重试",
			icon: "none",
		});
	} finally {
		loadingAction.value = "";
	}
};
</script>

<style lang="scss" scoped>
.order-button-container {
	justify-content: flex-end;
	align-items: center;
}

.order-button-container--block {
	width: 100%;
}

.order-button-item {
	width: 92px;
}

.order-button-container--block .order-button-item {
	flex: 1;
	width: auto;
	min-width: 0;
}

.order-button-container--block .order-button-item :deep(.u-button) {
	height: 88rpx;
	font-size: 28rpx;
	font-weight: 700;
}

.order-button-container--block .order-button-item :deep(.u-button--info) {
	color: #8b8b8b;
	border-color: #eeeeee;
	background-color: #ffffff;
}
</style>
