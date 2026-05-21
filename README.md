# 🍳 偏爱厨房

> 一款基于 uni-app 的情侣互动厨房管理小程序，支持「饲养员」与「吃货」双角色模式，让做饭也变得浪漫有趣。

[![uni-app](https://img.shields.io/badge/uni--app-3.x-2B9939?logo=vue.js)](https://uniapp.dcloud.net.cn/)
[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Pinia](https://img.shields.io/badge/Pinia-3.x-FFD859)](https://pinia.vuejs.org/)
[![uview-plus](https://img.shields.io/badge/uview--plus-latest-FF5C8D)](https://uiadmin.net/uview-plus/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## 📖 项目简介

**偏爱厨房** 是一款专为情侣设计的厨房互动小程序。用户可以选择「饲养员」（下厨方）或「吃货」（享用方）角色，实现从菜谱管理、下单点餐到订单跟踪的完整厨房协作流程。项目以粉色珊瑚色系为主视觉，营造温暖浪漫的使用氛围。

### 核心亮点

- **👫 双角色系统** — 饲养员管理菜谱与接单，吃货浏览菜单与下单，一套应用满足双方需求
- **📋 完整菜谱管理** — 创建、编辑、分类、拖拽排序，支持分步骤烹饪说明与食材清单
- **🛒 下单到出餐全流程** — 选菜 → 下单 → 接单 → 烹饪 → 完成，订单状态实时可查
- **💕 情侣绑定** — 通过邀请码绑定伴侣，共享厨房体验
- **🏆 积分体系** — 签到、邀请、做任务获取积分，可兑换 VIP、抽奖等权益
- **🎨 个性化装扮** — 支持首页壁纸切换，预设多款皮肤，也可自定义上传

## 📱 功能概览

| 模块 | 功能 |
|------|------|
| **首页** | 情侣头像展示、共进餐天数统计、角色切换、壁纸/皮肤更换、邀请伴侣 |
| **菜单** | 分类浏览菜谱、搜索菜品、购物车管理、添加/编辑/删除菜谱 |
| **订单** | 厨房订单/我的订单双视角、日期筛选、状态流转（待接单→已接单→烹饪中→已完成）、订单详情 |
| **我的** | 个人信息编辑、情侣绑定/解绑、积分明细、每日签到、意见反馈 |

## 🛠 技术栈

| 类别 | 技术选型 |
|------|----------|
| **框架** | [uni-app 3.x](https://uniapp.dcloud.net.cn/) (Vue 3) |
| **语法** | Composition API (`<script setup>`) |
| **语言** | JavaScript / SCSS |
| **构建工具** | Vite |
| **状态管理** | [Pinia](https://pinia.vuejs.org/) + [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate) |
| **UI 组件库** | [uview-plus](https://uiadmin.net/uview-plus/) (uView 2.x 的 uni-app Vue3 适配版) |
| **日期处理** | [dayjs](https://day.js.org/) |
| **剪贴板** | [clipboard](https://clipboardjs.com/) |
| **云服务** | uniCloud (阿里云) + uni-id 用户体系 |
| **跨平台** | 微信小程序 / 支付宝小程序 / 百度小程序 / 头条小程序 / H5 / Android / iOS |

## 📁 项目结构

```
hkt-applet/
├── apis/                    # API 接口层
│   └── order/               # 订单相关接口
├── common/                  # 公共 SCSS 样式
│   ├── common.scss          # 全局通用样式
│   └── upload.scss          # 上传组件样式覆盖
├── components/              # 全局公共组件
│   ├── Tabbar/              # 自定义底部导航栏
│   ├── NavbarMini/          # 自定义迷你导航栏
│   ├── Search/              # 搜索输入框
│   ├── CateList/            # 分类/菜谱列表
│   ├── Love/                # 爱心动画组件
│   └── Upload/              # 图片上传组件
├── config/                  # 应用配置
│   └── index.js             # 基础地址、主题色、TabBar、订单状态配置
├── hooks/                   # 组合式函数
│   ├── usePageTitle.js      # 页面标题与参数获取
│   └── home/                # 首页相关 hooks
├── pages/                   # 业务页面
│   ├── home/                # 首页
│   ├── sort/                # 菜单页
│   ├── recipe/              # 菜谱详情 / 编辑 / 分类管理
│   ├── order/               # 订单列表 / 订单详情
│   ├── cart/                # 确认订单
│   └── my/                  # 个人中心 / 积分明细
├── static/                  # 静态资源
│   ├── images/              # 图片资源
│   └── iconfont/            # 自定义图标字体
├── stores/                  # Pinia 状态管理
│   ├── index.js             # Pinia 实例
│   ├── user.js              # 用户状态（角色、个人信息）
│   ├── recipe.js            # 菜谱状态（购物车、分类）
│   └── order.js             # 订单状态（筛选、列表、详情）
├── utils/                   # 工具函数
│   └── tool.js              # 导航栏高度、安全区、ID 生成、日期格式化
├── uni_modules/             # uni-app 插件模块
├── uniCloud-aliyun/         # 云函数 & 数据库配置
├── App.vue                  # 应用根组件
├── main.js                  # 应用入口
├── manifest.json            # 应用清单配置
├── pages.json               # 页面路由 & 样式配置
├── uni.scss                 # 全局 SCSS 变量
└── package.json             # 依赖管理
```

## 🚀 快速开始

### 环境要求

- [HBuilderX](https://www.dcloud.io/hbuilderx.html) 最新版本 或 VS Code + uni-app 插件
- 微信开发者工具（用于微信小程序调试）
- Node.js >= 16

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/your-username/hkt-applet.git
cd hkt-applet

# 2. 安装依赖
npm install

# 3. 启动开发（H5 模式预览）
npm run dev:h5

# 4. 启动开发（微信小程序模式）
npm run dev:mp-weixin

# 5. 构建生产版本
npm run build:mp-weixin
```

### 微信小程序预览

1. 使用 HBuilderX 打开项目目录
2. 点击「运行」→「运行到小程序模拟器」→「微信开发者工具」
3. 在微信开发者工具中导入 `unpackage/dist/dev/mp-weixin` 目录

> **注意：** 首次运行需要修改 `manifest.json` 中的微信小程序 `appid` 为你自己的 AppID。

## ⚙️ 配置说明

项目核心配置集中在 [config/index.js](config/index.js)：

| 配置项 | 说明 |
|--------|------|
| `BASE_URL` | API 接口基础地址 |
| `APP_ID` | 微信小程序 AppID |
| `COLOURS` | 全局主题色系 |
| `TABBAR_DATA` | 底部导航栏配置 |
| `ORDER_STATUS_INFO` | 订单状态流转配置 |

### 主题色定制

在 [uni.scss](uni.scss) 和 [config/index.js](config/index.js) 中统一管理主题变量：

```scss
// 主色调
$theme-color: #FF5C8D;   // 草莓粉
$fu-color: #FFF5F5;       // 奶油白
$inter-color: #FF5C8D;    // 强调色
$tinge-color: #707070;    // 辅助灰
```

## 🎯 角色模式说明

| 角色 | 视角 | 核心功能 |
|------|------|----------|
| 🧑‍🍳 **饲养员** | 下厨方 | 管理菜谱、查看厨房订单、接单/烹饪/出餐 |
| 😋 **吃货** | 享用方 | 浏览菜谱、加入购物车、下单投喂、查看我的订单 |

角色可在「我的」页面自由切换，不同角色下菜单页和订单页的交互界面会自动适配。

## 📄 License

本项目采用 [MIT License](./LICENSE) 开源协议。

## 🙏 鸣谢

- [uni-app](https://uniapp.dcloud.net.cn/) — 跨平台开发框架
- [uview-plus](https://uiadmin.net/uview-plus/) — 优秀的 uni-app UI 组件库
- [Pinia](https://pinia.vuejs.org/) — 直观的 Vue 状态管理
- [dayjs](https://day.js.org/) — 轻量级日期处理库
