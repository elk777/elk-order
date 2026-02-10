<!--
 * @Author: elk
 * @Date: 2026-02-09 16:16:27
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 11:13:42
 * @FilePath: /hkt-applet/pages/my/component/UserEdit.vue
 * @Description: 用户信息编辑模块
-->
<template>
	<up-modal
		title="编辑资料"
		:show="show"
		closeOnClickOverlay
		showCancelButton
		confirmText="保存"
		:confirmColor="COLOURS['theme-color']"
		@close="handleClose"
		@cancel="handleClose"
		@confirm="handleSave"
	>
		<template #default>
			<view class="user-edit w-100">
				<up-form :model="userInfo" :rules="rules" labelPosition="top" labelWidth="auto" ref="formRef">
					<up-form-item label="头像" prop="avatar">
						<Upload
							:maxCount="1"
							v-model:fileList="userInfo.avatar"
							accept="image"
							@after-read="afterRead"
							:sizeType="['compressed']"
							:showBorder="false"
						>
							<up-avatar shape="circle" :src="userInfo.avatar" size="75" />
							<view class="change-avatar">点击更换</view>
						</Upload>
					</up-form-item>
					<up-form-item label="昵称" prop="nickName">
						<up-input v-model="userInfo.nickName" placeholder="请输入用户名"></up-input>
					</up-form-item>
					<up-form-item label="性别" prop="gender">
						<up-radio-group v-model="userInfo.gender" :options="genderOptions">
							<up-radio
								v-for="item in genderOptions"
								:name="item.value"
								:key="item.value"
								:label="item.label"
							></up-radio>
						</up-radio-group>
					</up-form-item>
					<up-form-item label="我的角色" prop="userType">
						<up-radio-group v-model="userInfo.userType" :options="userTypeOptions">
							<up-radio
								v-for="item in userTypeOptions"
								:key="item.value"
								:name="item.value"
								:label="item.label"
							></up-radio>
						</up-radio-group>
					</up-form-item>
				</up-form>
			</view>
		</template>
	</up-modal>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { ref, computed } from "vue";
import { COLOURS } from "@/config/index.js";

import { useUserStore } from "@/stores/user.js";
// 引入通用上传组件
import Upload from "@/components/Upload/index.vue";

const userStore = useUserStore();
// 深拷贝创建本地副本，避免直接修改store
const userInfo = computed(() => ({ ...userStore.profile }));

const genderOptions = ref([
	{ label: "男", value: 0 },
	{ label: "女", value: 1 },
]);

const userTypeOptions = ref([
	{ label: "饲养员", value: 0 },
	{ label: "吃货", value: 1 },
]);

const rules = ref({
	username: [{ required: true, message: "请输入用户名", trigger: ["blur"] }],
});

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});

/**
 * @description: 关闭弹窗事件
 * @return {*}
 */
const emit = defineEmits(["close"]);
const handleClose = () => {
	emit("close");
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
 * @description: 保存用户信息
 * @return {*}
 */
const handleSave = () => {
	// 将本地修改后的数据更新到store
	userStore.setProfile(userInfo.value);
	// 关闭modal
	handleClose();
	// 显示保存成功提示
	uni.showToast({
		title: "保存成功",
		icon: "success"
	});
};
</script>

<style scoped lang="scss">
:deep(.u-form-item__body__right__content__slot) {
	justify-content: center;
}
.change-avatar {
	margin-top: 5px;
	color: $tinge-color;
}
</style>
