# 首页换肤后端接口契约

前端换肤接口统一使用 `/home/skin` 契约。后端实际服务需挂在全局 `/api` 前缀下时，完整路径为 `/api/home/skin`。

前端已兼容 `url`、`path`、`imageUrl`、`data.url` 等常见资源字段，并通过 `mediaType` 区分图片/视频。

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
    "mediaType": "image",
    "url": "/static/images/home/wallpapers/warm-kitchen.jpg",
    "thumb": "/static/images/home/wallpapers/warm-kitchen.jpg"
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
  "mediaType": "video",
  "url": "https://cdn.example.com/home/skin/a.mp4",
  "thumb": "https://cdn.example.com/home/skin/a.mp4",
  "duration": 8.2
}
```

## POST /home/skin/upload

上传自定义壁纸，`multipart/form-data` 字段名为 `file`，附带 `scene=home_skin` 和 `mediaType=image|video`。

视频约束：

- 推荐上限：10 秒。
- 前端会先调用端能力压缩视频。
- 后端上传上限：30MB。
- 后端需要安装 `ffmpeg` 和 `ffprobe`，或通过 `FFMPEG_PATH`、`FFPROBE_PATH` 指定可执行文件路径。
- 后端输出建议：MP4/H.264、静音、宽度不超过 720px、24fps、`+faststart`。

推荐响应：

```json
{
  "code": 200,
  "data": {
    "id": "123",
    "name": "动态壁纸",
    "type": "custom",
    "mediaType": "video",
    "url": "https://cdn.example.com/home/skin/a.mp4",
    "thumb": "https://cdn.example.com/home/skin/a.mp4",
    "duration": 8.2,
    "originalSize": 12800000,
    "compressedSize": 2400000
  },
  "message": "ok"
}
```
