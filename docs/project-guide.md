# 项目新人指南

这份文档给第一次接手这个博客的人看。目标是让你知道：这个项目是什么、能做什么、文章在哪里、后台怎么用、配置怎么改、上线怎么部署。

## 1. 这个项目是什么

这是一个个人博客项目，基于 Astro 生成静态网站，并部署到 Cloudflare Pages。

简单理解：

- Astro 负责把 Markdown 文章和配置文件生成网页。
- Cloudflare Pages 负责把生成好的网站发布到线上。
- GitHub 仓库保存所有源码、文章、图片和配置。
- `/admin/` 后台用于在网页里写文章、上传图片、修改站点配置。

线上访问的是构建后的静态页面，文章源文件保存在仓库里。

## 2. 这个项目有什么用

这个项目主要用于：

- 发布博客文章。
- 管理分类、标签、归档。
- 配置站点标题、头像、导航、友链、歌单、追番等内容。
- 通过后台写文章，不需要每次手动改 Markdown 文件。
- 用 GitHub 和 Cloudflare Pages 自动部署上线。

## 3. 常用地址

请按自己的实际域名替换：

- 博客首页：`https://你的域名/`
- 管理后台：`https://你的域名/admin/`
- 文章列表：`https://你的域名/posts/`
- 分类列表：`https://你的域名/categories/`
- 标签列表：`https://你的域名/tags/`

后台登录密码来自 Cloudflare Pages 环境变量 `CMS_ADMIN_PASSWORD`。登录成功后服务端会签发 8 小时有效的 `HttpOnly` 会话 Cookie，浏览器不会保存明文后台密码。

## 4. 重要目录

| 路径 | 作用 |
|------|------|
| `src/content/blog/` | 所有博客文章，Markdown 文件都在这里 |
| `src/content/blog/legacy/` | 从旧博客迁移过来的文章 |
| `public/img/` | 网站图片资源，头像、封面、文章图片等 |
| `config/site.yaml` | 站点主要配置，标题、导航、友链、歌单、追番等 |
| `src/pages/` | 固定页面，比如关于、友链、音乐页 |
| `cms/` | 管理后台前端代码 |
| `functions/` | Cloudflare Pages Functions 后端接口 |
| `scripts/` | 辅助脚本，比如迁移旧博客 |
| `docs/` | 项目说明文档 |

日常写文章优先用 `/admin/` 后台，不建议直接改 `src/content/blog/`，除非你知道 Markdown frontmatter 的写法。

## 5. 文章是怎么保存的

每篇文章都是一个 Markdown 文件，例如：

```text
src/content/blog/note/yue-du/post-1782929922679.md
src/content/blog/legacy/technology-sharing/linux.md
```

文章开头有一段配置，叫 frontmatter：

```markdown
---
title: "文章标题"
date: 2026-07-06 12:00:00
updated: 2026-07-06 12:00:00
categories:
  - ["旧博客", "技术分享"]
tags:
  - "Linux"
draft: false
catalog: true
---

这里写正文。
```

常用字段说明：

| 字段 | 说明 |
|------|------|
| `title` | 文章标题 |
| `date` | 发布时间 |
| `updated` | 更新时间 |
| `description` | 文章摘要，不写也可以 |
| `cover` | 文章封面图地址 |
| `categories` | 分类，可以是单级，也可以是多级 |
| `tags` | 标签 |
| `draft` | 是否草稿，`true` 不会在线上显示 |
| `catalog` | 是否显示在分类和目录里 |
| `math` | 是否启用数学公式 |
| `password` | 是否设置文章密码 |

## 6. 怎么写文章

推荐方式：使用后台。

1. 打开 `https://你的域名/admin/`。
2. 输入后台密码。
3. 进入文章管理。
4. 新建文章或编辑已有文章。
5. 填标题、分类、标签、发布时间。
6. 写正文，可以使用 Markdown。
7. 上传图片或选择图片。
8. 保存。
9. 等待 Cloudflare Pages 自动部署完成。
10. 回到前台刷新查看。

如果保存后前台没变化，通常是部署还没跑完，或者文章仍是草稿。

## 7. Markdown 常用写法

````markdown
# 一级标题
## 二级标题

这是一段正文。

**加粗文字**

- 列表 1
- 列表 2

[链接文字](https://example.com)

![图片说明](/img/example.png)

```js
console.log("代码块");
```
````

注意：上面最后的代码块只是示例，实际写文章时可以正常使用三个反引号包住代码。

## 8. 图片怎么用

后台上传图片后，会把图片保存到仓库的 `public/img/cms/` 目录，文章里引用类似：

```markdown
![图片说明](/img/uploads/example.webp)
```

如果手动放图片，建议放到：

```text
public/img/
```

然后在文章里用：

```markdown
![图片说明](/img/文件名.png)
```

不要把图片放到 `src/content/blog/` 里面。

## 9. 怎么改站点配置

优先使用后台的“站点设置”页面。

如果需要手动改，主要改：

```text
config/site.yaml
```

常见配置：

| 配置 | 作用 |
|------|------|
| `site.title` | 网站标题 |
| `site.subtitle` | 网站副标题 |
| `site.description` | 网站描述 |
| `site.avatar` | 头像 |
| `site.url` | 网站域名 |
| `navigation` | 顶部导航 |
| `friends` | 友链 |
| `bgm` | 歌单 |
| `bangumi` | 追番 |
| `categoryMap` | 分类名和网址 slug 的对应关系 |

改分类时要注意：文章里的分类名必须能在 `categoryMap` 找到对应 slug，否则分类页面可能不正常。

## 10. 旧博客迁移内容在哪里

旧博客文章已经迁移到：

```text
src/content/blog/legacy/
```

旧文章分类：

- `旧博客 / 技术分享`
- `旧博客 / 知识科普`

对应页面：

```text
/categories/legacy/
/categories/legacy/technology-sharing/
/categories/legacy/knowledge-popularization/
```

注意：旧备份里没有包含原始图片文件，只包含图片记录。当前缺失图片已替换为占位图：

```text
public/img/legacy-media/_missing-image.svg
```

如果以后找回旧 R2 或 uploads 图片文件，再把图片补到 `public/img/legacy-media/`，并替换文章里的占位图引用。

## 11. 怎么本地运行

先进入项目目录：

```powershell
cd F:\Boke\astro-koharu
```

安装依赖：

```powershell
corepack pnpm install
```

启动本地预览：

```powershell
corepack pnpm dev
```

浏览器打开：

```text
http://localhost:4321
```

## 12. 怎么构建检查

上线前建议跑：

```powershell
corepack pnpm build
```

看到 build 成功，说明文章、配置和后台都能正常打包。

如果构建失败，优先检查：

- Markdown frontmatter 格式有没有写错。
- `date` 时间格式是否正确。
- 分类名是否在 `categoryMap` 里。
- 图片路径是否写成了不存在的路径。
- YAML 缩进是否正确，`config/site.yaml` 对缩进很敏感。

## 13. 怎么部署上线

正常流程是 GitHub 自动部署：

1. 本地修改文章、图片或配置。
2. 提交到 Git。
3. 推送到 GitHub 仓库 `Aegink/astro-koharu-blog`。
4. Cloudflare Pages 自动开始构建。
5. 构建成功后，线上网站更新。

常用命令：

```powershell
git status
git add 需要提交的文件
git commit -m "说明这次改了什么"
git push blog main
```

不要把 `.env`、密码、Token、临时缓存提交到仓库。

## 14. Cloudflare Pages 需要的配置

Cloudflare Pages 项目建议绑定 GitHub 仓库：

```text
Aegink/astro-koharu-blog
```

构建配置：

```text
构建命令：corepack pnpm build
输出目录：dist
```

常用环境变量：

| 变量 | 作用 |
|------|------|
| `GITHUB_TOKEN` | 后台写入 GitHub 仓库需要 |
| `CMS_ADMIN_PASSWORD` | 后台登录密码 |
| `CMS_SESSION_SECRET` | 推荐配置；用于签名后台短期会话，未配置时使用后台密码派生 |
| `GITHUB_OWNER` | GitHub 用户名，可选 |
| `GITHUB_REPO` | GitHub 仓库名，可选 |
| `GITHUB_BRANCH` | GitHub 分支名，可选 |

不要把这些值写进代码或文档。

GitHub Actions 部署还需要这些 Secrets：

| Secret | 作用 |
|------|------|
| `CLOUDFLARE_API_TOKEN` | `wrangler pages deploy` 和部署后清理 Cloudflare 缓存需要 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Pages 部署需要 |
| `CLOUDFLARE_ZONE_ID` | 推荐配置；不填时脚本会用 `CLOUDFLARE_ZONE_NAME=wangyouboke.com` 查询 Zone |

`CLOUDFLARE_API_TOKEN` 至少需要 Pages 部署权限；如果要自动清理旧 HTML 缓存，还需要 Cloudflare 缓存清理权限。未配置 `CLOUDFLARE_ZONE_ID` 时，还需要 Zone 读取权限用于查询 Zone。若没有 Zone 权限，缓存清理步骤会跳过，但 Actions 会继续检查线上旧品牌缓存，发现旧内容时仍会失败。

## 15. 常见问题

### 后台保存了文章，前台没变

先看文章是不是 `draft: true`。如果不是草稿，再看 Cloudflare Pages 部署是否完成。

### 图片不显示

检查图片路径是否以 `/img/` 开头，并确认文件在 `public/img/` 下。

### 分类页面打不开

检查 `config/site.yaml` 里的 `categoryMap` 是否有这个分类名。

### 本地能看，线上看不到

大概率是没有提交推送到 GitHub，或者 Cloudflare Pages 构建失败。

### 线上还是旧页面

如果裸 URL 仍显示旧 HTML，但加查询参数的新 URL 正常，通常是 Cloudflare 旧缓存对象未清理。重新运行 GitHub Actions 部署，或在具备 Cloudflare Token 的环境执行 `node scripts/purge-cloudflare-cache.mjs`。

### 不知道该改哪个文件

优先用后台改。必须手动改时，先看这张表：

| 想改什么 | 改哪里 |
|------|------|
| 写文章 | `/admin/` 或 `src/content/blog/` |
| 上传图片 | `/admin/` 或 `public/img/` |
| 网站标题 | `config/site.yaml` |
| 导航菜单 | `config/site.yaml` 的 `navigation` |
| 友链 | `config/site.yaml` 的 `friends` |
| 歌单 | `config/site.yaml` 的 `bgm` |
| 追番 | `config/site.yaml` 的 `bangumi` |
| 关于页 | `src/pages/about.md` |
| 音乐页 | `src/pages/music.md` |

## 16. 给维护者的原则

- 能用后台改，就不要手动改源文件。
- 改配置前先备份或确认 Git 状态。
- 每次上线前跑 `corepack pnpm build`。
- 不提交密码、Token、`.env`。
- 大改前先新建分支，确认没问题再合并。
