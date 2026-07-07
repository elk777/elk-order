/*
 * @Author: elk
 * @Date: 2026-06-13
 * @FilePath: /hkt-applet/api/recipes.js
 * @Description: 菜谱和分类相关 API 封装
 */

import { http } from '@/utils/request.js'
import { uploadToUpyun } from '@/utils/upyunUpload.js'

// ===================== 分类管理 =====================

/**
 * 获取分类列表
 * @returns {Promise<{ code: number, data: Array, message: string }>}
 */
export function getRecipeCategories() {
  return http.get('/recipes/categories')
}

/**
 * 创建分类
 * @param {Object} data - 分类数据
 * @param {string} data.name - 分类名称
 * @param {number} [data.sort] - 排序号
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function createRecipeCategory(data) {
  return http.post('/recipes/categories', data)
}

/**
 * 更新分类
 * @param {number|string} id - 分类 ID
 * @param {Object} data - 更新数据
 * @param {string} [data.name] - 分类名称
 * @param {number} [data.sort] - 排序号
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function updateRecipeCategory(id, data) {
  return http.patch(`/recipes/categories/${id}`, data)
}

/**
 * 删除分类
 * @param {number|string} id - 分类 ID
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function deleteRecipeCategory(id) {
  return http.del(`/recipes/categories/${id}`)
}

/**
 * 分类重新排序
 * @param {Array<Object>} items - 分类排序数组
 * @param {number|string} items[].id - 分类 ID
 * @param {number} items[].sort - 排序号
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function reorderRecipeCategories(items) {
  return http.patch('/recipes/categories/reorder', { items })
}

// ===================== 菜谱管理 =====================

/**
 * 获取菜谱列表
 * @param {Object} [params] - 查询参数
 * @param {string} [params.keyword] - 搜索关键词
 * @param {number|string} [params.categoryId] - 分类 ID
 * @returns {Promise<{ code: number, data: Array|Object, message: string }>}
 */
export function getRecipes(params = {}) {
  return http.get('/recipes', params)
}

/**
 * 获取分组后的菜谱列表（按分类分组）
 * @param {Object} [params] - 查询参数
 * @param {string} [params.keyword] - 搜索关键词
 * @param {number|string} [params.categoryId] - 分类 ID
 * @returns {Promise<{ code: number, data: Array<{ title: string, children: Array }>, message: string }>}
 */
export function getRecipesGrouped(params = {}) {
  return http.get('/recipes/grouped', params)
}

/**
 * 获取菜谱详情
 * @param {number|string} id - 菜谱 ID
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function getRecipeDetail(id) {
  return http.get(`/recipes/${id}`)
}

/**
 * 创建菜谱
 * @param {Object} data - 菜谱数据
 * @param {string} data.name - 菜谱名称
 * @param {number|string} data.categoryId - 分类 ID
 * @param {string} [data.coverImage] - 封面图片 URL
 * @param {string} [data.description] - 描述
 * @param {string} [data.cookTime] - 烹饪时长描述
 * @param {string} [data.difficulty] - 难度等级
 * @param {Array<Object>} [data.ingredients] - 食材清单
 * @param {Array<Object>} [data.steps] - 制作步骤
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function createRecipe(data) {
  return http.post('/recipes', data)
}

/**
 * 更新菜谱
 * @param {number|string} id - 菜谱 ID
 * @param {Object} data - 更新数据（参数同 createRecipe）
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function updateRecipe(id, data) {
  return http.patch(`/recipes/${id}`, data)
}

/**
 * 删除菜谱
 * @param {number|string} id - 菜谱 ID
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function deleteRecipe(id) {
  return http.del(`/recipes/${id}`)
}

/**
 * @description 生成 AI 菜谱草稿，供新增菜谱页回填可编辑文本字段。
 * @param {Object} data - 生成入参
 * @param {string} data.prompt - 用户输入的菜名、食材或口味描述
 * @param {Object} [opts] - 请求配置，支持 onTask/isCanceled 处理长耗时生成取消。
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function generateRecipeDraft(data, opts = {}) {
  return http.post('/recipe-assistant/drafts', data, opts)
}

// ===================== 图片上传 =====================

/**
 * 上传菜谱图片（封面或步骤图）
 * @param {string} filePath - 本地图片路径（uni.chooseImage 返回的临时路径）
 * @param {Function} [onProgress] - 上传进度回调
 * @returns {Promise<{ code: number, data: { url: string }, message: string }>}
 */
export function uploadRecipeImage(filePath, onProgress) {
  return uploadToUpyun({
    filePath,
    folder: 'recipes',
    mediaType: 'image',
    timeout: 30000,
    onProgress,
  })
}
