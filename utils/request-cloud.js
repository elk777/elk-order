/*
 * @Author: elk
 * @Date: 2026-05-21
 * @FilePath: /hkt-applet/utils/request-cloud.js
 * @Description: uniCloud 云函数请求封装（clound 分支使用）
 *
 * 设计原则：
 *   1. 统一入口 — 所有云函数调用经由此模块，便于切换后端方案时仅替换本文件
 *   2. 响应标准化 — 无论云函数返回何种结构，统一归一化为 { code, data, message }
 *   3. 错误分层 — 网络错误 / 业务错误 / 系统错误 分级处理，上游只需关注业务码
 *   4. 可观测性 — 请求追踪 ID + 耗时日志，便于联调排错
 *   5. 与 uni-id 无缝衔接 — 自动携带 token，token 过期时触发重新登录
 */

import { useUserStore } from '@/stores/user.js'

// ===================== 配置项 =====================

/** 超时时间 (ms)，uniCloud callFunction 默认 5000，此处适当放宽 */
const TIMEOUT = 15000

/** 最大重试次数（仅网络/超时错误触发） */
const MAX_RETRY = 2

/** 重试间隔基数 (ms)，实际延迟 = 基数 × 次数 */
const RETRY_BASE_DELAY = 800

/** 业务成功码 */
const SUCCESS_CODE = 200

/** token 过期 / 未登录的错误码集合（uni-id 规范） */
const UNAUTHORIZED_CODES = new Set([
  'uni-id-account-not-exists',
  'uni-id-token-expired',
  'uni-id-token-not-exist',
  'uni-id-check-token-failed',
  401,
])

// ===================== 内部状态 =====================

/** 当前正在进行的请求计数（用于全局 loading 控制） */
let pendingCount = 0

/** 是否正在刷新 token（防止并发刷新） */
let refreshing = false

/** 等待 token 刷新完成的请求队列 */
let refreshQueue = []

// ===================== 工具函数 =====================

/** 生成请求追踪 ID */
function traceId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

/** 延迟 */
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** 获取当前毫秒时间戳 */
function now() {
  return Date.now()
}

// ===================== 核心 =====================

/**
 * uniCloud 请求封装
 *
 * @param {string} name      - 云函数名称
 * @param {Object} [data={}] - 传递给云函数的参数
 * @param {Object} [opts]    - 可选配置
 * @param {boolean} [opts.loading=false]    - 是否显示全局 loading
 * @param {boolean} [opts.auth=true]        - 是否自动携带 uni-id token
 * @param {number} [opts.timeout=TIMEOUT]   - 超时时间
 * @param {number} [opts.retry=MAX_RETRY]   - 重试次数
 * @param {boolean} [opts.raw=false]        - 返回原始响应（跳过标准化）
 * @returns {Promise<{code: number, data: any, message: string, traceId: string}>}
 */
export function cloudRequest(name, data = {}, opts = {}) {
  const {
    loading = false,
    auth = true,
    timeout = TIMEOUT,
    retry = MAX_RETRY,
    raw = false,
  } = opts

  const id = traceId()
  const startTime = now()
  let attempt = 0

  if (loading) showLoading()

  return new Promise((resolve, reject) => {
    async function run() {
      try {
        const payload = { ...data }

        // 自动注入 uni-id token
        if (auth) {
          const userStore = useUserStore()
          if (userStore.token) {
            payload.uniIdToken = userStore.token
          }
        }

        const res = await callWithTimeout(name, payload, timeout)

        if (loading) hideLoading()

        const cost = now() - startTime
        log(id, name, 'success', cost, payload, res)

        // 检查 uni-id token 是否过期
        if (auth && isTokenExpired(res)) {
          const newToken = await refreshToken()
          if (newToken) {
            payload.uniIdToken = newToken
            const retryRes = await callWithTimeout(name, payload, timeout)
            resolve(raw ? retryRes : normalize(retryRes, id, name))
            return
          }
          // 刷新失败，跳转登录
          redirectLogin()
          reject(createError(401, '登录已过期，请重新登录', id, res))
          return
        }

        resolve(raw ? res : normalize(res, id, name))
      } catch (err) {
        attempt++
        const isNetErr = /timeout|network|fail/i.test(err.message || '')

        if (isNetErr && attempt <= retry) {
          console.warn(`[request-cloud] ${name} 第 ${attempt} 次重试`, id)
          await delay(RETRY_BASE_DELAY * attempt)
          return run()
        }

        if (loading) hideLoading()
        const cost = now() - startTime
        log(id, name, 'fail', cost, data, err)
        reject(createError(-1, err.message || '网络异常，请稍后重试', id, err))
      }
    }

    run()
  })
}

// ===================== 便捷方法 =====================

/** GET 语义（云函数内部自行判断 method） */
export function cloudGet(name, params = {}, opts = {}) {
  return cloudRequest(name, { ...params, _method: 'GET' }, opts)
}

/** POST 语义 */
export function cloudPost(name, data = {}, opts = {}) {
  return cloudRequest(name, { ...data, _method: 'POST' }, opts)
}

/** PUT 语义 */
export function cloudPut(name, data = {}, opts = {}) {
  return cloudRequest(name, { ...data, _method: 'PUT' }, opts)
}

/** DELETE 语义 */
export function cloudDelete(name, data = {}, opts = {}) {
  return cloudRequest(name, { ...data, _method: 'DELETE' }, opts)
}

/**
 * 上传文件（封装 uniCloud.uploadFile）
 * 注意：这是 uni-app 原生 API，非 callFunction
 */
export function cloudUpload(filePath, cloudPath, opts = {}) {
  const { loading = true, onProgress } = opts
  const id = traceId()
  const startTime = now()

  if (loading) showLoading()

  return new Promise((resolve, reject) => {
    uniCloud.uploadFile({
      filePath,
      cloudPath,
      onUploadProgress: onProgress
        ? (res) => onProgress(res)
        : undefined,
      success: (res) => {
        if (loading) hideLoading()
        log(id, 'uploadFile', 'success', now() - startTime)
        resolve(normalize(res, id, 'uploadFile'))
      },
      fail: (err) => {
        if (loading) hideLoading()
        log(id, 'uploadFile', 'fail', now() - startTime, null, err)
        reject(createError(-1, err.message || '上传失败', id, err))
      },
    })
  })
}

// ===================== 内部函数 =====================

/** 带超时的云函数调用 */
function callWithTimeout(name, data, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`云函数 ${name} 调用超时 (${timeout}ms)`))
    }, timeout)

    uniCloud.callFunction({
      name,
      data,
      success: (res) => {
        clearTimeout(timer)
        resolve(res)
      },
      fail: (err) => {
        clearTimeout(timer)
        reject(err)
      },
    })
  })
}

/** 统一响应格式 */
function normalize(res, traceId, cloudName) {
  // uniCloud.callFunction 返回结构: { result: { code, data, message } }
  const body = res.result || res

  if (body && typeof body.code !== 'undefined') {
    return { ...body, traceId }
  }

  // 兼容云函数未标准化返回的情况
  return {
    code: SUCCESS_CODE,
    data: body,
    message: 'ok',
    traceId,
  }
}

/** 判断 token 是否过期 */
function isTokenExpired(res) {
  const body = res.result || res
  const errCode = body?.code || body?.errCode || ''
  return UNAUTHORIZED_CODES.has(errCode)
}

/** 刷新 token */
async function refreshToken() {
  if (refreshing) {
    return new Promise((resolve) => refreshQueue.push(resolve))
  }

  refreshing = true
  try {
    // 调用 uni-id 内置的 refreshToken 机制
    // uniCloud 下 token 由 uni-id 自动维护在 uniCloud 上下文中
    // 此处为兜底：调用自定义云函数尝试刷新
    const res = await uniCloud.callFunction({
      name: 'uni-id-cf',
      data: { action: 'refreshToken' },
    })
    const newToken = res.result?.token || res.result?.data?.token
    if (newToken) {
      const userStore = useUserStore()
      userStore.setToken(newToken)
    }
    // 通知队列中等待的请求
    refreshQueue.forEach((cb) => cb(newToken))
    return newToken
  } catch {
    return null
  } finally {
    refreshing = false
    refreshQueue = []
  }
}

/** 跳转登录页 */
let loginRedirectTimer = null
function redirectLogin() {
  if (loginRedirectTimer) return
  loginRedirectTimer = setTimeout(() => {
    const userStore = useUserStore()
    userStore.setToken('')
    uni.reLaunch({ url: '/pages/home/index' })
    loginRedirectTimer = null
  }, 100)
}

/** 创建统一错误对象 */
function createError(code, message, traceId, raw) {
  const err = new Error(message)
  err.code = code
  err.traceId = traceId
  err.raw = raw
  return err
}

/** 全局 loading */
function showLoading() {
  if (pendingCount === 0) {
    uni.showLoading({ title: '加载中…', mask: true })
  }
  pendingCount++
}

function hideLoading() {
  if (pendingCount > 0) pendingCount--
  if (pendingCount === 0) uni.hideLoading()
}

/** 开发环境日志 */
function log(traceId, name, status, cost, req, res) {
  if (process.env.NODE_ENV === 'production') return
  const emoji = status === 'success' ? '✅' : '❌'
  console.log(
    `[request-cloud] ${emoji} ${name} | ${cost}ms | ${traceId}`,
    '\n  req:', JSON.stringify(req),
    '\n  res:', JSON.stringify(res)?.slice(0, 300),
  )
}
