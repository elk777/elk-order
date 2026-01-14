import App from "./App";
// 引入pinia状态管理
import pinia from "@/stores";
// 引入uview-plas 组件库
import uviewPlus from "@/uni_modules/uview-plus";

// #ifndef VUE3
import Vue from "vue";
import "./uni.promisify.adaptor";
Vue.config.productionTip = false;
App.mpType = "app";
const app = new Vue({
	...App,
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from "vue";
export function createApp() {
	const app = createSSRApp(App);
	// 注入组件库
	app.use(uviewPlus, () => {
		return {
			options: {
				// 修改config对象的属性
				config: {
					customIcon: {
						family: "lovers-icon",
						url: "/static/iconfont/iconfont.ttf",
					},
					customIcons: {
						"cart": "\ue70b",
					},
				},
			},
		};
	});
	app.use(pinia);
	return {
		app,
	};
}
// #endif
