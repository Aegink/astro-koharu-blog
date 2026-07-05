---
title: "docker部署轻阅读后端（ai编写）"
date: 2026-02-06 15:47:37
updated: 2026-02-06 15:49:10
categories:
  - ["旧博客", "技术分享"]
tags:
  - "docker"
  - "Linux"
  - "轻悦时光"
draft: false
catalog: true
---

### 第一步：准备环境（安装 Docker）

1. **检查是否已经安装 Docker**  
   打开终端（Windows 用 PowerShell 或 CMD，Mac/Linux 用 Terminal），输入：
   
   ```plain
   docker --version
   ```
   
   如果显示版本号（如 Docker version 20.x.x），说明已经安装，直接跳到第二步。  
   如果提示命令不存在，就需要安装。
2. **安装 Docker Desktop**（推荐，最简单）
- 去官网下载：https://www.docker.com/products/docker-desktop/
- 根据你的系统选择对应版本（Windows / Mac / Linux 都有）。
- 下载后双击安装，一路“Next”即可。
- 安装完成后，启动 Docker Desktop，它会常驻在系统托盘/菜单栏。
- 再次运行 `docker --version` 确认安装成功。
3. **安装 docker-compose**（新版 Docker Desktop 已内置，无需单独安装）  
   检查是否可用：
   
   ```plain
   docker compose version
   ```
   
   （注意是 `docker compose`，不是老版的 `docker-compose`）  
   如果提示不存在，老版单独安装命令（一般不需要）：
- Windows/Mac：Docker Desktop 已包含。
- Linux：`sudo apt install docker-compose-plugin`

### 第二步：创建项目文件夹

1. 在电脑上创建一个专用文件夹，比如：
- Windows：桌面新建文件夹 `qread`
- Mac/Linux：在家目录下 `mkdir ~/qread`
2. 进入这个文件夹：
   
   ```plain
   cd 路径/to/qread
   ```
   
   示例：
- Windows：`cd Desktop\qread`
- Mac/Linux：`cd ~/qread`

这个文件夹以后会用来放配置文件和数据，方便备份。

### 第三步：创建 docker-compose.yml 文件

1. 在 `qread` 文件夹里新建一个文件，名字必须是 **`docker-compose.yml`**（注意拼写和后缀）。
2. 用记事本/文本编辑器（推荐 VS Code、Notepad++、Vim）打开，复制粘贴以下完整内容：

```yaml
version: '3.8'

services:
  qread:
    image: docker.1ms.run/linmax/read:latest   # 使用毫秒加速镜像，拉取超快
    container_name: qread
    restart: unless-stopped                   # 容器崩溃自动重启
    ports:
      - "8080:8080"                           # 主机8080端口映射到容器8080，可改左边数字
    volumes:
      - ./appdata:/app                        # 数据持久化，appdata文件夹会自动创建
    environment:
      - TZ=Asia/Singapore                     # 时区设为新加坡（你所在位置）
      - DB_TYPE=sqlite                        # 使用内置sqlite数据库，最简单无需额外配置
      - ADMIN_USERNAME=admin                  # 后台管理员用户名
      - ADMIN_PASSWORD=adminadmin             # 后台初始密码（强烈建议登录后立即修改！）
      - ADMIN_UPDATE=true                     # 开启自动更新章节
      - USER_INDEX=0                          # 0=完全开放阅读界面，不需要登录就能看书
```

1. 保存文件，确认文件名就是 `docker-compose.yml`，放在 `qread` 文件夹根目录。

**说明每个参数（可选了解）**：

- `image`: 用加速镜像，拉取速度飞快（国内推荐）。
- `ports`: 左边是你的电脑端口，右边是容器固定端口。如果 8080 被占用，可以改成 `8888:8080`。
- `volumes`: 数据会保存在你文件夹下的 `appdata` 子文件夹，卸载容器也不会丢数据。
- `environment`: 环境变量，全部都是推荐默认值，最简单上手。

### 第四步：启动容器

1. 确保你在 `qread` 文件夹下（里面有 docker-compose.yml）。
2. 运行启动命令：
   
   ```plain
   docker compose up -d
   ```
- 第一次运行会自动下载镜像（几百 MB，加速镜像很快，几分钟内完成）。
- `-d` 表示后台运行，不占用终端。
3. 检查容器是否正常运行：
   
   ```plain
   docker ps
   ```
   
   你应该看到一个叫 `qread` 的容器，状态是 `Up`。

### 第五步：访问 QRead

1. 打开浏览器，输入地址：
   
   ```plain
   http://localhost:8080
   ```
   
   （如果你的端口改成了 8888，就用 http://localhost:8888）
2. **阅读界面**（直接看书）：
- 首页就是小说搜索/阅读页面，无需登录（因为我们设了 USER_INDEX=0）。
- 第一次使用可能需要等几秒加载。
3. **管理后台**（添加书源、设置公告等）：
- 访问：http://localhost:8080/admin
- 账号：admin
- 密码：adminadmin
- 登录后强烈建议立即改密码！（左上角头像 → 修改密码）

### 第六步：基础使用（新手必看）

1. **添加书源**（核心功能，没有书源就没书看）：
- 进入管理后台 → “书源管理” → “导入书源”。
- 推荐直接导入社区主流书源规则（很多现成的 JSON）。
- 常见书源合集可以搜索“QRead 书源”或“读不舍书源”，复制 JSON 内容粘贴导入。
- 导入后 → “书源管理” → 点击“校验”测试书源是否可用。
2. **搜索小说**：
- 回到首页搜索框输入书名，点搜索，就能从所有有效书源拉取结果。
- 点击书籍 → 添加到书架 → 开始阅读。
3. **自动更新章节**：
- 我们已经开启 ADMIN_UPDATE=true，系统会定时检查新章节。

### 第七步：常见操作与维护

- **停止容器**：
  
  ```plain
  docker compose down
  ```
- **重启容器**：
  
  ```plain
  docker compose restart
  ```
- **查看日志（出问题时）**：
  
  ```plain
  docker logs qread
  ```
- **备份数据**：
  直接复制整个 `qread` 文件夹（里面有 appdata 子文件夹，包含数据库和配置）。
- **更新镜像到最新版**：
  
  ```plain
  docker compose pull
  docker compose up -d
  ```
- **卸载完全删除**：
  
  ```plain
  docker compose down -v  # -v 会删除数据卷，谨慎使用
  docker rmi docker.1ms.run/linmax/read:latest
  ```
