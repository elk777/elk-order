# 偏爱厨房 — 后端数据库表设计文档

> **项目名称**: 偏爱厨房 (HKT Applet)
> **开发框架**: uni-app 3.x + Vue 3 + Pinia + uniCloud (阿里云)
> **业务定位**: 情侣互动厨房管理小程序，支持「饲养员」与「吃货」双角色模式
> **文档版本**: v1.0
> **更新日期**: 2026-05-21

---

## 一、业务模块与数据表总览

| 序号 | 业务模块 | 表名 | 说明 |
|------|---------|------|------|
| 1 | 用户体系 | `sys_user` | 用户基础信息表 |
| 2 | 情侣绑定 | `sys_couple` | 情侣绑定关系表 |
| 3 | 菜谱分类 | `recipe_category` | 菜谱分类表（支持拖拽排序） |
| 4 | 菜谱信息 | `recipe_info` | 菜谱主表 |
| 5 | 食材清单 | `recipe_ingredient` | 菜谱食材明细表 |
| 6 | 制作步骤 | `recipe_step` | 菜谱制作步骤表 |
| 7 | 购物车 | `cart_item` | 购物车明细表 |
| 8 | 订单信息 | `order_info` | 订单主表 |
| 9 | 订单明细 | `order_item` | 订单中菜品明细表 |
| 10 | 积分账户 | `points_account` | 用户积分账户表 |
| 11 | 积分流水 | `points_record` | 积分变动明细表 |
| 12 | 签到记录 | `checkin_record` | 每日签到记录表 |
| 13 | 壁纸配置 | `wallpaper_config` | 系统预设壁纸配置表 |
| 14 | 用户壁纸 | `user_wallpaper` | 用户自定义壁纸表 |
| 15 | 意见反馈 | `feedback` | 用户意见反馈表 |

---

## 二、ER 关系图 (实体关系)

```
sys_user (1) ────< (N) sys_couple          (一对多：一个用户可发起多次绑定)
sys_user (1) ────< (N) recipe_info          (一对多：一个用户可创建多个菜谱)
sys_user (1) ────< (N) cart_item            (一对多：一个用户购物车有多个商品)
sys_user (1) ────< (N) order_info           (一对多：一个用户有多个订单)
sys_user (1) ────< (N) points_record        (一对多：一个用户有多条积分记录)
sys_user (1) ────< (N) checkin_record       (一对多：一个用户有多条签到记录)
sys_user (1) ────< (N) user_wallpaper       (一对多：一个用户可上传多张壁纸)
sys_user (1) ────< (N) feedback             (一对多：一个用户可提交多条反馈)

sys_user (1) ──── (1) points_account        (一对一：一个用户一个积分账户)

recipe_category (1) ────< (N) recipe_info   (一对多：一个分类下有多个菜谱)

recipe_info (1) ────< (N) recipe_ingredient (一对多：一个菜谱有多个食材)
recipe_info (1) ────< (N) recipe_step       (一对多：一个菜谱有多个步骤)

order_info (1) ────< (N) order_item         (一对多：一个订单包含多个菜品)
recipe_info (1) ────< (N) order_item        (一对多：一个菜谱可出现在多个订单中)
```

---

## 三、详细表结构设计

### 3.1 用户基础信息表 `sys_user`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 用户唯一主键 |
| `openid` | VARCHAR(64) | — | — | N | NULL | UNIQUE | 微信 OpenID（uni-id 对接） |
| `unionid` | VARCHAR(64) | — | — | N | NULL | INDEX | 微信 UnionID |
| `nick_name` | VARCHAR(50) | — | — | N | '' | — | 用户昵称 |
| `avatar` | VARCHAR(500) | — | — | N | '' | — | 头像 URL |
| `gender` | TINYINT | — | — | N | 0 | — | 性别：0=男, 1=女 |
| `user_type` | TINYINT | — | — | N | 0 | INDEX | 角色类型：0=饲养员, 1=吃货 |
| `uuid` | VARCHAR(32) | — | — | Y | — | UNIQUE | 用户唯一标识码（邀请分享用） |
| `binding` | TINYINT(1) | — | — | N | 0 | — | 是否已绑定情侣：0=未绑定, 1=已绑定 |
| `status` | TINYINT | — | — | N | 1 | — | 账户状态：0=禁用, 1=正常 |
| `last_login_time` | DATETIME | — | — | N | NULL | — | 最后登录时间 |
| `last_login_ip` | VARCHAR(45) | — | — | N | NULL | — | 最后登录 IP |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | INDEX | 注册时间 |
| `update_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 更新时间 |

**设计说明:**
- `uuid` 字段用于情侣邀请码，由前端 `generateId()` 生成（`时间戳 + 随机字符串`），格式为 `ko4k1ttv` 样式
- `user_type` 决定用户在小程序中的交互界面和权限：饲养员管理菜谱和接单，吃货浏览和下单
- `binding` 字段冗余存储绑定状态，方便快速判断，实际以 `sys_couple` 表为准
- `openid` 由 uni-id 体系自动管理，可为 NULL 以兼容多平台

**业务规则:**
- 用户注册时自动生成 `uuid` 邀请码，不可修改
- 角色 (`user_type`) 可在「我的」页面自由切换
- 绑定状态通过 `sys_couple` 表维护，`binding` 字段为冗余标记

---

### 3.2 情侣绑定关系表 `sys_couple`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 关系唯一主键 |
| `feeder_user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 饲养员用户 ID |
| `foodie_user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 吃货用户 ID |
| `bind_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 绑定时间 |
| `unbind_time` | DATETIME | — | — | N | NULL | — | 解绑时间 |
| `status` | TINYINT | — | — | N | 1 | — | 状态：0=已解绑, 1=绑定中 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 创建时间 |
| `update_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 更新时间 |

**设计说明:**
- 一个情侣关系由饲养员和吃货两个角色组成，`feeder_user_id` 和 `foodie_user_id` 分别指向各自的用户记录
- `unbind_time` 记录解绑时间，用于统计情侣共处时长
- 首页展示的「共进餐天数」通过 `DATEDIFF(NOW(), bind_time)` 计算
- 支持「解绑后重新绑定」场景，通过 `status` 区分历史记录

**业务规则:**
- 每个用户同一时间只能处于一个有效绑定关系中（`status = 1` 时唯一约束）
- 绑定前需通过邀请码 (`uuid`) 查找对方用户
- 解绑后将双方 `sys_user.binding` 更新为 `0`

**索引设计:**
- `UNIQUE INDEX idx_active_couple (feeder_user_id, foodie_user_id, status)` — 确保两个用户间只有一条有效绑定

---

### 3.3 菜谱分类表 `recipe_category`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 分类唯一主键 |
| `user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 创建者用户 ID |
| `name` | VARCHAR(30) | — | — | Y | — | — | 分类名称 |
| `sort_order` | INT | — | — | N | 0 | INDEX | 排序序号（数值越小越靠前） |
| `status` | TINYINT | — | — | N | 1 | — | 状态：0=已删除, 1=正常 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 创建时间 |
| `update_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 更新时间 |

**设计说明:**
- `sort_order` 支持拖拽排序（前端使用 leo-drag 组件），排序变更时批量更新该字段
- 分类按用户维度管理，饲养员维护自己的分类体系
- 支持软删除 (`status = 0`)，防止误删关联菜谱

**业务规则:**
- 每个用户拥有独立的分类列表
- 分类名称不可为空，同一用户下分类名建议唯一
- 删除分类前需校验该分类下是否存在有效菜谱，有则提示不可删除或需先移动菜谱

---

### 3.4 菜谱主表 `recipe_info`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 菜谱唯一主键 |
| `user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 创建者用户 ID |
| `category_id` | BIGINT UNSIGNED | — | recipe_category.id | N | 0 | INDEX | 所属分类 ID（0 表示默认分类） |
| `name` | VARCHAR(100) | — | — | Y | — | — | 菜谱名称 |
| `cover` | VARCHAR(500) | — | — | N | '' | — | 菜谱封面图片 URL |
| `description` | VARCHAR(500) | — | — | N | '' | — | 菜谱描述 / 简介 |
| `cook_time` | VARCHAR(20) | — | — | N | '' | — | 烹饪时长描述（如 "10分钟"） |
| `difficulty` | VARCHAR(10) | — | — | N | '简单' | — | 难易程度：简单 / 中等 / 困难 |
| `price` | DECIMAL(10,2) | — | — | N | 0.00 | — | 菜品参考价格（用于下单时展示） |
| `status` | TINYINT | — | — | N | 1 | — | 状态：0=已删除, 1=正常 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | INDEX | 创建时间 |
| `update_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 更新时间 |

**设计说明:**
- `category_id = 0` 表示归属于"默认分类"，避免分类被删除时菜谱失去归属
- `cook_time` 和 `difficulty` 使用 VARCHAR 而非数值，保留灵活性（如 "约15分钟"、"30-45分钟"）
- `price` 字段为浮点数，用于订单金额计算
- 与 `recipe_ingredient` 和 `recipe_step` 通过 `recipe_id` 进行一对多关联

**业务规则:**
- 菜谱由饲养员创建和管理
- 菜谱封面图片通过 Upload 组件上传至云存储，此处存储 URL
- 删除菜谱为软删除，不影响已有订单中的关联数据

---

### 3.5 食材清单表 `recipe_ingredient`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 食材唯一主键 |
| `recipe_id` | BIGINT UNSIGNED | — | recipe_info.id | Y | — | INDEX | 所属菜谱 ID |
| `name` | VARCHAR(100) | — | — | Y | — | — | 食材名称 |
| `amount` | VARCHAR(50) | — | — | Y | — | — | 用量（如 "200g", "1勺"） |
| `sort_order` | INT | — | — | N | 0 | — | 排序序号 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 创建时间 |

**设计说明:**
- `amount` 为自由文本格式，支持用户自定义食材用量描述
- 食材列表在菜谱详情页可一键复制为购物清单（前端使用 clipboard 组件实现）
- 食材添加/删除与菜谱编辑同步进行

**业务规则:**
- 食材与菜谱是强关联关系，菜谱删除时级联删除关联食材
- 食材清单支持动态增删，至少保留 1 条食材记录

---

### 3.6 制作步骤表 `recipe_step`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 步骤唯一主键 |
| `recipe_id` | BIGINT UNSIGNED | — | recipe_info.id | Y | — | INDEX | 所属菜谱 ID |
| `step_num` | INT | — | — | Y | 1 | — | 步骤序号 |
| `describe` | VARCHAR(1000) | — | — | Y | — | — | 步骤文字描述 |
| `tip` | VARCHAR(300) | — | — | N | '' | — | 步骤提示 / 小贴士 |
| `images` | JSON | — | — | N | NULL | — | 步骤配图 URL 数组（JSON 格式） |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 创建时间 |

**设计说明:**
- `step_num` 为步骤序号，前端按此字段排序展示
- `tip` 对应前端 `stepList[].stepTip`，用于额外烹饪提示
- `images` 使用 JSON 类型，存储图片 URL 数组（如 `["url1", "url2"]`），支持步骤多图展示

**业务规则:**
- 步骤与菜谱强关联，菜谱删除时级联删除步骤
- 步骤支持动态增删

---

### 3.7 购物车明细表 `cart_item`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 购物车主键 |
| `user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 用户 ID（吃货角色） |
| `recipe_id` | BIGINT UNSIGNED | — | recipe_info.id | Y | — | INDEX | 菜谱 ID |
| `quantity` | INT UNSIGNED | — | — | N | 1 | — | 数量 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 加入时间 |
| `update_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 更新时间 |

**设计说明:**
- 购物车仅对「吃货」角色开放，饲养员不可添加购物车
- 同一用户同一菜谱多次添加时，合并为一条记录并增加 `quantity`
- 购物车在前端使用 Pinia + persist 本地持久化，后端同样落表以保证数据可靠
- `UNIQUE INDEX idx_user_recipe (user_id, recipe_id)` 确保同一用户对同一菜谱只有一条购物车记录

**业务规则:**
- 吃货仅能操作自己的购物车
- 购物车中同一菜谱只会有一条记录，多次添加增加数量
- 提交订单成功后，对应的购物车记录需清除

---

### 3.8 订单主表 `order_info`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 订单唯一主键 |
| `order_no` | VARCHAR(32) | — | — | Y | — | UNIQUE | 订单编号（业务显示用） |
| `foodie_user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 下单用户 ID（吃货） |
| `feeder_user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 接单用户 ID（饲养员） |
| `order_status` | TINYINT | — | — | N | 1 | INDEX | 订单状态：1=待接单, 2=已接单, 3=烹饪中, 4=已完成, 5=已取消 |
| `dine_way` | VARCHAR(20) | — | — | N | 'immediate' | — | 就餐方式：immediate=立即就餐, reservation=预约就餐 |
| `reservation_date` | DATE | — | — | N | NULL | — | 预约就餐日期（仅 reservation 时有效） |
| `reservation_time` | VARCHAR(10) | — | — | N | NULL | — | 预约餐段：早餐 / 午餐 / 晚餐 |
| `remark` | VARCHAR(500) | — | — | N | '' | — | 口味偏好 / 订单备注 |
| `total_quantity` | INT UNSIGNED | — | — | N | 0 | — | 菜品总数量（冗余字段，用于列表展示） |
| `order_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 下单时间 |
| `accept_time` | DATETIME | — | — | N | NULL | — | 接单时间 |
| `making_time` | DATETIME | — | — | N | NULL | — | 开始烹饪时间 |
| `completion_time` | DATETIME | — | — | N | NULL | — | 完成时间 |
| `cancel_time` | DATETIME | — | — | N | NULL | — | 取消时间 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 创建时间 |
| `update_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 更新时间 |

**设计说明:**
- `order_no` 为前端展示的订单编号，由后端生成规则：`日期 + 序号` 或 `雪花ID`
- 订单状态流转路径：
  ```
  待接单 (1) ──接受──→ 已接单 (2) ──开始烹饪──→ 烹饪中 (3) ──完成──→ 已完成 (4)
     │                    │                       │
     └──取消──→ 已取消(5) └──取消──→ 已取消(5)     └──取消──→ 已取消(5)
  ```
- `total_quantity` 为冗余字段，便于订单列表直接展示而不需关联查询
- `foodie_user_id` 和 `feeder_user_id` 指向同一情侣关系中的两个角色
- 四个时间字段 (`accept_time`, `making_time`, `completion_time`, `cancel_time`) 记录订单各状态变更的时间戳

**业务规则:**
- 订单创建后默认状态为「待接单」(1)
- 只有已绑定情侣关系的用户间才能下单和接单
- 饲养员看到「厨房订单」视图（按 `feeder_user_id` 查询），吃货看到「我的订单」视图（按 `foodie_user_id` 查询）
- 已取消 (5) 和已完成 (4) 为终态，不可再变更
- 预约就餐时 `reservation_date` 和 `reservation_time` 为必填

---

### 3.9 订单明细表 `order_item`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 明细主键 |
| `order_id` | BIGINT UNSIGNED | — | order_info.id | Y | — | INDEX | 所属订单 ID |
| `recipe_id` | BIGINT UNSIGNED | — | recipe_info.id | Y | — | INDEX | 菜谱 ID |
| `recipe_name` | VARCHAR(100) | — | — | Y | — | — | 下单时的菜谱名称（快照） |
| `recipe_cover` | VARCHAR(500) | — | — | N | '' | — | 下单时的菜谱封面（快照） |
| `quantity` | INT UNSIGNED | — | — | N | 1 | — | 下单数量 |
| `price` | DECIMAL(10,2) | — | — | N | 0.00 | — | 下单时的单价（快照） |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 创建时间 |

**设计说明:**
- `recipe_name`, `recipe_cover`, `price` 为快照字段，确保即使后续菜谱被修改或删除，订单中的菜品信息仍保持不变
- 订单详情页的「菜谱信息」模块从此表读取

**业务规则:**
- 订单明细与订单主表强关联，订单删除时级联删除明细
- 下单时从菜谱信息中快照关键字段写入此处

---

### 3.10 积分账户表 `points_account`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 账户主键 |
| `user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | UNIQUE | 用户 ID |
| `total_points` | INT UNSIGNED | — | — | N | 0 | — | 累计获得积分 |
| `current_points` | INT UNSIGNED | — | — | N | 0 | — | 当前可用积分 |
| `used_points` | INT UNSIGNED | — | — | N | 0 | — | 累计已使用积分 |
| `version` | INT UNSIGNED | — | — | N | 0 | — | 乐观锁版本号 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 创建时间 |
| `update_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 更新时间 |

**设计说明:**
- 一个用户对应一条积分账户记录（一对一关系）
- `total_points` = 累计获得积分总和 = `current_points + used_points`
- `version` 为乐观锁字段，积分变更时先查询版本号，更新时 `WHERE version = oldVersion`，防止并发导致积分错乱
- `current_points` 在积分详情页顶部「当前积分」展示，`used_points` 展示为「累计使用」

**业务规则:**
- 用户注册时自动创建积分账户，初始积分为 0
- 积分变更需在事务中同时更新 `points_account` 和插入 `points_record`
- 积分扣减时需校验 `current_points >= 扣减数量`，不足时拒绝操作

---

### 3.11 积分流水表 `points_record`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 流水主键 |
| `user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 用户 ID |
| `type` | TINYINT | — | — | Y | — | INDEX | 流水类型：0=支出, 1=收入, 2=冻结 |
| `amount` | INT UNSIGNED | — | — | Y | — | — | 变动数量 |
| `current_balance` | INT UNSIGNED | — | — | Y | — | — | 变动后余额 |
| `source` | VARCHAR(50) | — | — | Y | — | — | 来源/用途标识 |
| `source_desc` | VARCHAR(200) | — | — | N | '' | — | 来源/用途描述 |
| `relation_id` | BIGINT UNSIGNED | — | — | N | NULL | — | 关联业务 ID（如订单ID） |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 记录时间 |

**设计说明:**
- `source` 为枚举类标识，建议值包括：
  - **收入** (`type = 1`): `register` (注册奖励), `checkin` (签到), `invite` (邀请好友), `make_recipe` (制作菜谱), `order_complete` (下单完成), `task` (任务奖励)
  - **支出** (`type = 0`): `vip_exchange` (兑换VIP), `lottery` (抽奖), `ai_recognize` (AI识别), `shop_upgrade` (升级店铺)
- `relation_id` 用于追溯积分变动的关联业务记录
- `current_balance` 记录变动后余额，便于对账审计

**业务规则:**
- 积分明细在前端按 `全部 (2)`、`收入 (1)`、`支出 (0)` 三个 Tab 筛选展示
- 积分流水不可删除和修改，仅可追加
- 签到积分每天只能获取一次

---

### 3.12 签到记录表 `checkin_record`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 签到主键 |
| `user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 用户 ID |
| `checkin_date` | DATE | — | — | Y | — | INDEX | 签到日期 |
| `points_awarded` | INT UNSIGNED | — | — | N | 0 | — | 本次签到获得积分 |
| `consecutive_days` | INT UNSIGNED | — | — | N | 1 | — | 连续签到天数 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 签到时间 |

**设计说明:**
- `checkin_date` 精确到日期，同一天同一用户不可重复签到
- `consecutive_days` 为连续签到天数，用于实现连续签到积分递增奖励策略
- `UNIQUE INDEX idx_user_date (user_id, checkin_date)` 确保一天只能签到一次

**业务规则:**
- 每日签到功能暂未开放（`open: false`），但表结构先行设计
- 签到成功时自动调用积分流水接口增加积分

---

### 3.13 壁纸配置表 `wallpaper_config`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 壁纸主键 |
| `name` | VARCHAR(100) | — | — | Y | — | — | 壁纸名称 |
| `thumb_url` | VARCHAR(500) | — | — | Y | — | — | 壁纸缩略图 URL |
| `full_url` | VARCHAR(500) | — | — | Y | — | — | 壁纸原图 URL |
| `sort_order` | INT | — | — | N | 0 | INDEX | 排序序号 |
| `status` | TINYINT | — | — | N | 1 | — | 状态：0=下架, 1=上架 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 创建时间 |

**设计说明:**
- 系统预设壁纸通过管理端配置，前端通过 `SideToolSkin.vue` 弹出框选择
- `thumb_url` 和 `full_url` 分离，缩略图用于列表展示，原图用于首页背景渲染
- 当前前端 demo 中壁纸列表为硬编码的 CDN 图片，后端设计此表实现动态管理

---

### 3.14 用户壁纸表 `user_wallpaper`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 壁纸主键 |
| `user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 用户 ID |
| `image_url` | VARCHAR(500) | — | — | Y | — | — | 壁纸图片 URL |
| `status` | TINYINT | — | — | N | 1 | — | 状态：0=已删除, 1=正常 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 上传时间 |

**设计说明:**
- 用户在皮肤弹出框中可选择「自定义上传」壁纸，上传的图片 URL 存入此表
- 首页当前选中的背景图片由前端本地存储管理，后端负责持久化上传记录

---

### 3.15 意见反馈表 `feedback`

| 字段名 | 数据类型 | 主键 | 外键 | 非空 | 默认值 | 索引 | 注释 |
|--------|----------|------|------|------|--------|------|------|
| `id` | BIGINT UNSIGNED | PK | — | Y | AUTO_INCREMENT | UNIQUE | 反馈主键 |
| `user_id` | BIGINT UNSIGNED | — | sys_user.id | Y | — | INDEX | 反馈用户 ID |
| `content` | VARCHAR(2000) | — | — | Y | — | — | 反馈内容 |
| `images` | JSON | — | — | N | NULL | — | 反馈截图 URL 数组 |
| `contact` | VARCHAR(100) | — | — | N | '' | — | 联系方式（可选） |
| `status` | TINYINT | — | — | N | 0 | INDEX | 处理状态：0=未处理, 1=已处理, 2=已关闭 |
| `reply` | VARCHAR(2000) | — | — | N | NULL | — | 管理员回复 |
| `create_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 提交时间 |
| `update_time` | DATETIME | — | — | Y | CURRENT_TIMESTAMP | — | 更新时间 |

**设计说明:**
- 反馈功能暂未开放（`open: false`），但表结构预先设计
- `contact` 为用户主动填写的联系方式，方便管理员回访
- `reply` 为管理员回复内容，对应后台管理系统

---

## 四、索引设计汇总

| 表名 | 索引类型 | 索引名 | 字段 | 说明 |
|------|----------|--------|------|------|
| `sys_user` | UNIQUE | `uk_openid` | `openid` | 微信 OpenID 唯一 |
| `sys_user` | UNIQUE | `uk_uuid` | `uuid` | 用户邀请码唯一 |
| `sys_user` | INDEX | `idx_user_type` | `user_type` | 角色类型查询 |
| `sys_user` | INDEX | `idx_create_time` | `create_time` | 新用户查询 |
| `sys_couple` | UNIQUE | `uk_active_couple` | `feeder_user_id, foodie_user_id, status` | 活跃关系唯一约束 |
| `sys_couple` | INDEX | `idx_feeder` | `feeder_user_id` | 饲养员查询 |
| `sys_couple` | INDEX | `idx_foodie` | `foodie_user_id` | 吃货查询 |
| `recipe_category` | INDEX | `idx_user_sort` | `user_id, sort_order` | 用户分类排序 |
| `recipe_info` | INDEX | `idx_user_category` | `user_id, category_id` | 用户-分类联合查询 |
| `recipe_info` | INDEX | `idx_create_time` | `create_time` | 按时间查询 |
| `recipe_ingredient` | INDEX | `idx_recipe` | `recipe_id` | 菜谱食材查询 |
| `recipe_step` | INDEX | `idx_recipe` | `recipe_id` | 菜谱步骤查询 |
| `cart_item` | UNIQUE | `uk_user_recipe` | `user_id, recipe_id` | 同一用户同一菜谱唯一 |
| `order_info` | UNIQUE | `uk_order_no` | `order_no` | 订单编号唯一 |
| `order_info` | INDEX | `idx_foodie_status` | `foodie_user_id, order_status` | 吃货订单查询 |
| `order_info` | INDEX | `idx_feeder_status` | `feeder_user_id, order_status` | 饲养员订单查询 |
| `order_item` | INDEX | `idx_order` | `order_id` | 订单明细查询 |
| `points_account` | UNIQUE | `uk_user` | `user_id` | 用户积分唯一 |
| `points_record` | INDEX | `idx_user_type` | `user_id, type` | 积分明细筛选 |
| `checkin_record` | UNIQUE | `uk_user_date` | `user_id, checkin_date` | 每日签到唯一 |
| `wallpaper_config` | INDEX | `idx_sort` | `sort_order` | 壁纸排序 |
| `user_wallpaper` | INDEX | `idx_user` | `user_id` | 用户壁纸查询 |
| `feedback` | INDEX | `idx_user` | `user_id` | 用户反馈查询 |
| `feedback` | INDEX | `idx_status` | `status` | 反馈状态查询 |

---

## 五、业务规则补充说明

### 5.1 角色权限矩阵

| 功能 | 饲养员 (Feeder) | 吃货 (Foodie) |
|------|:--:|:--:|
| 查看菜谱列表 | ✅ | ✅ |
| 新增/编辑/删除菜谱 | ✅ | ❌ |
| 分类管理 | ✅ | ❌ |
| 搜索菜谱 | ✅ | ✅ |
| 加入购物车 | ❌ | ✅ |
| 提交订单 | ❌ | ✅ |
| 查看厨房订单 | ✅ | ❌ |
| 查看我的订单 | ❌ | ✅ |
| 接单/烹饪/出餐 | ✅ | ❌ |
| 取消订单 | ✅ | ✅ (仅待接单状态) |
| 编辑个人资料 | ✅ | ✅ |
| 绑定情侣 | ✅ | ✅ |
| 积分签到 | ✅ | ✅ |

### 5.2 数据一致性保障

1. **积分变更**: 使用乐观锁 (`version` 字段) 防止并发更新导致积分错乱
2. **订单状态流转**: 使用状态机模式，通过数据库事务 + 状态前置校验确保状态合法变更
3. **购物车去重**: 数据库唯一索引 + 前端合并逻辑双重保障
4. **情侣绑定唯一性**: 唯一复合索引 + 应用层校验，确保一个用户不会同时出现在两个活跃绑定关系中
5. **菜谱快照**: 订单明细中存储下单时的菜谱名称、封面和价格，确保历史订单数据不受菜谱修改影响
6. **软删除策略**: 菜谱分类、菜谱信息使用软删除 (`status = 0`)，保留数据完整性

### 5.3 扩展性预留

- `order_info` 中预留 `total_quantity` 冗余字段，后续可扩展 `total_price` 等
- `points_record.source` 使用 VARCHAR 枚举值而非 TINYINT，方便后续新增积分来源
- `recipe_step.images` 和 `feedback.images` 使用 JSON 类型，灵活支持多图上传
- 数据库使用 InnoDB 引擎，所有表默认 `utf8mb4` 字符集，支持 Emoji 存储

---

## 六、附录：当前项目 Mock 数据映射

| 前端数据结构 | 对应数据库表 | 映射关系 |
|-------------|-------------|---------|
| `userStore.profile` | `sys_user` | 1:1 映射 |
| `userStore.profile.binding` | `sys_couple` + `sys_user.binding` | 关系表判定 + 冗余字段 |
| `recipeStore.cartList` | `cart_item` + `recipe_info` | JOIN 查询 |
| `recipeStore.cateTotal` | `recipe_info` | COUNT 聚合 |
| `orderStore.orderList` | `order_info` + `order_item` | 主表 + 明细 JOIN |
| `orderStore.orderDetails` | `order_info` + `order_item` | 按 ID 关联查询 |
| `integralContentItems` | `points_record` | 直接映射 |
| `classifyList` | `recipe_category` | 直接映射 |
| `cateDetails (recipe)` | `recipe_info` + `recipe_ingredient` + `recipe_step` | 三表 JOIN |
| `tabList (CateTab)` | `recipe_category` + `recipe_info` | 分类 + 菜谱 JOIN |
| 壁纸列表 | `wallpaper_config` + `user_wallpaper` | 系统壁纸 + 用户壁纸 UNION |

---

> **文档结束** — 本文档基于 `偏爱厨房` 项目 v1.0.0 前端源码深度解析生成，涵盖全部 15 张业务表的设计。请在项目迭代中保持文档与数据库 Schema 同步更新。
