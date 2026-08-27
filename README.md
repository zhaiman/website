# 个人网站

基于 [Astro](https://astro.build) 的个人博客，部署在 Cloudflare Pages。

## 日常写作流程

1. 在 `src/content/blog/` 下新建 `.md` 文件，文件头按下面格式写：

   ```md
   ---
   title: 文章标题
   description: 一句话摘要
   pubDate: 2026-08-27
   ---

   正文……
   ```

2. 本地预览：`npm run dev`，浏览器打开 http://localhost:4321
3. 发布：提交并推送到 GitHub，Cloudflare Pages 自动构建上线

> ⚠️ 注意：**提交信息请用英文**（如 `post: new article about xxx`）。
> 纯中文提交信息会导致 Cloudflare Pages 构建失败（报 "Empty commit message"）。

> ⚠️ 注意：每篇文章开头必须有 frontmatter（title / description / pubDate 三个必填字段），
> 缺失会导致构建失败。文件名建议用英文短横线命名，它决定文章的网址。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览构建结果 |

## 目录结构

- `src/content/blog/` — 文章（日常只碰这里）
- `src/consts.ts` — 站点名称和描述
- `astro.config.mjs` — 站点域名等配置
- `src/layouts/`、`src/components/`、`src/pages/` — 页面结构与样式
