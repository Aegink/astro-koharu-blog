---
title: "阅读常用js语法"
date: 2026-02-01 22:00:31
updated: 2026-02-01 22:04:31
categories:
  - ["旧博客", "技术分享"]
tags:
  - "Javascript"
  - "开源阅读"
draft: false
catalog: true
---

## **第 1 部分：变量定义（存放数据的盒子）**

**效果**：创建有名字的盒子，用来存放数据

```javascript
// 最简单的盒子 - 字符串盒子（放文字）
let 名字 = "小明";          // 创建叫"名字"的盒子，里面放"小明"
let 书名 = "斗罗大陆";      // 创建叫"书名"的盒子，里面放"斗罗大陆"

// 数字盒子（放数字）
let 年龄 = 18;             // 创建叫"年龄"的盒子，里面放18
let 章节数 = 1000;         // 创建叫"章节数"的盒子，里面放1000
let 价格 = 9.9;            // 创建叫"价格"的盒子，里面放9.9

// 开关盒子（放是/否）
let 是否完结 = true;       // 创建叫"是否完结"的盒子，里面放"是"
let 是否VIP = false;       // 创建叫"是否VIP"的盒子，里面放"否"

// 空盒子（什么都没放）
let 暂无内容 = null;       // 创建叫"暂无内容"的空盒子
```

**书源例子**：

```javascript
// 存放书籍信息
let 当前书名 = "凡人修仙传";
let 当前作者 = "忘语";
let 总字数 = 5000000;
let 是否已完结 = false;
let 最后更新时间 = null;

// 存放网址信息
let 网站域名 = "https://www.example.com";
let 书号 = "1004608738";
let 封面链接 = "https://bookcover.yuewen.com/qdbimg/349573/1004608738/300";
```

---

## **第 2 部分：字符串操作（文字处理）**

**效果**：对文字进行各种处理

```javascript
// 1. 文字连接（把几段文字连起来）
let 姓 = "张";
let 名 = "三";
let 全名 = 姓 + 名;                    // 结果是"张三"

// 2. 文字查找（检查有没有某个词）
let 章节标题 = "第100章 VIP章节";
let 是否VIP = 章节标题.includes("VIP"); // 检查有没有"VIP"这个词
let 是否免费 = 章节标题.includes("免费"); // 检查有没有"免费"

// 3. 文字替换（把A换成B）
let 原始内容 = "本章有广告请删除广告内容";
let 清理后 = 原始内容.replace("广告", ""); // 结果是"本章有请删除内容"

// 4. 文字分割（按符号切开）
let 日期时间 = "2023-01-01 12:30:45";
let 分割结果 = 日期时间.split(" ");       // 按空格切开
分割结果[0]  // 日期部分："2023-01-01"
分割结果[1]  // 时间部分："12:30:45"

// 5. 获取文字长度（数有多少个字）
let 书名 = "斗罗大陆";
let 长度 = 书名.length;                 // 结果是4（4个字）

// 6. 获取部分文字（截取一段）
let 章节标题 = "第一百章 大战开始";
let 前4字 = 章节标题.substring(0, 4);   // 从第0字开始，取4个字："第一百章"
let 从第5字开始 = 章节标题.substring(4);  // 从第5字开始到结束："大战开始"
```

**书源例子**：

```javascript
// 拼接搜索网址
let 搜索关键词 = "玄幻小说";
let 编码后的关键词 = java.encodeURI(搜索关键词);  // 把中文转成网址格式
let 搜索网址 = "https://www.example.com/search?q=" + 编码后的关键词 + "&page=1";

// 检查章节类型
let 章节标题 = "第50章 VIP章节 (收费)";
if (章节标题.includes("VIP") || 章节标题.includes("收费")) {
    let 是否收费 = true;
    java.log("这是收费章节");
}

// 清理广告内容
let 带广告内容 = "正文开始<script>广告</script>正文继续";
let 清理后内容 = 带广告内容.replace(/<script>.*?<\/script>/g, "");  // 去掉所有广告
```

---

## **第 3 部分：数字操作（数学计算）**

**效果**：进行数学计算

```javascript
// 1. 基本计算
let 当前页 = 1;              // 第1页
let 下一页 = 当前页 + 1;       // 2（加法）
let 上一页 = 当前页 - 1;       // 0（减法）
let 两倍页数 = 当前页 * 2;     // 2（乘法）
let 一半页数 = 当前页 / 2;     // 0.5（除法）

// 2. 比较大小
let 页码 = 5;
let 是否第一页 = (页码 == 1);      // false（不等于1）
let 是否大于10 = (页码 > 10);      // false（不大于10）
let 是否小于等于5 = (页码 <= 5);    // true（小于等于5）

// 3. 特殊计算
let 总章节数 = 1500;
let 每页章节数 = 20;
let 总页数 = Math.ceil(总章节数 / 每页章节数);  // 向上取整，75页
let 剩余章节 = 总章节数 % 每页章节数;            // 求余数，0
```

**书源例子**：

```javascript
// 计算分页
let 当前页码 = 1;
let 每页显示 = 20;
let 跳过的章节数 = (当前页码 - 1) * 每页显示;  // 第一页跳过0个，第二页跳过20个

// 构建分页URL
let 基础网址 = "https://www.example.com/books";
let 分页网址;
if (当前页码 == 1) {
    分页网址 = 基础网址;  // 第一页不加页码参数
} else {
    分页网址 = 基础网址 + "?page=" + 当前页码;
}

// 计算阅读进度
let 总章节数 = 1000;
let 已读章节数 = 350;
let 阅读进度 = (已读章节数 / 总章节数) * 100;  // 35%
```

---

## **第 4 部分：数组操作（存放多个东西）**

**效果**：创建一个可以放多个东西的列表

```javascript
// 1. 创建数组（列表）
let 章节列表 = ["第一章", "第二章", "第三章", "第四章"];  // 创建有4个东西的列表

// 2. 访问数组元素（从0开始数）
let 第一章 = 章节列表[0];  // 第一个："第一章"
let 第二章 = 章节列表[1];  // 第二个："第二章"
let 第四章 = 章节列表[3];  // 第四个："第四章"

// 3. 添加新元素
章节列表.push("第五章");    // 在末尾添加"第五章"
章节列表.unshift("序章");   // 在开头添加"序章"

// 4. 删除元素
章节列表.pop();            // 删除最后一个
章节列表.shift();          // 删除第一个

// 5. 数组长度（有多少个元素）
let 章节数量 = 章节列表.length;  // 现在有5个

// 6. 遍历数组（对每个都做同样的事）
for (let i = 0; i < 章节列表.length; i++) {
    java.log("第" + (i + 1) + "个章节：" + 章节列表[i]);
}
```

**书源例子**：

```javascript
// 搜索结果列表
let 搜索结果 = [
    {书名: "斗罗大陆", 作者: "唐家三少"},
    {书名: "斗破苍穹", 作者: "天蚕土豆"},
    {书名: "凡人修仙传", 作者: "忘语"}
];

// 处理搜索结果
for (let i = 0; i < 搜索结果.length; i++) {
    let 当前书籍 = 搜索结果[i];
    java.log("找到书籍：" + 当前书籍.书名 + "，作者：" + 当前书籍.作者);
}

// 章节URL列表
let 章节网址列表 = [
    "https://example.com/chapter/1",
    "https://example.com/chapter/2",
    "https://example.com/chapter/3"
];

// 批量获取章节内容
try {
    let 所有内容 = java.ajaxAll(章节网址列表);  // 同时请求所有网址
    for (let j = 0; j < 所有内容.length; j++) {
        if (所有内容[j]) {
            java.log("第" + (j + 1) + "章获取成功");
        }
    }
} catch (错误) {
    java.log("批量获取失败：" + 错误);
}
```

---

## **第 5 部分：对象操作（带标签的数据）**

**效果**：创建像表格一样的数据结构

```javascript
// 1. 创建对象（像一张表格）
let 书籍信息 = {
    书名: "斗罗大陆",       // 标签"书名"，值"斗罗大陆"
    作者: "唐家三少",       // 标签"作者"，值"唐家三少"
    字数: 3000000,         // 标签"字数"，值3000000
    是否完结: true,         // 标签"是否完结"，值true
    章节列表: ["第一章", "第二章"]  // 标签"章节列表"，值是一个数组
};

// 2. 访问对象属性（通过标签名）
let 书名 = 书籍信息.书名;      // "斗罗大陆"
let 作者 = 书籍信息.作者;      // "唐家三少"
let 第一章 = 书籍信息.章节列表[0];  // "第一章"

// 3. 修改属性值
书籍信息.字数 = 3500000;      // 修改字数为350万
书籍信息.出版社 = "起点中文网";  // 添加新属性"出版社"

// 4. 删除属性
delete 书籍信息.出版社;       // 删除"出版社"这个属性

// 5. 检查是否有某个属性
let 是否有封面 = "封面" in 书籍信息;  // false（没有封面属性）
let 是否有书名 = "书名" in 书籍信息;  // true（有书名属性）
```

**书源例子**：

```javascript
// 构建书籍信息对象
let 书籍详情 = {
    书名: "圣墟",
    作者: "辰东",
    分类: "玄幻",
    字数: "200万字",
    最新章节: "第两千章 辰东宫殿",
    简介: "在破败中崛起，在寂灭中复苏...",
    封面: "https://bookcover.yuewen.com/qdbimg/349573/1004608738/300",
    目录URL: "https://m.qidian.com/book/1004608738"
};

// 在书源规则中使用
// 书名规则填：书籍详情.书名
// 作者规则填：书籍详情.作者
// 封面规则填：书籍详情.封面

// 处理复杂嵌套对象
let API返回数据 = {
    code: 0,  // 状态码
    data: {
        total: 100,  // 总数
        books: [
            {id: 1, name: "书1", author: "作者1"},
            {id: 2, name: "书2", author: "作者2"}
        ]
    },
    message: "成功"
};

// 访问嵌套数据
let 第一本书名 = API返回数据.data.books[0].name;  // "书1"
let 总书籍数 = API返回数据.data.total;            // 100
```

---

## **第 6 部分：条件判断（根据不同情况做不同事）**

**效果**：像做选择题一样，根据条件决定做什么

```javascript
// 1. 简单判断（如果...就...）
let 章节标题 = "第100章 VIP章节";

if (章节标题.includes("VIP")) {
    // 如果包含"VIP"，就执行这里
    java.log("这是VIP章节");
    let 是否收费 = true;
}

// 2. 二选一（如果...就...否则...）
if (章节标题.includes("VIP")) {
    java.log("这是收费章节");
} else {
    java.log("这是免费章节");
}

// 3. 多重选择（如果...就...否则如果...就...否则...）
let 章节类型 = "VIP";

if (章节类型 == "VIP") {
    java.log("VIP章节");
} else if (章节类型 == "试读") {
    java.log("试读章节");
} else if (章节类型 == "免费") {
    java.log("免费章节");
} else {
    java.log("未知章节类型");
}

// 4. 多个条件同时满足（并且）
if (章节标题.includes("VIP") && 章节标题.includes("收费")) {
    java.log("这是VIP收费章节");
}

// 5. 多个条件满足一个（或者）
if (章节标题.includes("VIP") || 章节标题.includes("收费")) {
    java.log("这可能需要付费");
}

// 6. 条件取反（不满足条件时）
if (!章节标题.includes("免费")) {  // !表示"不"
    java.log("这不是免费章节");
}
```

**书源例子**：

```javascript
// 判断第一页特殊处理
let 当前页码 = 1;

if (当前页码 == 1) {
    // 第一页不需要page参数
    let 搜索网址 = "https://example.com/search?q=" + 关键词;
} else {
    // 其他页需要page参数
    let 搜索网址 = "https://example.com/search?q=" + 关键词 + "&page=" + 当前页码;
}

// 判断章节是否可读
let 章节标题 = "第50章 VIP章节 (会员专享)";

if (章节标题.includes("VIP") || 章节标题.includes("会员") || 章节标题.includes("收费")) {
    java.log("此章节需要VIP权限");
    let 是否可读 = false;
} else if (章节标题.includes("试读") || 章节标题.includes("预览")) {
    java.log("这是试读章节");
    let 是否可读 = true;
} else {
    java.log("这是免费章节");
    let 是否可读 = true;
}

// 简化写法（三元运算符）
let 页码 = 1;
let 网址参数 = (页码 == 1) ? "" : "?page=" + 页码;  // 条件?成立时值:不成立时值
let 完整网址 = "https://example.com" + 网址参数;
```

---

## **第 7 部分：循环操作（重复做同样的事）**

**效果**：重复执行相同的操作

```javascript
// 1. for循环（知道要循环多少次时用）
for (let i = 0; i < 5; i++) {
    java.log("这是第" + (i + 1) + "次循环");
}
// 会打印5次，i从0到4

// 2. 遍历数组（最常用）
let 章节列表 = ["第一章", "第二章", "第三章", "第四章"];

// 方法1：for循环
for (let i = 0; i < 章节列表.length; i++) {
    java.log("正在处理：" + 章节列表[i]);
}

// 方法2：forEach（更简单）
章节列表.forEach(function(章节名, 序号) {
    java.log("第" + (序号 + 1) + "章：" + 章节名);
});

// 3. while循环（不知道要循环多少次时用）
let i = 0;
while (i < 章节列表.length) {
    java.log(章节列表[i]);
    i++;  // i增加1，避免无限循环
}

// 4. 遍历对象属性
let 书籍信息 = {
    书名: "斗罗大陆",
    作者: "唐家三少",
    字数: 3000000
};

for (let 属性名 in 书籍信息) {
    java.log(属性名 + "：" + 书籍信息[属性名]);
}
// 会打印：书名：斗罗大陆，作者：唐家三少，字数：3000000
```

**书源例子**：

```javascript
// 批量处理搜索结果
let 搜索结果 = [
    {书名: "书1", 作者: "作者1", 链接: "链接1"},
    {书名: "书2", 作者: "作者2", 链接: "链接2"},
    {书名: "书3", 作者: "作者3", 链接: "链接3"}
];

// 提取所有书名
let 所有书名 = [];
for (let i = 0; i < 搜索结果.length; i++) {
    所有书名.push(搜索结果[i].书名);
    java.log("找到书籍：" + 搜索结果[i].书名);
}

// 批量检查章节是否VIP
let 章节列表 = ["第1章 免费", "第2章 VIP", "第3章 收费", "第4章 免费"];
let VIP章节列表 = [];

章节列表.forEach(function(章节标题, 序号) {
    if (章节标题.includes("VIP") || 章节标题.includes("收费")) {
        VIP章节列表.push("第" + (序号 + 1) + "章");
        java.log("发现VIP章节：" + 章节标题);
    }
});

java.log("共有" + VIP章节列表.length + "个VIP章节");

// 分页加载（循环直到没有下一页）
let 当前页 = 1;
let 还有下一页 = true;
let 所有内容 = [];

while (还有下一页) {
    let 当前页网址 = "https://example.com/page/" + 当前页;
    let 页面内容 = java.ajax(当前页网址);
    
    所有内容.push(页面内容);
    java.log("已加载第" + 当前页 + "页");
    
    // 检查是否有下一页
    if (!页面内容.includes("下一页")) {
        还有下一页 = false;
    }
    
    当前页++;
}
```

---

## **第 8 部分：函数（把代码打包，重复使用）**

**效果**：把一段常用的代码打包起来，像制造一个工具，以后可以反复使用

```javascript
// 1. 创建函数（制造工具）
function 问好() {
    java.log("你好！");
    java.log("欢迎使用书源！");
}

// 使用函数（使用工具）
问好();  // 会打印"你好！"和"欢迎使用书源！"
问好();  // 可以反复使用

// 2. 带参数的函数（可以输入数据的工具）
function 介绍书籍(书名, 作者) {
    java.log("书名：" + 书名);
    java.log("作者：" + 作者);
}

// 使用带参数的函数
介绍书籍("斗罗大陆", "唐家三少");
介绍书籍("斗破苍穹", "天蚕土豆");

// 3. 带返回值的函数（会输出结果的工具）
function 计算总价(单价, 数量) {
    let 总价 = 单价 * 数量;
    return 总价;  // 返回计算结果
}

// 使用返回值
let 书籍总价 = 计算总价(9.9, 3);  // 计算3本书的总价
java.log("总价：" + 书籍总价 + "元");

// 4. 匿名函数（没有名字的函数）
let 计算函数 = function(数字1, 数字2) {
    return 数字1 + 数字2;
};

let 和 = 计算函数(10, 20);  // 结果是30
```

**书源例子**：

```javascript
// 构建搜索URL的函数
function 构建搜索网址(关键词, 页码) {
    let 基础网址 = "https://www.example.com/search";
    if (页码 == 1) {
        return 基础网址 + "?q=" + java.encodeURI(关键词);
    } else {
        return 基础网址 + "?q=" + java.encodeURI(关键词) + "&page=" + 页码;
    }
}

// 使用函数
let 网址1 = 构建搜索网址("玄幻小说", 1);
let 网址2 = 构建搜索网址("武侠小说", 2);
let 网址3 = 构建搜索网址("科幻小说", 3);

java.log("搜索网址1：" + 网址1);
java.log("搜索网址2：" + 网址2);
java.log("搜索网址3：" + 网址3);

// 检查章节是否VIP的函数
function 检查是否VIP(章节标题) {
    if (!章节标题) return false;  // 如果没有标题，返回false
    
    let VIP关键词列表 = ["VIP", "收费", "订阅", "会员", "付费"];
    
    for (let i = 0; i < VIP关键词列表.length; i++) {
        if (章节标题.includes(VIP关键词列表[i])) {
            return true;  // 包含任何一个关键词就是VIP
        }
    }
    
    return false;  // 不包含任何关键词，不是VIP
}

// 使用检查函数
let 章节1 = "第1章 免费章节";
let 章节2 = "第2章 VIP章节";
let 章节3 = "第3章 会员专享";

java.log("章节1是否VIP：" + 检查是否VIP(章节1));  // false
java.log("章节2是否VIP：" + 检查是否VIP(章节2));  // true
java.log("章节3是否VIP：" + 检查是否VIP(章节3));  // true

// 清理HTML内容的函数
function 清理HTML(原始HTML) {
    if (!原始HTML || 原始HTML.length < 10) {
        return "内容为空或太短";
    }
    
    // 去掉script标签
    let 清理后 = 原始HTML.replace(/<script[^>]*>.*?<\/script>/gi, "");
    // 去掉style标签
    清理后 = 清理后.replace(/<style[^>]*>.*?<\/style>/gi, "");
    // 去掉div广告
    清理后 = 清理后.replace(/<div class="ad[^>]*>.*?<\/div>/gi, "");
    // 换行处理
    清理后 = 清理后.replace(/<br[^>]*>/gi, "\n");
    清理后 = 清理后.replace(/<p[^>]*>/gi, "\n");
    // 去掉所有HTML标签
    清理后 = 清理后.replace(/<[^>]+>/g, "");
    // 去掉多余空白行
    清理后 = 清理后.replace(/\n\s*\n/g, "\n\n");
    
    return 清理后.trim();
}

// 使用清理函数
let 原始内容 = "<div>正文开始<script>广告</script><p>第一段</p><br>第二段</div>";
let 干净内容 = 清理HTML(原始内容);
java.log("清理后的内容：" + 干净内容);
```

---

## **第 9 部分：Java 内置方法（书源专用工具）**

### **1. 网络请求方法**

**效果**：从网站获取数据

```javascript
// 最简单的请求（去网站拿东西）
let 网址 = "https://www.example.com/book/123";
let 网页内容 = java.ajax(网址);  // 获取这个网址的内容

// 带请求头的请求（伪装成浏览器）
let 网页内容 = java.ajax(网址, {
    "headers": {
        "User-Agent": "Mozilla/5.0...",  // 浏览器信息
        "Cookie": "user=张三",           // 登录信息
        "Referer": "https://example.com"  // 来源页面
    }
});

// GET请求（获取数据）
let 响应 = java.get(网址, {
    "User-Agent": "浏览器信息",
    "timeout": 5000  // 5秒超时
});
let 内容 = 响应.body();  // 获取响应内容

// POST请求（提交数据）
let 响应 = java.post("https://example.com/search", "keyword=玄幻&page=1", {
    "Content-Type": "application/x-www-form-urlencoded"
});

// 同时请求多个网址（并发请求）
let 网址列表 = [
    "https://example.com/chapter/1",
    "https://example.com/chapter/2",
    "https://example.com/chapter/3"
];
let 响应列表 = java.ajaxAll(网址列表);  // 同时请求所有网址
```

**书源例子**：

```javascript
// 搜索书籍
function 搜索书籍(关键词, 页码) {
    let 编码关键词 = java.encodeURI(关键词);
    let 搜索网址 = "https://www.example.com/search?q=" + 编码关键词 + "&page=" + 页码;
    
    try {
        let 响应 = java.get(搜索网址, {
            "User-Agent": "Mozilla/5.0...",
            "timeout": 10000  // 10秒超时
        });
        
        return 响应.body();  // 返回搜索结果
    } catch (错误) {
        java.log("搜索失败：" + 错误);
        return null;
    }
}

// 获取书籍详情
let 书籍网址 = "https://www.example.com/book/12345";
let 书籍HTML = java.ajax(书籍网址, {
    "headers": {
        "User-Agent": "Mozilla/5.0...",
        "Cookie": java.getCookie("https://www.example.com", null)
    }
});
```

---

### **2. 编码解码方法**

**效果**：处理各种编码格式

```javascript
// URL编码（把中文转成网址格式）
let 关键词 = "玄幻小说";
let 编码后 = java.encodeURI(关键词);  // 结果是"%E7%8E%84%E5%B9%BB%E5%B0%8F%E8%AF%B4"

// 使用示例
let 搜索网址 = "https://example.com/search?q=" + java.encodeURI(关键词);

// Base64编码（把文字转成Base64格式）
let base64编码 = java.base64Encode("Hello World");  // "SGVsbG8gV29ybGQ="

// Base64解码
let 解码后 = java.base64Decode("SGVsbG8gV29ybGQ=");  // "Hello World"

// MD5加密（把文字转成MD5）
let md5值 = java.md5Encode("123456");  // "e10adc3949ba59abbe56e057f20f883e"

// UTF-8转GBK（处理中文编码问题）
let gbk编码 = java.utf8ToGbk("中文内容");

// 处理Cookie
let 全部Cookie = java.getCookie("https://baidu.com", null);  // 获取所有cookie
let 用户ID = java.getCookie("https://baidu.com", "userid");   // 获取特定cookie
```

**书源例子**：

```javascript
// 构建带中文参数的URL
let 搜索关键词 = "玄幻 修仙";
let 编码关键词 = java.encodeURI(搜索关键词);
let 搜索URL = "https://www.example.com/search?keyword=" + 编码关键词;

// 处理Base64编码的内容
let base64内容 = "SGVsbG8g5L2g5aW9";  // 这是Base64编码的"Hello 世界"
let 解码内容 = java.base64Decode(base64内容);
java.log("解码后：" + 解码内容);

// 使用MD5处理密码
let 用户名 = "admin";
let 密码 = "123456";
let md5密码 = java.md5Encode(密码);
let 登录数据 = "username=" + 用户名 + "&password=" + md5密码;

// 处理GBK编码的网站
let gbk网站内容 = java.ajax("https://gbk-example.com", {
    "charset": "gbk"  // 指定编码为GBK
});
```

---

### **3. 文件操作方法**

**效果**：读取和操作本地文件

```javascript
// 读取文本文件
let 文件内容 = java.readTxtFile("cache/book123.txt");  // 读取缓存文件

// 读取文件（指定编码）
let 文件内容 = java.readTxtFile("cache/book123.txt", "UTF-8");

// 写入文件（通过下载）
let 内容 = "这是要保存的书籍信息";
let 文件路径 = java.downloadFile(内容, "book_info.txt");  // 保存为文件

// 删除文件
deleteFile("cache/temp.txt");  // 删除临时文件

// 解压ZIP文件
let 解压路径 = java.unzipFile("download/book.zip");  // 解压ZIP

// 读取ZIP中的文件
let zip内容 = java.getZipStringContent("https://example.com/book.zip", "book.txt");
```

**书源例子**：

```javascript
// 缓存书籍信息
function 缓存书籍(书号, 书籍信息) {
    let 缓存文件名 = "cache/book_" + 书号 + ".json";
    let json内容 = JSON.stringify(书籍信息);
    
    try {
        java.downloadFile(json内容, 缓存文件名);
        java.log("书籍信息已缓存：" + 书号);
    } catch (错误) {
        java.log("缓存失败：" + 错误);
    }
}

// 读取缓存
function 读取缓存(书号) {
    let 缓存文件名 = "cache/book_" + 书号 + ".json";
    
    try {
        let 文件内容 = java.readTxtFile(缓存文件名);
        if (文件内容) {
            return JSON.parse(文件内容);  // 转成对象
        }
    } catch (错误) {
        // 文件不存在或读取失败
    }
    
    return null;  // 没有缓存
}

// 使用缓存
let 书号 = "12345";
let 缓存数据 = 读取缓存(书号);

if (缓存数据) {
    java.log("使用缓存数据：" + 缓存数据.书名);
} else {
    // 没有缓存，从网络获取
    let 书籍信息 = 从网络获取书籍(书号);
    缓存书籍(书号, 书籍信息);
}
```

---

### **4. 时间处理方法**

**效果**：处理时间相关操作

```javascript
// 格式化时间戳（时间戳是数字形式的时间）
let 时间戳 = 1675209600000;  // 这个数字代表2023年2月1日
let 格式化时间 = java.timeFormat(时间戳);  // 结果是"2023/02/01 00:00"

// 格式化字符串时间
let 时间字符串 = "2023-01-01 12:30:45";
let 格式化后 = java.timeFormat(时间字符串);  // 结果是"2023/01/01 12:30"

// 获取当前时间戳
let 当前时间戳 = Date.now();  // 当前时间的数字表示

// 计算时间差（用于统计耗时）
let 开始时间 = Date.now();
// ... 执行一些操作 ...
let 结束时间 = Date.now();
let 耗时毫秒 = 结束时间 - 开始时间;  // 计算耗时
let 耗时秒 = 耗时毫秒 / 1000;        // 转换成秒
```

**书源例子**：

```javascript
// 格式化更新时间
let 更新时间戳 = 1675209600000;  // 从网站获取的时间戳
let 可读时间 = java.timeFormat(更新时间戳);
java.log("最后更新时间：" + 可读时间);

// 计算章节发布时间
function 计算发布时间(原始时间字符串) {
    // 原始时间可能是各种格式，统一格式化
    return java.timeFormat(原始时间字符串);
}

// 统计操作耗时
function 执行耗时操作() {
    let 开始时间 = Date.now();
    
    // 执行一些耗时操作
    for (let i = 0; i < 1000; i++) {
        // 模拟耗时操作
    }
    
    let 结束时间 = Date.now();
    let 总耗时 = 结束时间 - 开始时间;
    
    java.log("操作耗时：" + 总耗时 + "毫秒");
    return 总耗时;
}

// 检查缓存是否过期
let 缓存时间戳 = 1675209600000;  // 缓存创建时间
let 当前时间戳 = Date.now();
let 时间差 = 当前时间戳 - 缓存时间戳;
let 是否过期 = 时间差 > (24 * 60 * 60 * 1000);  // 超过24小时算过期

if (是否过期) {
    java.log("缓存已过期，重新获取");
} else {
    java.log("使用缓存数据");
}
```

---

### **5. 调试方法**

**效果**：输出调试信息，帮助查找问题

```javascript
// 输出普通日志
java.log("开始执行搜索...");

// 输出变量值
let 书名 = "斗罗大陆";
let 作者 = "唐家三少";
java.log("书名：" + 书名);
java.log("作者：" + 作者);
java.log("书名=" + 书名 + "，作者=" + 作者);  // 合并输出

// 输出对象内容
let 书籍信息 = {
    书名: "凡人修仙传",
    作者: "忘语",
    字数: 5000000
};
java.log("书籍信息：" + JSON.stringify(书籍信息));  // 转成字符串输出

// 输出数组内容
let 章节列表 = ["第一章", "第二章", "第三章"];
章节列表.forEach(function(章节, 索引) {
    java.log("章节" + (索引 + 1) + "：" + 章节);
});

// 错误调试
try {
    let 内容 = java.ajax("错误的网址");
} catch (错误) {
    java.log("发生错误：" + 错误);
    java.log("错误堆栈：" + 错误.stack);  // 详细错误信息
}

// 性能调试
let 开始时间 = Date.now();
// ... 执行代码 ...
let 结束时间 = Date.now();
java.log("代码执行耗时：" + (结束时间 - 开始时间) + "毫秒");
```

**书源例子**：

```javascript
// 调试搜索功能
function 调试搜索(关键词) {
    java.log("=== 搜索调试开始 ===");
    java.log("搜索关键词：" + 关键词);
    
    let 搜索网址 = 构建搜索网址(关键词, 1);
    java.log("搜索网址：" + 搜索网址);
    
    try {
        let 搜索结果 = java.ajax(搜索网址);
        java.log("获取成功，内容长度：" + 搜索结果.length);
        
        // 解析结果
        let 解析结果 = 解析搜索结果(搜索结果);
        java.log("解析到 " + 解析结果.length + " 本书籍");
        
        return 解析结果;
    } catch (错误) {
        java.log("搜索失败：" + 错误);
        return [];
    }
}

// 分步调试
function 分步调试书源() {
    java.log("步骤1：测试搜索...");
    let 搜索结果 = 调试搜索("系统");
    
    if (搜索结果.length > 0) {
        java.log("步骤2：测试第一本书的详情...");
        let 第一本书 = 搜索结果[0];
        let 详情 = 获取书籍详情(第一本书.链接);
        
        if (详情) {
            java.log("步骤3：测试目录...");
            let 目录 = 获取目录(详情.目录链接);
            
            if (目录 && 目录.length > 0) {
                java.log("步骤4：测试正文...");
                let 正文 = 获取正文(目录[0].链接);
                
                if (正文) {
                    java.log("所有功能测试通过！");
                    return true;
                }
            }
        }
    }
    
    java.log("测试失败");
    return false;
}
```

---

## **第 10 部分：错误处理（防止程序崩溃）**

**效果**：当代码出错时，优雅地处理错误，而不是直接崩溃

```javascript
// try-catch基本结构
try {
    // 尝试执行这里的代码（可能会出错）
    let 网页内容 = java.ajax("https://example.com/book/123");
    java.log("获取成功，长度：" + 网页内容.length);
} catch (错误) {
    // 如果出错了，执行这里（不会崩溃）
    java.log("获取失败：" + 错误);
    // 给一个默认值
    let 网页内容 = "获取失败，请检查网络";
}

// 带finally的结构（无论是否出错都会执行）
try {
    let 内容 = java.ajax(网址);
} catch (错误) {
    java.log("错误：" + 错误);
} finally {
    java.log("无论是否出错，都会执行这里");
}

// 抛出错误（主动制造错误）
if (!内容 || 内容.length < 10) {
    throw new Error("内容太短或为空");  // 主动抛出错误
}
```

**书源例子**：

```javascript
// 安全的网络请求函数
function 安全获取(网址) {
    try {
        let 内容 = java.ajax(网址);
        
        if (!内容) {
            throw new Error("返回内容为空");
        }
        
        if (内容.length < 10) {
            throw new Error("内容过短，可能不是有效页面");
        }
        
        if (内容.includes("404") || 内容.includes("Not Found")) {
            throw new Error("页面不存在");
        }
        
        return 内容;  // 成功则返回内容
    } catch (错误) {
        java.log("网址 " + 网址 + " 获取失败：" + 错误.message);
        return null;  // 失败则返回null
    }
}

// 使用安全函数
let 内容1 = 安全获取("https://example.com/book/1");
let 内容2 = 安全获取("https://example.com/book/2");

if (内容1) {
    java.log("第一个网址获取成功");
    处理内容(内容1);
} else {
    java.log("第一个网址获取失败，尝试备用网址");
    let 备用内容 = 安全获取("https://backup.example.com/book/1");
    if (备用内容) {
        处理内容(备用内容);
    }
}

// 批量安全处理
function 批量安全处理(网址列表) {
    let 成功结果 = [];
    let 失败列表 = [];
    
    for (let i = 0; i < 网址列表.length; i++) {
        let 网址 = 网址列表[i];
        try {
            let 内容 = java.ajax(网址);
            if (内容) {
                成功结果.push(内容);
                java.log("网址 " + (i + 1) + " 获取成功");
            } else {
                失败列表.push(网址);
                java.log("网址 " + (i + 1) + " 获取失败：内容为空");
            }
        } catch (错误) {
            失败列表.push(网址);
            java.log("网址 " + (i + 1) + " 获取失败：" + 错误.message);
        }
    }
    
    return {
        成功: 成功结果,
        失败: 失败列表,
        成功率: (成功结果.length / 网址列表.length) * 100
    };
}

// 使用批量处理
let 网址列表 = [
    "https://example.com/chapter/1",
    "https://example.com/chapter/2",
    "https://example.com/chapter/3"
];

let 处理结果 = 批量安全处理(网址列表);
java.log("成功获取 " + 处理结果.成功.length + " 个章节");
java.log("失败 " + 处理结果.失败.length + " 个章节");
java.log("成功率：" + 处理结果.成功率.toFixed(2) + "%");
```

---

## **第 11 部分：JSON 数据处理**

**效果**：处理 JSON 格式的数据，JSON 是一种常用的数据交换格式

```javascript
// 1. JSON字符串（看起来像对象的字符串）
let json字符串 = '{"书名":"斗罗大陆","作者":"唐家三少","字数":3000000}';

// 2. 字符串转JSON对象（可以像对象一样使用）
let 书籍对象 = JSON.parse(json字符串);
let 书名 = 书籍对象.书名;      // "斗罗大陆"
let 作者 = 书籍对象.作者;      // "唐家三少"
let 字数 = 书籍对象.字数;      // 3000000

// 3. JSON对象转字符串（用于存储或传输）
let 书籍信息 = {
    书名: "斗破苍穹",
    作者: "天蚕土豆",
    状态: "已完结"
};
let 字符串格式 = JSON.stringify(书籍信息);
// 结果是 '{"书名":"斗破苍穹","作者":"天蚕土豆","状态":"已完结"}'

// 4. 处理嵌套的JSON数据
let 复杂数据 = {
    状态: "成功",
    数据: {
        书籍列表: [
            {id: 1, 书名: "书1", 作者: "作者1"},
            {id: 2, 书名: "书2", 作者: "作者2"}
        ],
        总数: 100
    }
};

// 访问嵌套数据
let 第一本书名 = 复杂数据.数据.书籍列表[0].书名;  // "书1"
let 总数 = 复杂数据.数据.总数;               // 100
let 状态码 = 复杂数据.状态;                  // "成功"
```

**书源例子**：

```javascript
// 处理API返回的JSON数据
let api网址 = "https://api.example.com/books/search?q=玄幻";
let api响应 = java.ajax(api网址);

try {
    let json数据 = JSON.parse(api响应);  // 解析JSON
    
    if (json数据.code === 0) {  // 状态码为0表示成功
        let 书籍列表 = json数据.data.books;
        let 总结果数 = json数据.data.total;
        
        java.log("搜索成功，找到 " + 总结果数 + " 本书");
        
        // 处理每本书
        书籍列表.forEach(function(书籍, 索引) {
            java.log("书籍" + (索引 + 1) + "：" + 书籍.书名);
            java.log("  作者：" + 书籍.作者);
            java.log("  简介：" + 书籍.简介);
        });
    } else {
        java.log("API返回错误：" + json数据.message);
    }
} catch (错误) {
    java.log("解析JSON失败：" + 错误);
}

// 创建JSON数据发送给API
let 登录数据 = {
    username: "用户名",
    password: "密码",
    remember: true
};

let 登录数据字符串 = JSON.stringify(登录数据);

let 登录响应 = java.post("https://api.example.com/login", 登录数据字符串, {
    "Content-Type": "application/json"
});

// 在书源规则中返回JSON
function 生成书籍信息() {
    return JSON.stringify({
        书名: "圣墟",
        作者: "辰东",
        分类: "玄幻",
        字数: "200万字",
        最新章节: "第两千章 辰东宫殿",
        简介: "在破败中崛起，在寂灭中复苏...",
        封面: "https://bookcover.yuewen.com/qdbimg/349573/1004608738/300",
        目录URL: "https://m.qidian.com/book/1004608738"
    });
}
```

---

## **第 12 部分：正则表达式基础**

**效果**：用特定的规则匹配和提取文本

```javascript
// 1. 简单匹配（查找数字）
let 文本 = "更新时间：2023-01-01 12:30:45";
let 日期匹配 = 文本.match(/\d{4}-\d{2}-\d{2}/);  // 匹配4位-2位-2位的数字
// 匹配到 "2023-01-01"

// 2. 分组提取（提取特定部分）
let 章节信息 = "第100章 大战开始 (字数：3056)";
let 匹配结果 = 章节信息.match(/第(\d+)章\s+(.+)\s+\(字数：(\d+)\)/);
// 匹配结果[1] = "100" (章节号)
// 匹配结果[2] = "大战开始" (标题)
// 匹配结果[3] = "3056" (字数)

// 3. 替换内容（去掉不需要的部分）
let 原始内容 = "正文开始<script>广告</script>正文结束";
let 清理后 = 原始内容.replace(/<script>.*?<\/script>/g, "");
// 结果是 "正文开始正文结束"
// /g 表示替换所有匹配的，不只是第一个

// 4. 分割文本
let 日期时间 = "2023-01-01 12:30:45";
let 分割结果 = 日期时间.split(/\s+/);  // 按空白字符分割
// 结果是 ["2023-01-01", "12:30:45"]

// 5. 检查是否符合模式
let 邮箱 = "test@example.com";
let 是否邮箱 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(邮箱);
// 结果是 true

// 6. 常用正则符号
// \d 表示数字，\w 表示字母数字下划线，\s 表示空白字符
// + 表示1个或多个，* 表示0个或多个，? 表示0个或1个
// . 表示任意字符（除了换行）
// ^ 表示开头，$ 表示结尾
// [] 表示字符集合，[0-9] 表示0到9的数字
```

**书源例子**：

```javascript
// 提取章节链接和标题
let html内容 = `
    <li><a href="/chapter/1.html">第一章 开始</a></li>
    <li><a href="/chapter/2.html">第二章 发展</a></li>
    <li><a href="/chapter/3.html">第三章 高潮</a></li>
`;

let 正则模式 = /<a href="([^"]+)">([^<]+)<\/a>/g;
let 匹配;
let 章节列表 = [];

while ((匹配 = 正则模式.exec(html内容)) !== null) {
    章节列表.push({
        链接: 匹配[1],  // /chapter/1.html
        标题: 匹配[2]   // 第一章 开始
    });
}

java.log("提取到 " + 章节列表.length + " 个章节");

// 清理HTML标签
function 清理HTML标签(html) {
    // 去掉所有HTML标签，保留换行
    return html.replace(/<br[^>]*>/gi, "\n")        // 把<br>换成换行
               .replace(/<p[^>]*>/gi, "\n")         // 把<p>换成换行
               .replace(/<[^>]+>/g, "")             // 去掉所有其他标签
               .replace(/\n\s*\n/g, "\n\n")         // 去掉多余空白行
               .trim();                             // 去掉首尾空白
}

// 提取特定信息
let 页面内容 = `
    <meta property="og:novel:book_name" content="斗罗大陆"/>
    <meta property="og:novel:author" content="唐家三少"/>
    <meta property="og:novel:category" content="玄幻"/>
`;

let 书名匹配 = 页面内容.match(/og:novel:book_name["'\s]+content=["']([^"']+)["']/);
let 作者匹配 = 页面内容.match(/og:novel:author["'\s]+content=["']([^"']+)["']/);
let 分类匹配 = 页面内容.match(/og:novel:category["'\s]+content=["']([^"']+)["']/);

if (书名匹配) {
    let 书名 = 书名匹配[1];  // "斗罗大陆"
}
if (作者匹配) {
    let 作者 = 作者匹配[1];  // "唐家三少"
}
if (分类匹配) {
    let 分类 = 分类匹配[1];  // "玄幻"
}

// 在书源规则中使用AllInOne正则
// 格式：:正则表达式
let 目录规则 = ":href=\"(/chapter/\\d+/\\d+)\">([^<]+)</a>";
// 在Legado中，$1代表第一个分组（链接），$2代表第二个分组（标题）
```

---

## **第 13 部分：异步处理**

**效果**：处理需要等待的操作，比如网络请求

```javascript
// 1. 回调函数方式（传统方式）
function 获取数据(网址, 回调函数) {
    try {
        let 数据 = java.ajax(网址);
        回调函数(null, 数据);  // 第一个参数是错误，第二个是数据
    } catch (错误) {
        回调函数(错误, null);  // 出错时传递错误
    }
}

// 使用回调函数
获取数据("https://example.com/book/1", function(错误, 数据) {
    if (错误) {
        java.log("获取失败：" + 错误);
    } else {
        java.log("获取成功，长度：" + 数据.length);
        // 继续处理数据...
    }
});

// 2. 并发请求多个数据
let 网址列表 = [
    "https://example.com/chapter/1",
    "https://example.com/chapter/2",
    "https://example.com/chapter/3"
];

try {
    let 响应列表 = java.ajaxAll(网址列表);  // 同时请求所有网址
    
    // 处理所有响应
    let 所有内容 = [];
    for (let i = 0; i < 响应列表.length; i++) {
        if (响应列表[i]) {
            let 内容 = 响应列表[i].body();
            所有内容.push(内容);
            java.log("第" + (i + 1) + "章获取成功");
        }
    }
    
    java.log("共获取 " + 所有内容.length + " 个章节");
} catch (错误) {
    java.log("并发请求失败：" + 错误);
}

// 3. 延迟执行（等待一段时间后执行）
function 延迟执行(毫秒数, 要执行的函数) {
    java.log("等待 " + 毫秒数 + " 毫秒...");
    setTimeout(要执行的函数, 毫秒数);
}

延迟执行(1000, function() {
    java.log("1秒后执行这里");
});

延迟执行(2000, function() {
    java.log("2秒后执行这里");
});
```

**书源例子**：

```javascript
// 分页加载所有数据
function 加载所有页面(总页数, 每页处理函数) {
    let 所有数据 = [];
    let 当前页 = 1;
    let 加载中 = false;
    
    function 加载下一页() {
        if (当前页 > 总页数 || 加载中) {
            return;  // 所有页已加载或正在加载
        }
        
        加载中 = true;
        let 当前页网址 = "https://example.com/page/" + 当前页;
        
        java.log("正在加载第" + 当前页 + "页...");
        
        try {
            let 页面数据 = java.ajax(当前页网址);
            所有数据 = 所有数据.concat(每页处理函数(页面数据));
            java.log("第" + 当前页 + "页加载成功");
            
            当前页++;
            加载中 = false;
            
            // 继续加载下一页
            setTimeout(加载下一页, 500);  // 延迟500毫秒，避免请求过快
        } catch (错误) {
            java.log("第" + 当前页 + "页加载失败：" + 错误);
            加载中 = false;
        }
    }
    
    // 开始加载
    加载下一页();
    
    return {
        数据: 所有数据,
        状态: function() {
            return {
                当前页: 当前页,
                总页数: 总页数,
                是否完成: 当前页 > 总页数
            };
        }
    };
}

// 使用分页加载
let 加载器 = 加载所有页面(5, function(页面内容) {
    // 解析每页的数据
    let 匹配 = 页面内容.match(/<div class="book-item">(.*?)<\/div>/g);
    return 匹配 || [];
});

// 检查加载状态
延迟执行(3000, function() {
    let 状态 = 加载器.状态();
    java.log("当前页：" + 状态.当前页 + "，是否完成：" + 状态.是否完成);
});

// 批量获取章节内容
function 批量获取章节(章节网址列表, 完成回调) {
    let 成功内容 = [];
    let 失败网址 = [];
    let 已完成数 = 0;
    
    function 检查是否全部完成() {
        if (已完成数 >= 章节网址列表.length) {
            完成回调({
                成功: 成功内容,
                失败: 失败网址,
                成功率: (成功内容.length / 章节网址列表.length) * 100
            });
        }
    }
    
    章节网址列表.forEach(function(网址, 索引) {
        setTimeout(function() {
            try {
                let 内容 = java.ajax(网址);
                if (内容) {
                    成功内容.push({
                        索引: 索引,
                        网址: 网址,
                        内容: 内容
                    });
                    java.log("章节" + (索引 + 1) + "获取成功");
                } else {
                    失败网址.push(网址);
                    java.log("章节" + (索引 + 1) + "获取失败：内容为空");
                }
            } catch (错误) {
                失败网址.push(网址);
                java.log("章节" + (索引 + 1) + "获取失败：" + 错误.message);
            }
            
            已完成数++;
            检查是否全部完成();
        }, 索引 * 200);  // 每个请求间隔200毫秒
    });
}

// 使用批量获取
批量获取章节([
    "https://example.com/chapter/1",
    "https://example.com/chapter/2",
    "https://example.com/chapter/3"
], function(结果) {
    java.log("批量获取完成");
    java.log("成功：" + 结果.成功.length + " 个");
    java.log("失败：" + 结果.失败.length + " 个");
    java.log("成功率：" + 结果.成功率.toFixed(2) + "%");
});
```

---

## **第 14 部分：书源专用变量和方法**

**效果**：Legado 阅读器提供的特殊变量和方法，只能在书源中使用

```javascript
// 1. 内置变量
baseUrl     // 当前页面的URL
result      // 上一步规则的结果
book        // 书籍对象，包含书名、作者等信息
chapter     // 章节对象，包含章节标题、URL等信息
title       // 当前章节标题
src         // 当前页面源码

// 2. 使用book对象的属性
book.name           // 书名
book.author         // 作者
book.coverUrl       // 封面URL
book.intro          // 简介
book.lastChapter    // 最新章节
book.tocUrl         // 目录URL

// 3. 使用chapter对象的属性
chapter.title       // 章节标题
chapter.url         // 章节URL
chapter.index       // 章节序号

// 4. cookie操作
cookie.get(url)     // 获取指定网址的cookie
cookie.set(url, cookieString)  // 设置cookie

// 5. 缓存操作
cache.get(key)      // 获取缓存
cache.put(key, value, timeout)  // 设置缓存，timeout是超时时间（秒）
cache.remove(key)   // 删除缓存
```

**书源例子**：

```javascript
// 在正文规则中使用book和chapter变量
let 正文规则 = "//div[@id='content']" + "###" + book.name + "正文卷" + chapter.title;
// 这样会净化类似"斗罗大陆正文卷第一章"这样的字符串

// 使用baseUrl构建完整URL
let 相对链接 = "/chapter/123.html";
let 完整链接 = baseUrl + 相对链接;  // 如果baseUrl是"https://example.com"，结果就是"https://example.com/chapter/123.html"

// 使用缓存提高效率
function 获取书籍详情(书号) {
    let 缓存键 = "book_detail_" + 书号;
    let 缓存数据 = cache.get(缓存键);
    
    if (缓存数据) {
        java.log("使用缓存数据：" + 书号);
        return JSON.parse(缓存数据);
    }
    
    // 没有缓存，从网络获取
    let 详情网址 = "https://example.com/book/" + 书号;
    let html = java.ajax(详情网址);
    
    // 解析详情...
    let 书籍详情 = {
        书名: 解析书名(html),
        作者: 解析作者(html),
        简介: 解析简介(html)
    };
    
    // 存入缓存（1小时过期）
    cache.put(缓存键, JSON.stringify(书籍详情), 3600);
    
    return 书籍详情;
}

// 在搜索规则中使用变量
let 搜索规则 = {
    bookList: "$.data.books",  // JSONPath格式
    name: "$.name",
    author: "$.author",
    bookUrl: baseUrl + "/book/{{$.id}}"  // 使用baseUrl和JSON数据
};

// 预处理规则中使用JavaScript
let 预处理规则 = `
(function() {
    // 在这里可以使用所有JavaScript功能
    let 书名 = "圣墟";
    let 作者 = "辰东";
    
    return {
        a: 书名,
        b: 作者,
        c: "玄幻",
        d: "200万字",
        e: "第两千章 辰东宫殿",
        f: "在破败中崛起，在寂灭中复苏...",
        g: "https://bookcover.yuewen.com/qdbimg/349573/1004608738/300",
        h: "https://m.qidian.com/book/1004608738"
    };
})()
`;
// 然后在其他规则中：书名规则填a，作者规则填b，等等
```

## **第十五部分：段评函数**

### **1. java.startBrowser() - 在开源阅读中打开网页**

**效果**：在 Legado 阅读器中打开一个内置浏览器窗口，用来显示网页内容。

**基本用法**：

```javascript
// 最简单的用法：打开一个网址
java.startBrowser("https://www.baidu.com");

// 带标题的用法：打开网址并设置窗口标题
java.startBrowser("https://www.example.com/book/123", "书籍详情页");
```

**实际段评例子**：

```javascript
// 打开段评页面
let 段评网址 = "https://example.com/comment/book/123/chapter/456";
java.startBrowser(段评网址, "本章段评");

// 带参数的段评网址
let 书号 = "1004608738";
let 章节号 = "2001";
let 段评链接 = `https://example.com/comment?bookId=${书号}&chapterId=${章节号}`;
java.startBrowser(段评链接, "段评详情");
```

---

### **2. java.startBrowserDp() - 在轻阅读中打开网页**

**效果**：在轻阅读中打开网页，多端阅读器。

**基本用法**：

```javascript
// 在轻阅读中打开
java.startBrowserDp("https://www.example.com/chapter/123", "第一章 开始");

// 处理可能的错误
try {
    java.startBrowserDp(网址, "章节内容");
} catch (错误) {
    java.log("轻阅读打开失败：" + 错误);
    // 降级处理：用普通浏览器打开
    java.startBrowser(网址, "章节内容");
}
```

**实际段评例子**：

```javascript
let 书号 = "12345";
let 章节号 = "100";
let 段落号 = "5";
let 段评标题 = "第100章第5段 精彩打斗";

// 构建段评URL
let 段评链接 = `https://example.cn/qddp.php?bookId=${书号}&chapterId=${章节号}¶graphId=${段落号}`;

// 尝试用轻阅读打开，失败则用普通浏览器
try {
    java.qread();  // 可能是初始化轻阅读环境
    java.startBrowserDp(段评链接, 段评标题);
} catch (错误) {
    java.startBrowser(段评链接, 段评标题);
}
```

---

### **3. java.showReadingBrowser() - 在源阅中打开网页**

**效果**：在源阅中打开网页，仅 ios 可用。

**基本用法**：

```javascript
// 在源阅中打开
java.showReadingBrowser("https://example.com/chapter/123", "章节");

// 带更多参数
java.showReadingBrowser(网址, 标题, 是否启用JS, 超时时间);
```

**实际段评例子**：

```javascript
// 打开源网站查看段评
let 书源 = "中文";
let 段评链接 = "https://example.com/ajax/comment/chapter?bookId=1004608738&chapterId=2001";
java.showReadingBrowser(段评链接, 书源 + "段评");
```

---

## **综合使用示例**

### **示例 1：完整的段评处理函数**

```javascript
// 函数：打开段评页面
function 打开段评页面(书号, 章节号, 段落号, 段落标题) {
    // 1. 构建段评URL
    let 段评链接 = `https://example.cn/qddp.php?bookId=${书号}&chapterId=${章节号}¶graphId=${段落号}`;
    
    // 2. 设置页面标题
    let 页面标题 = 段落标题 + " - 段评";
    
    // 3. 尝试用轻阅读打开，失败则用普通浏览器
    try {
        // 先尝试初始化轻阅读环境
        java.qread();
        // 在轻阅读中打开
        java.startBrowserDp(段评链接, 页面标题);
    } catch (错误) {
        // 如果轻阅读失败，使用普通浏览器
        java.log("轻阅读失败，使用普通浏览器：" + 错误);
        java.startBrowser(段评链接, 页面标题);
    }
    
    // 4. 记录日志
    java.log("已打开段评页面：" + 段评链接);
}

// 使用示例
打开段评页面("1004608738", "2001", "5", "第2001章第5段 突破境界");
```

---

### **示例 2：HTML 中嵌入段评链接**

```javascript
// 在正文内容中嵌入段评按钮
let 书号 = "12345";
let 章节号 = "100";
let 段落号 = "3";
let 段落标题 = "第三章第3段 主角出场";
let 段评数量 = 15;  // 该段落的评论数量

// 构建段评URL
let 段评链接 = `https://example.cn/qddp.php?bookId=${书号}&chapterId=${章节号}¶graphId=${段落号}`;

// 创建可点击的段评标签
let 段评标签 = `<comment count="${段评数量}" onClick="java.startBrowser('${段评链接}', '${段落标题}')" />`;

// 将段评标签插入到正文中
let 正文内容 = "这是小说正文内容..." + 段评标签 + "正文继续...";

// 完整示例：处理多个段落
function 添加段评到正文(原始正文, 书号, 章节号) {
    let 段落数组 = 原始正文.split("\n");  // 按换行分割成段落
    let 新正文 = [];
    
    for (let i = 0; i < 段落数组.length; i++) {
        let 当前段落 = 段落数组[i];
        if (当前段落.trim().length > 0) {  // 非空段落
            let 段落号 = i + 1;
            let 段落标题 = `第${章节号}章第${段落号}段`;
            
            // 构建段评链接
            let 段评链接 = `https://example.cn/qddp.php?bookId=${书号}&chapterId=${章节号}¶graphId=${段落号}`;
            
            // 创建段评标签（假设每段有随机数量的评论）
            let 评论数量 = Math.floor(Math.random() * 50);
            let 段评标签 = `<comment count="${评论数量}" onClick="java.startBrowser('${段评链接}', '${段落标题}')" />`;
            
            新正文.push(当前段落 + 段评标签);
        } else {
            新正文.push(当前段落);  // 空行保持不变
        }
    }
    
    return 新正文.join("\n");  // 重新组合成文本
}

// 使用函数
let 原始正文 = "第一章\n\n第一节\n这是第一节内容\n\n第二节\n这是第二节内容";
let 书号 = "1001";
let 章节号 = "1";

let 带段评正文 = 添加段评到正文(原始正文, 书号, 章节号);
java.log("处理后的正文：\n" + 带段评正文);
```

---

### **示例 3：智能选择浏览器模式**

```javascript
// 根据内容类型智能选择浏览器模式
function 智能打开网页(网址, 标题, 内容类型) {
    // 内容类型：'text'=文本阅读，'comment'=段评，'source'=源网站，'default'=默认
    
    try {
        switch (内容类型) {
            case 'text':  // 文本内容，使用轻阅读
                java.qread();
                java.startBrowserDp(网址, 标题);
                break;
                
            case 'comment':  // 段评，优先轻阅读，失败用普通
                try {
                    java.qread();
                    java.startBrowserDp(网址, 标题);
                } catch (错误) {
                    java.startBrowser(网址, 标题);
                }
                break;
                
            case 'source':  // 源网站，使用源阅
                java.showReadingBrowser(网址, 标题);
                break;
                
            default:  // 默认使用普通浏览器
                java.startBrowser(网址, 标题);
                break;
        }
        
        java.log("已打开页面：" + 标题);
        return true;
    } catch (错误) {
        java.log("打开页面失败：" + 错误);
        return false;
    }
}

// 使用示例
let 章节链接 = "https://www.example.com/chapter/123";
智能打开网页(章节链接, "第一章 开始", 'text');

let 段评链接 = "https://example.com/comment/123";
智能打开网页(段评链接, "章节段评", 'comment');

let 源站链接 = "https://example.com/book/1004608738";
智能打开网页(源站链接, "起点原站", 'source');
```

---

### **示例 4：书源规则中的实际应用**

```javascript
// 在书源规则中添加段评功能

// 1. 搜索规则中可点击的作者或书名
let 搜索规则 = {
    bookList: "//div[@class='book-item']",
    name: "//h3/a/text()",
    author: "//p[@class='author']/text()",
    // 添加点击打开作者主页的功能
    authorLink: "//p[@class='author']/@onClick",
    
    // 自定义处理函数
    custom: function(元素) {
        let 书名 = 元素.find("h3/a").text();
        let 作者 = 元素.find("p.author").text();
        let 作者主页 = "https://example.com/author/" + java.encodeURI(作者);
        
        // 返回包含可点击链接的作者信息
        return {
            name: 书名,
            author: `<a onClick="java.startBrowser('${作者主页}', '${作者}主页')">${作者}</a>`
        };
    }
};

// 2. 正文规则中添加段评支持
let 正文规则 = {
    content: "//div[@id='content']",
    custom: function(内容, 章节信息) {
        // 获取书号和章节号
        let 书号 = 章节信息.bookId || "unknown";
        let 章节号 = 章节信息.chapterId || "1";
        
        // 分割段落并添加段评
        let 段落 = 内容.split(/[\n。！？]/);  // 按句子分割
        let 新内容 = [];
        
        for (let i = 0; i < 段落.length; i++) {
            if (段落[i].trim().length > 5) {  // 长度大于5的段落
                let 段落号 = i + 1;
                let 段评链接 = `https://example.cn/qddp.php?bookId=${书号}&chapterId=${章节号}¶graphId=${段落号}`;
                let 段评标签 = `<comment count="0" onClick="java.startBrowser('${段评链接}', '第${章节号}章第${段落号}段')" />`;
                
                新内容.push(段落[i] + "。" + 段评标签);
            } else {
                新内容.push(段落[i]);  // 短段落不加段评
            }
        }
        
        return 新内容.join("");
    }
};

// 3. 目录规则中添加章节评论链接
let 目录规则 = {
    chapterList: "//ul[@class='chapter-list']/li/a",
    chapterName: "./text()",
    chapterUrl: "./@href",
    custom: function(链接元素, 索引) {
        let 章节标题 = 链接元素.text();
        let 章节链接 = 链接元素.attr("href");
        let 章节号 = 索引 + 1;
        
        // 添加评论图标（假设每章有评论）
        let 评论链接 = `https://example.com/chapter/comment/${章节号}`;
        let 评论图标 = ` <small onClick="java.startBrowser('${评论链接}', '${章节标题}评论')" style="color:blue;cursor:pointer;">💬</small>`;
        
        return {
            title: 章节标题 + 评论图标,
            url: 章节链接
        };
    }
};
```

---

### **示例 5：错误处理和降级方案**

```javascript
// 完整的安全浏览器打开函数
function 安全打开浏览器(网址, 标题, 选项 = {}) {
    // 选项可以包含：mode, fallback, timeout, onSuccess, onError
    
    let 默认选项 = {
        mode: 'auto',  // auto, dp, normal, source
        fallback: true,  // 是否降级处理
        timeout: 10000,  // 超时时间（毫秒）
        onSuccess: function() { java.log("打开成功：" + 标题); },
        onError: function(错误) { java.log("打开失败：" + 错误); }
    };
    
    // 合并选项
    let 最终选项 = { ...默认选项, ...选项 };
    
    try {
        // 根据模式选择打开方式
        switch (最终选项.mode) {
            case 'dp':  // 轻阅读
                java.qread();
                java.startBrowserDp(网址, 标题);
                break;
                
            case 'source':  // 源阅
                java.showReadingBrowser(网址, 标题);
                break;
                
            case 'normal':  // 普通
                java.startBrowser(网址, 标题);
                break;
                
            case 'auto':  // 自动选择
            default:
                // 尝试轻阅读，失败则降级
                try {
                    java.qread();
                    java.startBrowserDp(网址, 标题);
                } catch (错误1) {
                    if (最终选项.fallback) {
                        java.log("轻阅读失败，尝试普通浏览器：" + 错误1);
                        java.startBrowser(网址, 标题);
                    } else {
                        throw 错误1;
                    }
                }
                break;
        }
        
        // 成功回调
        if (最终选项.onSuccess) {
            setTimeout(最终选项.onSuccess, 100);
        }
        
        return true;
    } catch (错误) {
        // 错误回调
        if (最终选项.onError) {
            最终选项.onError(错误);
        }
        
        // 尝试最终降级方案
        if (最终选项.fallback) {
            try {
                java.log("尝试最终降级方案");
                // 使用最简单的打开方式
                let 降级代码 = `window.open('${网址}', '_blank');`;
                eval(降级代码);
                return true;
            } catch (最终错误) {
                java.log("所有方案都失败了：" + 最终错误);
                return false;
            }
        }
        
        return false;
    }
}

// 使用示例
安全打开浏览器(
    "https://example.com/book/123", 
    "书籍详情",
    {
        mode: 'auto',
        fallback: true,
        onSuccess: function() {
            java.log("页面打开成功！");
        },
        onError: function(错误) {
            java.log("打开页面时出错：" + 错误);
        }
    }
);

// 段评专用函数
function 打开段评(书号, 章节号, 段落号, 段落标题) {
    let 段评链接 = `https://example.cn/qddp.php?bookId=${书号}&chapterId=${章节号}¶graphId=${段落号}`;
    
    return 安全打开浏览器(段评链接, 段落标题 + " - 段评", {
        mode: 'dp',  // 优先使用轻阅读
        fallback: true
    });
}
```

---

### **示例 6：在书源 JSON 配置中使用**

```json
{
    "bookSourceName": "示例书源带段评",
    "bookSourceUrl": "https://www.example.com",
    
    "ruleSearch": {
        "bookList": "//div[@class='book-item']",
        "name": "./h3/text()",
        "author": "./p[@class='author']/text()",
        "coverUrl": "./img/@src",
        "bookUrl": "./a/@href",
        
        "custom": "<js>"
            + "let 书名 = result.name;"
            + "let 作者 = result.author;"
            + "let 作者主页 = 'https://example.com/author/' + java.encodeURI(作者);"
            + "result.author = '<a onClick=\"java.startBrowser(\\'' + 作者主页 + '\\', \\'' + 作者 + '主页\\')\">' + 作者 + '</a>';"
            + "return result;"
            + "</js>"
    },
    
    "ruleContent": {
        "content": "//div[@id='content']",
        "custom": "<js>"
            + "let 内容 = result;"
            + "let 书号 = book.name || 'unknown';"
            + "let 章节号 = chapter.index || '1';"
            
            + "// 分割段落并添加段评"
            + "let 段落数组 = 内容.split(/[。！？]/);"
            + "let 新内容 = [];"
            
            + "for (let i = 0; i < 段落数组.length; i++) {"
            + "    let 段落 = 段落数组[i].trim();"
            + "    if (段落.length > 5) {"
            + "        let 段落号 = i + 1;"
            + "        let 段评链接 = 'https://example.cn/qddp.php?bookId=' + java.encodeURI(书号) + '&chapterId=' + 章节号 + '¶graphId=' + 段落号;"
            + "        let 段评标签 = '<comment count=\"0\" onClick=\"java.startBrowser(\\\\'' + 段评链接 + '\\\\', \\\\'第' + 章节号 + '章第' + 段落号 + '段\\\\')\" />';"
            + "        新内容.push(段落 + '。' + 段评标签);"
            + "    } else {"
            + "        新内容.push(段落);"
            + "    }"
            + "}"
            
            + "return 新内容.join('');"
            + "</js>"
    },
    
    "ruleToc": {
        "chapterList": "//ul[@class='chapter-list']/li/a",
        "chapterName": "./text()",
        "chapterUrl": "./@href",
        
        "custom": "<js>"
            + "let 标题 = result.title;"
            + "let 链接 = result.url;"
            + "let 序号 = result.index;"
            
            + "// 添加评论图标"
            + "let 评论链接 = 'https://example.com/chapter/comment/' + 序号;"
            + "let 评论图标 = ' <small onClick=\"java.startBrowser(\\\\'' + 评论链接 + '\\\\', \\\\'' + 标题 + '评论\\\\')\" style=\"color:blue;cursor:pointer;\">💬</small>';"
            
            + "result.title = 标题 + 评论图标;"
            + "return result;"
            + "</js>"
    }
}
```
