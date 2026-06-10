/**
 * 微信小程序登录能力封装。
 * 页面只关心业务登录，微信 code 和用户资料采集统一收敛在这里。
 */

export function getWechatLoginCode() {
	return new Promise((resolve, reject) => {
		uni.login({
			provider: "weixin",
			success: (res) => {
				if (res.code) {
					resolve(res.code);
					return;
				}
				reject(new Error("微信登录凭证获取失败"));
			},
			fail: () => reject(new Error("微信登录凭证获取失败")),
		});
	});
}

export function getWechatUserProfile() {
	return new Promise((resolve) => {
		uni.getUserProfile({
			desc: "用于完善偏爱厨房账号资料",
			success: (res) => {
				resolve(normalizeWechatUserInfo(res.userInfo));
			},
			fail: () => {
				resolve({});
			},
		});
	});
}

function normalizeWechatUserInfo(userInfo = {}) {
	return {
		nickName: userInfo.nickName || "",
		avatar: userInfo.avatarUrl || "",
		gender: normalizeGender(userInfo.gender),
	};
}

function normalizeGender(gender) {
	if (gender === 1) return 0;
	if (gender === 2) return 1;
	return undefined;
}
