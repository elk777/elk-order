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
						<button
							class="avatar-picker"
							open-type="chooseAvatar"
							@chooseavatar="handleChooseWechatAvatar"
							@click="handleAvatarClick"
						>
							<up-avatar shape="circle" :src="userInfo.avatar" size="75" />
							<view class="change-avatar">{{ avatarUploading ? "上传中..." : "点击更换" }}</view>
						</button>
					</up-form-item>
					<up-form-item label="昵称" prop="nickName">
						<up-input v-model="userInfo.nickName" type="nickname" placeholder="请输入用户名"></up-input>
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
import { reactive, ref, watch } from "vue";
import { COLOURS } from "@/config/index.js";

import { useUserStore } from "@/stores/user.js";
import { updateUserProfile, uploadUserAvatar } from "@/apis/user.js";

const userStore = useUserStore();
const formRef = ref(null);
const saving = ref(false);
const avatarUploading = ref(false);
const userInfo = reactive(createEditableProfile());

const genderOptions = ref([
	{ label: "男", value: 0 },
	{ label: "女", value: 1 },
]);

const userTypeOptions = ref([
	{ label: "饲养员", value: 0 },
	{ label: "吃货", value: 1 },
]);

const rules = ref({
	nickName: [{ required: true, message: "请输入用户名", trigger: ["blur"] }],
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
	resetForm();
	emit("close");
};

watch(
	() => props.show,
	(show) => {
		if (show) resetForm();
	},
);

function createEditableProfile(profile = userStore.profile) {
	return {
		avatar: profile.avatar || "",
		nickName: profile.nickName || "",
		gender: normalizeOptionValue(profile.gender, 0),
		userType: normalizeOptionValue(profile.userType ?? userStore.userType, 0),
	};
}

function resetForm() {
	Object.assign(userInfo, createEditableProfile());
}

function normalizeOptionValue(value, fallback) {
	const numberValue = Number(value);
	return Number.isNaN(numberValue) ? fallback : numberValue;
}

const handleAvatarClick = () => {
	// #ifndef MP-WEIXIN
	chooseLocalAvatar();
	// #endif
};

const handleChooseWechatAvatar = (event) => {
	const avatarUrl = event?.detail?.avatarUrl;
	if (!avatarUrl) return;
	uploadAvatarFile(avatarUrl);
};

function chooseLocalAvatar() {
	uni.chooseImage({
		count: 1,
		sizeType: ["compressed"],
		sourceType: ["album", "camera"],
		success: (res) => {
			const filePath = res.tempFilePaths?.[0];
			if (filePath) uploadAvatarFile(filePath);
		},
	});
}

async function uploadAvatarFile(filePath) {
	if (avatarUploading.value) return;
	avatarUploading.value = true;
	const previousAvatar = userInfo.avatar;
	userInfo.avatar = filePath;
	try {
		const result = await uploadUserAvatar(filePath);
		const avatarUrl = resolveAvatarUrl(result);
		if (!avatarUrl) throw new Error("头像上传失败");
		userInfo.avatar = avatarUrl;
	} catch (error) {
		userInfo.avatar = previousAvatar;
		uni.showToast({
			title: error.message || "头像上传失败",
			icon: "none",
		});
	} finally {
		avatarUploading.value = false;
	}
}

/**
 * @description: 保存用户信息
 * @return {*}
 */
const handleSave = async () => {
	if (saving.value || avatarUploading.value) return;
	const nickName = userInfo.nickName.trim();
	if (!nickName) {
		uni.showToast({
			title: "请输入用户名",
			icon: "none",
		});
		return;
	}

	saving.value = true;
	try {
		const payload = {
			avatar: userInfo.avatar,
			nickName,
			gender: userInfo.gender,
			userType: userInfo.userType,
		};
		const result = await updateUserProfile(payload);
		userStore.setProfile(normalizeProfile(result, payload));
		emit("close");
		uni.showToast({
			title: "保存成功",
			icon: "success",
		});
	} catch (error) {
		uni.showToast({
			title: error.message || "保存失败",
			icon: "none",
		});
	} finally {
		saving.value = false;
	}
};

function resolveAvatarUrl(result = {}) {
	const data = result.data || result;
	return data.url || data.path || data.avatar || data.imageUrl || "";
}

function normalizeProfile(result = {}, fallback = {}) {
	const data = result.data || result;
	const source = data.profile || data.user || data;
	return {
		...userStore.profile,
		...fallback,
		...source,
		uuId: source.uuId || source.uuid || userStore.profile.uuId,
		uuid: source.uuid || source.uuId || userStore.profile.uuid,
		phone: source.phone ?? userStore.profile.phone,
		binding: source.binding ?? userStore.profile.binding,
		createTime: source.createTime ?? userStore.profile.createTime,
	};
}
</script>

<style scoped lang="scss">
:deep(.u-form-item__body__right__content__slot) {
	justify-content: center;
}
.change-avatar {
	margin-top: 5px;
	color: $tinge-color;
}

.avatar-picker {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	margin: 0;
	padding: 0;
	line-height: 1.2;
	background: transparent;
	border: 0;

	&::after {
		border: 0;
	}
}
</style>
