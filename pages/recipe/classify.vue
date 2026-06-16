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
		<view class="classify-add">
			<view class="section-head">
				<view class="publcTitleSize section-title">添加分类</view>
			</view>
			<view class="add-row pubFlex">
				<view class="add-input">
					<up-input v-model="classifyName" placeholder="请输入分类名称" border="none" clearable />
				</view>
				<view class="add-button">
					<up-button
						icon="plus-circle"
						shape="circle"
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
			<view class="classify-list" :class="{ 'classify-list--empty': classifyList.length === 0 }">
				<view v-if="classifyList.length === 0" class="classify-empty pubColumnFlex">
					<up-icon name="empty-list" size="58" color="#ffc2d4"></up-icon>
					<view>暂无分类</view>
				</view>
				<leo-drag v-else :column="1" ref="myDrop" @getList="handleDragList" v-model:list="classifyList">
					<template #content="{ data }">
						<view class="classify-item pubFlex" :class="{ 'classify-item--active': data.index === data.activeIndex }">
							<view class="drag-handle pubFlex" @touchstart="touchstart(data.index)">
								<up-icon name="list" size="26" :color="COLOURS['theme-color']"></up-icon>
							</view>
							<view class="classify-name">{{ data.name }}</view>
							<view class="classify-actions pubFlex">
								<view class="action-btn pubFlex" @click.stop="openEditCate(data.id, data.name)">
									<up-icon name="edit-pen" size="25" :color="COLOURS['theme-color']"></up-icon>
								</view>
								<view class="action-btn action-btn--delete pubFlex" @click.stop="deleteClassify(data.id)">
									<up-icon name="close-circle" size="27" :color="COLOURS['theme-color']"></up-icon>
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
import { nextTick, ref, onMounted } from "vue";
import { COLOURS } from "@/config/index.js";
import EditCate from "./component/EditCate.vue";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";
import {
	getRecipeCategories,
	createRecipeCategory,
	updateRecipeCategory,
	deleteRecipeCategory,
	reorderRecipeCategories,
} from "@/api/recipes.js";

useAuthGuard();

const classifyList = ref([]);
const classifyName = ref("");
const myDrop = ref(null);
const editCate = ref(null);
const editId = ref("");
const listLoading = ref(true);
const reorderLoading = ref(false);
const lastOrderKey = ref("");

const isSuccessResponse = (res) => res && res.code === 200;
const getResponseMessage = (res, fallback) => res?.message || fallback;
const getListData = (data) => {
	return Array.isArray(data) ? data : data?.list || data?.items || data?.categories || [];
};
const getManageableCategories = (list = []) => list.filter((item) => item?.canManage !== false);
const getCategoryId = (item) => String(item?.id || "");
const getOrderKey = (list = []) => list.map((item) => getCategoryId(item)).join("|");

onMounted(async () => {
	await loadCategories();
});

/**
 * @description: 加载分类列表
 * @return {*}
 */
const loadCategories = async () => {
	try {
		listLoading.value = true;
		const res = await getRecipeCategories();
		const list = getManageableCategories(getListData(res?.data));
		if (isSuccessResponse(res) && Array.isArray(list)) {
			classifyList.value = list;
			lastOrderKey.value = getOrderKey(list);
		} else {
			throw new Error(getResponseMessage(res, "加载分类列表失败"));
		}
	} catch (error) {
		console.error("加载分类列表失败:", error);
		uni.showToast({
			title: error.message || "加载分类列表失败",
			icon: "none",
		});
	} finally {
		listLoading.value = false;
	}
};

/**
 * @description: 打开编辑分类组件
 * @return {*}
 */
const openEditCate = (id, name) => {
	if (!editCate.value) return;
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
const addClassify = async () => {
	// 先判断是否有分类名称
	const name = classifyName.value.trim();
	if (!name) {
		uni.showToast({
			title: "请输入分类名称",
			icon: "none",
		});
		return;
	}

	try {
		const res = await createRecipeCategory({ name });
		if (!isSuccessResponse(res)) {
			throw new Error(getResponseMessage(res, "添加分类失败"));
		}
		if (!res.data) {
			throw new Error("添加分类失败");
		}
		// 将新分类添加到列表
		classifyList.value.push(res.data);
		lastOrderKey.value = getOrderKey(classifyList.value);
		// 调用changeList函数更新拖拽组件
		refreshDragList();
		// 清空分类名称输入框
		classifyName.value = "";
		uni.showToast({
			title: "添加成功",
			icon: "success",
		});
	} catch (error) {
		console.error("添加分类失败:", error);
		uni.showToast({
			title: error.message || "添加分类失败",
			icon: "none",
		});
	}
};
/**
 * @description: 编辑分类
 * @param {*} name - 分类名称
 * @return {*}
 */
const editClassify = async (name) => {
	try {
		const res = await updateRecipeCategory(editId.value, { name });
		if (!isSuccessResponse(res)) {
			throw new Error(getResponseMessage(res, "编辑分类失败"));
		}
		// 找到要编辑的分类，更新本地列表
		let classify = classifyList.value.find((item) => getCategoryId(item) === String(editId.value));
		if (classify) {
			classify.name = name;
			// 调用changeList函数更新拖拽组件
			refreshDragList();
		}
		uni.showToast({
			title: "编辑成功",
			icon: "success",
		});
	} catch (error) {
		console.error("编辑分类失败:", error);
		uni.showToast({
			title: error.message || "编辑分类失败",
			icon: "none",
		});
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
		success: async (res) => {
			if (res.confirm) {
				try {
					const response = await deleteRecipeCategory(id);
					if (!isSuccessResponse(response)) {
						throw new Error(getResponseMessage(response, "删除分类失败"));
					}
					// 过滤出不等于id的元素
					classifyList.value = classifyList.value.filter((item) => getCategoryId(item) !== String(id));
					lastOrderKey.value = getOrderKey(classifyList.value);
					// 调用changeList函数更新拖拽组件
					refreshDragList();
					uni.showToast({
						title: "删除成功",
						icon: "success",
					});
				} catch (error) {
					console.error("删除分类失败:", error);
					uni.showToast({
						title: error.message || "删除分类失败",
						icon: "none",
					});
				}
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
	myDrop.value?.handleLongpress?.(i);
};

/**
 * @description: 拖拽排序完毕后保存新顺序
 * @return {*}
 */
const handleDragList = async (list) => {
	const nextList = getListData(list);
	if (!nextList.length) return;
	const nextOrderKey = getOrderKey(nextList);
	classifyList.value = nextList;
	if (nextOrderKey === lastOrderKey.value) return;
	await saveReorder(nextList);
};

/**
 * @description: 刷新拖拽组件内部列表
 * @return {*}
 */
const refreshDragList = async () => {
	// 如果新增或者删除了数据，请调用此函数
	await nextTick();
	myDrop.value?.initList?.(classifyList.value, true);
};

/**
 * @description: 保存分类排序到后端
 * @return {*}
 */
const saveReorder = async (list = classifyList.value) => {
	if (reorderLoading.value || list.length === 0) return;

	try {
		reorderLoading.value = true;
		const items = list.map((item, index) => ({
			id: getCategoryId(item),
			sortOrder: index + 1,
		}));
		const res = await reorderRecipeCategories(items);
		if (!isSuccessResponse(res)) {
			throw new Error(getResponseMessage(res, "排序保存失败"));
		}
		const sortedList = getListData(res?.data);
		if (Array.isArray(sortedList) && sortedList.length > 0) {
			classifyList.value = sortedList;
			lastOrderKey.value = getOrderKey(sortedList);
			refreshDragList();
		} else {
			lastOrderKey.value = getOrderKey(list);
		}
		uni.showToast({
			title: "排序已保存",
			icon: "success",
		});
	} catch (error) {
		console.error("排序失败:", error);
		uni.showToast({
			title: error.message || "排序保存失败",
			icon: "none",
		});
		await loadCategories();
	} finally {
		reorderLoading.value = false;
	}
};
</script>
<style lang="scss" scoped>
.classify-container {
	width: 100%;
	min-height: 100vh;
	padding: 24rpx 22rpx calc(36rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
	overflow: hidden;
	background:
		linear-gradient(180deg, #ffe7ef 0, #fff4f7 280rpx, #fff8fa 100%),
		#fff8fa;

	.classify-add {
		box-sizing: border-box;
		width: 100%;
		padding: 28rpx;
		margin-bottom: 26rpx;
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.96);
		box-shadow: 0 18rpx 36rpx rgba(255, 92, 141, 0.08);
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		margin-bottom: 22rpx;
	}

	.section-title {
		color: #202124;
		font-size: 18px;
		line-height: 1.2;
	}

	.add-row {
		width: 100%;
		justify-content: space-between;
	}

	.add-input {
		flex: 1;
		min-width: 0;
		height: 78rpx;
		box-sizing: border-box;
		padding: 0 20rpx;
		border: 1rpx solid #eef0f4;
		border-radius: 14rpx;
		background: #fbfbfc;
	}

	.add-button {
		flex-shrink: 0;
		width: 154rpx;
		margin-left: 18rpx;
	}

	.classify-list {
		height: calc(100vh - 230rpx - env(safe-area-inset-bottom));
		overflow: auto;

		.classify-item {
			position: relative;
			width: 100%;
			min-height: 104rpx;
			padding: 18rpx 22rpx;
			margin-bottom: 22rpx;
			box-sizing: border-box;
			justify-content: space-between;
			border: 1rpx solid rgba(255, 92, 141, 0.08);
			border-radius: 16rpx;
			background: rgba(255, 255, 255, 0.98);
			box-shadow: 0 14rpx 30rpx rgba(255, 92, 141, 0.07);
			transition: transform 0.18s ease, box-shadow 0.18s ease;
		}

		.classify-item--active {
			box-shadow: 0 20rpx 42rpx rgba(255, 92, 141, 0.16);
			transform: scale(1.015);
		}

		.drag-handle {
			flex-shrink: 0;
			width: 72rpx;
			height: 72rpx;
			border: 1rpx solid rgba(255, 92, 141, 0.18);
			border-radius: 16rpx;
			background: #fff2f6;
		}

		.classify-name {
			flex: 1;
			min-width: 0;
			padding: 0 22rpx;
			overflow: hidden;
			color: #202124;
			font-size: 17px;
			font-weight: 700;
			text-align: center;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.classify-actions {
			flex-shrink: 0;
			justify-content: flex-end;
		}

		.action-btn {
			width: 62rpx;
			height: 62rpx;
			border-radius: 50%;
			background: #fff2f6;
		}

		.action-btn--delete {
			margin-left: 12rpx;
		}
	}

	.classify-list--empty {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.classify-empty {
		width: 100%;
		min-height: 360rpx;
		box-sizing: border-box;
		border: 1rpx dashed rgba(255, 92, 141, 0.18);
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.74);
		color: #909399;
		font-size: 14px;
	}

	.classify-empty > view {
		margin-top: 12rpx;
	}

	:deep(.u-input) {
		height: 76rpx;
	}

	:deep(.u-input__content__field-wrapper__field) {
		color: #303133;
		font-size: 15px;
	}

	:deep(.u-button) {
		height: 78rpx;
		font-size: 15px;
		font-weight: 700;
	}

	:deep(.leo-drag) {
		width: 100%;
	}
}
</style>
