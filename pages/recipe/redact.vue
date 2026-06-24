<!--
 * @Author: elk
 * @Date: 2025-09-12 09:18:25
 * @LastEditors: elk
 * @LastEditTime: 2026-01-12 14:25:02
 * @FilePath: /hkt-applet/pages/recipe/redact.vue
 * @Description: 菜谱-新增、编辑界面
-->
<template>
	<view class="recipe-redact-container">
		<view class="redact-form redact-form--basic pubColumnFlex">
			<view class="section-head">
				<view class="publcTitleSize from-title">基本信息</view>
				<view class="section-badge">必填</view>
			</view>
			<view class="cover">
				<view class="field-label">菜谱封面</view>
				<Upload
					class="cover-upload"
					style="width: 100%"
					v-model:fileList="form.basicForm.images"
					:maxCount="1"
					@after-read="afterRead"
					@delete="deleteImage"
					name="images"
					accept="image"
					:sizeType="['compressed']"
					:slotStyle="{ height: '340rpx' }"
					:previewStyle="{ height: '340rpx' }"
				>
					<view class="upload-slot pubColumnFlex">
						<view class="upload-slot__icon pubFlex">
							<up-icon name="camera-fill" size="24" :color="COLOURS['theme-color']"></up-icon>
						</view>
						<view class="upload-slot__text">上传菜谱封面</view>
					</view>
				</Upload>
			</view>
			<view class="form">
				<up-form ref="basicForm" :borderBottom="true" :model="form.basicForm" labelWidth="92" :rules="rules">
					<up-form-item :borderBottom="true" :required="true" label="菜谱名称" prop="name">
						<up-input v-model="form.basicForm.name" border="none" placeholder="给它起个名字"></up-input>
					</up-form-item>
					<up-form-item :borderBottom="true" :required="true" label="菜谱分类" prop="categoryId">
						<view @click="showCategoryPicker" class="category-select">
							<view v-if="selectedCategoryName" class="category-value">{{ selectedCategoryName }}</view>
							<view v-else class="category-placeholder">请选择分类</view>
							<up-icon name="arrow-down" size="16" color="#909399"></up-icon>
						</view>
					</up-form-item>
					<up-form-item label="菜谱描述" prop="describe">
						<up-textarea v-model="form.basicForm.describe" placeholder="发挥你的想象吧~" :height="92"></up-textarea>
					</up-form-item>
				</up-form>
			</view>
		</view>
		<view class="redact-form pubColumnFlex">
			<view class="section-head section-head--row">
				<view class="section-title-group pubFlex">
					<view class="publcTitleSize from-title">食材清单</view>
					<view class="section-count">{{ form.ingreList.length }}项</view>
				</view>
				<view class="form-button">
					<up-button
						@click="handelAddInger"
						icon="plus-circle"
						:color="COLOURS['theme-color']"
						shape="circle"
						:plain="true"
						>添加食材</up-button
					>
				</view>
			</view>
			<view class="form list-form">
				<IngreIList @remove-inger="removeIngreItem" :ingerList="form.ingreList" />
			</view>
		</view>
		<view class="redact-form pubColumnFlex">
			<view class="section-head section-head--row">
				<view class="section-title-group pubFlex">
					<view class="publcTitleSize from-title">制作步骤</view>
					<view class="section-count">{{ form.stepList.length }}步</view>
				</view>
				<view class="form-button">
					<up-button
						@click="handelAddStep"
						icon="plus-circle"
						:color="COLOURS['theme-color']"
						shape="circle"
						:plain="true"
						>添加步骤</up-button
					>
				</view>
			</view>
			<view class="form list-form">
				<StepList @remove-step="removeStepItem" :stepList="form.stepList" />
			</view>
		</view>
		<view class="bottom-spacer"></view>
		<BottomBtn @submit="handelSubmit" @cancel="handleCancel" :loading="loading" />

		<!-- 分类选择器 -->
		<up-picker
			:show="categoryPickerShow"
			:columns="categoryColumns"
			keyName="name"
			@confirm="onCategoryConfirm"
			@cancel="categoryPickerShow = false"
		></up-picker>
	</view>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { ref, onMounted } from "vue";
import { COLOURS } from "@/config/index.js";
import IngreIList from "./component/IngreIList.vue";
import StepList from "./component/StepList.vue";
import BottomBtn from "./component/BottomBtn.vue";
// 引入通用上传组件
import Upload from "@/components/Upload/index.vue";
// 引入usePageTitle hook函数
import { usePageTitle } from "@/hooks/usePageTitle.js";
import { generateId } from "@/utils/tool.js";
import { useListOperations } from "./hook/useListOperations.js";
import { useAuthGuard } from "@/hooks/useAuthGuard.js";
// 引入菜谱 API
import { createRecipe, updateRecipe, getRecipeDetail, uploadRecipeImage, getRecipeCategories } from "@/api/recipes.js";
import { normalizeMediaUrl } from "@/utils/media.js";

useAuthGuard();
// 调用usePageTitle hook函数，设置默认标题为"编辑菜谱"
usePageTitle();
// 调用useListOperations hook函数，初始化食材清单和制作步骤列表
const { list: ingreList, addItem: addIngreItem, removeItem: removeIngreItem } = useListOperations(
	[ {id: generateId(), ingreName: "", ingreDose: "" }],
	{ ingreName: "", ingreDose: "" }
);
const { list: stepList, addItem: addStepItem, removeItem: removeStepItem } = useListOperations(
	[{ id: generateId(), stepDesc: "", stepTip: "", stepImg: [] }],
	{ stepDesc: "", stepTip: "", stepImg: [] }
);
const form = ref({
	basicForm: {
		name: "",
		categoryId: "",
		describe: "",
		// 新增：存储上传的图片列表
		images: [],
	},
	ingreList: [],
	stepList: [],
});
const rules = ref({
	name: [{ required: true, message: "请输入名称", trigger: ["blur"] }],
	categoryId: [{ required: true, message: "请选择分类", trigger: ["change"] }],
});

// 分类选择器相关
const categoryPickerShow = ref(false);
const categoryList = ref([]);
const categoryColumns = ref([[]]);
const selectedCategoryName = ref("");

// 同步到表单数据
form.value.ingreList = ingreList;
form.value.stepList = stepList;
// 表单引用
const basicForm = ref(null);
const loading = ref(false);
// 编辑模式的菜谱 ID
const recipeId = ref(null);

/**
 * @description: 页面加载时执行，判断是否为编辑模式
 */
onMounted(async () => {
	// 加载分类列表
	await loadCategories();

	// 获取 URL 参数
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	const options = currentPage.options || {};

	if (options.id) {
		recipeId.value = options.id;
		loadRecipeDetail(options.id);
	}
});

/**
 * @description: 加载分类列表
 */
const loadCategories = async () => {
	try {
		console.log("开始加载分类列表...");
		const res = await getRecipeCategories();

		console.log("分类列表响应:", res);

		if (res.code === 200 && Array.isArray(res.data)) {
			categoryList.value = res.data;
			categoryColumns.value = [res.data];

			console.log("分类列表加载成功，数量:", res.data.length);

			// 如果没有分类，提示用户
			if (res.data.length === 0) {
				uni.showModal({
					title: "提示",
					content: "暂无分类，请先创建分类后再添加菜谱",
					confirmText: "去创建",
					cancelText: "取消",
					success: (modalRes) => {
						if (modalRes.confirm) {
							uni.redirectTo({
								url: "/pages/recipe/classify"
							});
						} else {
							uni.navigateBack();
						}
					}
				});
			}
		}
	} catch (error) {
		console.error("加载分类列表失败:", error);
		uni.showToast({ title: error.message || "加载分类失败", icon: "none" });
	}
};

/**
 * @description: 显示分类选择器
 */
const showCategoryPicker = () => {
	if (categoryList.value.length === 0) {
		uni.showToast({ title: "暂无分类，请先创建分类", icon: "none" });
		return;
	}
	categoryPickerShow.value = true;
};

/**
 * @description: 分类选择确认
 */
const onCategoryConfirm = (e) => {
	console.log("分类选择确认:", e);
	const selected = e.value[0];
	if (selected) {
		form.value.basicForm.categoryId = selected.id;
		selectedCategoryName.value = selected.name;
		console.log("已选择分类:", selected.name, "ID:", selected.id);
	}
	categoryPickerShow.value = false;
};

/**
 * @description: 加载菜谱详情（编辑模式）
 * @param {string|number} id - 菜谱 ID
 */
const loadRecipeDetail = async (id) => {
	try {
		uni.showLoading({ title: "加载中...", mask: true });
		const res = await getRecipeDetail(id);

		if (res.code === 200 && res.data) {
			const recipe = res.data;
			if (recipe.canManage === false) {
				uni.showToast({ title: "只能编辑自己创建的菜谱", icon: "none" });
				setTimeout(() => {
					uni.navigateBack();
				}, 1200);
				return;
			}

			// 填充基本信息
			form.value.basicForm.name = recipe.name || "";
			form.value.basicForm.categoryId = recipe.categoryId || "";
			form.value.basicForm.describe = recipe.description || "";

			// 填充已选分类名称
			if (recipe.category) {
				selectedCategoryName.value = recipe.category.name;
			}

			// 填充封面图片
			if (recipe.cover) {
				form.value.basicForm.images = [{ url: normalizeMediaUrl(recipe.cover), status: "success" }];
			}

			// 填充食材清单（字段映射：name→ingreName, amount→ingreDose）
			if (recipe.ingredients && recipe.ingredients.length > 0) {
				ingreList.value = recipe.ingredients.map((item) => ({
					id: generateId(),
					ingreName: item.name || "",
					ingreDose: item.amount || "",
				}));
			}

			// 填充制作步骤（字段映射：describe→stepDesc, tip→stepTip, images→stepImg）
			if (recipe.steps && recipe.steps.length > 0) {
				stepList.value = recipe.steps.map((item) => ({
					id: generateId(),
					stepDesc: item.describe || "",
					stepTip: item.tip || "",
					stepImg: (item.images || []).map((url) => ({ url: normalizeMediaUrl(url), status: "success" })),
				}));
			}
		}
	} catch (error) {
		console.error("加载菜谱详情失败:", error);
		uni.showToast({ title: error.message || "加载失败", icon: "none" });
	} finally {
		uni.hideLoading();
	}
};

/**
 * @description: 添加食材按钮事件
 * @param {:type}
 * @return {:type}
 */
const handelAddInger = () => {
	addIngreItem()
};

/**
 * @description: 添加步骤按钮事件
 * @param {:type}
 * @return {:type}
 */
const handelAddStep = () => {
	addStepItem()
};

const handleCancel = () => {
	const pages = getCurrentPages();
	if (pages.length > 1) {
		uni.navigateBack();
		return;
	}
	uni.switchTab({
		url: "/pages/sort/index",
	});
};

/**
 * @description: 图片上传后的处理函数
 * @param {Object} file - 上传的文件对象
 * @param {Array} fileList - 当前文件列表
 * @return {void}
 */
const afterRead = async (file, fileList) => {
	// 获取上传的文件路径
	const filePath = file.url || file.path;

	if (!filePath) {
		uni.showToast({ title: "图片路径无效", icon: "none" });
		return;
	}

	try {
		// 显示上传中
		uni.showLoading({ title: "上传中...", mask: true });

		// 调用后端上传接口
		const res = await uploadRecipeImage(filePath);

		if (res.code === 200 && res.data && res.data.url) {
			const uploadedUrl = normalizeMediaUrl(res.data.url);
			// 更新文件列表中的 URL
			const lastIndex = form.value.basicForm.images.length - 1;
			if (lastIndex >= 0) {
				form.value.basicForm.images[lastIndex].url = uploadedUrl;
				form.value.basicForm.images[lastIndex].status = "success";
			}

			uni.showToast({ title: "上传成功", icon: "success" });
		} else {
			throw new Error(res.message || "上传失败");
		}
	} catch (error) {
		console.error("图片上传失败:", error);
		uni.showToast({ title: error.message || "上传失败", icon: "none" });

		// 上传失败，移除最后一个文件
		form.value.basicForm.images.pop();
	} finally {
		uni.hideLoading();
	}
};

/**
 * @description: 删除图片的处理函数
 * @param {Number} index - 要删除的图片索引
 * @return {void}
 */
const deleteImage = (index) => {
	// 通用上传组件已经处理了文件删除，这里可以添加额外的业务逻辑
	console.log("删除图片索引", index);
};

/**
 * @description: 提交表单事件
 * @return {*}
 */
const handelSubmit = () => {
	basicForm.value.validate().then(async (valid) => {
		if (valid) {
			console.log("表单验证通过，准备提交...");

			// 检查封面图片
			if (!form.value.basicForm.images || form.value.basicForm.images.length === 0) {
				uni.showToast({ title: "请上传菜谱封面", icon: "none" });
				return;
			}

			// 检查食材清单
			const hasValidIngredient = form.value.ingreList.some(
				(item) => item.ingreName && item.ingreName.trim()
			);
			if (!hasValidIngredient) {
				uni.showToast({ title: "请至少添加一个食材", icon: "none" });
				return;
			}

			// 检查制作步骤
			const hasValidStep = form.value.stepList.some(
				(item) => item.stepDesc && item.stepDesc.trim()
			);
			if (!hasValidStep) {
				uni.showToast({ title: "请至少添加一个制作步骤", icon: "none" });
				return;
			}

			try {
				loading.value = true;

				// 构建提交数据（字段映射）
				const submitData = {
					name: form.value.basicForm.name,
					categoryId: form.value.basicForm.categoryId,
					description: form.value.basicForm.describe,
					cover: normalizeMediaUrl(form.value.basicForm.images[0]?.url || ""),
					// 食材清单映射：ingreName→name, ingreDose→amount
					ingreList: form.value.ingreList
						.filter((item) => item.ingreName && item.ingreName.trim())
						.map((item) => ({
							ingreName: item.ingreName,
							ingreDose: item.ingreDose || "",
						})),
					// 制作步骤映射：stepDesc→describe, stepTip→tip, stepImg→images
					stepList: form.value.stepList
						.filter((item) => item.stepDesc && item.stepDesc.trim())
						.map((item) => ({
							stepDesc: item.stepDesc,
							stepTip: item.stepTip || "",
							stepImg: (item.stepImg || []).map((img) => normalizeMediaUrl(img.url)).filter(Boolean),
						})),
				};

				console.log("提交数据:", submitData);

				let res;
				if (recipeId.value) {
					// 编辑模式：更新菜谱
					console.log("更新菜谱, ID:", recipeId.value);
					res = await updateRecipe(recipeId.value, submitData);
				} else {
					// 新增模式：创建菜谱
					console.log("创建新菜谱");
					res = await createRecipe(submitData);
				}

				console.log("提交响应:", res);

				if (res.code === 200) {
					uni.showToast({
						title: recipeId.value ? "更新成功" : "创建成功",
						icon: "success",
					});

					// 延迟返回上一页
					setTimeout(() => {
						uni.navigateBack();
					}, 1000);
				} else {
					throw new Error(res.message || "提交失败");
				}
			} catch (error) {
				console.error("提交失败:", error);
				uni.showToast({ title: error.message || "提交失败", icon: "none" });
			} finally {
				loading.value = false;
			}
		} else {
			console.log("表单验证失败", form.value);
		}
	});
};
</script>

<style lang="scss" scoped>
.recipe-redact-container {
	width: 100%;
	min-height: 100vh;
	box-sizing: border-box;
	padding: 24rpx 22rpx calc(148rpx + env(safe-area-inset-bottom));
	background:
		linear-gradient(180deg, #fff5f8 0, #f8f8f8 320rpx),
		#f8f8f8;

	.redact-form {
		align-items: stretch;
		width: 100%;
		box-sizing: border-box;
		padding: 26rpx;
		margin-bottom: 22rpx;
		border: 1rpx solid rgba(255, 92, 141, 0.08);
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.96);
		box-shadow: 0 16rpx 36rpx rgba(255, 92, 141, 0.07);
	}

	.redact-form--basic {
		padding-bottom: 20rpx;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		margin-bottom: 22rpx;
	}

	.section-head--row {
		margin-bottom: 8rpx;
	}

	.section-title-group {
		justify-content: flex-start;
		min-width: 0;
	}

	.from-title {
		width: auto;
		color: #202124;
		font-size: 18px;
		line-height: 1.25;
		text-align: left;
	}

	.section-badge,
	.section-count {
		flex-shrink: 0;
		box-sizing: border-box;
		border-radius: 999rpx;
		color: $theme-color;
		font-size: 12px;
		font-weight: 600;
		line-height: 1;
		background: #fff2f6;
	}

	.section-badge {
		padding: 10rpx 16rpx;
	}

	.section-count {
		margin-left: 12rpx;
		padding: 8rpx 14rpx;
	}

	.cover {
		width: 100%;
		margin-bottom: 10rpx;
		color: #303133;
	}

	.field-label {
		margin-bottom: 14rpx;
		color: #303133;
		font-size: 15px;
		font-weight: 600;
	}

	.cover-upload {
		display: block;
		overflow: hidden;
		border-radius: 16rpx;
	}

	.upload-slot {
		width: 100%;
		min-height: 340rpx;
		box-sizing: border-box;
		border: 2rpx dashed rgba(255, 92, 141, 0.24);
		border-radius: 16rpx;
		background:
			linear-gradient(180deg, rgba(255, 245, 248, 0.88), rgba(255, 255, 255, 0.94));
		color: #707070;
	}

	.upload-slot__icon {
		width: 64rpx;
		height: 64rpx;
		margin-bottom: 14rpx;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 10rpx 24rpx rgba(255, 92, 141, 0.12);
	}

	.upload-slot__text {
		color: #303133;
		font-size: 15px;
		font-weight: 600;
	}

	.form,
	.list-form {
		width: 100%;
	}

	.form {
		margin-top: 8rpx;
	}

	.form-button {
		flex-shrink: 0;
		width: 166rpx;
	}

	.category-select {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		box-sizing: border-box;
		min-height: 78rpx;
		padding: 0 2rpx;

		.category-value {
			color: #303133;
			font-size: 15px;
			font-weight: 500;
		}

		.category-placeholder {
			color: #b7bbc3;
			font-size: 15px;
		}
	}

	.bottom-spacer {
		height: 24rpx;
	}

	:deep(.u-form-item__body) {
		padding: 18rpx 0;
	}

	:deep(.u-form-item__body__left__content__label) {
		color: #303133;
		font-size: 15px;
		font-weight: 600;
	}

	:deep(.u-input__content__field-wrapper__field) {
		color: #303133;
		font-size: 15px;
	}

	:deep(.u-textarea) {
		box-sizing: border-box;
		border: 1rpx solid #eef0f4 !important;
		border-radius: 14rpx;
		background: #fbfbfc;
	}

	:deep(.u-button) {
		height: 66rpx;
		font-size: 14px;
		font-weight: 600;
	}
}
</style>
