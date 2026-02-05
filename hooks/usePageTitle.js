/*
 * @Author: elk
 * @Date: 2026-01-06 16:26:41
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-05 18:29:28
 * @FilePath: /hkt-applet/hooks/usePageTitle.js
 * @Description: 控制页面标题的hook函数
 */
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

/**
 * @description: 控制页面标题的hook函数
 * @param {*} defaultTitle
 * @return {*}
 */
export function usePageTitle(defaultTitle = "默认标题") {
	onLoad((options) => {
		const title = options.title || defaultTitle;
		uni.setNavigationBarTitle({
			title,
		});
	});
}
/**
 * @description: 控制页面参数的hook函数
 * @return {*}
 */
export function usePageParams() {
	let params = ref({});
	onLoad((options) => {
		params.value = { ...options };
	});
	return params;
}
