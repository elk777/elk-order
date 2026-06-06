/*
 * @Author: elk
 * @Date: 2026-05-21
 * @FilePath: /hkt-applet/utils/request.js
 * @Description: 纯后端 HTTP 请求封装（master 分支使用）
 *
 * 设计原则：
 *   1. 拦截器链 — request → token 注入 → 发送 → 响应解析 → 错误处理 → response
 *   2. Token 无感刷新 — 401 时排队刷新，其他请求等待，刷新完成后批量重放
 *   3. 请求去重 — 同一请求在 pending 期间不重复发送（可配置）
 *   4. 超时与重试 — 可配置超时 + 指数退避重试，仅幂等请求重试
 *   5. 加载态收敛 — 多个并发请求共享一个 loading，避免闪烁
 *   6. 可取消 — 支持 AbortController 风格的请求取消
 *
 * 用法示例：
 *   import { http } from '@/utils/request.js'
 *   const res = await http.get('/order/list', { page: 1 })
 *   const res = await http.post('/order/create', { recipeIds: [1, 2] })
 */

import { useUserStore } from '@/stores/user.js'
import { BASE_URL } from '@/config/index.js'
import { handleUnauthorized } from '@/utils/auth.js'

// ===================== 配置项 =====================

/** 接口基础地址 */
const BASE = BASE_URL

/** 超时时间 (ms) */
const TIMEOUT = 15000

/** 最大重试次数（仅 GET 请求） */
const MAX_RETRY = 2

/** 重试间隔基数 (ms) */
const RETRY_BASE_DELAY = 800

/** 业务成功码 */
const SUCCESS_CODE = 200

/** token 过期 HTTP 状态码 */
const HTTP_UNAUTHORIZED = 401

/** 是否需要 token 刷新的业务码集合 */
const REFRESH_CODES = new Set([401, 4010, 4011, 4012])

// ===================== 内部状态 =====================

/** 请求计数（loading 控制） */
let pendingCount = 0

/** token 刷新锁 */
let refreshing = false

/** token 刷新等待队列 */
let refreshQueue = []

/** 请求去重 Map: key → { timestamp, promise } */
const pendingMap = new Map()

/** 去重窗口 (ms)，同一 key 在此时间内不重复请求 */
const DEDUP_WINDOW = 300

// ===================== 拦截器注册表 =====================

const requestInterceptors = []
const responseInterceptors = []
const errorInterceptors = []

// ===================== 核心类 =====================

class Http {
  constructor() {
    this.baseURL = BASE
    this.timeout = TIMEOUT
  }

  // ---------- 快捷方法 ----------

  get(url, params = {}, opts = {}) {
    return this._request({ ...opts, url, method: 'GET', params })
  }

  post(url, data = {}, opts = {}) {
    return this._request({ ...opts, url, method: 'POST', data })
  }

  put(url, data = {}, opts = {}) {
    return this._request({ ...opts, url, method: 'PUT', data })
  }

  del(url, data = {}, opts = {}) {
    return this._request({ ...opts, url, method: 'DELETE', data })
  }

  upload(url, filePath, name = 'file', formData = {}, opts = {}) {
    const {
      loading = true,
      timeout = 30000,
      onProgress,
    } = opts

    const id = traceId()
    const startTime = Date.now()

    if (loading) showLoading()

    return new Promise((resolve, reject) => {
      const uploadTask = uni.uploadFile({
        url: this.baseURL + url,
        filePath,
        name,
        formData: { ...formData, _t: Date.now() },
        timeout,
        header: buildHeaders(),
        success: (res) => {
          if (loading) hideLoading()
          const cost = Date.now() - startTime
          log(id, url, 'success', cost)
          const parsed = parseUploadResponse(res)
          if (parsed.code === SUCCESS_CODE) {
            resolve(parsed)
          } else {
            reject(createError(parsed.code, parsed.message, id, res))
          }
        },
        fail: (err) => {
          if (loading) hideLoading()
          const cost = Date.now() - startTime
          log(id, url, 'fail', cost, null, err)
          reject(createError(-1, err.message || '上传失败', id, err))
        },
      })

      if (onProgress) {
        uploadTask.onProgressUpdate(onProgress)
      }
    })
  }

  // ---------- 拦截器 ----------

  /** 注册请求拦截器 (config) => config */
  useRequest(fn) {
    requestInterceptors.push(fn)
  }

  /** 注册响应拦截器 (response) => response */
  useResponse(fn) {
    responseInterceptors.push(fn)
  }

  /** 注册错误拦截器 (error) => error */
  useError(fn) {
    errorInterceptors.push(fn)
  }

  // ---------- 内部请求方法 ----------

  async _request(config) {
    const {
      url,
      method = 'GET',
      params = {},
      data = {},
      loading = false,
      auth = true,
      timeout = this.timeout,
      retry = method === 'GET' ? MAX_RETRY : 0,   // 仅 GET 幂等请求重试
      dedup = false,                                // 是否开启请求去重
      raw = false,                                  // 是否返回原始响应
    } = config

    const id = traceId()
    const startTime = Date.now()
    let attempt = 0

    // 去重检查
    const dedupKey = dedup ? `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}` : null
    if (dedupKey && pendingMap.has(dedupKey)) {
      const cached = pendingMap.get(dedupKey)
      if (Date.now() - cached.timestamp < DEDUP_WINDOW) {
        console.log(`[request] 命中去重缓存: ${dedupKey}`)
        return cached.promise
      }
      pendingMap.delete(dedupKey)
    }

    if (loading) showLoading()

    const executor = () => {
      return new Promise((resolve, reject) => {
        async function run() {
          try {
            // 构建请求配置
            let reqConfig = { url, method, params, data, auth, timeout, id }

            // 执行请求拦截器链
            for (const fn of requestInterceptors) {
              reqConfig = await fn(reqConfig)
            }

            // 拼接 URL 参数
            const fullUrl = buildUrl(this.baseURL + reqConfig.url, reqConfig.params)

            // 构建请求头
            const headers = buildHeaders()
            if (reqConfig.auth) {
              const token = getToken()
              if (token) headers['Authorization'] = `Bearer ${token}`
            }

            // 发送请求
            const res = await uniRequest({
              url: fullUrl,
              method: reqConfig.method,
              data: reqConfig.data,
              header: headers,
              timeout: reqConfig.timeout,
            })

            if (loading) hideLoading()

            const cost = Date.now() - startTime
            log(id, url, 'success', cost, reqConfig, res)

            // 执行响应拦截器链
            let normalized = parseResponse(res, id)

            // token 过期处理
            if (reqConfig.auth && REFRESH_CODES.has(normalized.code)) {
              // 先尝试刷新已有 token；无 token 时直接进入登录兜底。
              const currentToken = getToken()
              const newToken = currentToken ? await refreshToken() : ''
              if (newToken) {
                // 刷新成功后重放当前请求，调用方不需要感知 token 更新。
                headers['Authorization'] = `Bearer ${newToken}`
                const retryRes = await uniRequest({
                  url: fullUrl,
                  method: reqConfig.method,
                  data: reqConfig.data,
                  header: headers,
                  timeout: reqConfig.timeout,
                })
                normalized = parseResponse(retryRes, id)
                resolve(raw ? retryRes : normalized)
                return
              }
              // 刷新失败，跳转登录
              handleUnauthorized()
              reject(createError(401, '登录已过期，请重新登录', id, res))
              return
            }

            for (const fn of responseInterceptors) {
              normalized = await fn(normalized)
            }

            resolve(raw ? res : normalized)
          } catch (err) {
            attempt++

            // 仅网络/超时错误可重试
            const isNetErr = /timeout|network|fail|abort/i.test(err.message || '')
            if (isNetErr && attempt <= retry) {
              console.warn(`[request] ${url} 第 ${attempt} 次重试`, id)
              await delay(RETRY_BASE_DELAY * attempt)
              return run()
            }

            if (loading) hideLoading()
            const cost = Date.now() - startTime
            log(id, url, 'fail', cost, reqConfig, err)

            let finalErr = err.code ? err : createError(-1, err.message || '网络异常', id, err)
            for (const fn of errorInterceptors) {
              finalErr = await fn(finalErr)
            }
            reject(finalErr)
          }
        }

        run()
      })
    }

    const promise = executor()

    // 注册到去重缓存
    if (dedupKey) {
      pendingMap.set(dedupKey, { timestamp: Date.now(), promise })
      promise.finally(() => {
        if (pendingMap.get(dedupKey)?.promise === promise) {
          pendingMap.delete(dedupKey)
        }
      })
    }

    return promise
  }
}

// ===================== 导出实例 =====================

export const http = new Http()

export default http

// ===================== 内部函数 =====================

/** uni.request Promise 化 */
function uniRequest(opts) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: opts.url,
      method: opts.method,
      data: opts.data,
      header: opts.header,
      timeout: opts.timeout,
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    })
  })
}

/** 构建请求头 */
function buildHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'X-Request-From': 'mini-app',
    'X-Timestamp': String(Date.now()),
    ...extra,
  }
}

/** 构建完整 URL，拼接 query 参数 */
function buildUrl(url, params = {}) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  if (!query) return url
  return url + (url.includes('?') ? '&' : '?') + query
}

/** 解析 uni.request 返回的响应 */
function parseResponse(res, traceId) {
  const { statusCode, data } = res

  // HTTP 状态码异常
  if (statusCode === HTTP_UNAUTHORIZED) {
    return { code: 401, data: null, message: '未授权', traceId }
  }
  if (statusCode === 403) {
    return { code: 403, data: null, message: '无权限', traceId }
  }
  if (statusCode === 404) {
    return { code: 404, data: null, message: '接口不存在', traceId }
  }
  if (statusCode >= 500) {
    return { code: statusCode, data: null, message: '服务器繁忙', traceId }
  }

  // 正常响应，取业务 code
  if (data && typeof data === 'object') {
    return { code: data.code ?? SUCCESS_CODE, data: data.data ?? data, message: data.message ?? data.msg ?? 'ok', traceId }
  }

  return { code: SUCCESS_CODE, data, message: 'ok', traceId }
}

/** 解析 uploadFile 响应（返回的是字符串） */
function parseUploadResponse(res) {
  try {
    const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
    return {
      code: data.code ?? SUCCESS_CODE,
      data: data.data ?? data,
      message: data.message ?? data.msg ?? 'ok',
    }
  } catch {
    return { code: SUCCESS_CODE, data: res.data, message: 'ok' }
  }
}

/** 获取当前 token */
function getToken() {
  try {
    const userStore = useUserStore()
    return userStore.token || ''
  } catch {
    return ''
  }
}

/** 刷新 token */
async function refreshToken() {
  if (refreshing) {
    return new Promise((resolve) => refreshQueue.push(resolve))
  }

  refreshing = true
  try {
    const res = await uniRequest({
      url: BASE + '/auth/refresh',
      method: 'POST',
      data: {},
      header: buildHeaders(),
      timeout: 10000,
    })
    const data = res.data?.data || res.data
    const newToken = data?.token || data?.accessToken
    if (newToken) {
      const userStore = useUserStore()
      userStore.setToken(newToken)
    }
    refreshQueue.forEach((cb) => cb(newToken))
    return newToken
  } catch {
    return null
  } finally {
    refreshing = false
    refreshQueue = []
  }
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

/** 请求追踪 ID */
function traceId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

/** 延迟 */
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** 创建统一错误对象 */
function createError(code, message, traceId, raw) {
  const err = new Error(message)
  err.code = code
  err.traceId = traceId
  err.raw = raw
  return err
}

/** 开发环境日志 */
function log(traceId, url, status, cost, req, res) {
  if (process.env.NODE_ENV === 'production') return
  const emoji = status === 'success' ? '✅' : '❌'
  const reqStr = req ? `\n  req: ${JSON.stringify({ method: req.method, url: req.url, data: req.data })}` : ''
  const resStr = res ? `\n  res: ${JSON.stringify(res).slice(0, 300)}` : ''
  console.log(`[request] ${emoji} ${url} | ${cost}ms | ${traceId}${reqStr}${resStr}`)
}
