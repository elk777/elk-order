<!--
 * @Author: elk
 * @Date: 2026-01-05 15:49:54
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-05 17:01:42
 * @FilePath: /hkt-applet/pages/recipe/component/StepList.vue
 * @Description: 制作步骤-List组件
-->
<template>
	<view v-for="(step, index) in stepProps.stepList" :key="step.id" class="stepitem-container">
		<!-- 1 序号 步骤x  删除按钮 -->
		<view class="stepitem-content-title" style="width: 100%">
			<view class="title-content-container">
				<view class="badge">
					{{ index + 1 }}
				</view>
				<view class="publcTitleSize"> 步骤{{ index + 1 }} </view>
			</view>
			<view @click="$emit('clearStep',step.id)" v-if="stepList.length > 1">
				<up-icon name="trash-fill" :color="COLOURS['theme-color']" size="24"></up-icon>
			</view>
		</view>
		<!-- 2 步骤描述 多行输入框 -->
		<view class="mdy" style="width: 100%">
			<view class="font-weight-600 step-title">步骤描述</view>
			<up-textarea v-model="step.stepDesc" placeholder="请输入步骤描述" :height="100" count></up-textarea>
		</view>
		<!-- 3 步骤照片 上传步骤照片 -->
		<view class="mdy" style="width: 100%">
			<view class="font-weight-600 step-title">步骤图片</view>
			<up-upload></up-upload>
		</view>
		<!-- 4 小提示 注意事项 单行输入框 -->
		<view class="mdy" style="width: 100%">
			<view class="font-weight-600 step-title">小贴士</view>
			<u-input v-model="step.stepTip" placeholder="制作过程中的技巧和注意事项，分享给大家嘛~" :auto-height="true" />
		</view>
	</view>
</template>
<script setup>
import { ref, defineProps, toRefs, onMounted } from "vue";
import { COLOURS } from '@/config/index.js'
const stepProps = defineProps({
	stepList: {
		type: Array,
		required: true,
	},
});
</script>

<style scoped lang="scss">
.stepitem-container {
	margin-top: 12px;
	padding: 12px;
	border-radius: 10px;
	border: 1px solid #f0f0f0;
	background-color: #fafafa;
	.stepitem-content-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		.title-content-container {
			display: flex;
		}
	}
	.mdy {
		margin: 15px 0;
	}
    .step-title {
        margin-bottom: 10px;
    }
}
.badge {
	/* 设置宽度和高度，使元素为正方形，从而形成圆形 */
	width: 45px;
	height: 45px;
	margin-right: 10px;
	/* 背景颜色设置为粉色 */
	background-color: $theme-color;
	/* 文字颜色设置为白色 */
	color: white;
	/* 使元素变成圆形（ border-radius 为宽度/高度的 50% ） */
	border-radius: 50%;
	/* 让文字水平居中 */
	text-align: center;
	/* 让文字垂直居中（通过行高等于高度实现） */
	line-height: 45px;
	/* 可以根据需要设置字体大小等样式 */
	font-size: 16px;
	font-weight: 600;
}
</style>
