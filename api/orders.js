/*
 * @Author: elk
 * @Date: 2026-06-13
 * @FilePath: /hkt-applet/api/orders.js
 * @Description: 订单相关 API 封装
 */

import { http } from '@/utils/request.js'

// ===================== 订单管理 =====================

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} [params.sort] - 1=吃货视角, 0=饲养员视角
 * @param {number} [params.status] - 订单状态筛选
 * @param {string} [params.date] - 日期筛选 YYYY-MM-DD
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function getOrderList(params) {
  return http.get('/orders', params)
}

/**
 * 获取订单详情
 * @param {number|string} id - 订单 ID
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function getOrderDetail(id) {
  return http.get(`/orders/${id}`)
}

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @param {Array<Object>} [data.cartList] - 购物车列表（可选，不传则使用后端购物车所有项）
 * @param {string} data.cartList[].id - 菜谱 ID
 * @param {number} [data.cartList[].quantity] - 数量
 * @param {string} [data.dineWay] - 就餐方式: 'immediate'/'立即就餐' 或 'reservation'/'预约就餐'
 * @param {string} [data.reservationDate] - 预约日期 YYYY-MM-DD（预约就餐时必填）
 * @param {string} [data.reservationTime] - 预约时间 早餐/午餐/晚餐（预约就餐时必填）
 * @param {string} [data.remark] - 订单备注
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function createOrder(data) {
  return http.post('/orders', data)
}

/**
 * 更新订单状态
 * @param {number|string} id - 订单 ID
 * @param {number} status - 新状态
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function updateOrderStatus(id, status) {
  return http.patch(`/orders/${id}/status`, { status })
}

/**
 * 再来一单：将历史订单菜品加入当前吃货购物车
 * @param {number|string} id - 订单 ID
 * @returns {Promise<{ code: number, data: Object, message: string }>}
 */
export function reorderOrder(id) {
  return http.post(`/orders/${id}/reorder`)
}
