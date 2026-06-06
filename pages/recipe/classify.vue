<!--
 * @Author: elk
 * @Date: 2026-01-19 15:43:23
 * @LastEditors: elk
 * @LastEditTime: 2026-01-22 13:18:45
 * @FilePath: /hkt-applet/pages/recipe/classify.vue
 * @Description: 分类管理页
-->
<template>
	<view class="classify-container">
		<!-- 添加分类 -->
		<view class="classify-add pubColumnFlex">
			<view style="margin-bottom: 15px" class="publcTitleSize">添加分类</view>
			<view class="pubFlex w-100">
				<view style="width: 100%; margin: 0 auto">
					<up-input v-model="classifyName" placeholder="请输入分类名称" />
				</view>
				<view style="width: 100px; margin-left: 10px">
					<up-button
						icon="plus-circle"
						shape
						type="primary"
						:color="COLOURS['theme-color']"
						@click="addClassify"
						>添加</up-button
					>
				</view>
			</view>
		</view>
		<up-skeleton rowsHeight="80" :rows="classifyList.length" :title="false" :loading="listLoading">
			<!-- 分类列表 -->
			<view class="classify-list">
				<leo-drag :column="1" ref="myDrop" v-model:list="classifyList">
					<template #content="{ data }">
						<view class="classify-item pubFlex">
							<up-icon @touchstart="touchstart(data.index)" name="list" size="30" :color="COLOURS['theme-color']"></up-icon>
							<view>{{ data.name }}</view>
							<view class="pubFlex">
								<view @click="openEditCate(data.id, data.name)">
									<up-icon name="share-square" size="30" :color="COLOURS['theme-color']"></up-icon>
								</view>
								<view @click="deleteClassify(data.id)" style="margin-left: 10px">
									<up-icon name="close-circle" size="30" :color="COLOURS['theme-color']"></up-icon>
								</view>
							</view>
						</view>
					</template>
				</leo-drag>
			</view>
		</up-skeleton>
	</view>
	<!-- 编辑分类组件 -->
	<EditCate ref="editCate" @editClassify="editClassify" />
</template>
<script setup>
import { ref, onMounted } from "vue";
import { COLOURS } from "@/config/index.js";
import EditCate from "./component/EditCate.vue";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";

useAuthGuard();

const classifyList = ref([]);
const classifyName = ref("");
const myDrop = ref("myDrop");
const editCate = ref("editCate");
const editId = ref("");
const listLoading = ref(true);

onMounted(() => {
	// 后续联调后端时替换为真实分类列表接口。
	listLoading.value = false;
});
/**
 * @description: 打开编辑分类组件
 * @return {*}
 */
const openEditCate = (id, name) => {
	// 调用编辑分类组件
	editCate.value.show = true;
	// 传递当前分类id
	editId.value = id;
	// 传递当前分类名称
	editCate.value.classifyName = name;
};
/**
 * @description: 添加分类
 * @return {*}
 */
const addClassify = () => {
	// 先判断是否有分类名称
	if (!classifyName.value) {
		uni.showToast({
			title: "请输入分类名称",
			icon: "none",
		});
		return;
	}
	classifyList.value.push({
		id: classifyList.value.length + 1,
		name: classifyName.value,
		order: classifyList.value.length + 1,
	});
	// 调用changeList函数更新列表
	changeList();
	// 清空分类名称输入框
	classifyName.value = "";
};
/**
 * @description: 编辑分类
 * @param {*} id - 分类id
 * @return {*}
 */
const editClassify = (name) => {
	// 找到要编辑的分类
	let classify = classifyList.value.find((item) => item.id === editId.value);
	if (classify) {
		// 更新分类名称
		classify.name = name;
		// 调用changeList函数更新列表
		changeList();
	}
};
/**
 * @description: 删除分类
 * @param {*} id - 分类id
 * @return {*}
 */
const deleteClassify = (id) => {
	// 先判断是否确认删除
	uni.showModal({
		title: "确认删除",
		content: "确定删除该分类吗？",
		confirmColor: COLOURS["theme-color"],
		success: (res) => {
			if (res.confirm) {
				// 过滤出不等于id的元素
				classifyList.value = classifyList.value.filter((item) => item.id !== id);
				// 调用changeList函数更新列表
				changeList();
			}
		},
	});
};
/**
 * @description: 触摸开始事件，触发长按事件
 * @param {*} i
 * @return {*}
 */
const touchstart = (i) => {
	// 默认是长按才能拖动，可根据需求，通过触摸拖动元素
	myDrop.value.handleLongpress(i);
};
/**
 * @description: 拖拽排序完毕后，更新列表
 * @return {*}
 */
const changeList = () => {
	// 如果新增或者删除了数据，请调用此函数
	let list = classifyList.value;
	myDrop.value.initList(list, true);
};
</script>
<style lang="scss" scoped>
.classify-container {
	width: 100%;
	height: 100vh;
	padding: 20px 15px;
	box-sizing: border-box;
	overflow: hidden;
	background: linear-gradient(135deg, #ffe6ea 0%, #fff5f5 100%);
	.classify-add {
		align-items: baseline;
		padding: 20px 10px;
		background-color: #fff;
		border-radius: 15px;
		margin-bottom: 20px;
	}
	.classify-list {
		height: calc(100vh - 180px);
		overflow: auto;
		.classify-item {
			width: 100%;
			height: 80px;
			padding: 20px 12px;
			margin-bottom: 20px;
			border-radius: 15px;
			box-sizing: border-box;
			justify-content: space-between;
			background-color: #fff;
		}
	}
}
</style>
