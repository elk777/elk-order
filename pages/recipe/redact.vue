<!--
 * @Author: elk
 * @Date: 2025-09-12 09:18:25
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-06 17:00:15
 * @FilePath: /hkt-applet/pages/recipe/redact.vue
 * @Description: 菜谱-新增、编辑界面
-->
<template>
	<view class="recipe-redact-container">
		<view class="redact-form pubColumnFlex">
			<view class="publcTitleSize from-title">基本信息</view>
			<up-upload></up-upload>
			<view class="form">
				<up-form ref="basicForm" :borderBottom="true" :model="form.basicForm" :rules="rules">
					<up-form-item :borderBottom="true" :required="true" label="名称" prop="name">
						<up-input v-model="form.basicForm.name" border="none"></up-input>
					</up-form-item>
					<up-form-item :borderBottom="true" :required="true" label="分类" prop="sort">
						<up-input v-model="form.basicForm.sort" border="none"></up-input>
					</up-form-item>
					<up-form-item label="描述" prop="describe">
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
				<IngreIList @clear-inger="clearInger" :ingerList="form.ingreList" />
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
				<StepList @clear-step="clearStep" :stepList="form.stepList" />
			</view>
		</view>
		<view style="height: 100px"></view>
		<BottomBtn @submit="handelSubmit" :loading="loading" />
	</view>
</template>

<script setup>
import { ref } from "vue";
import { COLOURS } from "@/config/index.js";
import IngreIList from "./component/IngreIList.vue";
import StepList from "./component/StepList.vue";
import BottomBtn from "./component/BottomBtn.vue";
// 引入usePageTitle hook函数
import { usePageTitle } from '@/hooks/usePageTitle.js';

// 调用usePageTitle hook函数，设置默认标题为"编辑菜谱"
usePageTitle();

const form = ref({
	basicForm: {
		name: "",
		sort: "",
		describe: "",
	},
	ingreList: [
		// { id: "1212131231", ingreName: "鸡蛋", ingreDose: "3个" },
		// { id: "2323232323", ingreName: "西红柿", ingreDose: "1个" },
		// { id: "3231231233", ingreName: "番茄酱", ingreDose: "1勺" },
	],
	stepList: [
		// { id: "1212131231", stepDesc: "将鸡蛋打散", stepTip: "加入水", stepImg: "" },
		// { id: "2323232323", stepDesc: "将西红柿洗净", stepTip: "加入水", stepImg: "" },
		// { id: "3231231233", stepDesc: "将番茄酱洗净", stepTip: "加入水", stepImg: "" },
	],
});
const rules = ref({
	name: [{ required: true, message: "请输入名称", trigger: ["blur"] }],
	sort: [{ required: true, message: "请输入分类", trigger: ["blur"] }],
});
// 表单引用
const basicForm = ref(null);
const loading = ref(false);
/**
 * @description: 添加食材按钮事件
 * @param {:type}
 * @return {:type}
 */
const handelAddInger = () => {
	let obj = {
		id: (form.value.ingreList.length + 1).toString(),
		name: "",
		dose: "",
	};
	form.value.ingreList.push(obj);
};
/**
 * @description: 删除指定食材的父组件事件
 * @param {:type}
 * @return {:type}
 */
const clearInger = (id) => {
	form.value.ingreList = form.value.ingreList.filter((item) => item.id !== id);
};

/**
 * @description: 添加步骤按钮事件
 * @param {:type}
 * @return {:type}
 */
const handelAddStep = () => {
	let obj = {
		id: (form.value.stepList.length + 1).toString(),
		stepDesc: "",
		stepTip: "",
		stepImg: "",
	};
	form.value.stepList.push(obj);
};
/**
 * @description: 删除指定步骤的父组件事件
 * @param {:type}
 * @return {:type}
 */
const clearStep = (id) => {
	form.value.stepList = form.value.stepList.filter((item) => item.id !== id);
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
		.form-button {
			width: 150px;
		}
		.form {
			width: 100%;
		}
	}
}
</style>
