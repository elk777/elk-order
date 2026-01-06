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

/**
 * @description: 控制首页中心body的模式  mini 和 max
 * @param {:type}  isbody  true: 代表中心展示 false: 代表mini侧边展示
 * @return {:type} 
 */
let isBody = ref(true)
export function useBodyMode() {
	const cut = () => {
		isBody.value = !isBody.value;
	};
	return {
		isBody,
		cut,
	}
}