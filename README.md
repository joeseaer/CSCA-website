生成日期：2026-11-08

概要：HubCSCA 纯静态官网与备考资源库，包含本地开发、静态构建和 GitHub 自动发布说明。

# HubCSCA 中文官网

基于 Astro、TypeScript 和 CSS 的纯静态前端，没有应用后端或数据库

## 开发

建议使用 Node.js 24 LTS 和 npm，最低 Node.js 版本为 22.23.4

```sh
npm ci
npm run dev
```

默认地址为 `http://127.0.0.1:4321/`，`/` 与 `/zh/` 均为中文首页；资源库位于 `/resources/` 与 `/zh/resources/`。

`scripts/run-astro.mjs` 优先使用兼容的系统 Node.js，也可使用本机已安装的兼容运行时，不修改系统设置

## 检查与构建

```sh
npm run format:check
npm run check
npm run build
npm run preview
```

`npm run format` 统一格式化源码；`npm run check` 执行 Astro 与 TypeScript 检查

构建产物位于 `dist/`，包含首页、资源库、中文路径与 404 页面，可由静态托管或 Nginx 提供服务。

如果部署到 GitHub Pages 仓库子路径，构建前设置 `BASE_PATH=/CSCA-website/`；根域名部署使用默认 `/`

PowerShell 示例：

```powershell
$env:BASE_PATH = '/CSCA-website/'
npm run build
```

GitHub Pages 地址：https://joeseaer.github.io/CSCA-website/

`.github/workflows/deploy-pages.yml` 在 main 更新时自动检查、构建并部署到 GitHub Pages，也可在 Actions 中手动运行；发布来源设为 GitHub Actions

## 代码结构

```text
src/
  assets/fonts/  由构建工具处理的字体
  components/    首屏、学习路径、考试时间表、功能展示和 FAQ
  data/          页面文案、品牌数据、考试配置和外部链接
  layouts/       页面布局与元信息
  pages/         首页、资源库、中文别名和 404 路由
  scripts/       轮播、滚动动画、时区换算和二维码弹窗
  styles/        全局样式及各模块样式
public/
  images/        页面实际使用的图片与二维码
  fonts/         字体授权文件
  resources/     双语术语 JSON、CSV 和原始 DOCX
scripts/         本地开发与构建入口
```

品牌与外部链接在 `src/data/site.ts`，评价和 FAQ 在 `src/data/content.ts`，考试安排在 `src/data/exam-schedule.ts`，功能展示在 `src/data/journey.ts`

页面包含响应式导航、HubCSCA 首屏、评价轮播、滚动学习路径、数据展示、考试时间表、时区换算、四步功能展示、FAQ 与微信二维码咨询，支持键盘操作和减少动画偏好

“了解 HubCSCA”链接到学习平台，咨询入口展示微信二维码。资源库直接提供考试大纲、公式表、双语术语及小程序功能介绍；课程链接在 `site.ts` 中维护。

资源数据位于 `src/data/resources.ts`。考试大纲链接到 CSCA 官方文件；双语术语来自现有词汇库；数学公式为常用公式整理。所有正文在构建时生成 HTML，搜索和分类由浏览器增强，无运行时 API。`npm run build` 会核对页面、站内链接、下载文件和锚点。

服务器部署与自动拉取配置见 [scripts/deployment/README.md](scripts/deployment/README.md)。自定义域名为 `www.hubcsca.dcpstudios.top`，与已有学习平台域名分开。

## 素材与提交范围

Logo、学习场景、界面预览和二维码为页面实际使用的素材；Inter 字体授权见 `public/fonts/OFL.txt`

Git 仅收录前端源码、必要配置、运行素材和本说明，不包含依赖目录、构建产物、PPT 原件、设计截图、开发记录、缓存或本机环境文件
