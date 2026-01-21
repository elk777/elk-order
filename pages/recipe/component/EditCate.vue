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
				<view class="pubColumnFlex">
					<view style="width: 100%; margin: 0 auto">
						<up-input v-model="classifyName" placeholder="请输入分类名称" clearable />
					</view>
				</view>
			</template>
		</up-modal>
	</view>
</template>
<script setup>
import { ref, defineEmits } from "vue";
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
    if (!classifyName.value) {
        uni.showToast({
            title: "请输入分类名称",
            icon: "none",
        });
        return;
    }
	// 调用添加分类的方法
	emit("editClassify", classifyName.value);
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
}
</style>
