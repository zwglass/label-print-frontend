# ZWGlass Label Print Frontend

`frontend_customer` 是 label_print 的前端项目，使用 Next.js 重写。当前源码基于旧站打包产物和首页截图恢复，目标是保持结构清晰、逻辑简单、可维护，并支持静态导出部署。

## 技术栈

- Next.js 14
- React 18
- Bun
- Tailwind CSS 4
- daisyUI 5

## 功能

- 通用标签页面：`/`
- 镜片标签页面：`/lens/`
- 使用说明页面：`/contact/`
- 标签文本新增、编辑、删除
- 标签尺寸编辑
- 二维码/条形码占位显示
- 标签 JSON 导入/导出
- 浏览器本地保存
- 浏览器打印预览/打印
- 尝试读取 LODOP/CLODOP 打印机；未检测到时使用浏览器默认打印机

## 目录结构

```text
.
├── auto_deploy.sh          # 服务器部署脚本，部署 out 静态目录
├── next.config.js          # Next.js 配置，启用静态导出
├── package.json            # 项目依赖和脚本，使用 Bun
├── bun.lock                # Bun 锁文件
├── public/                 # 旧站静态产物和图标资源
├── src/
│   ├── app/                # Next.js App Router 页面
│   ├── components/         # 页面组件和标签编辑组件
│   └── lib/                # 标签模型、本地存储等纯逻辑
└── tmp_imgs/               # 参考截图
```

## 环境要求

安装 Bun：

```bash
curl -fsSL https://bun.sh/install | bash
```

确认版本：

```bash
bun --version
```

当前项目使用：

```text
bun@1.3.13
```

## 安装依赖

```bash
bun install
```

## 环境变量

复制示例配置：

```bash
cp .env.example .env.local
```

常用配置：

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_LODOP_DOWNLOAD_URL=https://label-1254307677.cos.ap-chengdu.myqcloud.com/zip_files/CLodop_Setup_for_Win32NT.exe.zip
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

前端可见变量需要使用 `NEXT_PUBLIC_` 前缀；不要把后端密钥、数据库密码等敏感信息写入这些变量。

## 本地开发

```bash
bun run dev
```

默认访问：

```text
http://localhost:3000
```

如需指定地址和端口：

```bash
bun run dev -- --hostname 127.0.0.1 --port 3000
```

## 构建

```bash
bun run build
```

构建完成后，静态文件输出到：

```text
out/
```

## 生产运行

本项目配置了静态导出：

```js
output: "export"
```

生产环境推荐直接部署 `out/` 目录到 Nginx、静态网站服务或对象存储。

如果只是本地预览静态构建结果，可以使用任意静态文件服务器，例如：

```bash
bunx serve out
```

## 部署

执行构建：

```bash
bun run build
```

然后运行：

```bash
./auto_deploy.sh
```

`auto_deploy.sh` 当前会把服务器上的：

```text
/deploy/label_print/frontend_customer/out
```

同步到：

```text
/www/label_zwglass_net
```

## 注意事项

- 旧 Next/Gatsby 源码已丢失，当前实现是按现有静态产物和截图重写，不包含旧项目中的全部接口逻辑。
- 标签保存优先使用浏览器 `localStorage`，同时支持导出 JSON 文件。
- 打印逻辑使用 `window.print()` 作为可靠基础；如果浏览器环境存在 `LODOP` 或 `CLODOP`，打印机下拉框会尝试读取打印机列表。
