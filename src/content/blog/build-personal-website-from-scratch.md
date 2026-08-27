---
title: 从零搭建个人博客：Astro + GitHub + Cloudflare Pages 完整建站教程
description: 从空文件夹到网站上线全流程实录：Astro 初始化、中文化、Git 版本管理、Cloudflare Pages 自动部署、域名绑定，以及两个真实踩坑记录
pubDate: 2026-08-27
---

这篇教程记录了我搭建本站（www.carryqi.cn）的完整过程，从零开始到网站上线，每一步都经过实际验证。即使你完全没有建站经验，跟着做也能在半天内拥有自己的网站。

## 成果预览

先说这套方案搭出来的东西长什么样：

- **写作方式**：在文件夹里写一个 Markdown 文件，推送后约 1 分钟文章自动上线
- **运行成本**：**0 元**（Cloudflare Pages 免费额度对个人博客绰绰有余）
- **维护成本**：无服务器、无数据库、无安全补丁，纯静态文件托管在 CDN 上
- **访问速度**：Cloudflare 全球 CDN 加速，国内访问也很快

整体链路：

```
本地写 .md 文章 → git push 到 GitHub → Cloudflare Pages 自动构建 → 全球 CDN 发布
```

## 一、技术选型：为什么是 Astro + Cloudflare Pages

建个人博客的常见方案对比：

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| **Astro（本站方案）** | 纯静态、写作即 Markdown、生态成熟 | 需要一点命令行基础 |
| Hugo | 构建极快 | 模板语言上手成本高 |
| Hexo | 老牌方案、主题多 | 生态老化，配置繁琐 |
| WordPress | 功能全、后台可视 | 需要服务器、要维护安全、有成本 |

选 Astro 的核心理由：**内容和代码彻底分离**。日常写作只碰一个文件夹，每篇文章就是一个 `.md` 文件，随时可以用任何编辑器写，用 git 管理历史版本。

选 Cloudflare Pages 的理由：免费额度大（每月 500 次构建、无限静态请求）、全球 CDN、和 Cloudflare 的域名 DNS 无缝集成、push 即部署。

## 二、准备工作

开始前确认这几样东西：

1. **域名一个**（约 ¥50/年，在 Cloudflare Registrar 或阿里云等注册商购买）
2. **Cloudflare 账号**，并且域名 DNS 托管在 Cloudflare（在 Cloudflare 添加站点，按提示把注册商的 nameserver 改成 Cloudflare 提供的两个地址）
3. **GitHub 账号**（代码仓库用，私有仓库也免费）
4. **本地环境**：
   - Node.js 22 以上（[nodejs.org](https://nodejs.org) 下载 LTS 版安装）
   - Git（[git-scm.com](https://git-scm.com) 下载安装）

验证环境，终端里执行：

```bash
node -v    # 应输出 v22.x 或更高
npm -v     # 应输出 10.x 或更高
git --version  # 应输出 git version 2.x
```

## 三、初始化 Astro 项目

打开终端，进入你想放网站的目录：

```bash
cd D:/website   # 换成你的目录
npm create astro@latest .
```

- `.` 表示在当前目录创建（目录需为空）
- 交互提示中选择：模板 **blog**、TypeScript 建议 **strict**、是否安装依赖选 **Yes**

> **提示**：如果它把项目建到了一个随机名字的子文件夹里（比如 `dangerous-dwarf`），把子文件夹里的**所有文件**（包括 `.gitignore`、`.vscode` 等隐藏文件）移到根目录再继续。

创建完成后先验证一次：

```bash
npm run dev
```

浏览器打开 `http://localhost:4321`，能看到 Astro 官方博客模板就说明成功了。

## 四、项目结构速览

初始化完的项目长这样，日常只需要关注少数几个位置：

```
├── src/
│   ├── content/
│   │   └── blog/            # ★ 你的文章都在这里，一个 .md 一篇
│   ├── layouts/             # 文章页骨架（标题、日期、正文的排版）
│   ├── pages/               # 路由：首页 / 文章列表 / 关于页 / RSS
│   ├── components/          # 页头、页脚、日期等小组件
│   ├── styles/              # 全局样式
│   └── consts.ts            # ★ 站点名称和描述，改这里全站生效
├── public/                  # favicon 等静态资源
├── astro.config.mjs         # ★ 站点域名等核心配置
└── package.json
```

带 ★ 的是日常会碰的，其余基本不用动。

## 五、中文化改造

模板默认是英文的，需要改这几个地方：

### 1. 站点信息（`src/consts.ts`）

```ts
export const SITE_TITLE = '你的站点名';
export const SITE_DESCRIPTION = '一句话站点描述';
```

### 2. 域名配置（`astro.config.mjs`）

```js
export default defineConfig({
	site: 'https://www.你的域名.com',
	// ...
});
```

这一步影响 RSS、sitemap 和 SEO 的 canonical 链接，上线前务必改对。

### 3. 界面文案

- `src/components/Header.astro`：导航链接改成「首页 / 文章 / 关于」，顺手删掉模板自带的 Mastodon/Twitter 图标链接
- `src/components/Footer.astro`：页脚版权文字
- `src/layouts/BlogPost.astro`：`<html lang="en">` 改成 `<html lang="zh-CN">`，「Last updated on」改成「最后更新于」
- `src/pages/index.astro`、`src/pages/blog/index.astro`、`src/pages/about.astro`：同样改 `lang`，替换英文欢迎语

### 4. 日期中文化（`src/components/FormattedDate.astro`）

```astro
{date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
```

显示效果：「2026年8月27日」。

### 5. 换掉示例文章

删掉 `src/content/blog/` 里模板自带的英文文章（`first-post.md`、`second-post.md` 等），写自己的（下一节讲格式）。

## 六、写文章的格式（重点）

每篇文章是 `src/content/blog/` 下的一个 Markdown 文件，**开头必须有 frontmatter**：

```markdown
---
title: 文章标题
description: 一句话摘要，用于列表页和搜索引擎
pubDate: 2026-08-27
---

正文从这开始，标准 Markdown 语法随便写……
```

三条规则：

1. **`title`、`description`、`pubDate` 三个字段必填**，缺失会导致构建失败（这是我踩过的第一个坑，后面详说）
2. **文件名就是网址**：`my-first-post.md` 对应 `你的域名/blog/my-first-post/`，所以文件名建议用英文和短横线
3. 正文里**不要再写一级大标题**（`# 标题`）——页面会自动显示 frontmatter 的 title，重复写会出现两个标题

正文支持所有标准 Markdown：加粗、列表、引用、代码块、图片、表格都没问题。图片放进 `src/assets/` 目录，在文章里用 `![描述](../../assets/文件名.jpg)` 引用，Astro 会自动压缩优化。

## 七、Git 版本管理

```bash
git init -b main
git config user.name "你的名字"
git config user.email "你的邮箱"   # 建议用 GitHub 的 noreply 邮箱保护隐私
git add -A
git commit -m "initial commit"
```

> **邮箱隐私技巧**：GitHub → Settings → Emails → 勾选 "Keep my email addresses private"，用形如 `12345678+用户名@users.noreply.github.com` 的地址作为 git 邮箱，提交记录里就不会暴露真实邮箱。

检查项目根目录的 `.gitignore`，确认里面有这几行（模板一般自带，没有就补上）：

```
node_modules/
dist/
.astro/
.claude/settings.local.json
```

## 八、推送到 GitHub

1. 打开 [github.com/new](https://github.com/new) 新建仓库（比如叫 `website`）
2. **不要**勾选自动生成 README / .gitignore（保持空仓库）
3. 本地执行：

```bash
git remote add origin https://github.com/你的用户名/website.git
git push -u origin main
```

Windows 第一次推送会弹出 GitHub 登录窗口，按提示用浏览器授权即可。

## 九、连接 Cloudflare Pages 自动部署

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → 切到 **Pages** 标签 → **Connect to Git**
2. 授权 GitHub，选中刚才的仓库 → **Begin setup**
3. 构建配置 Cloudflare 会自动识别 Astro：
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 点 **Save and Deploy**，等 1~2 分钟，得到一个 `项目名.pages.dev` 的临时网址，打开能访问就说明部署成功

从此以后，每次 `git push` 到 `main` 分支，Cloudflare 会自动拉取代码、执行构建、发布到全球 CDN，全自动。

> 构建失败排查入口：项目页 → **Deployments** → 点失败的那次 → **View build log**，从底部往上找第一个红色报错。

## 十、绑定自己的域名

1. 进入 Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 输入你的域名（如 `www.example.com`）→ Continue
3. 因为域名 DNS 就在 Cloudflare，它会提示自动添加 CNAME 记录，确认即可
4. HTTPS 证书自动签发，几分钟后生效
5. 建议把根域名 `example.com` 也添加一遍，Cloudflare 会自动处理跳转

**如果报错 `Hostname already has externally managed DNS records`**——说明这个子域名之前绑过别的网站，DNS 里还留着旧记录（这是我踩过的第三个坑）：

1. Cloudflare → 域名 → **DNS** → **Records**
2. 找到 `www` 那条 A 或 CNAME 记录，删掉它（别动 MX/TXT 等邮件记录）
3. 如果旧网站也是 Cloudflare Pages 项目，先去旧项目的 Custom domains 里解绑
4. 回新项目重新添加域名，这次会顺利创建指向 `项目名.pages.dev` 的新记录

最后别忘了确认 `astro.config.mjs` 里的 `site` 是最终域名，改完推送一次。

## 十一、日常写作流程（最终形态）

所有基建完成后，写一篇文章的全部动作：

```
1. 在 src/content/blog/ 新建文件，如 travel-notes.md
2. 开头写 frontmatter（title / description / pubDate）
3. 正文用 Markdown 随便写
4. 本地预览（可选）：npm run dev → http://localhost:4321
5. 发布：git add . → git commit → git push
6. 等一分钟，文章上线
```

## 十二、真实踩坑记录

这三个坑都是我上线过程中实际遇到的，提前知道能省不少时间。

### 坑 1：文章缺少 frontmatter

**报错**：`[InvalidContentEntryDataError] blog → xxx data does not match collection schema`

**原因**：Astro 会对每篇文章的文件头做校验，`title`、`description`、`pubDate` 必填。直接把正文开头就写内容的文件放进去，构建直接失败。

**解决**：每篇 `.md` 开头补上三行横线包裹的元信息。**预防**：写新文章时先复制一篇旧文章的 frontmatter 改内容，永远不会忘。

### 坑 2：纯中文的 git 提交信息

**报错**：Cloudflare Pages 构建失败，日志显示 `Empty commit message`

**原因**：这是最隐蔽的一个。同样的代码，中文提交信息构建失败，英文提交信息立即成功——Cloudflare 解析纯中文 commit message 时会把它当成空信息，进而构建异常。

**解决**：**提交信息一律用英文**，比如 `post: new article about travel`、`fix: add frontmatter`。文章内容是中文完全没问题，只有 commit message 这个字段有影响。

### 坑 3：域名绑定提示已有外部 DNS 记录

**报错**：`Hostname 'www.xxx.com' already has externally managed DNS records (A, CNAME, etc). Delete them first.`

**原因**：域名之前绑过别的网站，DNS 里留着指向旧站的记录。

**解决**：见第十节的处理步骤——删旧 DNS 记录、旧项目解绑、重新添加。

## 十三、常用命令速查

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器（localhost:4321） |
| `npm run build` | 构建生产版本到 `dist/`（提交前可用来验证） |
| `npm run preview` | 本地预览构建结果 |
| `git add -A` | 暂存所有改动 |
| `git commit -m "post: xxx"` | 提交（信息用英文！） |
| `git push` | 推送并触发自动部署 |

## 十四、后续可加的功能

网站跑起来之后，这些功能都可以随时按需添加：

- **评论系统**：giscus（基于 GitHub Discussions，免费无广告，一段脚本嵌入文章页即可）
- **访问统计**：Cloudflare Web Analytics（Dashboard 里一键开启，免费且不侵犯访客隐私）
- **站内搜索**：pagefind（构建时自动生成索引，纯静态无后端）
- **文章标签/分类**：给 frontmatter 加 tags 字段，用 Astro 的 content collections API 生成标签页
- **RSS 订阅**：本站已自带（`/rss.xml`），读者可用任意 RSS 阅读器订阅

## 结语

整套流程的核心思想是：**把重复劳动全部交给自动化**。写作只管写 Markdown，版本管理交给 Git，构建和发布交给 Cloudflare，分发交给 CDN。你需要做的唯一一件事就是写作本身。

如果这篇教程帮到了你，欢迎分享给也想搭个人网站的朋友。
