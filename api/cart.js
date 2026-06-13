/*
 * @Author: elk
 * @Date: 2026-06-13
 * @FilePath: /hkt-applet/api/cart.js
 * @Description: 购物车相关 API 封装
 */

import { http } from '@/utils/request.js'

// ===================== 购物车管理 =====================

/**
 * 获取购物车列表
 * @returns {Promise<{ code: number, data: Array<Object>, message: string }>}
 * @description 返回当前用户的购物车项列表，包含菜谱信息和数量
 */
export function getCartList() {
  return http.get('/cart')
}

/**
 * 添加菜谱到购物车
 * @param {Object} data - 购物车数据
 * @param {number|string} data.recipeId - 菜谱 ID
 * @param {number} [data.quantity=1] - 数量
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function addToCart(data) {
  return http.post('/cart', data)
}

/**
 * 更新购物车项数量
 * @param {number|string} id - 购物车项 ID
 * @param {number} quantity - 新数量
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function updateCartItem(id, quantity) {
  return http.patch(`/cart/${id}`, { quantity })
}

/**
 * 删除购物车项
 * @param {number|string} id - 购物车项 ID
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function removeCartItem(id) {
  return http.del(`/cart/${id}`)
}

/**
 * 清空购物车
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 * @description 删除当前用户的所有购物车项
 */
export function clearCart() {
  return http.del('/cart')
}
