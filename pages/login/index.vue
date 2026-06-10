<!--
 * @Author: elk
 * @Date: 2026-06-05 00:00:00
 * @LastEditors: elk 
 * @LastEditTime: 2026-06-05 17:55:49
 * @FilePath: /hkt-applet/pages/login/index.vue
 * @Description: 登录页
-->
<template>
	<view class="login-container">
		<view class="login-top">
			<view class="brand-area">
				<view class="logo-frame">
					<image class="brand-logo" src="/static/logo.png" mode="aspectFit" />
				</view>
				<view class="brand-name">偏爱厨房</view>
				<view class="brand-desc">把家常饭，留给偏爱的人</view>
			</view>
		</view>

		<view class="login-panel">
			<button
				class="primary-login pubFlex"
				:class="{ disabled: !isAgreed || logging }"
				:disabled="logging"
				:loading="logging"
				hover-class="primary-login-hover"
				@click="handleWechatLogin"
			>
				<up-icon name="weixin-fill" color="#ffffff" size="22" />
				<text class="primary-login-text">微信授权登录</text>
			</button>

			<button class="other-login pubFlex" hover-class="other-login-hover" @click="openOtherLogin">
				<up-icon name="phone" :color="COLOURS['theme-color']" size="20" />
				<text class="other-login-text">其他手机号登录</text>
			</button>

			<view class="agreement pubFlex" @click="toggleAgreement">
				<view class="agreement-check pubFlex" :class="{ checked: isAgreed }">
					<up-icon v-if="isAgreed" name="checkbox-mark" color="#ffffff" size="14" />
				</view>
				<view class="agreement-text">
					我已阅读并同意
					<text class="agreement-link" @click.stop="openAgreement('user')">《用户协议》</text>
					和
					<text class="agreement-link" @click.stop="openAgreement('privacy')">《隐私政策》</text>
				</view>
			</view>
		</view>

		<view class="register-tip">未注册用户登录后将自动创建偏爱厨房账号</view>

		<view v-if="showOtherLogin" class="login-mask" @click="closeOtherLogin">
			<view class="phone-sheet" @click.stop>
				<view class="sheet-header pubFlex">
					<view>
						<view class="sheet-title">其他手机号登录</view>
						<view class="sheet-desc">验证码将发送至当前手机号</view>
					</view>
					<up-icon name="close" color="#999999" size="22" @click="closeOtherLogin" />
				</view>

				<view class="form-item pubFlex">
					<up-icon name="phone" color="#999999" size="20" />
					<input
						v-model="phone"
						class="form-input"
						type="number"
						maxlength="11"
						placeholder="请输入手机号"
						placeholder-class="form-placeholder"
					/>
				</view>

				<view class="form-item pubFlex">
					<up-icon name="email" color="#999999" size="20" />
					<input
						v-model="verifyCode"
						class="form-input"
						type="number"
						maxlength="6"
						placeholder="请输入验证码"
						placeholder-class="form-placeholder"
					/>
					<view class="code-btn" :class="{ disabled: codeSecond > 0 }" @click="sendCode">
						{{ codeSecond > 0 ? `${codeSecond}s` : "获取验证码" }}
					</view>
				</view>

				<button
					class="sheet-submit"
					:disabled="logging"
					:loading="logging"
					hover-class="sheet-submit-hover"
					@click="submitPhoneLogin"
				>
					登录
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { onUnmounted, ref } from "vue";
import { COLOURS } from "@/config/index.js";
import { login } from "@/apis/login.js";
import { completeLogin, redirectAfterLogin } from "@/utils/auth.js";
import { getWechatLoginCode, getWechatUserProfile } from "@/utils/wechatAuth.js";

const isAgreed = ref(false);
const showOtherLogin = ref(false);
const phone = ref("");
const verifyCode = ref("");
const codeSecond = ref(0);
const logging = ref(false);

let codeTimer = null;

/**
 * @description: 提示用户先勾选协议
 * @return {void}
 */
const showAgreementToast = () => {
	uni.showToast({
		title: "请先同意协议",
		icon: "none",
	});
};

/**
 * @description: 切换协议勾选状态
 * @return {void}
 */
const toggleAgreement = () => {
	isAgreed.value = !isAgreed.value;
};

/**
 * @description: 微信授权登录
 * @return {void}
 */
const handleWechatLogin = async () => {
	if (!isAgreed.value) {
		showAgreementToast();
		return;
	}

	if (logging.value) {
		return;
	}

	let loginCode = "";
	let wechatProfile = {};
	try {
		loginCode = await getWechatLoginCode();
		wechatProfile = await getWechatUserProfile();
	} catch (error) {
		uni.showToast({
			title: error.message || "微信登录失败",
			icon: "none",
		});
		return;
	}

	submitLogin({
		loginType: "WECHAT",
		loginCode,
		...wechatProfile,
	});
};

/**
 * @description: 打开其他手机号登录弹层
 * @return {void}
 */
const openOtherLogin = () => {
	if (!isAgreed.value) {
		showAgreementToast();
		return;
	}
	showOtherLogin.value = true;
};

/**
 * @description: 关闭其他手机号登录弹层
 * @return {void}
 */
const closeOtherLogin = () => {
	showOtherLogin.value = false;
};

/**
 * @description: 校验手机号格式
 * @return {boolean} 手机号是否合法
 */
const isValidPhone = () => /^1[3-9]\d{9}$/.test(phone.value);

/**
 * @description: 发送验证码并启动倒计时
 * @return {void}
 */
const sendCode = () => {
	if (codeSecond.value > 0) {
		return;
	}
	if (!isValidPhone()) {
		uni.showToast({
			title: "请输入正确手机号",
			icon: "none",
		});
		return;
	}

	// 当前项目暂无短信接口，先保留前端倒计时交互。
	codeSecond.value = 60;
	codeTimer = setInterval(() => {
		codeSecond.value -= 1;
		if (codeSecond.value <= 0) {
			clearInterval(codeTimer);
			codeTimer = null;
		}
	}, 1000);

	uni.showToast({
		title: "验证码已发送",
		icon: "none",
	});
};

/**
 * @description: 提交其他手机号验证码登录
 * @return {void}
 */
const submitPhoneLogin = () => {
	uni.showToast({
		title: "验证码登录暂未开放，请使用微信授权登录",
		icon: "none",
	});
};

/**
 * @description: 打开协议或隐私政策
 * @param {string} type 协议类型
 * @return {void}
 */
const openAgreement = (type) => {
	uni.showToast({
		title: type === "privacy" ? "隐私政策" : "用户协议",
		icon: "none",
	});
};

/**
 * @description: 提交登录请求，写入登录态并回跳原目标页
 * @param {Object} data 登录参数
 * @return {Promise<void>}
 */
const submitLogin = async (data) => {
	if (logging.value) {
		return;
	}

	logging.value = true;
	try {
		// 1. 调用登录接口，登录接口本身不需要携带 token。
		const result = await login(data);
		if (result.code && result.code !== 200) {
			throw new Error(result.message || "登录失败");
		}

		// 2. 从兼容格式中解析 token 和用户资料。
		const { token, profile } = resolveLoginResult(result);

		if (!token) {
			uni.showToast({
				title: "登录接口未返回token",
				icon: "none",
			});
			return;
		}

		// 3. 写入登录态，关闭弹层并提示用户。
		completeLogin(token, profile);
		closeOtherLogin();
		uni.showToast({
			title: "登录成功",
			icon: "success",
		});

		// 4. 等成功提示展示后，回到用户原本要进入的页面。
		setTimeout(() => {
			redirectAfterLogin();
		}, 500);
	} catch (error) {
		uni.showToast({
			title: error.message || "登录失败",
			icon: "none",
		});
	} finally {
		logging.value = false;
	}
};

/**
 * @description: 从登录接口响应中解析 token 和用户资料
 * @param {Object} result 登录接口响应
 * @return {{token: string, profile: Object|null}} 登录结果
 */
const resolveLoginResult = (result = {}) => {
	const data = result.data || result;
	return {
		token: data.token || data.accessToken || data.user?.token || "",
		profile: data.profile || data.user || null,
	};
};

onUnmounted(() => {
	if (codeTimer) {
		clearInterval(codeTimer);
	}
});
</script>

<style lang="scss" scoped>
page {
	background-color: #fff8fa;
}

.login-container {
	position: relative;
	min-height: 100vh;
	box-sizing: border-box;
	overflow: hidden;
	padding-bottom: 120rpx;
	background: #fff9f7;
	color: #303133;
}

.login-top {
	position: relative;
	height: 580rpx;
	box-sizing: border-box;
	padding-left: 40rpx;
	padding-right: 40rpx;
	background: linear-gradient(180deg, #fff0f2 0%, #fff8f5 76%, #fff9f7 100%);
	border-bottom-left-radius: 56rpx;
	border-bottom-right-radius: 56rpx;
}

.login-top::after {
	content: "";
	position: absolute;
	left: 40rpx;
	right: 40rpx;
	bottom: 50rpx;
	height: 1rpx;
	background: linear-gradient(90deg, transparent, rgba(255, 92, 141, 0.28), transparent);
}

.brand-area {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 116rpx;
	text-align: center;
}

.logo-frame {
	width: 278rpx;
	height: 278rpx;
	padding: 10rpx;
	box-sizing: border-box;
	border: 1rpx solid rgba(255, 92, 141, 0.14);
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.86);
	box-shadow: 0 22rpx 48rpx rgba(181, 97, 80, 0.12);
}

.brand-logo {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.brand-name {
	margin-top: 28rpx;
	font-size: 46rpx;
	font-weight: 600;
	line-height: 1.3;
	color: #272727;
}

.brand-desc {
	margin-top: 10rpx;
	font-size: 28rpx;
	line-height: 1.5;
	color: $tinge-color;
}

.login-panel {
	position: relative;
	z-index: 2;
	box-sizing: border-box;
	width: calc(100% - 64rpx);
	margin: 20rpx auto 0;
	padding: 36rpx 16rpx 24rpx;
}

.primary-login,
.other-login,
.sheet-submit {
	width: 100%;
	height: 92rpx;
	margin: 0;
	padding: 0;
	border-radius: 46rpx;
	font-size: 30rpx;
	line-height: 92rpx;
}

.primary-login::after,
.other-login::after,
.sheet-submit::after {
	border: 0;
}

.primary-login {
	margin-top: 0;
	background: linear-gradient(135deg, #ff5c8d 0%, #ff8a96 100%);
	color: #ffffff;
	box-shadow: 0 14rpx 30rpx rgba(255, 92, 141, 0.22);
}

.primary-login.disabled {
	opacity: 0.55;
}

.primary-login-hover,
.sheet-submit-hover {
	opacity: 0.86;
}

.primary-login-text,
.other-login-text {
	margin-left: 12rpx;
}

.other-login {
	margin-top: 24rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.22);
	background: #fff8f6;
	color: $theme-color;
}

.other-login-hover {
	background: #fff0f1;
}

.agreement {
	justify-content: flex-start;
	align-items: flex-start;
	margin-top: 34rpx;
	font-size: 24rpx;
	line-height: 1.6;
	color: $tinge-color;
}

.agreement-check {
	flex-shrink: 0;
	width: 30rpx;
	height: 30rpx;
	margin-top: 5rpx;
	margin-right: 12rpx;
	box-sizing: border-box;
	border: 2rpx solid $gray-color;
	border-radius: 50%;
	background: #ffffff;
}

.agreement-check.checked {
	border-color: $theme-color;
	background: $theme-color;
}

.agreement-text {
	flex: 1;
}

.agreement-link {
	color: $theme-color;
}

.register-tip {
	position: fixed;
	left: 0;
	right: 0;
	bottom: calc(28rpx + env(safe-area-inset-bottom));
	z-index: 3;
	padding: 0 48rpx;
	text-align: center;
	font-size: 23rpx;
	line-height: 1.5;
	color: #aaa0a0;
}

.login-mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 20;
	display: flex;
	align-items: flex-end;
	background: rgba(0, 0, 0, 0.42);
}

.phone-sheet {
	width: 100%;
	box-sizing: border-box;
	padding: 38rpx 34rpx calc(44rpx + env(safe-area-inset-bottom));
	border-radius: 24rpx 24rpx 0 0;
	background: #ffffff;
}

.sheet-header {
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 34rpx;
}

.sheet-title {
	font-size: 34rpx;
	font-weight: 600;
	line-height: 1.4;
	color: #272727;
}

.sheet-desc {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: $tinge-color;
}

.form-item {
	justify-content: flex-start;
	height: 96rpx;
	box-sizing: border-box;
	padding: 0 24rpx;
	margin-top: 22rpx;
	border-radius: 12rpx;
	background: #f7f7f7;
}

.form-input {
	flex: 1;
	height: 96rpx;
	margin-left: 16rpx;
	font-size: 30rpx;
	color: #303133;
}

.form-placeholder {
	color: #b8b8b8;
}

.code-btn {
	flex-shrink: 0;
	min-width: 152rpx;
	text-align: right;
	font-size: 26rpx;
	color: $theme-color;
}

.code-btn.disabled {
	color: #b8b8b8;
}

.sheet-submit {
	margin-top: 36rpx;
	background: $theme-color;
	color: #ffffff;
}
</style>
