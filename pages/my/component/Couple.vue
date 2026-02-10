<!--
 * @Author: elk
 * @Date: 2026-02-09 12:15:16
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-09 13:57:13
 * @FilePath: /hkt-applet/pages/my/component/Couple.vue
 * @Description: 情侣信息模块
-->
<template>
    <up-card class="couple-container" :head-border-bottom="false" :border="false">
        <template #head>
            <view class="couple-relation pubFlex">
                <up-icon size="24" name="heart" :color="COLOURS['theme-color']"></up-icon>
               <view class="couple-relation-text publcTitleSize">情侣关系</view>
            </view>
        </template>
        <template #body>
            <view class="couple-body pubColumnFlex">
                <view class="couple-body-text">准备好了吗？ 开启两个人的厨房</view>
                <view>
                    <up-button shape="circle" size="large" :color="COLOURS['theme-color']" type="primary">绑定情侣</up-button>
                </view>
            </view>
        </template>
    </up-card>
</template>
<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user.js";
import { COLOURS } from "@/config/index.js";
const userStore = useUserStore();
const userInfo = computed(() => userStore.profile);
</script>
<style lang="scss" scoped>
.couple-relation {
    justify-content: start; 
    .couple-relation-text {
        margin-left: 5px;
    }
}
.couple-body {
    justify-content: start; 
    .couple-body-text {
        margin-bottom: 20px;
    }
}

</style>
