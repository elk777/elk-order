# 🍓 偏爱厨房小程序

> 🍓 把家常饭，留给偏爱的人。

偏爱厨房是一款面向情侣和亲密关系的互动厨房小程序。它把「今天想吃什么」这件很日常的小事，整理成一个可以一起参与的流程：一个人维护菜谱、准备下厨，另一个人浏览菜单、加入购物车、下单点餐；两个人绑定后，菜谱会汇成同一个共享厨房，日常签到、订单进度和饭点记忆也会被认真记录下来。

项目当前主要面向微信小程序，使用 uni-app + Vue 3 开发，配套后端服务为 `hkt-applet-service-nest`。

## ✨ 项目亮点

- 🧑‍🍳 双角色体验：饲养员负责菜谱、接单和烹饪；吃货负责挑菜、下单和查看订单。
- 🍱 共享厨房：情侣绑定后，双方创建的菜谱会合并展示，谁都可以浏览和下单。
- 🛒 完整点单链路：从菜单、购物车、确认订单，到接单、烹饪中、完成订单都有对应页面。
- 📖 菜谱管理：支持分类管理、拖拽排序、封面上传、食材清单和制作步骤。
- 💗 生活化互动：每日签到、提醒对方签到、积分中心、烹饪日历和共进餐天数。
- 🎀 个性首页：支持首页壁纸/皮肤切换，自定义图片和视频皮肤。
- 🔔 订阅提醒：集中在首页开启微信订阅消息，用于订单进度和签到提醒。

## 🧁 功能模块

| 模块 | 说明 |
| --- | --- |
| 🏠 首页 | 情侣角色展示、共进餐天数、首次登录引导、皮肤切换、通知入口 |
| 🔐 登录 | 微信授权登录，登录成功后写入本地持久化状态 |
| 💞 情侣绑定 | 通过邀请码绑定另一半，支持绑定信息展示和解绑 |
| 🍽️ 菜单 | 分类浏览、搜索菜谱、共享厨房展示、加入购物车 |
| 🥗 菜谱 | 新增、编辑、删除菜谱，维护分类、食材和制作步骤 |
| 🧾 订单 | 我的订单和厨房订单双视角，支持状态流转和再来一单 |
| 🌷 我的 | 资料编辑、头像上传、积分、签到、烹饪日历、意见反馈 |
| 🔔 通知 | 微信订阅消息授权、订阅状态保存、订单和签到提醒模板 |

## 🛠️ 技术栈

| 类型 | 技术 |
| --- | --- |
| 跨端框架 | uni-app |
| 前端框架 | Vue 3，Composition API |
| 状态管理 | Pinia，pinia-plugin-persistedstate |
| UI 与组件 | uview-plus，uni-calendar，leo-drag，自定义业务组件 |
| 样式 | SCSS，rpx，微信小程序自定义导航和安全区适配 |
| 请求 | 基于 `uni.request` / `uni.uploadFile` 的统一 HTTP 封装 |
| 后端 | NestJS，Prisma，MySQL，Redis |

## 📁 项目结构

```text
hkt-applet/
├── api/                       # 菜谱、购物车、订单等接口封装
├── apis/                      # 登录、用户、情侣、积分、通知、首页皮肤等接口封装
├── common/                    # 全局 SCSS 与组件样式覆盖
├── components/                # 通用组件
├── config/                    # 基础配置、主题色、订单状态、订阅消息模板
├── hooks/                     # 组合式逻辑
├── pages/                     # 页面目录
│   ├── home/                  # 首页
│   ├── login/                 # 登录
│   ├── sort/                  # 菜单入口
│   ├── recipe/                # 菜谱详情、编辑、分类
│   ├── cart/                  # 购物车和确认订单
│   ├── order/                 # 订单列表和详情
│   └── my/                    # 我的、签到、积分、烹饪日历
├── static/                    # 静态资源
├── stores/                    # Pinia store
├── uni_modules/               # uni-app 插件
├── utils/                     # 请求、登录、邀请、微信授权、订阅消息等工具
├── App.vue
├── main.js
├── manifest.json
├── pages.json
└── uni.scss
```

## 🚀 快速开始

### 🌱 环境准备

- Node.js 16+
- HBuilderX
- 微信开发者工具
- 可访问的后端服务
- 微信小程序 AppID

当前仓库没有维护 `npm run dev:*` 这类 CLI 脚本，推荐使用 HBuilderX 运行到微信开发者工具。

### 📦 安装依赖

```bash
npm install
```

### 🧩 启动后端

前端需要配套后端服务。后端项目通常与本仓库同级放置：

```text
H-K-T/
├── hkt-applet
└── hkt-applet-service-nest
```

后端启动示例：

```bash
cd ../hkt-applet-service-nest
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm start:dev
```

默认接口前缀为 `/api`。本地 MySQL 和 Redis 可参考后端仓库的 `docker-compose.yml`。

### 🌐 配置接口地址

编辑 [config/index.js](./config/index.js)：

```js
// 局域网真机调试示例
// const BASE_URL = 'http://localhost:3000/api'

// 内网穿透示例
const BASE_URL = '内存穿透地址'
```

真机预览时，手机必须能访问 `BASE_URL`。如果后端只跑在本机 `localhost`，微信真机无法直接访问，需要改成局域网 IP 或内网穿透地址。

### 🪪 配置微信 AppID

编辑 [manifest.json](./manifest.json)：

```json
{
  "mp-weixin": {
    "appid": "你的微信小程序 AppID"
  }
}
```

如果需要使用订阅消息，还要在微信公众平台配置订阅模板，并同步维护 [config/subscriptionMessages.js](./config/subscriptionMessages.js) 中的模板 ID。

### 📱 运行到微信小程序

1. 使用 HBuilderX 打开项目根目录。
2. 选择「运行」→「运行到小程序模拟器」→「微信开发者工具」。
3. 微信开发者工具会打开 `unpackage/dist/dev/mp-weixin`。
4. 真机调试前确认后端服务、`BASE_URL`、AppID、订阅消息模板都已配置。

## 🍳 核心业务约定

### 🧑‍🍳 角色

- `userType = 0`：饲养员。
- `userType = 1`：吃货。
- 登录态和用户资料保存在 `stores/user.js`，并通过 Pinia 持久化到本地。

### 🍱 共享厨房

- 未绑定情侣时，用户只能看到自己创建的菜谱和分类。
- 绑定后，双方菜谱会合并展示为共享厨房。
- 菜谱和分类仍保留创建者归属。
- 后端返回 `canManage` 标记，前端只展示当前用户可管理内容的编辑和删除入口。
- 购物车和订单提交必须由后端校验菜谱是否属于当前共享厨房。

### 🔔 订阅消息

- 首页侧边通知按钮打开订阅面板。
- 授权逻辑集中在 `utils/subscribeMessage.js`。
- 模板类型和模板 ID 维护在 `config/subscriptionMessages.js`。
- 微信订阅消息必须由用户点击触发授权，不能在后台静默授权。

### 📨 请求格式

后端统一响应结构：

```json
{
  "code": 200,
  "data": {},
  "message": "ok"
}
```

前端统一请求封装位于 [utils/request.js](./utils/request.js)，支持：

- 自动拼接 `BASE_URL`
- token 注入
- 401 登录过期处理
- GET 请求重试
- 上传文件
- 统一错误提示

## 🧭 常用开发入口

| 场景 | 文件 |
| --- | --- |
| 接口地址、主题色、订单按钮 | `config/index.js` |
| 页面路由和 easycom | `pages.json` |
| 请求和上传 | `utils/request.js` |
| 登录状态 | `utils/auth.js`，`stores/user.js` |
| 首页和皮肤 | `pages/home/index.vue`，`hooks/home/useHomeSkin.js` |
| 菜单和共享厨房 | `pages/cart/component/CateTab.vue`，`pages/sort/index.vue` |
| 菜谱表单和分类 | `pages/recipe/redact.vue`，`pages/recipe/classify.vue` |
| 订单状态 | `stores/order.js`，`pages/order/component/OrderButton.vue` |
| 签到和积分 | `pages/my/attendance.vue`，`pages/my/integral.vue`，`apis/points.js` |
| 订阅消息 | `pages/home/component/SubscribeMessagePanel.vue`，`utils/subscribeMessage.js` |

## 📝 开发与提交规范

### 🌿 分支建议

```text
feat/<module-name>       # 新功能
fix/<module-name>        # 问题修复
docs/<topic>             # 文档调整
refactor/<module-name>   # 重构
```

### 💬 Commit Message

推荐使用 Conventional Commits，并保留当前项目常用的中文模块标识：

```text
feat：【菜单】适配共享厨房菜谱权限
fix：【请求】更新真机调试接口地址
docs：【README】完善项目说明
refactor：【订单】整理状态按钮逻辑
```

常用类型：

| 类型 | 说明 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 问题修复 |
| `docs` | 文档 |
| `style` | 样式或格式调整，不改变逻辑 |
| `refactor` | 重构 |
| `chore` | 构建、依赖、配置等杂项 |

提交前建议确认：

- 只提交当前任务相关文件。
- 不混入本地接口地址、调试日志、临时图片等无关改动。
- 真机相关改动至少确认微信开发者工具可编译。
- 接口契约变化需要同步后端和 README/注释。

## ✅ 联调检查清单

- 后端服务是否启动。
- `BASE_URL` 是否指向可访问的 `/api` 地址。
- 微信开发者工具是否配置了正确 AppID。
- 真机是否能访问后端地址。
- MySQL/Redis 是否与后端 `.env` 一致。
- 登录后是否写入 token 和用户资料。
- 订阅消息模板 ID 是否与微信公众平台一致。
- 图片上传后 `/uploads` 静态资源是否可访问。

## 🌙 项目状态

本项目仍在持续迭代中，当前重点围绕微信小程序体验进行开发和验证。uni-app 的多端配置仍保留，但其他平台不是当前主要验收目标。

如果你计划将项目发布为公开开源仓库，建议补充：

- `LICENSE`
- 示例截图或演示视频
- 后端仓库地址
- 线上体验二维码
- 更完整的 API 文档
