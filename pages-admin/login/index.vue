<!--
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/pages-admin/login/index.vue
 * @Description: 管理端登录（仅 H5）
-->
<template>
	<view class="admin-page">
		<view class="login-box">
			<view class="login-logo">
				<up-icon name="lock-fill" size="26px" color="#ffffff"></up-icon>
			</view>
			<view class="login-title">HKT 运营后台</view>
			<view class="login-sub">同工程条件编译产出的 H5<br />不上架微信，用户端安装包内不含此代码</view>

			<view class="login-form">
				<input
					v-model.trim="form.username"
					class="login-input"
					type="text"
					placeholder="管理员账号"
					placeholder-class="login-placeholder"
					:disabled="submitting"
					@confirm="handleLogin"
				/>
				<input
					v-model.trim="form.password"
					class="login-input"
					password
					placeholder="密码"
					placeholder-class="login-placeholder"
					:disabled="submitting"
					@confirm="handleLogin"
				/>
				<button class="login-btn" :disabled="!canSubmit" @click="handleLogin">
					{{ submitting ? "登录中…" : "登录" }}
				</button>
			</view>

			<view class="login-foot">仅限内部使用 · 所有写操作记入 AdminOperationLog</view>
		</view>
	</view>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { adminLogin, getAdminProfileRemote, getAdminToken } from "@/apis/admin/index.js";

/** 与后端 AdminLoginDto 的 MinLength 保持一致，避免把注定 400 的请求发出去 */
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

const FEEDBACK_LIST_PAGE = "/pages-admin/feedback/list";

const form = reactive({
	username: "",
	password: "",
});
const submitting = ref(false);

const canSubmit = computed(
	() =>
		!submitting.value &&
		form.username.length >= MIN_USERNAME_LENGTH &&
		form.password.length >= MIN_PASSWORD_LENGTH,
);

// 带着有效会话回到登录页时直接进后台，省掉一次重复登录
onLoad(() => {
	restoreSession();
});

/**
 * 校验本地 token 是否仍然有效。
 * @description 只信服务端的判断：token 存在不等于没过期，也不等于账号没被停用。
 * 失效时静默留在登录页 —— 请求封装已经清过本地态。
 * @return {Promise<void>}
 */
async function restoreSession() {
	if (!getAdminToken()) return;
	try {
		await getAdminProfileRemote();
		uni.reLaunch({ url: FEEDBACK_LIST_PAGE });
	} catch (error) {
		console.warn("[admin] restore session failed", error);
	}
}

/**
 * @description: 提交登录
 * @return {Promise<void>}
 */
async function handleLogin() {
	if (!canSubmit.value) return;
	submitting.value = true;
	try {
		await adminLogin({ username: form.username, password: form.password });
		uni.reLaunch({ url: FEEDBACK_LIST_PAGE });
	} catch (error) {
		// 后端对账号不存在/停用/密码错误统一返回「账号或密码错误」，原样透传即可
		uni.showToast({
			title: error?.message || "登录失败",
			icon: "none",
		});
	} finally {
		submitting.value = false;
	}
}
</script>

<style lang="scss" scoped>
/* 管理端跑在桌面浏览器上，rpx 会按视口宽度换算导致字号失控，因此统一用 px */
.admin-page {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 24px 16px;
	box-sizing: border-box;
	background: linear-gradient(180deg, #fff0f6 0, #fdf8f9 240px, #f7f7f8 100%);
}

.login-box {
	width: 100%;
	max-width: 360px;
	padding: 36px 26px 26px;
	border-radius: 20px;
	box-sizing: border-box;
	background: #ffffff;
	box-shadow: 0 12px 40px rgba(40, 40, 40, 0.08);
	text-align: center;
}

.login-logo {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56px;
	height: 56px;
	margin: 0 auto 16px;
	border-radius: 18px;
	background: linear-gradient(135deg, #ff7ba5 0, #ff5c8d 100%);
	box-shadow: 0 8px 20px rgba(255, 92, 141, 0.32);
}

.login-title {
	color: #303133;
	font-size: 20px;
	font-weight: 700;
}

.login-sub {
	margin-top: 8px;
	color: #9ba0aa;
	font-size: 12px;
	line-height: 1.8;
}

.login-form {
	margin-top: 26px;
}

.login-input {
	width: 100%;
	height: 44px;
	padding: 0 14px;
	margin-bottom: 12px;
	border: 1px solid #eef0f4;
	border-radius: 12px;
	box-sizing: border-box;
	background: #f8f9fb;
	color: #303133;
	font-size: 14px;
}

.login-placeholder {
	color: #c0c4cc;
	font-size: 14px;
}

.login-btn {
	width: 100%;
	height: 44px;
	margin-top: 4px;
	border: none;
	border-radius: 12px;
	background: linear-gradient(135deg, #ff7ba5 0, #ff5c8d 100%);
	color: #ffffff;
	font-size: 15px;
	font-weight: 600;
	line-height: 44px;

	&::after {
		border: none;
	}

	&[disabled] {
		background: #f0d5de;
		color: #ffffff;
	}
}

.login-foot {
	margin-top: 22px;
	color: #c0c4cc;
	font-size: 11px;
	line-height: 1.7;
}
</style>
