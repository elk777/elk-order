<!--
 * @Author: elk
 * @Date: 2026-01-23 16:52:57
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-03 20:48:57
 * @FilePath: /hkt-applet/components/CateList/index.vue
 * @Description: 分类列表组件
-->
<template>
	<view v-for="item in cateList" :key="item.id" class="cate-list-container">
		<view class="cate-list-item pubFlex">
			<view class="cate-item-left pubFlex">
				<up-image :radius="5" :width="imageSize" :height="imageSize" :src="item.cover" mode="aspectFill"></up-image>
				<view class="pubColumnFlex item-left-content">
					<view class="cate-list-item-name">{{ item.name }}</view>
					<template v-if="readonly">
						<view class="quantity-display">x{{ item.quantity }}</view>
					</template>
					<template v-else>
						<up-number-box v-model="item.quantity" @change="valChange"></up-number-box>
					</template>
				</view>
			</view>
			<view v-if="!readonly" class="cate-item-right">
				<up-icon @click="deleteCart(item)" name="trash" size="24" :color="COLOURS['theme-color']"></up-icon>
			</view>
		</view>
	</view>
</template>
<script setup>
import { computed, watch } from "vue";
import { COLOURS } from "@/config/index.js";
const emit = defineEmits(['delete']);
const props = defineProps({
    // 图片大小
    imageSize: {
        type: Number,
        default: 100
    },
    // 美食列表
    cateList: {
        type: Array,
        default: () => []
    },
    // 是否只读
	readonly: {
		type: Boolean,
		default: false
	}
});


/**
 * @description: 删除购物车项
 * @param {Object} item - 购物车项
 * @return {*}
 */
const deleteCart = (item) => {
    emit('delete', item);
}
</script>
<style lang="scss" scoped>
.cate-list-container {
    padding: 0px 15px;
    .cate-list-item {
        justify-content: space-between;
        margin-bottom: 20px;
        .item-left-content {
            margin-left: 20px;
            align-items: start;
        }
    }
}
.quantity-display {
    font-size: 28rpx;
    color: #666666;
    margin-top: 10rpx;
    font-weight: 500;
}
</style>
