# 公司资料、头像上传 API 说明

本文档说明前端修改公司用户名、密码、头像等资料的接口调用方式。接口默认返回 JSON。

## 公共约定

### Base URL

```text
/
```

接口完整路径以 Django 路由为准，例如：

```text
/registlogin/v1/company/<company_id>
/imageshandle/v1/images
```

### 鉴权

需要登录的接口都要在请求头传公司 token：

```http
Authorization: <token>
```

当前后端 `TokenAuthCompany` 直接读取 `Authorization` 原值，不需要加 `Bearer ` 前缀。

### 字段兼容说明

头像和图片表字段名仍保持旧命名：

```text
avatar
image_cos_name
image_cos_name_url
```

但现在字段内容是 R2 object key，不再是腾讯云 COS key。

## 登录获取 Token

### 请求

```http
POST /registlogin/v1/companytoken
Content-Type: application/json
```

```json
{
  "mobile": "13800000000",
  "password": "123456"
}
```

### 返回

```json
{
  "id": 1,
  "token": "xxxxxxxxxxxxxxxx",
  "company_id": 12,
  "code": 1000,
  "msg": "Success"
}
```

前端后续请求使用返回的 `token` 作为 `Authorization`。

## 查询公司资料

### 请求

```http
GET /registlogin/v1/company/<company_id>
Authorization: <token>
```

`<company_id>` 目前会被后端登录态覆盖，只能查询当前登录公司。

### 返回示例

```json
{
  "id": 12,
  "name": "测试公司",
  "mobile": "13800000000",
  "email": "test@example.com",
  "company_category": 1,
  "avatar": "glasses-images/u12/2026/5/9/u12abcd1770000000.png",
  "avatar_url": "https://cdn.example.com/glasses-images/u12/2026/5/9/u12abcd1770000000.png",
  "code": 1000,
  "msg": "Success"
}
```

## 修改用户名、密码等资料

### 请求

```http
PUT /registlogin/v1/company/<company_id>
Authorization: <token>
Content-Type: application/json
```

### 修改公司名称

```json
{
  "name": "新公司名称"
}
```

### 修改密码

```json
{
  "password": "new-password"
}
```

后端会对 `password` 做 MD5 后保存。

### 同时修改多个字段

```json
{
  "name": "新公司名称",
  "password": "new-password",
  "company_category": 1
}
```

### 不允许修改的字段

公司资料接口会忽略或删除以下字段：

```text
mobile, id, email, Admin, Admin_id, company, company_id, add_time, update_time
```

手机号和邮箱不能通过这个接口修改。

## 上传并设置头像

头像上传分三步：

1. 创建图片记录，获取 R2 上传签名。
2. 前端把文件 PUT 到 R2 签名 URL。
3. 调用公司资料接口，把返回的 `image_cos_name` 写入 `avatar`。

### 第 1 步：创建图片记录并获取上传 URL

```http
POST /imageshandle/v1/images
Authorization: <token>
Content-Type: application/json
```

```json
{
  "image_name": "avatar.png",
  "file_size": 123456,
  "content_type": "image/png",
  "explains": "avatar"
}
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `image_name` | 是 | 原始文件名，后端会用它生成 R2 key 和后缀 |
| `file_size` | 是 | 文件字节数 |
| `content_type` | 建议传 | 如 `image/jpeg`、`image/png`、`image/webp`；不传时后端会尝试按文件名推断 |
| `explains` | 否 | 备注 |

### 返回示例

```json
{
  "id": 100,
  "company_id": 12,
  "file_name": "avatar.png",
  "image_cos_name": "glasses-images/u12/2026/5/9/u12abcd1770000000.png",
  "image_cos_name_url": "https://cdn.example.com/glasses-images/u12/2026/5/9/u12abcd1770000000.png",
  "explains": "avatar",
  "r2_sign_obj": {
    "url": "https://xxx.r2.cloudflarestorage.com/bucket/glasses-images/u12/2026/5/9/u12abcd1770000000.png?...",
    "r2_name": "glasses-images/u12/2026/5/9/u12abcd1770000000.png",
    "file_name": "avatar.png",
    "file_size": 123456,
    "content_type": "image/png",
    "max_file_size_bytes": 5242880,
    "allowed_content_types": ["image/jpeg", "image/png", "image/webp"]
  },
  "code": 1000,
  "msg": "Success"
}
```

前端后续保存头像时使用 `image_cos_name`，不要使用 `image_cos_name_url`。

### 第 2 步：上传文件到 R2

```http
PUT <r2_sign_obj.url>
Content-Type: image/png
```

请求 body 直接放文件二进制内容。

注意：

- `Content-Type` 必须和第 1 步返回的 `r2_sign_obj.content_type` 一致。
- 成功时 R2 通常返回 200。
- 这个请求不需要带业务接口的 `Authorization`。

前端示例：

```js
await fetch(r2SignObj.url, {
  method: 'PUT',
  headers: {
    'Content-Type': r2SignObj.content_type,
  },
  body: file,
})
```

### R2 跨域配置

前端从浏览器直接 `PUT` 到 `r2.cloudflarestorage.com` 时，请求不会经过 Django，所以 Django 后端的 CORS 配置不能解决这个跨域问题。需要在 Cloudflare R2 bucket 上配置 CORS。

如果浏览器报错：

```text
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

说明 R2 bucket 没有允许当前前端域名，例如本地开发的：

```text
http://localhost:3000
```

R2 CORS 示例：

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD",
      "PUT"
    ],
    "AllowedHeaders": [
      "content-type"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

生产环境需要把正式前端域名也加进去，例如：

```json
"AllowedOrigins": [
  "http://localhost:3000",
  "https://your-frontend-domain.com"
]
```

注意：

- `AllowedMethods` 必须包含 `PUT`，否则签名上传会被预检请求拦截。
- `AllowedHeaders` 必须允许 `content-type`，因为当前签名 URL 里包含 `X-Amz-SignedHeaders=content-type;host`。
- 前端上传时传的 `Content-Type` 必须和后端签名返回的 `r2_sign_obj.content_type` 一致。
- 修改 R2 CORS 后，重新创建上传签名再测试，避免旧签名过期或参数不一致。

### 第 3 步：设置公司头像

```http
PUT /registlogin/v1/company/<company_id>
Authorization: <token>
Content-Type: application/json
```

```json
{
  "avatar": "glasses-images/u12/2026/5/9/u12abcd1770000000.png"
}
```

这里的 `avatar` 值使用第 1 步返回的 `image_cos_name`。

后端会：

- 删除旧头像对应的 R2 文件。
- 删除图片临时表里本次头像图片记录。
- 把新 R2 key 保存到公司 `avatar` 字段。

### 返回示例

```json
{
  "id": 12,
  "name": "测试公司",
  "avatar": "glasses-images/u12/2026/5/9/u12abcd1770000000.png",
  "avatar_url": "https://cdn.example.com/glasses-images/u12/2026/5/9/u12abcd1770000000.png",
  "code": 1000,
  "msg": "Success"
}
```

## 常见错误

### 未登录或 token 失效

```json
{
  "detail": "Not Authorization..."
}
```

或：

```json
{
  "detail": "Company INVALID..."
}
```

### 创建上传签名时缺少文件大小

```json
{
  "file_size": "file_size is required"
}
```

### Content-Type 不允许

```json
{
  "detail": "content_type not allowed: image/gif"
}
```

允许类型由后端环境变量 `R2_ALLOWED_IMAGE_CONTENT_TYPES` 控制，默认：

```text
image/jpeg,image/png,image/webp
```

### 文件太大

默认最大上传大小为 5 MB，由 `R2_SIGN_MAX_FILE_SIZE_BYTES` 控制。
