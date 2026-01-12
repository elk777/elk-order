/*
 * @Author: elk
 * @Date: 2026-01-09 16:47:07
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-12 14:24:39
 * @FilePath: /hkt-applet/pages/recipe/hook/useListOperations.js
 * @Description: 列表操作的自定义hooks
 */
import { ref } from "vue";
import { generateId } from "@/utils/tool.js";

/**
 * @description: 列表操作
 * @return {*}
 */
export const useListOperations = (initialList = [], defaultItem = {}) => {
  let list = ref([...initialList]);
  /**
   * @description: 添加项到列表
   * @param {*} item 要添加的项
   * @return {void}
   */
  const addItem = () => {
    let newItem = { id: generateId(), ...defaultItem };
    list.value.push(newItem);
    console.log("🚀 ~ addItem ~ list:", list)
    return newItem;
  };

  /**
   * @description: 从列表中删除项
   * @param {string} id 要删除项的id
   * @return {void}
   */
  const removeItem = (id) => {
    list.value = list.value.filter((item) => item.id !== id);
  };

  return {
    list,
    addItem,
    removeItem,
  };
};