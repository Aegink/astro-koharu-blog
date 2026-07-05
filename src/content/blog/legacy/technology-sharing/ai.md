---
title: "轻悦时光小说源核心函数 AI 提示词"
date: 2026-02-02 18:05:27
updated: 2026-02-02 18:13:59
categories:
  - ["旧博客", "技术分享"]
tags:
  - "Javascript"
  - "轻悦时光"
draft: false
catalog: true
---

# 轻悦时光小说源核心函数 AI 提示词

**作者**: 雨落星辰  
**更新时间**: 2026-02-2

本文档为“轻悦时光”小说阅读器书源开发提供标准化 AI 提示词模板。  
每个函数对应一个独立提示词，用于指导 AI 根据用户提供的网站结构信息，一步步生成准确、健壮的核心函数代码。

**使用指南**：  
当用户请求某个函数时，直接复制对应提示词（包含“要求如下”及后续全部内容），作为系统提示发送给 AI。AI 将根据用户提供的网站 HTML 片段或描述，生成完整代码。

-----

### 1. 搜索函数 `search(key, page)`

```Plain Text
我需要你为小说书源编写搜索函数 async function search(key, page)，要求如下：

1. 运行环境：
   - 已内置：flutterBridge（日志/调试）、http（Http类）、cache、cookie
   - 工具函数：parseHTMLSafely、removeHTMLTags、removeHTMLSafely
   - 全局变量：baseurl、header

2. 函数逻辑：
   - 根据网站搜索机制拼接请求 URL（如 baseurl + 路径 + key，或从首页提取 form action）
   - 若 page > 1 且网站不支持多页搜索，直接返回 "[]"
   - 使用 http.Get 请求搜索页，必要时设置 Referer 等 header
   - 调用 parseBookList 解析返回结果

3. 异常处理：
   - try-catch 捕获所有异常
   - flutterBridge.log 输出错误信息
   - 异常时返回 "[]"

4. 返回要求：
   - 返回 parseBookList 处理后的 JSON 字符串（书籍列表）

5. 示例代码结构（请根据实际网站调整）：
   // 搜索函数
   async function search(key, page) {
       if (page > 1) return "[]";

       try {
           // 示例：从首页提取搜索表单 action
           const indexRes = await http.Get(baseurl, JSON.stringify({ ...header, Referer: baseurl }), true);
           const $home = parseHTMLSafely(removeHTMLTags(indexRes.data));
           const action = $home.find('form[name="search"]').attr('action') || '/search.php';
           removeHTMLSafely($home);

           const searchUrl = baseurl + action + '?searchkey=' + encodeURIComponent(key);
           const res = await http.Get(searchUrl, JSON.stringify({ ...header, Referer: baseurl }), true);

           return parseBookList(res.data);
       } catch (e) {
           flutterBridge.log("搜索出错: " + e.message);
           return "[]";
       }
   }

请根据用户提供的网站搜索逻辑和 HTML 片段，直接返回完整的 async function search(key, page) 代码。代码结构清晰、添加关键注释，无需多余解释。
```

-----

### 2. 解析书籍列表函数 `parseBookList(html)`

```Plain Text
我需要你为小说书源编写解析书籍列表函数 function parseBookList(html)，要求如下：

1. 运行环境：
   - 已内置：flutterBridge、$（jQuery 类库）、parseHTMLSafely、removeHTMLTags、removeHTMLSafely
   - 全局变量：baseurl

2. 函数逻辑：
   - 使用 parseHTMLSafely(removeHTMLTags(html)) 创建临时容器 $tempContainer
   - 初始化 books = [] 和 bookUrls = new Set() 用于去重
   - 根据用户提供的书籍项选择器（例如 ".item" 或 "li"）遍历每个书籍节点
   - 提取以下字段（必须严格匹配固定对象结构）：
     • bookUrl / tocUrl：主链接，拼接 baseurl，统一以 / 结尾
     • name：书名（长度 < 2 则跳过）
     • author：作者
     • coverUrl：封面（优先 data-original 或 src，拼接 baseurl）
     • intro：简介（移除开头“简介:”等前缀）
     • wordCount：字数
     • latestChapterTitle：最新章节或更新时间
     • kind：分类（无则留空）
     • type：固定为 0
   - 去重基于 bookUrl
   - 组装标准书籍对象并 push 到 books

3. 异常处理：
   - try-catch 捕获异常
   - flutterBridge.log 输出错误
   - 异常时返回 "[]"

4. 返回要求：
   - 返回 JSON.stringify(books)

请根据用户提供的书籍列表 HTML 片段，直接返回完整的 function parseBookList(html) 代码。代码结构清晰、添加关键注释，无需多余解释。
```

-----

### 3. 书籍详情函数 `info(bookurl)`

```Plain Text
我需要你为小说书源编写书籍详情函数 async function info(bookurl)，要求如下：

1. 运行环境：
   - 已内置：flutterBridge、http、$、parseHTMLSafely、removeHTMLTags、removeHTMLSafely
   - 全局变量：baseurl、header

2. 函数逻辑：
   - 使用 http.Get(bookurl, ...) 获取详情页 HTML
   - flutterBridge.text(1, data) 输出源码（用于调试）
   - parseHTMLSafely(removeHTMLTags(html)) 解析
   - 提取字段（与 parseBookList 保持一致）：
     • name、author、kind、coverUrl、intro、wordCount、status、latestChapterTitle、lastUpdate
   - 特殊处理 tocUrl：根据网站规则拼接目录页 URL（如替换为 /indexlist/xxx/），失败则回退为 bookurl
   - 组装标准详情对象

3. 异常处理：
   - try-catch，flutterBridge.log 输出错误，返回 "{}"

4. 返回要求：
   - 返回 JSON.stringify(详情对象)

请根据用户提供的书籍详情页 HTML 片段，直接返回完整的 async function info(bookurl) 代码。代码结构清晰、添加关键注释，无需多余解释。
```

-----

### 4. 章节列表函数 `chapter(tocUrl)` 与辅助函数 `buildPageUrl(tocUrl, pageIndex)`

```Plain Text
我需要你为小说书源编写章节列表函数 async function chapter(tocUrl)，要求如下：

1. 运行环境：
   - 已内置：flutterBridge、http、$、parseHTMLSafely、removeHTMLTags、removeHTMLSafely
   - 依赖：buildPageUrl(tocUrl, pageIndex)、getChapterPage(pageUrl)

2. 函数逻辑：
   - 采用并发分页预取（maxConcurrent = 10）
   - 循环获取直到无下一页或达到安全上限（100 页）
   - 合并所有章节，统一重设 index 字段
   - 输出关键日志（预取页数、获取章节数、停止原因）

3. 异常处理：
   - try-catch，flutterBridge.log 输出错误，返回 "[]"

4. 返回要求：
   - 返回 JSON.stringify(allChapters)

5. 必须同时实现辅助函数 buildPageUrl（根据网站分页规则拼接 URL）

请根据用户提供的目录分页规则，直接返回完整的 async function chapter(tocUrl) 和 function buildPageUrl(tocUrl, pageIndex) 代码。代码结构清晰、添加关键注释，无需多余解释。
```

-----

### 5. 获取单页章节函数 `getChapterPage(pageUrl)`

```Plain Text
我需要你为小说书源编写获取单页章节函数 async function getChapterPage(pageUrl)，要求如下：

1. 运行环境：
   - 已内置：flutterBridge、http、$、parseHTMLSafely、removeHTMLTags、removeHTMLSafely
   - 全局变量：baseurl、header

2. 函数逻辑：
   - http.Get(pageUrl, ...) 获取页面
   - flutterBridge.text(2, data) 输出源码
   - parseHTMLSafely(removeHTMLTags(html)) 解析
   - 根据用户提供的章节链接选择器遍历
   - 过滤无效链接（包含“下载”“TXT”“目录”“下一页”等）
   - 拼接完整 chapterId（兼容多种路径格式）
   - 组装章节对象（name、chapterId、index、isPay/false、isVip/false、isVolume/false、tag=""）
   - 判断 hasNextPage（存在“下一页”链接）
   - 清理临时容器

3. 异常处理：
   - try-catch，返回 { chapters: [], hasNextPage: false }

4. 返回要求：
   - 返回 { chapters: [...], hasNextPage: boolean }

请根据用户提供的目录页 HTML 片段，直接返回完整的 async function getChapterPage(pageUrl) 代码。代码结构清晰、添加关键注释，无需多余解释。
```

-----

### 6. 章节内容函数 `content(url)`

```Plain Text
我需要你为小说书源编写章节内容函数 async function content(url)（支持多页章节），要求如下：

1. 运行环境：
   - 已内置：flutterBridge、http、$、parseHTMLSafely、removeHTMLTags、removeHTMLSafely
   - 全局变量：baseurl、header

2. 函数逻辑：
   - 循环获取分页（最多 10 页防止死循环）
   - 首页 flutterBridge.text(3, data) 输出源码
   - 根据用户提供的内容容器选择器提取正文（优先 p 标签段落）
   - 自动检测并拼接“下一页”链接
   - 合并内容后清理导航文本（上一章/下一章/目录等）
   - 规范化空行（\r\n\r\n 分段）

3. 异常处理：
   - try-catch，flutterBridge.log 输出错误，返回 ""

4. 返回要求：
   - 返回纯文本章节内容

请根据用户提供的正文页 HTML 片段，直接返回完整的 async function content(url) 代码。代码结构清晰、添加关键注释，无需多余解释。
```

-----

### 7. 获取发现分类函数 `getfinds()`

```Plain Text
我需要你为小说书源编写发现分类函数 async function getfinds()，要求如下：

1. 运行环境：
   - 已内置：flutterBridge、http、$、parseHTMLSafely、removeHTMLTags、removeHTMLSafely
   - 全局变量：baseurl、header

2. 函数逻辑：
   - 请求首页 HTML 并解析
   - 根据用户提供的导航选择器遍历分类链接
   - 提取 title（文本）和 href
   - 拼接完整 URL，将分页数字（如 /1/）替换为 /{{page}}/
   - 组装 { title, url, type: 0 }
   - 可根据需要排除特定项（如“记录”“首页”）

3. 异常处理：
   - try-catch，返回 "[]"

4. 返回要求：
   - 返回 JSON.stringify(分类数组)

请根据用户提供的首页导航 HTML 片段，直接返回完整的 async function getfinds() 代码。代码结构清晰、添加关键注释，无需多余解释。
```

-----

### 8. 解析发现列表函数 `parsefindList(html)`

```Plain Text
我需要你为小说书源编写解析发现列表函数 function parsefindList(html)，要求如下：

1. 运行环境：
   - 已内置：flutterBridge、$、parseHTMLSafely、removeHTMLTags、removeHTMLSafely
   - 全局变量：baseurl

2. 函数逻辑：
   - 先询问用户：发现页书籍列表结构是否与搜索页完全一致？
     • 若一致，直接调用 return parseBookList(html);
     • 若不同，继续按以下逻辑编写
   - parseHTMLSafely(removeHTMLTags(html))
   - 支持多种结构共存（使用 bookUrls Set 统一去重）
   - 提取字段与 parseBookList 保持一致（缺失字段留空）
   - 特殊处理 tocUrl（如需从 bookUrl 提取小说 ID 拼接）

3. 异常处理：
   - try-catch，返回 "[]"

4. 返回要求：
   - 返回 JSON.stringify(books)

请根据用户提供的发现页 HTML 片段，直接返回完整的 function parsefindList(html) 代码。代码结构清晰、添加关键注释，无需多余解释。
```

-----

### 9. 发现页书籍列表函数 `find(url, page)`

```Plain Text
我需要你为小说书源编写发现页函数 async function find(url, page)，要求如下：

1. 运行环境：
   - 已内置：flutterBridge、http
   - 依赖：parsefindList(html)

2. 函数逻辑：
   - 将 url 中的 {{page}} 替换为实际 page 值
   - http.Get 请求目标页面
   - 调用 parsefindList 解析并返回结果

3. 异常处理：
   - try-catch，返回 "[]"

4. 返回要求：
   - 返回 parsefindList 处理后的 JSON 字符串

请直接返回完整的 async function find(url, page) 代码（逻辑通常固定，仅需少量调整）。代码结构清晰、添加关键注释，无需多余解释。
```

-----
