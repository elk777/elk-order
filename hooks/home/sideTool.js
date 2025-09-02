/**
 * @Description: 首页-工具栏-皮肤按钮-打开遮罩层
 * @Author: elk
 * @Date: 2025-08-28 16:04:58
 * @LastEditors: 
 * @LastEditTime: 2025-08-28 16:04:58
 */
import {
	ref
} from "vue";
import {
	func
} from "../../uni_modules/uview-plus/libs/function/test";

/**
 * @description: 控制pop弹出框显示隐藏的hook函数
 * @param {:type} 
 * @return {:type} 
 */

// 将open提升到模块级别，所有组件共享这个响应式对象
let isOpen = ref(false)
export function useSkinPop() {
	const open = () => {
		isOpen.value = true;
	};
	const close = () => {
		isOpen.value = false;
	};
	return {
		isOpen,
		open,
		close
	}
}