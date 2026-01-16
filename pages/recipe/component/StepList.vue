<!--
 * @Author: elk
 * @Date: 2026-01-05 15:49:54
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-16 18:12:21
 * @FilePath: /hkt-applet/pages/recipe/component/StepList.vue
 * @Description: 制作步骤-List组件
-->
<template>
	<view v-for="(step, index) in stepProps.stepList" :key="step.id" class="stepitem-container">
		<!-- 1 序号 步骤x  删除按钮 -->
		<view class="stepitem-content-title" style="width: 100%">
			<view class="title-content-container">
				<SerialStyle :index="index" :size="45" :fontSize="16" />
				<view class="publcTitleSize"> 步骤{{ index + 1 }} </view>
			</view>
			<view @click="$emit('removeStep', step.id)" v-if="stepProps.stepList.length > 1">
				<up-icon name="trash-fill" :color="COLOURS['theme-color']" size="24"></up-icon>
			</view>
		</view>
		<!-- 2 步骤描述 多行输入框 -->
		<view class="mdy" style="width: 100%">
			<view class="font-weight-600 step-title">步骤描述</view>
			<up-textarea v-model="step.stepDesc" placeholder="请输入步骤描述" :height="100" count></up-textarea>
		</view>
		<!-- 3 步骤照片 上传步骤照片 -->
		<view class="mdy upload-btn-container" style="width: 100%">
			<view class="font-weight-600 step-title">步骤图片</view>
			<!-- 引入通用上传组件 -->
			<Upload :action="uploadAction" v-model:fileList="step.stepImg" :maxCount="1" :autoUpload="false"
				><view class="upload-slot pubColumnFlex">
					<up-icon name="camera-fill" size="24" :color="COLOURS['theme-color']"></up-icon>
					<view>上传步骤图片</view>
				</view>
			</Upload>
		</view>
		<!-- 4 小提示 注意事项 单行输入框 -->
		<view class="mdy" style="width: 100%">
			<view class="font-weight-600 step-title">小贴士</view>
			<u-input
				v-model="step.stepTip"
				placeholder="制作过程中的技巧和注意事项，分享给大家嘛~"
				:auto-height="true"
			/>
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
import { ref, defineProps, toRefs, onMounted } from "vue";
import { COLOURS } from "@/config/index.js";
// 引入通用上传组件
import Upload from "@/components/Upload/index.vue";
import SerialStyle from "./SerialStyle.vue";
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
	.upload-btn-container {
		color: $tinge-color;
	}
}
</style>
