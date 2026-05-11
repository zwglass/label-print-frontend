# Development Guide

本文档用于约束 `frontend_customer` 的后续开发，目标是让项目保持简单、清晰、可靠。

## 基本原则

- 优先保持现有结构，不为小功能引入复杂框架或过度抽象。
- 页面逻辑集中在页面级组件，通用 UI 拆到 `src/components/`。
- 纯数据模型、格式转换、本地存储等逻辑放到 `src/lib/`。
- 代码应易读、少依赖、少副作用。
- 新功能完成后必须至少运行一次构建验证。

## 包管理

项目使用 Bun，不使用 npm/yarn/pnpm。

```bash
bun install
bun run dev
bun run build
```

不要提交以下文件：

```text
package-lock.json
yarn.lock
pnpm-lock.yaml
```

依赖锁文件只保留：

```text
bun.lock
```

## 目录规范

```text
src/
├── app/          # Next.js App Router 页面和全局样式
├── components/   # 可复用 UI 和业务组件
└── lib/          # 纯逻辑、模型、本地存储、工具函数
```

### `src/app/`

- 只放页面入口、布局、metadata 和全局样式。
- 页面文件尽量薄，复杂交互放到 `src/components/`。
- 新页面使用 App Router 目录约定，例如：

```text
src/app/example/page.js
```

### `src/components/`

- 每个组件只负责一个明确职责。
- 客户端交互组件必须在文件顶部写：

```js
"use client";
```

- 组件 props 应保持简单，避免传入过深对象后在子组件中做大量业务决策。

### `src/lib/`

- 只放无 UI 的纯逻辑。
- 优先写可预测的函数，输入明确，输出明确。
- 访问 `window`、`localStorage` 时必须判断运行环境：

```js
if (typeof window === "undefined") return fallback;
```

## 样式规范

当前项目使用 Tailwind CSS 4 + daisyUI 5，入口在：

```text
src/app/globals.css
```

CSS 入口必须保留：

```css
@import "tailwindcss";
@plugin "daisyui";
```

开发要求：

- 通用按钮、表单、弹窗、卡片、导航等优先使用 daisyUI class，例如 `btn`、`select`、`input`、`modal`、`card`、`navbar`。
- 页面布局可以使用 Tailwind utility class。
- 不引入 Ant Design、Material UI 等额外大型 UI 框架，除非确实需要。
- 标签预览区域涉及毫米单位，应保持 `mm` 单位，不随意改成 `px`。
- 标签预览、二维码/条形码占位、打印控制等少量特殊样式可以保留在 `globals.css`。
- 打印样式统一写在 `@media print` 中。
- 移动端布局优先使用 Tailwind 响应式前缀，例如 `max-md:`、`md:`。

## 状态管理

当前项目不使用 Redux、Zustand 等全局状态库。

推荐方式：

- 页面级状态使用 `useState`。
- 派生数据使用 `useMemo`。
- 持久化使用 `src/lib/storage.js`。
- 标签默认模型和创建逻辑放在 `src/lib/labelModels.js`。

不要把标签模型散落在多个组件中重复定义。

## 标签数据规范

标签对象基础结构：

```js
{
  name: "LabelPrint",
  width: 80,
  height: 50,
  unit: "mm",
  texts: [],
  qrCode: {},
  barcode: {}
}
```

文本项基础结构：

```js
{
  value: "New text",
  x: 6,
  y: 5,
  width: 26,
  fontSize: 9,
  bold: false
}
```

要求：

- `width`、`height`、`x`、`y` 默认按毫米处理。
- 导入 JSON 时必须经过 `normalizeLabel`，避免旧数据或坏数据导致页面崩溃。
- 修改模型字段时，同步更新 `normalizeLabel` 和 README/DEVELOPMENT 文档。

## 打印规范

当前打印能力以浏览器打印为基础：

```js
window.print();
```

打印相关要求：

- 打印区域只保留 `.label-preview`。
- 不要在打印时输出工具栏、顶部导航、编辑面板。
- LODOP/CLODOP 只能作为增强能力，不能成为页面正常运行的前置条件。

## 静态导出

项目使用 Next.js 静态导出：

```js
output: "export"
```

要求：

- 不使用必须依赖 Node.js 服务端运行的 API Route。
- 不使用动态服务端渲染能力。
- 构建产物固定输出到：

```text
out/
```

部署脚本应部署 `out/`，不要部署旧的 `public/`。

## 开发流程

1. 安装依赖：

```bash
bun install
```

2. 启动开发服务：

```bash
bun run dev
```

3. 修改代码。

4. 构建验证：

```bash
bun run build
```

5. 确认 `out/` 生成正常。

## 提交前检查

提交或部署前至少检查：

```bash
bun run build
```

并确认：

- 没有新增 npm/yarn/pnpm lockfile。
- 没有把 `.next/`、`out/`、`node_modules/` 作为源码提交。
- `auto_deploy.sh` 仍然部署 `out/`。
- 页面 `/`、`/lens/`、`/contact/` 能正常打开。

## 依赖管理

新增依赖前先判断是否必要：

- 小工具函数优先自己实现。
- 只为明确收益引入依赖。
- 避免引入大型 UI 框架。
- 新增依赖后必须运行：

```bash
bun install
bun run build
```

## 兼容性要求

- 页面应在现代 Chrome、Edge、Safari 中可用。
- 未安装 LODOP 插件时，页面仍应可编辑和浏览器打印。
- 标签 JSON 导入失败时，应提示错误，不应导致页面崩溃。

## 文档同步

以下变更需要同步更新文档：

- 开发命令变化
- 部署路径变化
- 标签数据结构变化
- 打印逻辑变化
- 新增主要页面或核心功能
