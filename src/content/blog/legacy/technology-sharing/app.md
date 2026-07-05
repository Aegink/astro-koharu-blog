---
title: "阅读APP段评页面美化样式"
date: 2026-04-05 12:50:00
updated: 2026-04-05 12:51:41
categories:
  - ["旧博客", "技术分享"]
tags:
  - "Markdown"
  - "开源阅读"
draft: false
catalog: true
---

# 阅读 APP 段评页面美化样式 - 完整部署指南

本文档详细说明如何将美化样式代码嵌入到阅读 APP 的 JSON 源文件中，适用于任何需要修改段评页面的 AI 或开发者。

## 目录

- [一、JSON 文件结构概览](#一json文件结构概览)
- [二、样式代码存放位置](#二样式代码存放位置)
- [三、样式代码模板](#三样式代码模板)
- [四、完整代码上下文](#四完整代码上下文)
- [五、样式参数速查表](#五样式参数速查表)
- [六、部署步骤](#六部署步骤)
- [七、注意事项](#七注意事项)
- [八、效果预览](#八效果预览)

---

## 一、JSON 文件结构概览

阅读 APP 的源文件是一个 JSON 格式文件，核心结构如下：

```json
{
  "jsLib": "这里是最重要的JavaScript代码字符串",
  "其他配置项": "..."
}
```

**关键点：** 所有美化样式代码都存放在 `jsLib` 字段中。

---

## 二、样式代码存放位置

### 2.1 目标函数

样式代码位于 `jsLib` 中的 `showCmt` 函数内部，具体结构如下：

```javascript
function showCmt(bid, cid, para, date) {
    // ... 变量定义 ...

    var prejs = `
        (function(){
            // ... 初始化代码 ...

            setTimeout(function() {
                // ... DOM操作代码 ...

                // ========== 样式代码从这里开始 ==========
                var globalStyle = createEl('style');
                globalStyle.textContent = `【所有CSS样式代码放在这里】`;
                document.head.appendChild(globalStyle);
                // ========== 样式代码到这里结束 ==========

                // ... 后续功能代码 ...
            }, 250);
        })();
    `;

    // ... 调用浏览器显示 ...
}
```

### 2.2 定位标识符

在 `jsLib` 字符串中搜索以下关键词即可快速定位插入点：

| 定位目标         | 搜索关键词                         |
| ---------------- | ---------------------------------- |
| 样式区块开始     | `globalStyle = createEl('style')`  |
| 样式内容开始     | `globalStyle.textContent =` 后面的反引号 `` ` `` |
| 样式区块结束     | `document.head.appendChild(globalStyle)` |

---

## 三、样式代码模板

### 3.1 完整样式代码（直接复制使用）

将以下 CSS 代码放入 `globalStyle.textContent = \`` 和 ```;`` 之间：

```css
#themeToggle, #commentCount { display: none !important; }

.max-w-4xl {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
}

/* ========== 原文卡片样式 ========== */
.content-card {
    position: relative !important;
    background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%) !important;
    padding: 24px 28px 24px 32px !important;
    border-radius: 20px !important;
    box-shadow: 0 4px 20px rgba(149, 157, 165, 0.08), 0 1px 3px rgba(149, 157, 165, 0.05) !important;
    margin: 0 0 20px 0 !important;
    overflow: hidden !important;
    border: 1px solid rgba(230, 235, 240, 0.6) !important;
}

.content-card::before {
    content: '' !important;
    position: absolute !important;
    left: 0 !important;
    top: 16px !important;
    bottom: 16px !important;
    width: 4px !important;
    background: linear-gradient(180deg, #E8A87C 0%, #C38D9E 100%) !important;
    border-radius: 4px !important;
}

.content-card > *:first-child {
    margin: 0 !important;
    font-size: 15px !important;
    font-weight: 500 !important;
    color: #4A5568 !important;
    line-height: 1.6 !important;
}

/* ========== 评论区域卡片 ========== */
.comment-card {
    background: linear-gradient(135deg, #FFFFFF 0%, #FFF9F5 100%) !important;
    padding: 24px !important;
    border-radius: 24px !important;
    box-shadow: 0 8px 32px rgba(149, 157, 165, 0.06), 0 2px 8px rgba(149, 157, 165, 0.04) !important;
    margin: 16px 0 0 0 !important;
    border: 1px solid rgba(232, 168, 124, 0.15) !important;
}

#title {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #2D3748 !important;
    border-radius: 0 !important;
}
#title::before { display: none !important; }

/* ========== 单条评论样式 ========== */
.comment-item, [class*="comment"] {
    background: rgba(255, 255, 255, 0.7) !important;
    border-radius: 16px !important;
    padding: 16px 20px !important;
    margin: 12px 0 !important;
    border: 1px solid rgba(230, 235, 240, 0.5) !important;
    transition: all 0.3s ease !important;
}

.comment-item:hover, [class*="comment"]:hover {
    background: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 4px 16px rgba(149, 157, 165, 0.1) !important;
    transform: translateY(-2px) !important;
}

/* ========== 按钮样式 ========== */
button, .btn, [role="button"] {
    border-radius: 12px !important;
    transition: all 0.2s ease !important;
}

button:hover, .btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(149, 157, 165, 0.15) !important;
}

/* ========== 评论图片 ========== */
.comment-img, img[class*="comment"] {
    border-radius: 12px !important;
    cursor: pointer !important;
    transition: transform 0.3s ease !important;
}
.comment-img:hover {
    transform: scale(1.02) !important;
}

/* ========== 深色模式 ========== */
body.dark-mode {
    background: linear-gradient(180deg, #1A1B21 0%, #16171C 100%) !important;
}

body.dark-mode .content-card {
    background: linear-gradient(135deg, #26272E 0%, #22232A 100%) !important;
    border-color: rgba(255, 255, 255, 0.05) !important;
}

body.dark-mode .content-card::before {
    background: linear-gradient(180deg, #F4A261 0%, #E76F51 100%) !important;
}

body.dark-mode .comment-card {
    background: linear-gradient(135deg, #26272E 0%, #2A2B33 100%) !important;
    border-color: rgba(255, 255, 255, 0.05) !important;
}

body.dark-mode #title {
    color: #E2E8F0 !important;
}

body.dark-mode .comment-item, body.dark-mode [class*="comment"] {
    background: rgba(38, 39, 46, 0.8) !important;
    border-color: rgba(255, 255, 255, 0.05) !important;
}
```

---

## 四、完整代码上下文

以下展示了样式区块在 JavaScript 中的完整上下文，可以直接对照修改：

```javascript
var globalStyle = createEl('style');
globalStyle.textContent = `
    #themeToggle, #commentCount { display: none !important; }

    .max-w-4xl {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
    }

    .content-card {
        position: relative !important;
        background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%) !important;
        padding: 24px 28px 24px 32px !important;
        border-radius: 20px !important;
        box-shadow: 0 4px 20px rgba(149, 157, 165, 0.08), 0 1px 3px rgba(149, 157, 165, 0.05) !important;
        margin: 0 0 20px 0 !important;
        overflow: hidden !important;
        border: 1px solid rgba(230, 235, 240, 0.6) !important;
    }

    .content-card::before {
        content: '' !important;
        position: absolute !important;
        left: 0 !important;
        top: 16px !important;
        bottom: 16px !important;
        width: 4px !important;
        background: linear-gradient(180deg, #E8A87C 0%, #C38D9E 100%) !important;
        border-radius: 4px !important;
    }

    .content-card > *:first-child {
        margin: 0 !important;
        font-size: 15px !important;
        font-weight: 500 !important;
        color: #4A5568 !important;
        line-height: 1.6 !important;
    }

    .comment-card {
        background: linear-gradient(135deg, #FFFFFF 0%, #FFF9F5 100%) !important;
        padding: 24px !important;
        border-radius: 24px !important;
        box-shadow: 0 8px 32px rgba(149, 157, 165, 0.06), 0 2px 8px rgba(149, 157, 165, 0.04) !important;
        margin: 16px 0 0 0 !important;
        border: 1px solid rgba(232, 168, 124, 0.15) !important;
    }

    #title {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        color: #2D3748 !important;
        border-radius: 0 !important;
    }
    #title::before { display: none !important; }

    .comment-item, [class*="comment"] {
        background: rgba(255, 255, 255, 0.7) !important;
        border-radius: 16px !important;
        padding: 16px 20px !important;
        margin: 12px 0 !important;
        border: 1px solid rgba(230, 235, 240, 0.5) !important;
        transition: all 0.3s ease !important;
    }

    .comment-item:hover, [class*="comment"]:hover {
        background: rgba(255, 255, 255, 0.95) !important;
        box-shadow: 0 4px 16px rgba(149, 157, 165, 0.1) !important;
        transform: translateY(-2px) !important;
    }

    button, .btn, [role="button"] {
        border-radius: 12px !important;
        transition: all 0.2s ease !important;
    }

    button:hover, .btn:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(149, 157, 165, 0.15) !important;
    }

    .comment-img, img[class*="comment"] {
        border-radius: 12px !important;
        cursor: pointer !important;
        transition: transform 0.3s ease !important;
    }
    .comment-img:hover {
        transform: scale(1.02) !important;
    }

    body.dark-mode {
        background: linear-gradient(180deg, #1A1B21 0%, #16171C 100%) !important;
    }
    body.dark-mode .content-card {
        background: linear-gradient(135deg, #26272E 0%, #22232A 100%) !important;
        border-color: rgba(255, 255, 255, 0.05) !important;
    }
    body.dark-mode .content-card::before {
        background: linear-gradient(180deg, #F4A261 0%, #E76F51 100%) !important;
    }
    body.dark-mode .comment-card {
        background: linear-gradient(135deg, #26272E 0%, #2A2B33 100%) !important;
        border-color: rgba(255, 255, 255, 0.05) !important;
    }
    body.dark-mode #title {
        color: #E2E8F0 !important;
    }
    body.dark-mode .comment-item, body.dark-mode [class*="comment"] {
        background: rgba(38, 39, 46, 0.8) !important;
        border-color: rgba(255, 255, 255, 0.05) !important;
    }
`;
document.head.appendChild(globalStyle);
```

---

## 五、样式参数速查表

### 5.1 颜色参数

| 用途             | 浅色模式                        | 深色模式                        |
| ---------------- | ------------------------------- | ------------------------------- |
| 装饰条渐变起点   | `#E8A87C` 珊瑚粉                | `#F4A261` 暖橙色                |
| 装饰条渐变终点   | `#C38D9E` 淡紫色                | `#E76F51` 橘红色                |
| 原文文字颜色     | `#4A5568` 中灰                  | `#E2E8F0` 亮灰                  |
| 标题文字颜色     | `#2D3748` 深灰                  | `#E2E8F0` 亮灰                  |
| 卡片背景（原文） | `#FFFFFF` → `#FAFBFC`           | `#26272E` → `#22232A`           |
| 卡片背景（评论） | `#FFFFFF` → `#FFF9F5`           | `#26272E` → `#2A2B33`           |
| 页面背景         | `#F8F9FB` → `#EEF1F5`（渐变）   | `#1A1B21` → `#16171C`（渐变）   |

### 5.2 尺寸参数

| 元素             | 参数名       | 值                         |
| ---------------- | ------------ | -------------------------- |
| 原文卡片圆角     | `border-radius` | 20px                     |
| 评论卡片圆角     | `border-radius` | 24px                     |
| 单条评论圆角     | `border-radius` | 16px                     |
| 按钮圆角         | `border-radius` | 12px                     |
| 装饰条宽度       | `width`      | 4px                        |
| 装饰条圆角       | `border-radius` | 4px                      |
| 原文卡片内边距   | `padding`    | `24px 28px 24px 32px`      |
| 评论卡片内边距   | `padding`    | `24px`                     |
| 单条评论内边距   | `padding`    | `16px 20px`                |

### 5.3 阴影参数

| 元素         | 阴影值                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| 原文卡片     | `0 4px 20px rgba(149,157,165,0.08), 0 1px 3px rgba(149,157,165,0.05)`   |
| 评论卡片     | `0 8px 32px rgba(149,157,165,0.06), 0 2px 8px rgba(149,157,165,0.04)`   |
| 悬停阴影     | `0 4px 16px rgba(149,157,165,0.1)`                                      |

---

## 六、部署步骤

### 步骤 1：读取 JSON 文件

```python
import json

with open('源文件.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
jslib = data.get('jsLib', '')
```

### 步骤 2：定位样式区块

在 `jslib` 字符串中搜索 `globalStyle.textContent =` 找到样式插入位置。

### 步骤 3：替换或插入样式

将上文「[三、样式代码模板](#三样式代码模板)」中的完整 CSS 代码替换到反引号 `之间。

### 步骤 4：保存文件

```python
data['jsLib'] = jslib  # 更新后的jsLib
with open('输出文件.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
```

---

## 七、注意事项

1. **反引号转义**  
   在 JavaScript 字符串中，反引号需要用 ``` 转义。如果直接复制模板代码，确保外部包裹的反引号正确。

2. **`!important` 规则**  
   所有 CSS 规则必须添加 `!important` 以覆盖阅读 APP 的默认样式。

3. **JSON 格式校验**  
   修改后的文件必须是有效的 JSON 格式。可以使用在线 JSON 验证工具或 `json.loads` 检查。

4. **文件编码**  
   必须使用 **UTF-8** 编码保存文件，避免中文注释或特殊字符出现乱码。

5. **深色模式兼容**  
   样式已经内置深色模式支持，但需要 APP 本身支持 `body.dark-mode` 类的切换。如果不生效，可检查 APP 实际使用的深色模式类名。

6. **选择器冲突**  
   部分 APP 可能使用动态生成的类名，如果样式不生效，请根据实际 HTML 结构调整选择器。

---

## 八、效果预览

### 浅色模式
- 原文卡片：白色渐变背景 + 左侧珊瑚粉装饰条
- 评论区域：暖白渐变背景 + 柔和阴影
- 悬停效果：轻微上浮 + 阴影加深

### 深色模式
- 原文卡片：深灰渐变背景 + 左侧暖橙装饰条
- 评论区域：深灰渐变背景
- 文字颜色自动调亮

---

*文档版本：v1.1（优化版）*  
*最后更新：2025 年*
