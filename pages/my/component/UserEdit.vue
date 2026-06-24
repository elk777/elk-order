<!--
 * @Author: elk
 * @Date: 2026-02-09 16:16:27
 * @LastEditors: elk
 * @LastEditTime: 2026-06-15 00:00:00
 * @FilePath: /hkt-applet/pages/my/component/UserEdit.vue
 * @Description: 用户信息编辑模块
-->
<template>
	<up-popup
		:show="show"
		mode="center"
		round="20"
		:closeOnClickOverlay="!isActionBusy"
		:safeAreaInsetBottom="false"
		@close="handleClose"
	>
		<view class="profile-panel">
			<view class="panel-head pubFlex">
				<view class="panel-title-wrap">
					<view class="panel-title">编辑资料</view>
					<view class="panel-subtitle">{{ isBound ? "已绑定关系，可查看对方资料" : "完善自己的偏爱厨房名片" }}</view>
				</view>
				<view class="panel-close pubFlex" :class="{ disabled: isActionBusy }" @click="handleClose">
					<up-icon name="close" color="#8f6772" size="18"></up-icon>
				</view>
			</view>

			<scroll-view class="profile-scroll" scroll-y>
				<view class="profile-section">
					<view class="section-head pubFlex">
						<view>
							<view class="section-title">我的资料</view>
							<view class="section-desc">头像、昵称和基础信息会展示在我的页</view>
						</view>
						<view class="section-badge">{{ isBound ? "已绑定" : "未绑定" }}</view>
					</view>

					<up-form :model="userInfo" :rules="rules" labelPosition="top" labelWidth="auto" ref="formRef">
						<up-form-item label="头像" prop="avatar">
							<button
								class="avatar-picker"
								open-type="chooseAvatar"
								:disabled="isActionBusy"
								@chooseavatar="handleChooseWechatAvatar"
								@click="handleAvatarClick"
							>
								<view class="avatar-shell pubFlex">
									<up-avatar shape="circle" :src="userInfo.avatar || defaultAvatar" size="78" />
								</view>
								<view class="change-avatar">{{ avatarUploading ? "上传中..." : "点击更换头像" }}</view>
							</button>
						</up-form-item>

						<up-form-item label="昵称" prop="nickName">
							<view class="field-shell">
								<up-input
									v-model="userInfo.nickName"
									type="nickname"
									border="none"
									placeholder="请输入昵称"
								></up-input>
							</view>
						</up-form-item>

						<up-form-item label="性别" prop="gender">
							<view class="option-shell">
								<up-radio-group v-model="userInfo.gender" placement="row">
									<up-radio
										v-for="item in genderOptions"
										:name="item.value"
										:key="item.value"
										:label="item.label"
									></up-radio>
								</up-radio-group>
							</view>
						</up-form-item>

						<up-form-item label="我的角色" prop="userType">
							<view v-if="isBound" class="readonly-role pubFlex">
								<view class="role-icon pubFlex">
									<up-icon name="account-fill" color="#ffffff" size="18"></up-icon>
								</view>
								<view>
									<view class="readonly-role-title">{{ currentRoleText }}</view>
									<view class="readonly-role-desc">已绑定后角色会与对方关系同步，暂不在资料里切换</view>
								</view>
							</view>
							<view v-else class="option-shell">
								<up-radio-group v-model="userInfo.userType" placement="row">
									<up-radio
										v-for="item in userTypeOptions"
										:key="item.value"
										:name="item.value"
										:label="item.label"
									></up-radio>
								</up-radio-group>
							</view>
						</up-form-item>
					</up-form>
				</view>

				<view v-if="isBound" class="profile-section relation-section">
					<view class="section-head pubFlex">
						<view>
							<view class="section-title">绑定用户</view>
							<view class="section-desc">这里展示当前与你绑定的另一半资料</view>
						</view>
						<view class="section-badge section-badge--warm">关系中</view>
					</view>

					<view v-if="partnerLoading" class="partner-loading pubFlex">正在加载绑定信息...</view>
					<view v-else-if="partnerProfile" class="partner-card">
						<view class="partner-main pubFlex">
							<up-avatar shape="circle" :src="partnerProfile.avatar || defaultAvatar" size="58" />
							<view class="partner-info">
								<view class="partner-name">{{ partnerProfile.nickName }}</view>
								<view class="partner-id">用户ID {{ partnerProfile.uuid || "暂无" }}</view>
							</view>
						</view>
						<view class="partner-tags pubFlex">
							<view class="partner-tag">{{ partnerProfile.genderText }}</view>
							<view class="partner-tag partner-tag--role">{{ partnerProfile.roleText }}</view>
						</view>
					</view>
					<view v-else class="partner-empty">
						绑定信息暂时没有加载出来，请稍后再试
					</view>
				</view>
			</scroll-view>

			<view class="panel-actions">
				<view
					v-if="isBound"
					class="unbind-btn pubFlex"
					:class="{ disabled: isActionBusy }"
					@click="handleUnbindClick"
				>
					解除绑定
				</view>
				<view class="action-row pubFlex">
					<view class="cancel-btn pubFlex" :class="{ disabled: isActionBusy }" @click="handleClose">取消</view>
					<view class="save-btn pubFlex" :class="{ disabled: isActionBusy }" @click="handleSave">
						{{ saving ? "保存中..." : "保存" }}
					</view>
				</view>
			</view>
		</view>
	</up-popup>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { computed, reactive, ref, watch } from "vue";
import { COLOURS } from "@/config/index.js";
import { useUserStore } from "@/stores/user.js";
import { getUserProfile, updateUserProfile, uploadUserAvatar } from "@/apis/user.js";
import { getActiveCouple, unbindCouple } from "@/apis/couples.js";
import { DEFAULT_USER_AVATAR, DEFAULT_USER_NICK_NAME } from "@/utils/userDefaults.js";
import { normalizeMediaUrl, withDefaultMediaUrl } from "@/utils/media.js";

const userStore = useUserStore();
const formRef = ref(null);
const saving = ref(false);
const avatarUploading = ref(false);
const partnerLoading = ref(false);
const unbinding = ref(false);
const coupleInfo = ref(null);
const userInfo = reactive(createEditableProfile());
const defaultAvatar = DEFAULT_USER_AVATAR;
let coupleLoadTicket = 0;

const genderOptions = [
	{ label: "男", value: 0 },
	{ label: "女", value: 1 },
];

const userTypeOptions = [
	{ label: "饲养员", value: 0 },
	{ label: "吃货", value: 1 },
];

const rules = {
	nickName: [{ required: true, message: "请输入用户名", trigger: ["blur"] }],
};

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["close"]);
const isBound = computed(() => !!userStore.profile.binding);
const isActionBusy = computed(() => saving.value || avatarUploading.value || unbinding.value);
const currentRoleText = computed(() => getRoleText(userInfo.userType));
const partnerProfile = computed(() => resolvePartnerProfile());

watch(
	() => props.show,
	(show) => {
		if (show) {
			resetForm();
			loadBoundUser();
		}
	},
);

/**
 * @description: 关闭弹窗事件
 * @return {void}
 */
const handleClose = () => {
	if (isActionBusy.value) return;
	resetForm();
	emit("close");
};

function createEditableProfile(profile = userStore.profile) {
	return {
		avatar: normalizeMediaUrl(profile.avatar || ""),
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

async function loadBoundUser() {
	const ticket = ++coupleLoadTicket;
	coupleInfo.value = null;
	if (!isBound.value) return;

	partnerLoading.value = true;
	try {
		const res = await getActiveCouple();
		if (res?.code !== 200) {
			throw new Error(res?.message || "绑定信息加载失败");
		}
		if (ticket === coupleLoadTicket) {
			coupleInfo.value = res.data || null;
		}
	} catch (error) {
		console.warn("[my] load bound user failed", error);
		if (ticket === coupleLoadTicket) {
			coupleInfo.value = null;
		}
		uni.showToast({
			title: error.message || "绑定信息加载失败",
			icon: "none",
		});
	} finally {
		if (ticket === coupleLoadTicket) {
			partnerLoading.value = false;
		}
	}
}

const handleAvatarClick = () => {
	if (isActionBusy.value) return;
	// #ifndef MP-WEIXIN
	chooseLocalAvatar();
	// #endif
};

const handleChooseWechatAvatar = (event) => {
	if (isActionBusy.value) return;
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
		userInfo.avatar = normalizeMediaUrl(avatarUrl);
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
 * @return {Promise<void>}
 */
const handleSave = async () => {
	if (isActionBusy.value) return;
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
			avatar: normalizeMediaUrl(userInfo.avatar),
			nickName,
			gender: userInfo.gender,
			...(isBound.value ? {} : { userType: userInfo.userType }),
		};
		const result = await updateUserProfile(payload);
		if (result?.code !== 200) {
			throw new Error(result?.message || "保存失败");
		}
		userStore.setProfile(normalizeProfile(result?.data, payload));
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

function handleUnbindClick() {
	if (isActionBusy.value) return;
	const partnerName = partnerProfile.value?.nickName || "对方";
	uni.showModal({
		title: "确认解除绑定？",
		content: `解除后，你和${partnerName}的情侣关系会清空，双方需要重新邀请才能再次绑定。`,
		confirmText: "解除绑定",
		cancelText: "再想想",
		confirmColor: COLOURS["theme-color"],
		success: (res) => {
			if (res.confirm) {
				handleUnbindConfirm();
			}
		},
	});
}

async function handleUnbindConfirm() {
	if (unbinding.value) return;
	unbinding.value = true;
	try {
		const res = await unbindCouple();
		if (res?.code !== 200) {
			throw new Error(res?.message || "解除绑定失败");
		}
		await refreshUserProfileAfterUnbind();
		coupleInfo.value = null;
		resetForm();
		uni.showToast({
			title: "已解除绑定",
			icon: "success",
		});
	} catch (error) {
		uni.showToast({
			title: error.message || "解除绑定失败",
			icon: "none",
		});
	} finally {
		unbinding.value = false;
	}
}

async function refreshUserProfileAfterUnbind() {
	try {
		const profileRes = await getUserProfile();
		if (profileRes?.code === 200 && profileRes?.data) {
			userStore.setProfile(profileRes.data);
			return;
		}
		throw new Error(profileRes?.message || "刷新用户资料失败");
	} catch (error) {
		console.warn("[my] refresh profile after unbind failed", error);
		userStore.setProfile({
			...userStore.profile,
			binding: false,
		});
	}
}

function resolvePartnerProfile() {
	if (!coupleInfo.value) return null;
	const feeder = coupleInfo.value.feeder;
	const foodie = coupleInfo.value.foodie;
	const currentProfile = userStore.profile || {};

	if (isSameUser(feeder, currentProfile)) {
		return normalizePartner(foodie, 1);
	}
	if (isSameUser(foodie, currentProfile)) {
		return normalizePartner(feeder, 0);
	}

	return userInfo.userType === 0 ? normalizePartner(foodie, 1) : normalizePartner(feeder, 0);
}

function isSameUser(candidate = {}, currentProfile = {}) {
	const candidateId = normalizeIdentity(candidate.id);
	const currentId = normalizeIdentity(currentProfile.id);
	const candidateUuid = normalizeIdentity(candidate.uuid || candidate.uuId);
	const currentUuid = normalizeIdentity(currentProfile.uuid || currentProfile.uuId);

	return (!!candidateId && candidateId === currentId) || (!!candidateUuid && candidateUuid === currentUuid);
}

function normalizeIdentity(value) {
	return value === undefined || value === null ? "" : String(value);
}

function normalizePartner(user, fallbackRole) {
	if (!user) return null;
	const role = normalizeOptionValue(user.userType, fallbackRole);
	return {
		avatar: normalizeMediaUrl(user.avatar || ""),
		nickName: user.nickName || user.nickname || DEFAULT_USER_NICK_NAME,
		uuid: user.uuid || user.uuId || "",
		genderText: getGenderText(user.gender),
		roleText: getRoleText(role),
	};
}

function getGenderText(gender) {
	const genderValue = Number(gender);
	if (genderValue === 0) return "男";
	if (genderValue === 1) return "女";
	return "未设置";
}

function getRoleText(userType) {
	const typeValue = Number(userType);
	if (typeValue === 0) return "饲养员";
	if (typeValue === 1) return "吃货";
	return "未设置";
}

function resolveAvatarUrl(result = {}) {
	const data = result.data || result;
	return normalizeMediaUrl(data.url || data.path || data.avatar || data.imageUrl || "");
}

function normalizeProfile(result = {}, fallback = {}) {
	const data = result || {};
	const source = data.profile || data.user || data;
	return {
		...userStore.profile,
		...fallback,
		...source,
		avatar: withDefaultMediaUrl(source.avatar || fallback.avatar, userStore.profile.avatar || DEFAULT_USER_AVATAR),
		uuid: source.uuid || source.uuId || userStore.profile.uuid,
		phone: source.phone ?? userStore.profile.phone,
		binding: source.binding ?? userStore.profile.binding,
		createTime: source.createTime ?? userStore.profile.createTime,
	};
}
</script>

<style scoped lang="scss">
.profile-panel {
	width: 650rpx;
	max-width: calc(100vw - 48rpx);
	box-sizing: border-box;
	overflow: hidden;
	border: 1rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 20rpx;
	background:
		linear-gradient(180deg, #fff8fa 0%, #ffffff 45%, #fff8f2 100%),
		#ffffff;
	box-shadow: 0 24rpx 64rpx rgba(45, 35, 38, 0.18);
}

.panel-head {
	align-items: flex-start;
	justify-content: space-between;
	padding: 30rpx 30rpx 22rpx;
	border-bottom: 1rpx solid rgba(255, 92, 141, 0.08);
}

.panel-title-wrap {
	min-width: 0;
	padding-right: 20rpx;
}

.panel-title {
	color: #202124;
	font-size: 20px;
	font-weight: 800;
	line-height: 1.2;
}

.panel-subtitle {
	margin-top: 8rpx;
	color: #777a82;
	font-size: 13px;
	font-weight: 600;
	line-height: 1.35;
}

.panel-close {
	flex-shrink: 0;
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: #fff2f6;
}

.profile-scroll {
	height: 62vh;
	max-height: 760rpx;
	box-sizing: border-box;
	padding: 22rpx 26rpx 10rpx;
}

.profile-section {
	box-sizing: border-box;
	padding: 24rpx;
	margin-bottom: 22rpx;
	border: 1rpx solid #eef0f4;
	border-radius: 18rpx;
	background: rgba(255, 255, 255, 0.96);
}

.section-head {
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.section-title {
	color: #202124;
	font-size: 17px;
	font-weight: 800;
	line-height: 1.25;
}

.section-desc {
	margin-top: 6rpx;
	color: #909399;
	font-size: 12px;
	font-weight: 600;
	line-height: 1.35;
}

.section-badge {
	flex-shrink: 0;
	padding: 8rpx 14rpx;
	border-radius: 999rpx;
	background: #fff2f6;
	color: $theme-color;
	font-size: 12px;
	font-weight: 700;
	line-height: 1;
}

.section-badge--warm {
	background: #fff4e8;
	color: #c97428;
}

.avatar-picker {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	margin: 0;
	padding: 4rpx 0 0;
	line-height: 1.2;
	background: transparent;
	border: 0;

	&::after {
		border: 0;
	}
}

.avatar-shell {
	width: 172rpx;
	height: 172rpx;
	margin: 0 auto;
	border-radius: 50%;
	background: linear-gradient(180deg, #fff1f6, #ffffff);
	box-shadow: 0 14rpx 30rpx rgba(255, 92, 141, 0.12);
}

.change-avatar {
	margin-top: 16rpx;
	color: $theme-color;
	font-size: 14px;
	font-weight: 700;
}

.field-shell {
	box-sizing: border-box;
	width: 100%;
	min-height: 78rpx;
	padding: 0 20rpx;
	border: 1rpx solid #eef0f4;
	border-radius: 14rpx;
	background: #fbfbfc;
}

.option-shell {
	box-sizing: border-box;
	width: 100%;
	padding: 4rpx 0;
}

.readonly-role {
	justify-content: flex-start;
	align-items: center;
	width: 100%;
	box-sizing: border-box;
	padding: 18rpx;
	border-radius: 16rpx;
	background: #fbfbfc;
}

.role-icon {
	flex-shrink: 0;
	width: 58rpx;
	height: 58rpx;
	margin-right: 16rpx;
	border-radius: 18rpx;
	background: linear-gradient(135deg, #ff7aa7, #ff5c8d);
}

.readonly-role-title {
	color: #303133;
	font-size: 15px;
	font-weight: 800;
	line-height: 1.2;
}

.readonly-role-desc {
	margin-top: 6rpx;
	color: #909399;
	font-size: 12px;
	font-weight: 600;
	line-height: 1.35;
}

.relation-section {
	background:
		linear-gradient(180deg, rgba(255, 248, 250, 0.9), rgba(255, 255, 255, 0.96)),
		#ffffff;
}

.partner-loading,
.partner-empty {
	min-height: 128rpx;
	box-sizing: border-box;
	border: 1rpx dashed rgba(255, 92, 141, 0.2);
	border-radius: 16rpx;
	background: #fff8fa;
	color: #909399;
	font-size: 14px;
	font-weight: 600;
	text-align: center;
}

.partner-empty {
	padding: 44rpx 24rpx;
	line-height: 1.5;
}

.partner-card {
	box-sizing: border-box;
	padding: 20rpx;
	border-radius: 18rpx;
	background: #fbfbfc;
}

.partner-main {
	justify-content: flex-start;
}

.partner-info {
	min-width: 0;
	margin-left: 18rpx;
}

.partner-name {
	overflow: hidden;
	color: #202124;
	font-size: 17px;
	font-weight: 800;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.partner-id {
	margin-top: 8rpx;
	overflow: hidden;
	color: #909399;
	font-size: 12px;
	font-weight: 600;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.partner-tags {
	justify-content: flex-start;
	margin-top: 18rpx;
}

.partner-tag {
	min-width: 72rpx;
	box-sizing: border-box;
	padding: 8rpx 18rpx;
	border-radius: 999rpx;
	background: #ffffff;
	color: #707070;
	font-size: 13px;
	font-weight: 700;
	text-align: center;
}

.partner-tag--role {
	margin-left: 12rpx;
	background: $theme-color;
	color: #ffffff;
}

.panel-actions {
	padding: 18rpx 30rpx calc(22rpx + env(safe-area-inset-bottom));
	border-top: 1rpx solid rgba(255, 92, 141, 0.08);
	background: rgba(255, 255, 255, 0.96);
}

.unbind-btn {
	width: 100%;
	height: 72rpx;
	margin-bottom: 16rpx;
	border-radius: 999rpx;
	background: #fff3f0;
	color: #d75f42;
	font-size: 14px;
	font-weight: 800;
}

.action-row {
	width: 100%;
}

.cancel-btn,
.save-btn {
	height: 78rpx;
	box-sizing: border-box;
	border-radius: 999rpx;
	font-size: 15px;
	font-weight: 800;
}

.cancel-btn {
	flex-shrink: 0;
	width: 188rpx;
	background: #f3f4f6;
	color: #60636b;
}

.save-btn {
	flex: 1;
	margin-left: 18rpx;
	background: linear-gradient(135deg, #ff6f9f, #ff5c8d);
	color: #ffffff;
	box-shadow: 0 12rpx 26rpx rgba(255, 92, 141, 0.2);
}

.disabled {
	opacity: 0.56;
}

:deep(.u-form-item__body) {
	padding: 18rpx 0;
}

:deep(.u-form-item__body__left__content__label) {
	color: #303133;
	font-size: 15px;
	font-weight: 800;
}

:deep(.u-form-item__body__right__content__slot) {
	justify-content: center;
}

:deep(.u-input) {
	min-height: 76rpx;
}

:deep(.u-input__content__field-wrapper__field) {
	color: #303133;
	font-size: 15px;
	font-weight: 600;
}

:deep(.u-radio) {
	margin-right: 34rpx;
}

:deep(.u-radio__text) {
	color: #303133;
	font-size: 15px;
	font-weight: 700;
}
</style>
