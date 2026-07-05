---
title: "Claude Code 完整命令列表"
date: 2026-04-03 17:12:00
updated: 2026-04-03 17:18:15
categories:
  - ["旧博客", "知识科普"]
tags:
  - "Claude Code"
draft: false
catalog: true
---

---

## 一、CLI 命令与标志（终端启动时使用）

### 1.1 基本启动与继续会话

| 命令 | 示例 | 说明 |
|------|------|------|
| `claude` | `claude` | 在当前目录启动交互式会话 |
| `claude "query"` | `claude "解释这个项目的架构"` | 带初始查询启动会话 |
| `claude -c, --continue` | `claude -c` | 继续当前目录最近一次对话 |
| `claude -r <session-id>` | `claude -r "abc123"` | 恢复指定 ID 的会话 |
| `claude -w` | `claude -w` | 在一个独立的 Git worktree 中启动会话 |

### 1.2 非交互模式（适合脚本、管道）

| 命令 | 示例 | 说明 |
|------|------|------|
| `claude -p "query"` | `claude -p "修复这个文件中的语法错误" --file main.c` | 执行后立即退出 |
| `cat file \| claude -p "query"` | `cat error.log \| claude -p "分析错误原因"` | 通过管道传入文件内容 |
| `claude -p --output-format json` | `claude -p "列出所有函数" --output-format json` | 输出 JSON 格式，便于程序解析 |
| `--max-turns <n>` | `claude -p "帮我重构" --max-turns 5` | 限制非交互模式的对话轮数 |

### 1.3 会话与模型配置

| 命令 | 示例 | 说明 |
|------|------|------|
| `--model <model>` | `claude --model opus` | 指定模型（opus/sonnet/haiku） |
| `--add-dir <path>` | `claude --add-dir ../lib --add-dir ../include` | 添加额外的工作目录 |
| `--system-prompt <prompt>` | `claude --system-prompt "你是前端专家，只用TypeScript"` | 完全替换系统提示 |
| `--append-system-prompt <prompt>` | `claude --append-system-prompt "保持回答简洁"` | 追加系统提示 |

### 1.4 权限控制（危险/安全场景）

| 命令 | 示例 | 说明 |
|------|------|------|
| `--dangerously-skip-permissions` | `claude --dangerously-skip-permissions` | **跳过所有权限提示**（仅用于 CI/CD 等可控环境） |
| `--allowedTools "Tool1,Tool2"` | `claude --allowedTools "Read,Write,Edit"` | 只允许某些工具 |
| `--disallowedTools "Tool1"` | `claude --disallowedTools "Bash"` | 禁止使用 Bash 工具 |

### 1.5 更新与诊断

| 命令 | 示例 | 说明 |
|------|------|------|
| `claude update` | `claude update` | 更新 Claude Code 到最新版 |
| `claude mcp` | `claude mcp` | 进入 MCP 服务器配置界面 |
| `--verbose` | `claude --verbose` | 显示详细日志 |
| `--debug` | `claude --debug -p "test"` | 开启调试模式 |

---

## 二、斜杠命令（交互式会话内使用）

### 2.1 会话与上下文管理

| 命令 | 示例 | 说明 |
|------|------|------|
| `/init` | `/init` | 自动扫描项目，生成 `CLAUDE.md` 持久记忆文件 |
| `/clear` | `/clear` | **硬重置**：清除整个对话历史，开启全新会话 |
| `/compact [指令]` | `/compact` 或 `/compact "重点是修复API接口"` | 压缩上下文，释放 token，可附带焦点指令 |
| `/context` | `/context` | 可视化当前上下文占用情况 |
| `/resume` | `/resume` | 列出所有历史会话并选择恢复 |
| `/rename "新名称"` | `/rename "修复登录bug"` | 重命名当前会话 |
| `/export [文件]` | `/export session.txt` | 导出对话记录到文件 |
| `/rewind` | `/rewind` | 回退代码和对话到上一个检查点 |
| `/fork` | `/fork` | 基于当前状态创建新会话（不影响原会话） |
| `/copy` | `/copy` | 将 Claude 最后一条回复复制到剪贴板 |
| `/diff` | `/diff` | 交互式查看本次会话的所有代码改动 |

### 2.2 配置与模型

| 命令 | 示例 | 说明 |
|------|------|------|
| `/model [name]` | `/model opus` | 切换模型（opus/sonnet/haiku） |
| `/effort [level]` | `/effort high` | 设置推理强度（low/medium/high/max） |
| `/config` | `/config` | 查看/修改配置（主题、模型、行为等） |
| `/permissions` | `/permissions` | 管理工具权限规则 |
| `/mcp` | `/mcp` | 管理 MCP 服务器连接 |
| `/terminal-setup` | `/terminal-setup` | 配置终端键绑定（如 Shift+Enter 换行） |
| `/theme` | `/theme` | 更换颜色主题 |
| `/vim` | `/vim` | 切换 Vim 键绑定模式 |
| `/statusline` | `/statusline` | 自定义状态栏内容 |

### 2.3 开发工具与诊断

| 命令 | 示例 | 说明 |
|------|------|------|
| `/plan` | `/plan` | 启动任务规划模式，分解复杂任务 |
| `/review` | `/review src/main.c` | 请求代码审查 |
| `/pr_comments` | `/pr_comments` | 查看当前 PR 中的评论（需 GitHub 关联） |
| `/bug` | `/bug` | 向 Anthropic 报告 bug（自动附带对话信息） |
| `/doctor` | `/doctor` | 诊断环境、配置和运行状况 |
| `/status` | `/status` | 显示系统和账户状态 |

### 2.4 信息与统计

| 命令 | 示例 | 说明 |
|------|------|------|
| `/help` | `/help` | 显示所有斜杠命令的简要说明 |
| `/cost` | `/cost` | 显示当前会话的 token 使用和估算费用 |
| `/usage` | `/usage` | 更详细的使用量统计 |
| `/memory` | `/memory` | 显示/编辑所有 `CLAUDE.md` 内容 |

### 2.5 代理与扩展

| 命令 | 示例 | 说明 |
|------|------|------|
| `/agent` | `/agent` | 启动专门的子代理处理特定任务 |
| `/hooks` | `/hooks` | 管理自动化钩子（如 pre-commit） |
| `/plugin` | `/plugin install my-plugin` | 管理插件 |
| `/bashes` | `/bashes` | 查看后台运行的 Bash 命令 |

### 2.6 隐藏/未文档化命令

| 命令 | 示例 | 说明 |
|------|------|------|
| `/btw` | `/btw "你支持 Python 3.12 吗？"` | 临时插入问题，不打断主任务 |
| `/custom` | `/custom` | 创建自定义斜杠命令（需在 `.claude/commands/` 下放文件） |

---

## 三、键盘快捷键（交互式会话中直接使用）

| 快捷键 | 示例场景 | 说明 |
|--------|----------|------|
| `Ctrl+C` | 正在生成回复时按 | 取消当前生成或输入 |
| `Ctrl+D` | 会话空闲时按 | 安全退出 Claude Code |
| `Ctrl+L` | 屏幕太乱时按 | 清屏但保留对话历史 |
| `Ctrl+R` | 想找之前输入过的命令时按 | 反向搜索命令历史 |
| `Esc + Esc` | 想撤销上一步操作时连按两次 Esc | 回退到上一个检查点（同 `/rewind`） |
| `Shift+Tab` | 循环切换权限模式 | normal → auto-accept → plan → normal |
| `Ctrl+G` | 想用 vim 编辑当前长命令时按 | 在外部编辑器中打开当前输入行 |
| `Ctrl+O` | 调试时按 | 切换详细输出模式 |
| `Ctrl+T` | 想查看当前任务列表时按 | 切换任务列表视图 |
| `Ctrl+F` | 想终止所有后台代理时按（需确认两次） | 强制终止 |
| `\ + Enter` | 需要多行输入时（反斜杠后回车） | 在输入框中创建换行 |
| `Option+Enter` (Mac) / `Alt+Enter` (Win) | 默认换行键 | 在消息中换行 |
| `Shift+Enter` | 支持该键绑定的终端（如 iTerm2） | 换行 |
| `Ctrl+K` | 光标后内容想一次性删掉 | 删除从光标到行尾 |
| `Ctrl+U` | 整行输入错了 | 删除整行输入 |
| `Alt+B` / `Alt+F` | 快速移动光标 | 向后/向前移动一个单词 |
| `Cmd+V` (Mac) / `Ctrl+V` (Win) | 想粘贴截图 | 从剪贴板粘贴图片 |
| `Up` / `Down` | 想复用之前的命令 | 浏览命令历史 |
| `Option+P` (Mac) / `Alt+P` (Win) | 想快速换模型 | 快速切换模型（循环） |
| `Option+T` (Mac) / `Alt+T` (Win) | 开启/关闭扩展思考模式 | 切换思考模式 |
| `?` | 忘记快捷键时按 | 显示所有快捷键 |
| `!` | 在输入框开头打 `!` | 直接运行 Bash 命令，例如 `!ls -la` |
| `@` | 在输入框开头打 `@` | 自动补全文件路径，引用文件内容 |

---

## 四、自定义与扩展

### 4.1 自定义斜杠命令
- **位置**：项目目录 `.claude/commands/` 或用户目录 `~/.claude/commands/`
- **格式**：任意 `.md` 文件，文件名就是命令名（不含扩展名）
- **示例**：创建 `.claude/commands/review.md`，内容：
  ```markdown
  请对以下代码进行严格的安全审查，重点关注内存安全和注入风险：
  ```
  然后就可以在会话中输入 `/review` 触发。

### 4.2 自定义代理（`--agent`）
- 通过 JSON 定义专门的子代理，例如：
  ```bash
  claude --agent '{
    "name": "security-reviewer",
    "tools": ["Read", "Grep"],
    "model": "opus",
    "systemPrompt": "你是安全专家，只报告漏洞"
  }'
  ```

### 4.3 模型上下文协议（MCP）
- 使用 `/mcp` 或 `claude mcp` 添加外部数据源，如 Google Drive、Slack 等。

---

## 五、常用场景示例（组合使用）

| 场景 | 命令/操作 |
|------|----------|
| 初次使用项目，让 Claude 学习代码库 | `claude` → 输入 `/init` → 回答 `是` |
| 在脚本中让 Claude 分析日志并输出 JSON | `cat app.log \| claude -p "提取所有错误" --output-format json` |
| 继续上次未完成的会话 | `claude -c` |
| 想节省 token，压缩长对话 | 会话内输入 `/compact` |
| 快速测试一个 Python 片段 | 输入框打 `!python -c "print(2+2)"` |
| 引用当前文件内容提问 | 输入 `@` + Tab 补全文件路径 |
| 切换模型提高推理质量 | 输入 `/model opus` 或按 `Option+P` |
| 撤销上一次文件编辑 | 按两次 `Esc` 或输入 `/rewind` |
| 查看本次会话花了多少钱 | 输入 `/cost` |

---
