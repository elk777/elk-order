<!--
 * @Author: elk
 * @Date: 2026-02-10 18:16:48
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-28 17:55:31
 * @FilePath: /hkt-applet/pages/my/integral.vue
 * @Description: 用户积分界面
-->
<template>
	<view class="integral-container">
		<!-- 用户积分：用户当前的积分 -->
		<up-card
			:body-style="{
				width: '100%',
				boxSizing: 'border-box',
				color: '#fff',
				backgroundColor: COLOURS['inter-color'],
			}"
			:show-head="false"
			:border="false"
		>
			<template #body>
				<view class="integral-container-header">
					<view class="integral-title pubColumnFlex">
						<view class="integral-title-text publcTitleSize">用户积分</view>
					</view>
					<view class="integral-content pubColumnFlex">
						<view class="integral-content-text publcLabelSize"
							>当前积分：<span class="integral-content-text-span publcTitleSize">1000</span></view
						>
					</view>
					<up-line margin="15px 0px" color="#ffffff"></up-line>
					<view class="integral-content-buttom pubFlex">
						<view class="integral-content-text"
							>累计使用：<span class="integral-content-text-span">10</span></view
						>
						<view @click="handleIntegralDetail">积分明细</view>
					</view>
				</view>
			</template>
		</up-card>
		<!-- 获取积分：获取积分的途径 -->
		<up-card :head-style="{ fontWeight: 'bold' }" title-size="32rpx" title="获取积分">
			<template #body>
				<view class="integral-container-gain">
					<view class="integral-gain-item pubFlex" v-for="item in gainOptions" :key="item.value">
						<view class="gain-item-left pubFlex">
							<up-icon size="35" :name="item.icon"></up-icon>
							<view class="left-content">
								<view class="integral-gain-item-text font-weight-600 publcTextSize">{{
									item.label
								}}</view>
								<view class="integral-gain-item-desc publcLabelSize">{{ item.desc }}</view>
							</view>
						</view>
						<view class="gain-item-right">
							<up-icon name="arrow-right"></up-icon>
						</view>
					</view>
				</view>
			</template>
		</up-card>
		<!-- 积分用途：用户可以用积分来购买商品 -->
		<up-card :head-style="{ fontWeight: 'bold' }" title-size="32rpx" title="积分用途">
			<template #body>
				<up-grid :col="2" :border="true">
					<up-grid-item v-for="(baseListItem, baseListIndex) in baseList" :key="baseListIndex">
						<up-icon
							:customStyle="{ paddingTop: 20 + 'rpx' }"
							:name="baseListItem.name"
							:size="22"
						></up-icon>
						<text class="grid-text">{{ baseListItem.title }}</text>
					</up-grid-item>
				</up-grid>
			</template>
		</up-card>

		<!-- 积分详细：用户可以查看自己的积分详细 -->
		<IntegralDetail :show.sync="show" @update:show="close" ref="integralDetailRef" />
	</view>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { ref, onMounted } from "vue";
// import { upGridItem } from "uview-plus";
import IntegralDetail from "./component/IntegralDetail.vue";
import { useUserStore } from "@/stores/user.js";
import { COLOURS } from "@/config/index.js";
// const userStore = useUserStore();

// 获取积分方式：list
const gainOptions = ref([
	{ label: "注册奖励", value: 0, desc: "新用户注册后可获得积分", icon: "level" },
	{ label: "全民推广", value: 1, desc: "邀请好友注册后可获得积分", icon: "level" },
	{ label: "完成任务", value: 2, desc: "每日签到、制作菜谱、下单菜谱可获取积分", icon: "level" },
]);
// 积分详细状态框
const show = ref(false);

// 积分用途：list
const baseList = ref([
	{ name: "photo", title: "兑换VIP" },
	{ name: "lock", title: "参与抽奖" },
	{ name: "star", title: "AI识别" },
	{ name: "hourglass", title: "升级店铺" },
]);

/**
 * @description: 积分详细
 * @return {*}
 */
const handleIntegralDetail = () => {
	// 打开积分详细状态框
	show.value = true;
};
/**
 * @description: 关闭积分详细弹窗
 * @return {*}
 */
const close = () => {
	show.value = false;
};
</script>

<style lang="scss" scoped>
.integral-container {
	width: 100%;
	box-sizing: border-box;
	.integral-container-header {
		width: 100%;
		height: 200rpx;
		.integral-title {
			margin-bottom: 20rpx;
		}
		.integral-content {
			margin-bottom: 20rpx;
		}
		.integral-content-buttom {
			justify-content: space-between;
		}
	}
	.integral-container-gain {
		.integral-gain-item {
			padding: 15px;
			margin-bottom: 15px;
			background-color: $light-color;
			justify-content: space-between;
			border-radius: 10px;
			.gain-item-left {
				.left-content {
					margin-left: 10px;
					.integral-gain-item-text {
						color: #000;
						margin-bottom: 3px;
					}
				}
			}
		}
	}
}
</style>
