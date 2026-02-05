<!--
 * @Author: elk
 * @Date: 2026-01-29 14:06:37
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-05 14:49:40
 * @FilePath: /hkt-applet/pages/order/component/OrderClassification.vue
 * @Description: 订单分类组件
-->
<template>
	<view class="order-classification-container pubFlex">
        <view>一个记录了<span :style="{'color': COLOURS['theme-color']}">{{ 0 }}</span>个订单</view>
        <view class="order-classification-subsection pubFlex">
            <up-subsection mode="button" :list="list" :current="0" bgColor="#ffffff" activeColor="#ffffff" @change="orderStore.setOrderSort"></up-subsection>
            <view style="margin-left: 5px;">
                <up-icon @tap="orderStore.setDateShow" size="42" name="calendar" :color="COLOURS['theme-color']"></up-icon>
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
import { ref } from "vue";
import { COLOURS } from "@/config/index.js";
import { useOrderStore } from "@/stores/order.js";
const orderStore = useOrderStore();

const list = ref([
    {
        name: "厨房订单",
        value: 0,
    },
    {
        name: "我的订单",
        value: 1,
    }
]);
</script>

<style lang="scss" scoped>
.order-classification-container {
    width: 100vw;
    padding-left: 15px;
    box-sizing: border-box;
	justify-content: space-between;
    .order-classification-subsection {
        width: 200px;
    }
    :deep(.u-subsection--button__bar) {
        background-color: $theme-color;
    }
}

</style>
