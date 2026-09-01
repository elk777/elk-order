<!--
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/pages/my/feedback/index.vue
 * @Description: 意见反馈-提交页
-->
<template>
	<view class="feedback-submit-page">
		<view class="form-card">
			<view class="field-label"><text class="field-required">*</text>反馈类型</view>
			<view class="type-row">
				<view
					v-for="item in FEEDBACK_TYPE_INFO"
					:key="item.value"
					class="type-chip pubFlex"
					:class="{ 'type-chip--active': form.type === item.value }"
					@click="form.type = item.value"
					>{{ item.label }}</view
				>
			</view>
		</view>

		<view class="form-card">
			<view class="field-label"><text class="field-required">*</text>问题描述</view>
			<up-textarea
				v-model="form.content"
				border="none"
				height="120"
				:count="true"
				:maxlength="FEEDBACK_RULES.maxContentLength"
				placeholder="请描述遇到的问题，写清操作步骤和预期结果，我们会更快定位～"
				customStyle="background:#f8f9fb;border-radius:22rpx;padding:20rpx 24rpx"
			></up-textarea>
		</view>

		<view class="form-card">
			<view class="field-label">
				上传截图<text class="field-tip">（选填，最多 {{ FEEDBACK_RULES.maxImages }} 张）</text>
			</view>
			<view class="shot-row">
				<view v-for="(shot, index) in form.images" :key="shot.key" class="shot-item">
					<image class="shot-image" :src="shot.url" mode="aspectFill" @click="previewShot(index)" />
					<view v-if="shot.status === 'uploading'" class="shot-mask pubFlex">上传中</view>
					<view class="shot-delete pubFlex" @click.stop="removeShot(index)">
						<up-icon name="close" size="10" color="#ffffff"></up-icon>
					</view>
				</view>
				<view v-if="canAddShot" class="shot-add pubColumnFlex" @click="chooseShots">
					<up-icon name="camera-fill" size="22" color="#c0c4cc"></up-icon>
					<text class="shot-add-text">添加</text>
				</view>
			</view>
		</view>

		<view class="form-card">
			<view class="field-label">联系方式<text class="field-tip">（选填）</text></view>
			<up-input
				v-model="form.contact"
				border="none"
				:maxlength="FEEDBACK_RULES.maxContactLength"
				placeholder="微信号 / 手机号，便于我们回访"
				customStyle="background:#f8f9fb;border-radius:22rpx;height:80rpx;padding:0 24rpx"
			></up-input>
		</view>

		<view class="reward-tip">
			<up-icon name="integral" size="16" :color="COLOURS['theme-color']"></up-icon>
			<view class="reward-tip-text">
				反馈一经核实，将根据问题严重程度补偿<text class="reward-tip-strong"
					>{{ FEEDBACK_REWARD_RANGE.min }}~{{ FEEDBACK_REWARD_RANGE.max }} 积分</text
				>，处理结果会在「我的反馈」中通知你。
			</view>
		</view>

		<view
			class="submit-button pubFlex"
			:class="{ 'submit-button--disabled': !canSubmit }"
			@click="handleSubmit"
		>
			{{ submitting ? "提交中..." : "提交反馈" }}
		</view>
	</view>
</template>
<script setup>
import { computed, reactive, ref } from "vue";
import {
	COLOURS,
	FEEDBACK_REWARD_RANGE,
	FEEDBACK_RULES,
	FEEDBACK_TYPE,
	FEEDBACK_TYPE_INFO,
} from "@/config/index.js";
import { createFeedback, uploadFeedbackImage } from "@/apis/feedback.js";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";
import { generateId } from "@/utils/tool.js";

useAuthGuard();

const form = reactive({
	type: FEEDBACK_TYPE.BUG,
	content: "",
	// 每项形如 { key, url, status }，url 在上传完成前是本地临时路径，仅用于预览
	images: [],
	contact: "",
});
const submitting = ref(false);

const canAddShot = computed(() => form.images.length < FEEDBACK_RULES.maxImages);
const hasUploadingShot = computed(() => form.images.some((item) => item.status === "uploading"));
const canSubmit = computed(
	() =>
		form.content.trim().length >= FEEDBACK_RULES.minContentLength &&
		!hasUploadingShot.value &&
		!submitting.value,
);

/**
 * @description: 选择截图，按剩余额度限制单次可选数量
 * @return {void}
 */
function chooseShots() {
	const restCount = FEEDBACK_RULES.maxImages - form.images.length;
	if (restCount <= 0) return;

	uni.chooseImage({
		count: restCount,
		sizeType: ["compressed"],
		success: ({ tempFilePaths }) => {
			(tempFilePaths || []).slice(0, restCount).forEach((filePath) => uploadShot(filePath));
		},
	});
}

/**
 * @description: 直传截图到又拍云，失败时移除占位
 * @param {string} filePath 本地临时文件路径
 * @return {Promise<void>}
 */
async function uploadShot(filePath) {
	// 先占位再上传：本地路径可直接预览，用户不必等直传完成才看到缩略图
	const shot = { key: generateId(), url: filePath, status: "uploading" };
	form.images.push(shot);

	try {
		const res = await uploadFeedbackImage(filePath);
		const uploadedUrl = res?.data?.url;
		if (!uploadedUrl) {
			throw new Error("截图上传失败");
		}
		patchShot(shot.key, { url: uploadedUrl, status: "success" });
	} catch (error) {
		// 【字段映射契约】提交只允许携带已落到又拍云的公网地址，
		// 本地临时路径提交后管理端打不开，因此上传失败必须移除占位而不是留着待提交
		removeShotByKey(shot.key);
		uni.showToast({
			title: error?.message || "截图上传失败",
			icon: "none",
		});
	}
}

/**
 * @description: 按 key 更新截图状态，必须通过响应式数组取回代理对象才能触发渲染
 * @param {string} key 截图唯一标识
 * @param {Object} patch 需要合并的字段
 * @return {void}
 */
function patchShot(key, patch) {
	const target = form.images.find((item) => item.key === key);
	if (target) Object.assign(target, patch);
}

function removeShotByKey(key) {
	const index = form.images.findIndex((item) => item.key === key);
	if (index > -1) form.images.splice(index, 1);
}

function removeShot(index) {
	form.images.splice(index, 1);
}

function previewShot(index) {
	uni.previewImage({
		urls: form.images.map((item) => item.url),
		current: index,
	});
}

/**
 * @description: 提交反馈工单
 * @return {Promise<void>}
 */
async function handleSubmit() {
	if (!canSubmit.value) {
		if (form.content.trim().length < FEEDBACK_RULES.minContentLength) {
			uni.showToast({
				title: `问题描述至少 ${FEEDBACK_RULES.minContentLength} 个字`,
				icon: "none",
			});
		}
		return;
	}

	// 【防重复提交】反馈有每用户每日 5 条限频，连点会白白吃掉用户当天的额度
	submitting.value = true;
	try {
		const res = await createFeedback({
			type: form.type,
			content: form.content.trim(),
			images: form.images.filter((item) => item.status === "success").map((item) => item.url),
			contact: form.contact.trim() || undefined,
		});

		if (res?.code === 200) {
			uni.showToast({
				title: "提交成功，我们会尽快核实",
				icon: "none",
			});
			// 用 redirectTo 换页：从列表返回时回到「我的」，而不是又落回已提交过的表单
			// 跳转前保持 submitting 为真，按钮不会在这 800ms 里被再次点亮
			setTimeout(() => {
				uni.redirectTo({ url: "/pages/my/feedback/list" });
			}, 800);
			return;
		}

		uni.showToast({
			title: res?.message || "提交失败",
			icon: "none",
		});
		submitting.value = false;
	} catch (error) {
		// 限频、字数等业务校验文案由后端给出，直接透出给用户
		uni.showToast({
			title: error?.message || "提交失败，请稍后重试",
			icon: "none",
		});
		submitting.value = false;
	}
}
</script>
<style lang="scss" scoped>
.feedback-submit-page {
	min-height: 100vh;
	padding: 24rpx 26rpx 60rpx;
	box-sizing: border-box;
	background: linear-gradient(180deg, #fff6f9 0, #fdf8f9 300rpx, #f7f7f8 560rpx), #f7f7f8;
}

.form-card {
	padding: 28rpx;
	margin-bottom: 24rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 16rpx 34rpx rgba(40, 40, 40, 0.04);
}

.field-label {
	margin-bottom: 18rpx;
	color: #303133;
	font-size: 26rpx;
	font-weight: 600;
	line-height: 1.4;
}

.field-required {
	margin-right: 6rpx;
	color: $theme-color;
}

.field-tip {
	color: #c0c4cc;
	font-size: 22rpx;
	font-weight: 400;
}

.type-row {
	display: flex;
	gap: 16rpx;
}

.type-chip {
	flex: 1;
	height: 72rpx;
	border: 3rpx solid #edeef1;
	border-radius: 999rpx;
	box-sizing: border-box;
	color: #606266;
	font-size: 26rpx;
	font-weight: 600;
}

.type-chip--active {
	border-color: $theme-color;
	background: #fff1f5;
	color: $theme-color;
}
.shot-row {
	display: flex;
	flex-wrap: wrap;
	gap: 18rpx;
}

.shot-item {
	position: relative;
	width: 132rpx;
	height: 132rpx;
}

.shot-image {
	width: 100%;
	height: 100%;
	border-radius: 22rpx;
	background: #f4f6f9;
}

.shot-mask {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	border-radius: 22rpx;
	background: rgba(24, 24, 28, 0.5);
	color: #ffffff;
	font-size: 20rpx;
}

.shot-delete {
	position: absolute;
	right: -10rpx;
	top: -10rpx;
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	background: rgba(24, 24, 28, 0.72);
}

.shot-add {
	width: 132rpx;
	height: 132rpx;
	border: 3rpx dashed #e4e6eb;
	border-radius: 22rpx;
	box-sizing: border-box;
	background: #fafbfc;
}

.shot-add-text {
	margin-top: 6rpx;
	color: #c0c4cc;
	font-size: 20rpx;
}
.reward-tip {
	display: flex;
	align-items: flex-start;
	gap: 14rpx;
	padding: 22rpx 24rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.1);
	border-radius: 22rpx;
	background: #fff7fa;
}

.reward-tip-text {
	flex: 1;
	color: #b76a87;
	font-size: 23rpx;
	line-height: 1.65;
}

.reward-tip-strong {
	color: $theme-color;
	font-weight: 700;
}

.submit-button {
	height: 88rpx;
	margin-top: 32rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ff5c8d, #ff7f9a);
	color: #ffffff;
	font-size: 30rpx;
	font-weight: 700;
	box-shadow: 0 16rpx 32rpx rgba(255, 92, 141, 0.24);
}

.submit-button--disabled {
	background: #e8e9ec;
	color: #b4b7bd;
	box-shadow: none;
}
</style>
