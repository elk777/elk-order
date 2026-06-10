# 首页换肤后端接口契约

当前仓库未包含 NestJS 后端源码，因此本次在前端侧补齐接口封装和调用契约。后端实现时建议保持以下响应结构，前端已兼容 `url`、`path`、`imageUrl`、`data.url` 等常见字段。

## GET /home/skin

获取当前登录用户保存的首页壁纸。

推荐响应：

```json
{
  "code": 200,
  "data": {
    "id": "warm-kitchen",
    "name": "暖厨偏爱",
    "type": "preset",
    "url": "/static/images/home/wallpapers/warm-kitchen.png",
    "thumb": "/static/images/home/wallpapers/warm-kitchen.png"
  },
  "message": "ok"
}
```

## POST /home/skin

保存当前登录用户的首页壁纸选择。

请求体：

```json
{
  "id": "custom_1780910000000",
  "name": "自定义壁纸",
  "type": "custom",
  "url": "https://cdn.example.com/home/skin/a.png",
  "thumb": "https://cdn.example.com/home/skin/a.png"
}
```

## POST /home/skin/upload

上传自定义壁纸，`multipart/form-data` 字段名为 `file`，附带 `scene=home_skin`。

推荐响应：

```json
{
  "code": 200,
  "data": {
    "url": "https://cdn.example.com/home/skin/a.png",
    "thumb": "https://cdn.example.com/home/skin/a.png"
  },
  "message": "ok"
}
```
