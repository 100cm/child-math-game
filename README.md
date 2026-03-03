# 小马宝莉数学乐园

iPad 适配的儿童 10 以内加减法游戏

## 运行方式

由于使用了 ES6 模块，需要通过 HTTP 服务器运行：

```bash
# 方式 1: Python 3
cd /Users/icepoint1999/code/child-math-game
python3 -m http.server 8080

# 方式 2: Node.js (需要安装 serve)
npx serve .

# 方式 3: PHP
php -S localhost:8080
```

然后在浏览器访问: http://localhost:8080

## 项目结构

```
child-math-game/
├── index.html          # 主页面
├── css/
│   ├── main.css        # 主样式
│   └── animations.css  # 动画样式
├── js/
│   ├── main.js         # 应用入口
│   ├── config.js       # 游戏配置
│   ├── game.js         # 游戏逻辑
│   ├── pony.js         # Canvas 绘制小马
│   ├── sound.js        # Web Audio 音效
│   ├── storage.js      # 本地存储
│   └── animations.js   # 动画效果
└── assets/
    ├── images/         # 预留图片目录
    └── sounds/         # 预留音效目录
```

## 功能特性

- **三种难度**：简单(1-5)、中等(1-8 限时)、困难(1-10 限时)
- **卡片收集**：答对累计获得小马卡片
- **Canvas 绘制**：所有小马角色使用 Canvas 绘制，零外部依赖
- **Web Audio**：使用 Web Audio API 生成音效
- **iPad 适配**：响应式布局，支持横竖屏
- **本地存储**：保存卡片收集进度和高分

## 可选资产

如需使用外部图片，可下载免费资源放入 `assets/images/`:

- Vecteezy: 搜索 "little pony vector"
- Pixabay: 搜索 "cute pony cartoon"
- Flaticon: 搜索 "pony icon"
