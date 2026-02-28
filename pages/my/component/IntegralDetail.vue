<!--
 * @Author: elk
 * @Date: 2026-02-28 13:02:01
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-28 17:42:05
 * @FilePath: /hkt-applet/pages/my/component/IntegralDetail.vue
 * @Description: 积分详细模块
-->
<template>
	<up-modal :show="show" :title="title" :closeOnClickOverlay="true" @close="close" :showConfirmButton="false">
		<template #default>
			<view class="integral-detail-container">
				<up-tabs
					:list="gainOptions"
					:active="active"
					@change="handleChange"
					:activeStyle="{ color: COLOURS['theme-color'] }"
				>
				</up-tabs>
				<up-divider></up-divider>
				<view class="integral-detail-content">
					<view class="integral-content-item pubFlex" v-for="item in integralContentItems" :key="item.value">
						<view class="interal-item-left">
							<view class="integral-detail-content-title publcTextSize">{{ item.name }}</view>
							<view class="integral-detail-content-time publcLabelSize">{{ item.time }}</view>
						</view>
						<view class="interal-item-right font-weight-600">
							<view
								class="interal-item-right-amount"
								:class="{
									add: item.type === 1,
									subtract: item.type === 0,
								}"
								>{{ amountDetail(item.type) }}{{ item.amount }}</view
							>
						</view>
						<!-- <up-divider></up-divider> -->
					</view>
				</view>
			</view>
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
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user.js";
import { COLOURS } from "@/config/index.js";

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});
const emit = defineEmits(["update:show"]);

//
const amountDetail = computed(() => {
	return (type) => {
		if (type === 0) {
			return "-";
		} else if (type === 1) {
			return "+";
		} else if (type === 2) {
			return "";
		}
	};
});

/**
 * @description: 关闭积分详细弹窗
 * @return {*}
 */
const close = () => {
	emit("update:show", false);
};

// 积分详细标题
const title = ref("积分明细");

// 获取积分方式：list
const gainOptions = ref([
	{ name: "全部", value: 0 },
	{ name: "收入", value: 1 },
	{ name: "支出", value: 2 },
]);
// 积分详细选项卡：active
const active = ref(0);

// 积分详细内容项
const integralContentItems = ref([
	{ name: "签到", time: "2026-02-28 13:02:01", amount: 5, type: 1 },
	{ name: "注册奖励", time: "2026-02-28 13:02:01", amount: 5, type: 1 },
	{ name: "AI识别菜谱", time: "2026-02-28 13:02:01", amount: 5, type: 0 },
	{ name: "AI识别菜谱", time: "2026-02-28 13:02:01", amount: 5, type: 0 },
	{ name: "AI识别菜谱", time: "2026-02-28 13:02:01", amount: 5, type: 0 },
	{ name: "AI识别菜谱", time: "2026-02-28 13:02:01", amount: 5, type: 0 },
	{ name: "AI识别菜谱", time: "2026-02-28 13:02:01", amount: 5, type: 0 },
	{ name: "AI识别菜谱", time: "2026-02-28 13:02:01", amount: 5, type: 0 },
]);

/**
 * @description: 选项卡切换事件
 * @param {*} index
 * @return {*}
 */
const handleChange = (index) => {
	active.value = index;
};
</script>
<style lang="scss" scoped>
.integral-detail-container {
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	overflow: auto;
	.integral-detail-content {
        height: 450px;
        overflow: auto;
		.integral-content-item {
			justify-content: space-between;
			padding: 12px 15px;
			.integral-detail-content-time {
				color: $tinge-color;
			}
			.interal-item-right {
				.interal-item-right-amount {
					&.add {
						color: $theme-color;
					}
					&.subtract {
						color: #5ac725;
					}
				}
			}
		}
	}
}
:deep(.u-tabs__wrapper__nav) {
	justify-content: space-around;
}
:deep(.u-tabs__wrapper__nav__line) {
	display: none;
}
</style>
