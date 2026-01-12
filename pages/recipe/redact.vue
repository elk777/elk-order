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
		<view class="redact-form pubColumnFlex">
			<view class="publcTitleSize from-title">基本信息</view>
			<view class="cover">
				<view style="margin: 15px 0px 10px;">菜谱封面</view>
				<Upload
					style="width: 100%"
					v-model:fileList="form.basicForm.images"
					:maxCount="1"
					@after-read="afterRead"
					@delete="deleteImage"
					name="images"
					accept="image"
					:sizeType="['compressed']"
					:slotStyle="{ height: '250px' }"
					:previewStyle="{ height: '250px' }"
				>
					<view class="upload-slot pubColumnFlex">
						<up-icon name="camera-fill" size="24" :color="COLOURS['theme-color']"></up-icon>
						<view>上传菜谱封面</view>
					</view>
				</Upload>
			</view>
			<view class="form">
				<up-form ref="basicForm" :borderBottom="true" :model="form.basicForm" labelWidth="auto" :rules="rules">
					<up-form-item :borderBottom="true" :required="true" label="菜谱名称" prop="name">
						<up-input v-model="form.basicForm.name" border="none"></up-input>
					</up-form-item>
					<up-form-item :borderBottom="true" :required="true" label="菜谱分类" prop="sort">
						<up-input v-model="form.basicForm.sort" border="none"></up-input>
					</up-form-item>
					<up-form-item label="菜谱描述" prop="describe">
						<up-textarea v-model="form.basicForm.describe" placeholder="发挥你的想象吧~"></up-textarea>
					</up-form-item>
				</up-form>
			</view>
		</view>
		<view class="redact-form pubColumnFlex">
			<view class="pubFlex from-title">
				<view class="publcTitleSize from-title">食材清单</view>
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
			<view class="form">
				<IngreIList @remove-inger="removeIngreItem" :ingerList="form.ingreList" />
			</view>
		</view>
		<view class="redact-form pubColumnFlex">
			<view class="pubFlex from-title">
				<view class="publcTitleSize from-title">制作步骤</view>
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
			<view class="form">
				<StepList @remove-step="removeStepItem" :stepList="form.stepList" />
			</view>
		</view>
		<view style="height: 100px"></view>
		<BottomBtn @submit="handelSubmit" :loading="loading" />
	</view>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { ref } from "vue";
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
		sort: "",
		describe: "",
		// 新增：存储上传的图片列表
		images: [],
	},
	ingreList: [],
	stepList: [],
});
const rules = ref({
	name: [{ required: true, message: "请输入名称", trigger: ["blur"] }],
	sort: [{ required: true, message: "请输入分类", trigger: ["blur"] }],
});

// 同步到表单数据
form.value.ingreList = ingreList;
form.value.stepList = stepList;
// 表单引用
const basicForm = ref(null);
const loading = ref(false);
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

/**
 * @description: 图片上传后的处理函数
 * @param {Object} file - 上传的文件对象
 * @param {Array} fileList - 当前文件列表
 * @return {void}
 */
const afterRead = (file, fileList) => {
	// 通用上传组件已经处理了文件添加，这里可以添加额外的业务逻辑
	console.log("图片上传成功", file);
	console.log("当前文件列表", fileList);
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
	basicForm.value.validate().then((valid) => {
		if (valid) {
			console.log("表单验证通过", form.value);
		} else {
			console.log("表单验证失败", form.value);
		}
	});
};
</script>

<style lang="scss" scoped>

.recipe-redact-container {
	width: 100%;
	height: 100vh;
	box-sizing: border-box;
	padding: 15px;
	.redact-form {
		padding: 18px;
		margin-bottom: 18px;
		border-radius: 15px;
		background-color: #fff;
		.from-title {
			width: 100%;
			justify-content: space-between;
			text-align: left;
		}
		.cover {
			width: 100%;
			color: #303133;
		}
		.form-button {
			width: 150px;
		}
		.form {
			width: 100%;
		}
	}
	// .upload-btn {
	// 	height: 250px;
	// }
}
</style>
