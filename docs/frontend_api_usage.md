# Frontend API Usage

本文档说明当前 Django 项目前端可用 API。接口来自 `label_print_server/urls.py` 已注册路由：

- `/message/v1/`
- `/registlogin/v1/`
- `/labeltemplate/v1/`
- `/imageshandle/v1/`

## 基础约定

### Base URL

开发环境示例：

```text
http://127.0.0.1:8005
```

生产环境按实际域名替换。

### Content-Type

当前接口主要使用 JSON 请求：

```http
Content-Type: application/json
```

### 鉴权 Header

商家端登录后，后续商家接口带公司 token：

```http
Authorization: <company_token>
```

管理员登录后，后台管理接口带管理员 token：

```http
Authorization: <admin_token>
```

注意：当前后端直接读取 `HTTP_AUTHORIZATION`，不要自动加 `Bearer `，除非后端 token 本身就是带 `Bearer ` 的完整字符串。

### 通用成功返回

多数接口会返回：

```json
{
  "code": 1000,
  "msg": "Success"
}
```

登录失败、验证码失败等业务失败常见：

```json
{
  "code": 1001,
  "msg": "Error..."
}
```

DRF 鉴权失败通常返回 HTTP 401/403，并包含错误描述。

### 分页返回

列表接口默认分页，常见结构：

```json
{
  "count": 12,
  "next": "http://127.0.0.1:8000/xxx?page=2",
  "previous": null,
  "results": [],
  "code": 1000,
  "msg": "Success"
}
```

可传：

```text
?page=1&page_size=10
```

多数 GET 查询支持按字段模糊查询，例如：

```text
GET /imageshandle/v1/images?file_name=logo
```

部分字段如 `id` 不走模糊查询。

## 验证码接口

### 发送邮箱验证码

```http
POST /message/v1/sendemailcode
```

请求：

```json
{
  "email": "user@example.com"
}
```

成功：

```json
{
  "mobile_email": "user@example.com",
  "code": 1000,
  "msg": "Success"
}
```

说明：

- 同一邮箱 2 分钟内只能发送一次。
- 后端会删除当天以前的旧验证码。
- 当前实现主要支持邮箱，手机号字段虽然存在，但发送逻辑未实现短信。

### 验证验证码是否有效

```http
POST /message/v1/verifycodevalid
```

请求：

```json
{
  "email": "user@example.com",
  "verification_code": "1234"
}
```

成功：

```json
{
  "code": 1000,
  "msg": "Success"
}
```

说明：

- 验证码有效期按后端认证逻辑为 2 小时。
- 注册和找回密码也会复用该验证码认证逻辑。

## 商家注册登录

### 商家注册

```http
POST /registlogin/v1/companyregist
```

需要先发送并验证邮箱验证码。请求：

```json
{
  "name": "商家公司",
  "email": "user@example.com",
  "mobile": "13800000000",
  "password": "123456",
  "company_category": 1,
  "verification_code": "1234"
}
```

成功返回会过滤 `password`。

说明：

- `email`、`mobile`、`wx_openid` 只要传了就会检查重复。
- `password` 后端保存为 MD5 后的值。

### 商家登录

```http
POST /registlogin/v1/companytoken
```

请求：

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

或：

```json
{
  "mobile": "13800000000",
  "password": "123456"
}
```

成功：

```json
{
  "token": "<company_token>",
  "company_id": 1,
  "code": 1000,
  "msg": "Success"
}
```

后续商家接口使用：

```http
Authorization: <company_token>
```

### 获取公司信息

```http
GET /registlogin/v1/company/<id>
Authorization: <company_token>
```

说明：

- URL 里的 `<id>` 实际不会决定查询对象，后端按 token 对应公司查询。
- 返回中如果有 `avatar`，会额外返回 `avatar_url`。

示例返回：

```json
{
  "id": 1,
  "name": "商家公司",
  "mobile": "13800000000",
  "email": "user@example.com",
  "company_category": 1,
  "avatar": "label-print/2021/6/15/xxx.jpg",
  "avatar_url": "https://purchase-records-1254307677.cos.ap-chengdu.myqcloud.com/label-print/2021/6/15/xxx.jpg",
  "code": 1000,
  "msg": "Success"
}
```

### 修改公司信息

```http
PUT /registlogin/v1/company/<id>
Authorization: <company_token>
```

请求示例：

```json
{
  "name": "新公司名",
  "company_category": 1,
  "avatar": "label-print/2021/6/15/xxx.jpg"
}
```

说明：

- 不允许前端修改 `mobile`、`email`、`id` 等字段。
- 如果传 `avatar`，后端会尝试删除旧头像对象，并从 `Images` 表删除对应临时图片记录。

### 找回密码

```http
PUT /registlogin/v1/companyfindpassword/<id>
```

需要验证码认证。请求：

```json
{
  "email": "user@example.com",
  "password": "new-password",
  "verification_code": "1234"
}
```

说明：

- `<id>` 不参与实际查询。
- 后端根据请求里的 `email` 或 `mobile` 定位公司。

## 图片接口

当前图片接口不是 multipart 上传接口。前端调用流程是：

1. 前端把图片文件名传给后端创建图片记录。
2. 后端生成 `image_cos_name` 和 `sts_obj`。
3. 前端使用返回的 `sts_obj` 和 `image_cos_name` 直传对象存储。
4. 后续业务字段保存 `image_cos_name`。

### 创建图片记录并获取上传凭证

```http
POST /imageshandle/v1/images
Authorization: <company_token>
```

请求：

```json
{
  "image_name": "logo.jpg",
  "explains": "公司 logo"
}
```

成功：

```json
{
  "id": 10,
  "company_id": 1,
  "file_name": "logo.jpg",
  "image_cos_name": "label-print/2021/6/14/tqxh0_1623677124.jpg",
  "image_cos_name_url": "https://purchase-records-1254307677.cos.ap-chengdu.myqcloud.com/label-print/2021/6/14/tqxh0_1623677124.jpg",
  "explains": "公司 logo",
  "sts_obj": {},
  "code": 1000,
  "msg": "Success"
}
```

说明：

- `image_name` 必填，否则不会创建记录。
- `image_cos_name` 是后续业务保存的对象 key。
- `sts_obj` 是前端直传 COS 使用的临时凭证。
- 接口本身不接收图片二进制文件。
- 创建前会清理一天以前未使用的图片记录和对象。

### 查询图片列表

```http
GET /imageshandle/v1/images
Authorization: <company_token>
```

可选查询：

```text
?file_name=logo&page=1&page_size=10
```

返回分页列表，每条记录包含 `image_cos_name`，通常还会包含 `image_cos_name_url`。

### 删除图片

```http
DELETE /imageshandle/v1/images/<id>
Authorization: <company_token>
```

成功：

```http
204 No Content
```

说明：

- 删除数据库记录前，后端会尝试删除对应对象存储文件。

## 标签模板接口

标签模板的 `label_obj` 由后端写成 JSON 文件并保存到对象存储。前端不需要直接上传 JSON 文件。

### 创建标签模板

```http
POST /labeltemplate/v1/labeltemplate
Authorization: <company_token>
```

请求：

```json
{
  "label_title": "镜片标签",
  "product_categray": "1.56",
  "is_lens": 1,
  "label_obj": {
    "width": 60,
    "height": 40,
    "items": []
  }
}
```

成功返回会包含：

```json
{
  "id": 1,
  "company": 1,
  "label_title": "镜片标签",
  "product_categray": "1.56",
  "is_lens": 1,
  "label_object_cos_name": "label-print/2021/6/22/inbd0_1624344753.json",
  "label_object": {
    "width": 60,
    "height": 40,
    "items": [],
    "labid": 1
  },
  "code": 1000,
  "msg": "Success"
}
```

说明：

- 请求字段名是 `label_obj`。
- 响应字段名是 `label_object`。
- 后端会把 `label_object.labid` 更新为当前模板 `id`。

### 查询标签模板列表

```http
GET /labeltemplate/v1/labeltemplate
Authorization: <company_token>
```

说明：

- 只返回当前 token 对应公司的数据。
- GET 返回中会尝试读取 `label_object_cos_name` 指向的 JSON，并补充 `label_object`。

### 查询单个标签模板

```http
GET /labeltemplate/v1/labeltemplate/<id>
Authorization: <company_token>
```

说明：

- 只能查询当前公司自己的模板。
- 返回会包含 `label_object`。

### 修改标签模板

```http
PUT /labeltemplate/v1/labeltemplate/<id>
Authorization: <company_token>
```

请求：

```json
{
  "label_title": "新模板名",
  "product_categray": "1.60",
  "is_lens": 1,
  "label_obj": {
    "width": 60,
    "height": 40,
    "items": []
  }
}
```

说明：

- 修改前，后端会删除旧的 JSON 对象。
- 修改后，新的 `label_obj` 会保存成新的 JSON 对象。

### 删除标签模板

```http
DELETE /labeltemplate/v1/labeltemplate/<id>
Authorization: <company_token>
```

成功：

```http
204 No Content
```

说明：

- 删除数据库记录前，后端会删除对应 JSON 对象。

## 管理员接口

### 管理员登录

```http
POST /registlogin/v1/admintoken
```

请求：

```json
{
  "mobile": "13800000000",
  "password": "123456"
}
```

成功：

```json
{
  "token": "<admin_token>",
  "admin_id": 1,
  "code": 1000,
  "msg": "Success"
}
```

后续管理员接口使用：

```http
Authorization: <admin_token>
```

### 管理员列表

```http
GET /registlogin/v1/admin
Authorization: <admin_token>
```

### 创建管理员

```http
POST /registlogin/v1/admin
Authorization: <admin_token>
```

请求示例：

```json
{
  "name": "admin",
  "mobile": "13800000000",
  "password": "123456",
  "people_id": "",
  "address": "",
  "title": 2,
  "avatar": "",
  "on_job": true
}
```

### 修改管理员

```http
PUT /registlogin/v1/admin/<id>
Authorization: <admin_token>
```

### 删除管理员

```http
DELETE /registlogin/v1/admin/<id>
Authorization: <admin_token>
```

成功返回 `204 No Content`。

### 管理公司列表

```http
GET /registlogin/v1/managecompany
Authorization: <admin_token>
```

### 创建公司

```http
POST /registlogin/v1/managecompany
Authorization: <admin_token>
```

请求字段同公司模型：

```json
{
  "name": "商家公司",
  "mobile": "13800000000",
  "email": "user@example.com",
  "password": "123456",
  "company_category": 1,
  "avatar": "",
  "out_time_stamp": 0
}
```

### 修改公司

```http
PUT /registlogin/v1/managecompany/<id>
Authorization: <admin_token>
```

### 删除公司

```http
DELETE /registlogin/v1/managecompany/<id>
Authorization: <admin_token>
```

## 对象存储字段说明

当前后端没有直接暴露 `/app_cos_handle/` API。对象存储能力通过业务接口间接使用：

- `Images.image_cos_name`
- `LabelTemplate.label_object_cos_name`
- `Company.avatar`

这些字段保存的是对象 key，不是完整 URL。前端显示图片时应优先使用后端返回的 `*_url` 字段，例如：

- `image_cos_name_url`
- `avatar_url`

如果只拿到了 key，需要通过对应业务详情接口重新获取 URL，不建议前端自行拼 URL。

当前图片和头像上传流程依赖 `sts_obj` 直传对象存储；标签模板 JSON 由后端保存和读取。

## 常见前端调用顺序

### 注册登录

1. `POST /message/v1/sendemailcode`
2. `POST /registlogin/v1/companyregist`
3. `POST /registlogin/v1/companytoken`
4. 保存返回的 `token`
5. 后续请求带 `Authorization: <company_token>`

### 上传图片并绑定头像

1. `POST /imageshandle/v1/images`，传 `image_name`
2. 使用返回的 `sts_obj` 和 `image_cos_name` 上传真实图片
3. `PUT /registlogin/v1/company/<id>`，传 `avatar: image_cos_name`

### 保存标签模板

1. `POST /labeltemplate/v1/labeltemplate`，传 `label_obj`
2. 后端保存 JSON，返回 `label_object_cos_name` 和 `label_object`
3. 编辑时 `PUT /labeltemplate/v1/labeltemplate/<id>` 重新提交完整 `label_obj`

