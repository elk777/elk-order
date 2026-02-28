<!--
 * @Author: elk
 * @Date: 2026-02-09 14:03:58
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-27 15:25:24
 * @FilePath: /hkt-applet/pages/my/component/FunList.vue
 * @Description: 功能列表模块
-->
<template>
	<up-card class="fun-list-container" :show-head="false" :head-border-bottom="false" :border="false">
		<template #body>
			<view class="fun-list-body">
				<view @click="navigateTo(fun)" class="fun-list-item pubFlex" v-for="fun in funList" :key="fun.id">
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
		open: true,
	},
	{
		id: 1,
		name: "每日签到",
		icon: "order",
		path: "/pages/my/attendance",
		open: false,
	},
	{
		id: 2,
		name: "烹饪日历",
		icon: "calendar",
		path: "/pages/my/calendar",
		open: false,
	},
	{
		id: 3,
		name: "意见反馈",
		icon: "chat",
		path: "/pages/my/feedback",
		open: false,
	},
	{
		id: 4,
		name: "联系客服",
		icon: "kefu-ermai",
		path: "/pages/my/contact",
		open: false,
	},
]);


/**
 * @description: 点击跳转
 * @param {*} path
 * @return {*}
 */
const navigateTo = (fun) => {
    console.log("🚀 ~ navigateTo ~ path:", fun.path)
	if(fun.open) {
        uni.navigateTo({
            url: fun.path,
        })
    }else {
		uni.showToast({
			title: "功能暂未开放",
			icon: "none",
		})
	}
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
