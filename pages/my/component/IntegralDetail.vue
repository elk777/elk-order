<!--
 * @Author: elk
 * @Date: 2026-02-28 13:02:01
 * @LastEditors: elk
 * @LastEditTime: 2026-03-13 17:28:34
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
					<view v-if="!integralContentItems.length" class="integral-empty pubColumnFlex">
						<up-icon name="empty-data" size="46" color="#dadbde"></up-icon>
						<view class="integral-empty-text">暂无积分记录</view>
					</view>
					<view class="integral-content-item pubFlex" v-for="item in integralContentItems" :key="item.id">
						<view class="interal-item-left">
							<view class="integral-detail-content-title publcTextSize">{{ item.sourceDesc || item.source }}</view>
							<view class="integral-detail-content-time publcLabelSize">{{ formatTime(item.createTime) }}</view>
						</view>
						<view class="interal-item-right font-weight-600">
							<view
								class="interal-item-right-amount"
								:class="{
									add: item.type === 1,
									subtract: item.type === 0,
								}"
							>
								{{ amountDetail(item.type) }}{{ item.amount }}
							</view>
						</view>
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
import { ref, computed, watch } from "vue";
import { COLOURS } from "@/config/index.js";
import { getPointsRecords } from "@/apis/points.js";

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
		return "";
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
	{ name: "全部", value: 2 },
	{ name: "收入", value: 1 },
	{ name: "支出", value: 0 },
]);
// 积分详细选项卡：active
const active = ref(2);

// 积分详细内容项（用于显示）
const integralContentItems = ref([]);

watch(
	() => props.show,
	(show) => {
		if (show) {
			loadRecords();
		}
	},
);

/**
 * @description: 选项卡切换事件
 * @param {*} tab 选项卡
 * @return {*}
 */
const handleChange = (tab) => {
	active.value = tab.value;
	loadRecords();
};

async function loadRecords() {
	try {
		const res = await getPointsRecords({
			type: active.value,
			page: 1,
			pageSize: 20,
		});
		if (res?.code === 200 && res?.data) {
			integralContentItems.value = res.data.list || [];
		}
	} catch (error) {
		console.warn("[integral-detail] load records failed", error);
	}
}

function formatTime(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	const pad = (num) => String(num).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
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
		.integral-empty {
			height: 320px;
			.integral-empty-text {
				margin-top: 12px;
				color: $tinge-color;
				font-size: 26rpx;
			}
		}
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
	display: none !important;
}
</style>
