<!--
 * @Author: elk
 * @Date: 2026-02-09 14:03:58
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 19:25:47
 * @FilePath: /hkt-applet/pages/my/component/FunList.vue
 * @Description: 功能列表模块
-->
<template>
	<up-card class="fun-list-container" :show-head="false" :head-border-bottom="false" :border="false">
		<template #body>
			<view class="fun-list-body">
				<view @click="navigateTo(fun.path)" class="fun-list-item pubFlex" v-for="fun in funList" :key="fun.id">
					<view class="pubFlex">
						<up-icon :color="COLOURS['theme-color']" :name="fun.icon" size="26" />
						<view class="fun-list-name publcTextSize">{{ fun.name }}</view>
					</view>
					<up-icon name="arrow-right" class="fun-list-arrow" />
				</view>
			</view>
		</template>
	</up-card>
</template>
<script setup>
import { ref } from "vue";
import { COLOURS } from "@/config/index.js";
const funList = ref([
	{
		id: 0,
		name: "我的积分",
		icon: "coupon",
		path: "/pages/my/integral",
	},
	{
		id: 1,
		name: "每日签到",
		icon: "order",
		path: "/pages/my/attendance",
	},
	{
		id: 2,
		name: "烹饪日历",
		icon: "calendar",
		path: "/pages/my/calendar",
	},
	{
		id: 3,
		name: "意见反馈",
		icon: "chat",
		path: "/pages/my/feedback",
	},
	{
		id: 4,
		name: "联系客服",
		icon: "kefu-ermai",
		path: "/pages/my/contact",
	},
]);


/**
 * @description: 点击跳转
 * @param {*} path
 * @return {*}
 */
const navigateTo = (path) => {
    console.log("🚀 ~ navigateTo ~ path:", path)
    uni.navigateTo({
        url: path,
    })
}
</script>
<style lang="scss" scoped>
.fun-list-body {
	justify-content: space-between;
}
.fun-list-item {
    justify-content: space-between;
	padding: 20px 0;
	border-bottom: 1rpx solid $light-color;
    .fun-list-name {
        margin-left: 15px;
    }
    &:last-child {
        border-bottom: none;
    }
}
.fun-list-arrow {
	font-size: 32rpx;
	color: #999;
}
</style>
