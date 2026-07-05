---
title: "利用爪云每月$5免费额度搭建轻阅读后端"
date: 2026-03-05 20:58:00
updated: 2026-03-31 11:29:11
categories:
  - ["旧博客", "技术分享"]
tags:
  - "Markdown"
  - "轻悦时光"
draft: false
catalog: true
---

<!--
迁移提示：旧站备份未包含以下图片实体，当前已替换为占位图。
如果后续拿到旧 R2 或 uploads 文件，把对应文件放到 public/img/legacy-media/ 后可重新替换。
- /api/files/cmmvwcj0z00l54x014vxm23yg -> 2026/03/18/f66d2d04c6a04f2b8f90ba3eba975837.png
- /api/files/cmmdg7o07003h4x015p2pjjz2 -> 2026/03/05/acd4625ef2604c1d9a67858399522b5e.png
- /api/files/cmne1ydee00094x01bj7gb616 -> 2026/03/31/14dda7c9f8664d5cb246e810353ffb6b.png
- /api/files/cmmdg846r003j4x01tdez0pk3 -> 2026/03/05/7cb5e4e6e0814573a31b54ff158c6d84.png
- /api/files/cmne1yzz5000b4x01hktteirm -> 2026/03/31/fa6f98429e08431d916e5a40eeffe0ef.png
- /api/files/cmmdg9apx003l4x011jf6av90 -> 2026/03/05/3a9fc1eba3e6442295101d4e08e2dfc2.png
- /api/files/cmmdg9ncr003n4x01ncff62hd -> 2026/03/05/cae7100b75b14eeca4a0f0b33798468b.png
- /api/files/cmne21zl7000f4x01ruqxj385 -> 2026/03/31/7463656390aa4aefb9893203f11d3795.png
- /api/files/cmmdgb2nx003p4x01pirooyvc -> 2026/03/05/9d2dcf8b609742cd9bb3d0027dc60057.png
- /api/files/cmmdgbdiu003r4x01sc90wlrf -> 2026/03/05/5a8900ef61a24802b5c0b6562abc1c1a.png
- /api/files/cmmdgblmu003t4x01y7fttowp -> 2026/03/05/3521dbb24ffc4061bf6766c1e9931065.png
- /api/files/cmne2037c000d4x012jpe845u -> 2026/03/31/0d335fd8d7604c889d6a02ff58db279a.png
- /api/files/cmmdgroln003z4x01368ubx6e -> 2026/03/05/0b2951b3d6e34b619869a81f2972a24e.png
- /api/files/cmne23wm0000h4x01brg3ojwe -> 2026/03/31/485134a6d411496a8024177dd3435eca.png
- /api/files/cmmdgsqu200414x01blkoocbf -> 2026/03/05/177da90c023e43b595b96d207ba468c2.png
- /api/files/cmne24aev000j4x01gq51nuya -> 2026/03/31/a864a65fa21547b8a22e95203f60e1cf.png
- /api/files/cmmdgto8n00434x01nev8xxnz -> 2026/03/05/de9f683bd00c48c799f7cea5a180fb82.png
- /api/files/cmne24pvp000l4x01d3bqxd3k -> 2026/03/31/f32acdf514a54c4094e6156e5becea21.png
- /api/files/cmmdgw6ad00454x01iz30ecdm -> 2026/03/05/e828ce2361504544ba19787d6001f8d6.png
- /api/files/cmne257b8000n4x01z8q9cvh6 -> 2026/03/31/9ac9bfe506fe45d089aa661e5284e79c.png
- /api/files/cmn880lfd01bz4x013pirsx02 -> 2026/03/27/827a4d9bbda04fa5abb3455d82e19985.png
- /api/files/cmn881rjd01c14x01g421sth0 -> 2026/03/27/5fd921eb222140c2bdd5b0b4f77c9ebd.png
- /api/files/cmn882qsp01c34x01bo9zvjjr -> 2026/03/27/1afc793ba3054f32ae438245fd3abf45.png
- /api/files/cmne25kjk000p4x01mdv1fasa -> 2026/03/31/3e32e009667546478fb6b09db80c7910.png
-->

> **作者**: 广大群友  
> 建议个人使用
---

# 利用爪云每月$5 免费额度搭建轻阅读后端

## 适用人群
- 拥有一个注册时间超过 180 天的 GitHub 账号
- 希望零成本搭建个人轻阅读后端服务
- 注意：“每月至少登录一次爪云官网，不然会取消免费额度”

---

## 一、注册并登录爪云平台

1. 访问爪云平台：https://ap-northeast-1.run.claw.cloud/
2. 使用你的 GitHub 账号登录（需满足账号注册时间 > 180 天）
3. 地区选择推荐 *Singapore* 新加坡
![image.png](/img/legacy-media/_missing-image.svg 'image.png')

3. 注册成功后，你将看到平台主界面。如有模板引导，可选择跳过或按需选择“Deploy From Template”

![image.png](/img/legacy-media/_missing-image.svg 'image.png')

![image.png](/img/legacy-media/_missing-image.svg 'image.png')


---

## 二、确认免费额度

1. 点击右上角用户菜单，选择 **Plan**
2. 确认当前计划是否为“永久免费”或包含每月$5 免费额度  
   👇 如下图所示界面：
   
![image.png](/img/legacy-media/_missing-image.svg 'image.png')

![image.png](/img/legacy-media/_missing-image.svg 'image.png')


---

## 三、创建轻阅读容器

1. 点击左侧导航栏第一个图标 **App Launchpad**

![image.png](/img/legacy-media/_missing-image.svg 'image.png')

3. 在页面左上角点击黑色 **Create App** 按钮

 ![image.png](/img/legacy-media/_missing-image.svg 'image.png')

4. 进入容器创建页面，按照下图提示填写基础配置：

详情请看图片

镜像：linmax/read （请务必填写此镜像）

![image.png](/img/legacy-media/_missing-image.svg 'image.png')


![image.png](/img/legacy-media/_missing-image.svg 'image.png')

![image.png](/img/legacy-media/_missing-image.svg 'image.png')

![image.png](/img/legacy-media/_missing-image.svg 'image.png')


![image.png](/img/legacy-media/_missing-image.svg 'image.png')

---

## 四、配置环境变量

在环境变量（Environment Variables）区域，添加以下键值对。
系统默认使用内置的 SQLite 数据库，无需额外配置数据库服务，非常适合个人自用。
如果你希望使用 MySQL，可自行修改相关变量，否则请保持默认或删除 MySQL 相关变量。

![image.png](/img/legacy-media/_missing-image.svg 'image.png')

```plaintext
USER_MAXSOURCE=0
SERVER_HTTP_CORETHREADS=x5
DB_USERNAME=               
USER_TIMEOUT=0
USER_ALLOWCACHE=false
USER_PROXYPNG=false
DB_JDBCURL=               
USER_ALLOWIMG=false
USER_ALLOWUPTXT=false
USER_SOURCE=0
JAVA_CMD=java -jar /app/read.jar
TZ=Asia/Shanghai
DB_TYPE=sqlite            
ADMIN_USERNAME=admin      
SERVER_HTTP_MAXTHREADS=x10
DB_PASSWORD=              
USER_ALLOWCHECK=false
ADMIN_PASSWORD=adminadmin  
PATH=/opt/java/openjdk/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
JAVA_HOME=/opt/java/openjdk
LANG=en_US.UTF-8
JAVA_VERSION=jdk-22.0.2+9
LANGUAGE=en_US:en
LC_ALL=en_US.UTF-8
```

⚠️ 安全提示：

ADMIN_USERNAME 和 ADMIN_PASSWORD 是后台登录凭证，务必改为复杂且唯一的值。

使用 SQLite 时，与 MySQL 相关的变量（DB_USERNAME、DB_PASSWORD、DB_JDBCURL）均可留空或删除，避免混淆。

---

🔧 如需使用 MySQL（高级选项）
若你希望使用外部 MySQL 数据库，请自行搭建并修改以下变量：

DB_TYPE=mysql

DB_USERNAME=你的数据库用户名

DB_PASSWORD=你的数据库密码

DB_JDBCURL=jdbc:mysql://你的 MySQL 地址:3306/数据库名?characterEncoding=UTF-8&allowMultiQueries=true&serverTimezone=UTC

![image.png](/img/legacy-media/_missing-image.svg 'image.png')

---

## 五、开始构建

1. 确认配置无误后，点击右上角 **开始构建**
2. 构建过程约需 3–5 分钟，请耐心等待

![image.png](/img/legacy-media/_missing-image.svg 'image.png')

![image.png](/img/legacy-media/_missing-image.svg 'image.png')


---

## 六、部署成功与访问后台

1. 构建完成后，容器状态显示为“可用”
2. 复制生成的访问链接，在浏览器中打开：`链接+/admin`

![image.png](/img/legacy-media/_missing-image.svg 'image.png')

3. 使用刚刚设置的管理员账号和密码登录后台

![image.png](/img/legacy-media/_missing-image.svg 'image.png')


---

## 七、添加用户与开始使用

1. 登录后台后，进入用户管理页面
2. 添加新用户即可开始使用轻阅读服务
         
  ![image.png](/img/legacy-media/_missing-image.svg 'image.png')

3.  前端访问链接为：`复制的链接`（不带 `/admin`）

![image.png](/img/legacy-media/_missing-image.svg 'image.png')

---
## 八、后端更新

1.进入容器管理界面（App Launchpad 里面）
2.点击下图的“update”

![image.png](/img/legacy-media/_missing-image.svg 'image.png')
3.什么都不改，点击右上角的“update”
![image.png](/img/legacy-media/_missing-image.svg 'image.png')
4.等待容器可用就好了
![image.png](/img/legacy-media/_missing-image.svg 'image.png')


![image.png](/img/legacy-media/_missing-image.svg 'image.png')



---

## 注意事项

- 请妥善保管管理员账号和密码
- 每月免费额度为$5，超出部分将产生费用，请注意用量
- 如需修改配置，可随时在容器管理页面进行调整并重新部署

---
