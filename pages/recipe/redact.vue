/**
* @Description: 菜谱-新增、编辑界面
* @Author: elk
* @Date: 2025-09-12 09:18:28
* @LastEditors:
* @LastEditTime: 2025-09-12 09:18:28
*/
<template>
	<view class="recipe-redact-container">
		<view class="redact-form pubColumnFlex">
			<view class="publcTitleSize from-title">基本信息</view>
			<up-upload></up-upload>
			<view class="form">
				<up-form :borderBottom='true' :model="form.basicForm" :rules="rules">
					<up-form-item :borderBottom='true' :required='true' label="名称" prop="form.name">
						<up-input v-model="form.basicForm.name" border="none"></up-input>
					</up-form-item>
					<up-form-item :borderBottom='true' :required='true' label="分类" prop="form.sort">
						<up-input v-model="form.basicForm.sort" border="none"></up-input>
					</up-form-item>
					<up-form-item label="描述" prop="form.describe">
						<up-textarea v-model="form.basicForm.describe" placeholder="发挥你的想象吧~" ></up-textarea>
					</up-form-item>
				</up-form>
			</view>
		</view>
		<view class="redact-form pubColumnFlex">
			<view class="pubFlex from-title">
				<view class="publcTitleSize from-title">食材清单</view>
				<view class="form-button">
					<up-button icon="plus-circle" :color="COLOURS['theme-color']" shape="circle" :plain="true">添加食材</up-button>
				</view>
			</view>
			<view class="form">
				<IngreItem />
			</view>
		</view>
		<view class="redact-form pubColumnFlex">
			<view class="pubFlex from-title">
				<view class="publcTitleSize from-title">制作步骤</view>
				<view class="form-button">
					<up-button icon="plus-circle" :color="COLOURS['theme-color']" shape="circle" :plain="true">添加步骤</up-button>
				</view>
			</view>
			<view class="form">
				
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import { COLOURS } from '@/config/index.js'
	import IngreItem from './component/IngreItem.vue';

	const form = ref({
		basicForm: {},
		ingreForm: {},
		stepForm: {},
	})
	const rules = ref([])
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