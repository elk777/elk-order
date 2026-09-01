/*
 * @Author: elk
 * @Date: 2026-08-31
 * @FilePath: /hkt-applet/apis/admin/constants.js
 * @Description: 管理端专属常量
 *
 * 【为什么不并入 config/index.js】config 会被小程序端整体打包，
 * 而这些常量只有 H5 管理端用得上。放在 apis/admin/ 下，配合 pages.json 的
 * #ifdef H5 条件编译，小程序产物里不会出现任何管理端代码与文案。
 */

/** 管理端 token 存储键。刻意与用户端的 token 分开，两套鉴权互不影响 */
export const ADMIN_TOKEN_KEY = 'ADMIN_TOKEN'

/**
 * 开发环境下管理端的接口地址。
 * 【为什么不复用用户端 BASE_URL】后台调试几乎总是连本地后端，而小程序端往往还挂在
 * 测试环境上；共用一个地址意味着为了调后台得把小程序也切到本地，验证完再切回去。
 * 两端分开配置后互不牵制。
 * 留空则回退到 config/index.js 的 BASE_URL；生产环境不读此项，走同源 /api。
 */
export const ADMIN_DEV_BASE_URL = 'http://localhost:7788/api'

/** 管理端登录管理员信息存储键 */
export const ADMIN_PROFILE_KEY = 'ADMIN_PROFILE'

/** 管理端登录页路径，401 与登出后统一跳这里 */
export const ADMIN_LOGIN_PAGE = '/pages-admin/login/index'

/**
 * bug 类补偿档位。
 * level 是传给后端的唯一入参，points 仅用于界面预览 ——
 * 实际金额由后端 resolveFeedbackReward 按工单类型推导，前端传金额不会被采纳。
 * 两端档位定义须同步：后端见 src/common/constants.ts 的 FEEDBACK_REWARD.bug。
 */
export const FEEDBACK_REWARD_LEVELS = [
	{ level: 'minor', points: 20, name: '轻微', desc: '文案错别字、样式偏移等展示问题' },
	{ level: 'major', points: 50, name: '影响使用', desc: '功能异常但有替代路径，可绕过' },
	{ level: 'critical', points: 100, name: '严重', desc: '数据错误、核心流程阻断、无法使用' },
]

/** 建议类固定补偿分值，与后端 FEEDBACK_REWARD.suggestion 对齐，仅用于界面预览 */
export const FEEDBACK_SUGGESTION_POINTS = 20

/** 驳回原因固定枚举。原因对用户可见，走枚举是为了让驳回文案口径一致 */
export const FEEDBACK_REJECT_REASONS = ['无法复现', '重复反馈', '非产品问题', '描述不清', '已知问题']

/** 历史获补偿次数超过该阈值时，详情页标黄预警，作为人工防刷的判断依据 */
export const REWARDED_COUNT_WARN_THRESHOLD = 2

/** 工单列表 tab：待处理传 status=0，已处理不传 status 由前端过滤终态 */
export const ADMIN_FEEDBACK_TAB = {
	PENDING: 0,
	HANDLED: 1,
}
