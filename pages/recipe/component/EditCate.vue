<!--
 * @Author: elk
 * @Date: 2026-01-21 15:23:23
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-21 19:40:34
 * @FilePath: /hkt-applet/pages/recipe/component/EditCate.vue
 * @Description: 编辑分类组件
-->
<template>
	<view class="edit-cate-container">
		<up-modal
			class="edit-cate-modal"
			:show="show"
			title="编辑分类"
			:confirmColor="COLOURS['theme-color']"
            :showCancelButton="true"
            :closeOnClickOverlay="true"
			@confirm="confirm"
            @cancel="close"
            @close="close"
		>
			<template #default>
				<view class="edit-cate-content">
					<view class="edit-cate-input">
						<up-input v-model="classifyName" placeholder="请输入分类名称" border="none" clearable />
					</view>
				</view>
			</template>
		</up-modal>
	</view>
</template>
<script setup>
import { ref } from "vue";
import { COLOURS } from "@/config/index.js";

// 定义组件事件
const emit = defineEmits(["editClassify"]);

// 定义组件数据
const classifyName = ref("");
const show = ref(false);

/**
 * @description: 确认编辑分类
 * @return {*}
 */
const confirm = () => {
    // 先判断是否有分类名称
    const name = classifyName.value.trim();
    if (!name) {
        uni.showToast({
            title: "请输入分类名称",
            icon: "none",
        });
        return;
	}
	// 调用添加分类的方法
	emit("editClassify", name);
	// 清空分类名称
	classifyName.value = "";
    // 关闭弹窗
    show.value = false;
};

/**
 * @description: 关闭弹窗
 * @return {*}
 */
const close = () => {
    // 清空分类名称
    classifyName.value = "";
    // 关闭弹窗
    show.value = false;
}
// 定义组件暴露的方法,提供外部调用
defineExpose({
	show,
    classifyName
});

</script>
<style lang="scss" scoped>
.edit-cate-container {
    width: 100%;
    height: 100%;

	.edit-cate-content {
		box-sizing: border-box;
		width: 100%;
		padding: 8rpx 18rpx 18rpx;
	}

	.edit-cate-input {
		box-sizing: border-box;
		width: 100%;
		height: 82rpx;
		padding: 0 20rpx;
		border: 1rpx solid #eef0f4;
		border-radius: 14rpx;
		background: #fbfbfc;
	}

	:deep(.u-modal) {
		border-radius: 18rpx;
		overflow: hidden;
	}

	:deep(.u-modal__title) {
		color: #303133;
		font-size: 18px;
		font-weight: 700;
	}

	:deep(.u-input) {
		height: 80rpx;
	}

	:deep(.u-input__content__field-wrapper__field) {
		color: #303133;
		font-size: 15px;
		font-weight: 600;
	}
}
</style>
