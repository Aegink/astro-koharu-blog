---
title: "群晖 NAS 部署轻阅读完整教程"
date: 2026-02-15 01:16:58
updated: 2026-02-15 01:19:40
categories:
  - ["旧博客", "技术分享"]
tags:
  - "docker"
  - "轻悦时光"
draft: false
catalog: true
---

<!--
迁移提示：旧站备份未包含以下图片实体，当前已替换为占位图。
如果后续拿到旧 R2 或 uploads 文件，把对应文件放到 public/img/legacy-media/ 后可重新替换。
- /api/files/cmlmkorly00054x013h85v9q6 -> 2026/02/14/3d5d9935b4c5428c82506e6913ae8642.png
- /api/files/cmlmkpujh00074x01fximudtw -> 2026/02/14/96cc8062218144778a23f73d2d7531fa.png
- /api/files/cmlmkr6ch00094x010s8225mb -> 2026/02/14/ac664990b49f43d58e5f6f99571f1369.png
- /api/files/cmlmkropb000b4x01m73p6jx4 -> 2026/02/14/887f439358394133b5fde69bd22fa25a.png
- /api/files/cmlmktexa000d4x010cggazgc -> 2026/02/14/ae0326fc446744fa85a0443f4906982a.png
- /api/files/cmlmkvfdj000f4x01ruspdk9w -> 2026/02/14/d4e99e71a7474c1eb13fddb278e9bca3.png
-->

# 群晖 NAS 部署轻阅读完整教程

**作者**: 河豚

> 这份教程专为**完全小白**用户编写，跟着一步一步操作即可成功部署轻阅读。  
> 感谢原作者及群内大佬的指导，本教程在此基础上进行了更详细的说明和优化。

## 前提条件
- 你已经有一台群晖 NAS
- 群晖系统已开启 **Container Manager**（以前叫 Docker）
- 能正常访问互联网

## 第一步：获取轻阅读的部署代码

1. 打开浏览器，访问官网：**https://www.qread.xyz**
2. 在首页找到 **“部署方式”** 或类似的入口（通常有明显的按钮或导航）
3. 点击进入后，找到 **Docker Compose 部署** 的代码块
4. 在代码块右侧或下方，会有一个 **复制按钮**（通常是两个方块重叠的图标），点击它**完整复制所有代码**

![图片1.png](/img/legacy-media/_missing-image.svg '图片1.png')

![图片2.png](/img/legacy-media/_missing-image.svg '图片2.png')


## 第二步：在群晖创建书籍存储文件夹

1. 打开群晖的 **File Station**（文件管理器）
2. 在左侧选择一个磁盘卷（如 volume1 或 volume2），建议选择空间大的
3. 右上角点击 **创建 → 文件夹**
4. 文件夹名称建议命名为：**qyd**（或你喜欢的名字，比如 qingdu-books）
5. 创建好后，**右键这个文件夹 → 属性**
6. 在弹窗中查看 **位置**，完整路径类似：  
   `/volume1/qyd` 或 `/volume2/docker/qyd`  
   **记住这个路径！后面要多次用到**
   
![图片3.png](/img/legacy-media/_missing-image.svg '图片3.png')


## 第三步：打开 Container Manager 创建项目

1. 打开群晖的 **Container Manager**
2. 左侧菜单点击 **项目**
3. 右上角点击 **创建**

![图片4.png](/img/legacy-media/_missing-image.svg '图片4.png')

## 第四步：填写项目信息并配置

1. **项目名称**：随便填，比如 `qingdu` 或 `轻阅读`
2. **路径**：点击浏览，选择你刚才在 File Station 创建的文件夹（比如 `/volume2/docker/qyd`）
3. **来源**：选择 **从 URL 创建** 或直接选择 **手动输入 Compose 文件**
4. 将第一步复制的代码**完整粘贴**到文本框中


## 第五步：关键修改（必须操作！）

在粘贴的代码中，需要修改以下几处：

### 1. 修改卷挂载路径（最重要！）
找到类似这样的行：
```yaml
volumes:
  - ./data:/app/data
```

或者：

```yaml
- /volume1/docker/qyd:/app/data
```

**必须把左侧的路径改成你第二步记下的实际路径**，例如：

```yaml
volumes:
  - /volume2/docker/qyd:/app/data
```

> 注意：
> 
> - 左侧是你群晖的文件夹路径（宿主机路径）
> - 右侧 `/app/data` 不要动
> - 如果有多个卷，也要对应修改

![修改卷路径示例](/img/legacy-media/_missing-image.svg '图片5.png')
*（图片示意：修改卷路径示例）*

### 2. 修改后台管理员密码（强烈建议修改）

找到以下两行（通常在 environment 部分）：

```yaml
ADMIN_USERNAME: admin
ADMIN_PASSWORD: admin123
```

改成你自己容易记住但安全的用户名和密码，例如：

```yaml
ADMIN_USERNAME: myname
ADMIN_PASSWORD: mysecret123456
```

![图片6.png](/img/legacy-media/_missing-image.svg '图片6.png')

*（图片示意：修改账号密码位置）*

### 3. 端口（一般不用改）

默认端口是 `8080`，如果你的群晖 8080 端口被占用，可以改成别的，比如 `8081`

```yaml
ports:
  - "8080:8080"
```

改为：

```yaml
ports:
  - "8081:8080"
```

## 第六步：完成部署

1. 全部修改完成后，点击 **下一步** → **应用**（或 **创建**）
2. 等待几分钟，Container Manager 会自动下载镜像并启动容器
3. 启动完成后，在 **容器** 页面可以看到轻阅读相关的容器在运行


## 第七步：访问轻阅读

1. 在浏览器输入：  
   `http://你的群晖IP:8080`  
   （例如：`http://192.168.1.100:8080`）
2. 进入主界面即可开始使用
3. 后台管理地址：  
   `http://你的群晖IP:8080/admina`  
   使用你设置的用户名和密码登录

## 常见问题

- 打不开网页？检查端口是否被占用，防火墙是否允许
- 书籍目录为空？把电子书（epub/mobi/pdf 等）上传到你创建的文件夹里
- 想外网访问？需要设置群晖的反向代理或 DDNS + 端口转发（进阶操作）

## 最后

恭喜你！已经成功部署轻阅读了！  
再次感谢群内大佬的无私帮助！

如有任何问题，欢迎留言或回群里询问。
