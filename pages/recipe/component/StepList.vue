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
		<view class="stepitem-content-title">
			<view class="title-content-container">
				<SerialStyle :index="index" :size="42" :fontSize="16" />
				<view class="step-name">步骤{{ index + 1 }}</view>
			</view>
			<view class="step-remove pubFlex" @click="$emit('removeStep', step.id)" v-if="stepProps.stepList.length > 1">
				<up-icon name="trash-fill" :color="COLOURS['theme-color']" size="24"></up-icon>
			</view>
		</view>
		<!-- 2 步骤描述 多行输入框 -->
		<view class="mdy step-block">
			<view class="font-weight-600 step-title">步骤描述</view>
			<up-textarea v-model="step.stepDesc" placeholder="请输入步骤描述" :height="100" count></up-textarea>
		</view>
		<!-- 3 步骤照片 上传步骤照片 -->
		<view class="mdy upload-btn-container">
			<view class="font-weight-600 step-title">步骤图片</view>
			<!-- 引入通用上传组件 -->
			<Upload
				v-model:fileList="step.stepImg"
				:maxCount="1"
				@after-read="(file) => handleStepImageUpload(file, step)"
				accept="image"
				:sizeType="['compressed']"
			>
				<view class="upload-slot pubColumnFlex">
					<view class="upload-slot__icon pubFlex">
						<up-icon name="camera-fill" size="22" :color="COLOURS['theme-color']"></up-icon>
					</view>
					<view>上传步骤图片</view>
				</view>
			</Upload>
		</view>
		<!-- 4 小提示 注意事项 单行输入框 -->
		<view class="mdy step-block">
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
import { COLOURS } from "@/config/index.js";
// 引入通用上传组件
import Upload from "@/components/Upload/index.vue";
import SerialStyle from "./SerialStyle.vue";
// 引入菜谱图片上传 API
import { uploadRecipeImage } from "@/api/recipes.js";

const stepProps = defineProps({
	stepList: {
		type: Array,
		required: true,
	},
});

/**
 * @description: 处理步骤图片上传
 * @param {Object} file - 上传的文件对象
 * @param {Object} step - 当前步骤对象
 */
const handleStepImageUpload = async (file, step) => {
	const filePath = file.url || file.path;

	if (!filePath) {
		uni.showToast({ title: "图片路径无效", icon: "none" });
		return;
	}

	try {
		uni.showLoading({ title: "上传中...", mask: true });

		const res = await uploadRecipeImage(filePath);

		if (res.code === 200 && res.data && res.data.url) {
			// 更新步骤图片列表中的 URL
			const lastIndex = step.stepImg.length - 1;
			if (lastIndex >= 0) {
				step.stepImg[lastIndex].url = res.data.url;
				step.stepImg[lastIndex].status = "success";
			}

			uni.showToast({ title: "上传成功", icon: "success" });
		} else {
			throw new Error(res.message || "上传失败");
		}
	} catch (error) {
		console.error("步骤图片上传失败:", error);
		uni.showToast({ title: error.message || "上传失败", icon: "none" });

		// 上传失败，移除最后一个文件
		step.stepImg.pop();
	} finally {
		uni.hideLoading();
	}
};
</script>

<style scoped lang="scss">
.stepitem-container {
	width: 100%;
	box-sizing: border-box;
	margin-top: 18rpx;
	padding: 20rpx;
	border: 1rpx solid #f0f1f5;
	border-radius: 16rpx;
	background: #fbfbfc;

	.stepitem-content-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;

		.title-content-container {
			display: flex;
			align-items: center;
			min-width: 0;
		}
	}

	.step-name {
		color: #202124;
		font-size: 16px;
		font-weight: 700;
	}

	.step-remove {
		flex-shrink: 0;
		width: 62rpx;
		height: 62rpx;
		border-radius: 50%;
		background: #fff2f6;
	}

	.mdy {
		width: 100%;
		margin-top: 20rpx;
	}

	.step-block {
		box-sizing: border-box;
		padding: 16rpx;
		border-radius: 16rpx;
		background: #ffffff;
	}

	.step-title {
		margin-bottom: 12rpx;
		color: #303133;
		font-size: 14px;
	}

	.upload-btn-container {
		color: $tinge-color;
	}

	.upload-slot {
		min-height: 160rpx;
		box-sizing: border-box;
		border: 1rpx dashed rgba(255, 92, 141, 0.26);
		border-radius: 16rpx;
		background: #fff8fa;
		color: #707070;
		font-size: 14px;
	}

	.upload-slot__icon {
		width: 56rpx;
		height: 56rpx;
		margin-bottom: 10rpx;
		border-radius: 50%;
		background: #ffffff;
	}

	:deep(.u-textarea) {
		border: 1rpx solid #eef0f4 !important;
		border-radius: 14rpx;
		background: #fbfbfc;
	}

	:deep(.u-input) {
		min-height: 68rpx;
		border-radius: 14rpx;
		background: #fbfbfc;
	}
}
</style>
