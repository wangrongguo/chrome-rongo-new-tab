# Chrome 新标签页插件

![界面概览](images/003.png)
![自适应布局](images/001.png)
![节气展示](images/002.png)

## 项目概述
这是一个功能丰富的新标签页替代插件，提供日历、便签、天气和节假日倒计时等功能，帮助用户高效管理日常事务。插件采用现代化的设计风格，支持明暗主题切换，并提供个性化的使用体验。

## 主要功能

### 1. 界面布局
- **左侧导航栏**：
  - 用户头像和昵称显示
  - 快速访问常用网站
  - 支持自定义导航网站
- **中间内容区**：
  - 实时时钟和日期显示
  - 便签管理系统
  - 节假日倒计时展示
- **右侧面板**：
  - 日历（支持公历和农历）
  - 天气信息显示
- **右下角**：
  - 互动表情图标
  - 每日趣味文案

### 2. 核心功能

#### 2.1 实时时钟
- 显示当前时间和日期
- 支持24小时制
- 自动更新显示

#### 2.2 便签系统
- **基本功能**：
  - 添加、查看、删除便签
  - 支持标题和内容
  - 自动保存时间戳
  - 展开/收起长列表
  - TODO列表以及完成状态
- **高级功能**：
  - 便签提醒功能
  - 便签内容字数统计
  - 便签分类管理

#### 2.3 日历功能
- **日期显示**：
  - 公历日期显示
  - 农历日期显示
  - 节假日标记
  - 节气显示
- **操作功能**：
  - 上下月份切换
  - 年份快速选择
  - 今天快速定位
  - 便签关联显示
- **特殊标记**：
  - 节假日调休标记
  - 工作日标记
  - 休息日标记

#### 2.4 天气信息
- 实时天气状况
- 温度和湿度显示
- 天气图标显示
- 自动更新天气数据

#### 2.5 节假日倒计时
- 显示距离主要节假日的天数
- 自动更新和排序显示
- 支持自定义节假日
- 节假日调休提醒

### 3. 特色功能

#### 3.1 主题切换
- **主题模式**：
  - 明亮主题
  - 暗黑主题
- **背景设置**：
  - 随机背景色切换
  - 自定义背景图片
  - 背景透明度调节

#### 3.2 互动表情
- 右下角可爱表情图标
- 鼠标悬停显示每日趣味文案
- 点击切换表情状态
- 根据星期几显示不同心情文案

#### 3.3 个性化设置
- 用户昵称自定义
- 导航网站自定义
- 节假日配置自定义
- 调休日期自定义

## 技术栈
- HTML5/CSS3
- JavaScript ES6+
- Chrome Extension API (Manifest V3)
- LocalStorage API
- 农历转换库

## 安装步骤

### 方法一：从Chrome商店安装
1. 访问Chrome网上应用店
2. 搜索"智能新标签页"
3. 点击"添加到Chrome"
4. 未上传商店

### 方法二：开发者模式安装
1. 下载项目代码
2. 打开Chrome浏览器
3. 访问 `chrome://extensions`
4. 启用右上角「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择项目根目录
7. 打开新标签页即可使用

## 配置说明

### 1. 导航网站配置
编辑`index.json`文件：
```json
{
  "navigation_sites": [
    {
      "name": "网站名称",
      "url": "网站地址"
    }
  ]
}
```

### 2. 节假日配置
编辑`holidays.json`文件：
```json
{
  "name": "节日名称",
  "type": "lunar/solar",
  "month": 数字月份,
  "day": 日期,
  "description": "描述"
}
```

### 3. 调休配置
编辑`holiday-work.json`文件：
```json
{
  "year": 2024,
  "month": 4,
  "day": 27,
  "type": "班/休"
}
```

## 开发指南

### 1. 项目结构
```
demo008/
├── css/                      # 样式文件目录
│   ├── calendar.css         # 日历组件样式
│   │   ├── 日历网格布局
│   │   ├── 日期单元格样式
│   │   ├── 节假日标记样式
│   │   └── 便签关联样式
│   └── style.css           # 全局样式
│       ├── 主题变量定义
│       ├── 布局样式
│       ├── 组件样式
│       └── 响应式设计
│
├── js/                       # 脚本文件目录
│   ├── calendar.js          # 日历核心逻辑
│   │   ├── 日期计算
│   │   ├── 农历转换
│   │   ├── 节假日处理
│   │   └── 便签关联
│   ├── main.js             # 入口文件
│   │   ├── 初始化逻辑
│   │   ├── 事件处理
│   │   ├── 数据管理
│   │   └── UI更新
│   └── confirm-dialog.js   # 确认对话框组件
│       ├── 弹窗创建
│       ├── 事件绑定
│       └── 样式管理
│
├── lib/                      # 第三方库目录
│   └── chinese-lunar.min.js # 农历转换库
│       ├── 农历计算
│       ├── 节气计算
│       └── 节日判断
│
├── images/                   # 图片资源目录
│   ├── icon16.png          # 16x16图标
│   ├── icon48.png          # 48x48图标
│   ├── icon128.png         # 128x128图标
│   ├── logo.jpg            # 用户头像
│   └── close.png           # 关闭按钮图标
│
├── webfonts/                 # 字体文件目录
│   └── Font Awesome字体
│
├── index.html               # 主页面
│   ├── 页面结构
│   ├── 组件引用
│   └── 脚本引入
│
├── manifest.json            # Chrome插件配置
│   ├── 基本信息
│   ├── 权限配置
│   └── 资源声明
│
├── index.json              # 配置文件
│   ├── 导航网站配置
│   ├── 用户信息配置
│   └── 文案配置
│
├── holidays.json           # 节假日配置
│   ├── 节日定义
│   ├── 日期配置
│   └── 描述信息
│
└── holiday-work.json       # 调休配置
    ├── 调休日期
    ├── 工作类型
    └── 年份配置
```

### 2. 文件说明

#### 2.1 核心文件
- `index.html`: 插件的主页面，包含所有UI组件和布局结构
- `manifest.json`: Chrome扩展的配置文件，定义插件的基本信息和权限
- `main.js`: 插件的主要逻辑文件，处理用户交互和数据管理
- `calendar.js`: 日历功能的核心实现，包含日期计算和显示逻辑

#### 2.2 配置文件
- `index.json`: 存储用户自定义配置，包括导航网站和个人信息
- `holidays.json`: 定义节假日信息，支持农历和公历节日
- `holiday-work.json`: 配置调休安排，支持工作日和休息日标记

#### 2.3 样式文件
- `style.css`: 全局样式定义，包含主题变量和通用样式
- `calendar.css`: 日历组件专用样式，处理日历显示和交互效果

#### 2.4 资源文件
- `images/`: 存放图标和图片资源
- `webfonts/`: 存放字体文件，支持图标显示
- `lib/`: 存放第三方库，提供农历转换等功能

### 3. 开发规范

#### 3.1 文件命名
- 使用小写字母
- 单词间用连字符（-）分隔
- 文件名应具有描述性

#### 3.2 目录结构
- 按功能模块分类
- 相关文件放在同一目录
- 保持目录结构清晰

#### 3.3 代码组织
- 相关功能放在同一文件
- 使用模块化开发
- 保持代码结构清晰

## 常见问题

### 1. 安装问题
Q: 安装后无法显示新标签页？
A: 检查Chrome扩展管理页面是否已启用插件

### 2. 使用问题
Q: 如何添加新的导航网站？
A: 编辑`index.json`文件中的`navigation_sites`数组

Q: 如何修改个人昵称？
A: 修改`index.json`中的`person_nickname`字段

### 3. 性能问题
Q: 首次加载农历数据较慢？
A: 允许浏览器完成IndexedDB初始化

Q: 天气数据更新不及时？
A: 检查网络连接和API密钥配置

## 更新日志

### v1.6.0（2024-04-30）
- 新增节假日调休自定义功能
- 优化个性化设置
- 改进界面交互
- 提升性能表现

### v1.5.0（2024-04-24）
- 新增便签内容字数统计
- 优化便签列表显示
- 修复日历显示问题
- 增加主题切换动画

### v1.3.0（2024-06-20）
- 新增自定义节假日功能：
  - 支持JSON格式配置文件
  - 农历/公历双模式支持
  - 智能日期冲突检测
  - 前端验证配置格式
- 界面优化：
  - 日历项间距调整（8px → 12px）
  - 新增节假日期动画效果
  - 优化移动端触控响应区域
- 操作优化：
  - 无感新增便签同步日历

### v1.2.0（2024-03-20）
- 节气算法重构：
  - 采用《寿星天文历》计算模型
  - 支持公元前722年至公元2200年
  - 精度±0.5天
- 自适应布局升级：
  - 基于CSS Grid + Flexbox混合布局
  - 新增断点：320px/768px/1024px
  - 使用CSS Containment优化渲染性能
- 高频词统计：
  - 基于TF-IDF算法
  - 支持便签内容实时分析
- 修复日历切换时农历计算异常问题

### v1.1.0（2024-02-15）
- 表情互动系统：
  - SVG路径动画实现
  - 状态机管理表情切换
  - 基于localStorage的状态持久化
- 文案系统升级：
  - 内置200+条UGC文案
  - 基于工作日/节假日的动态过滤
  - 支持Markdown格式渲染
- 便签性能优化：
  - 虚拟滚动技术（100+条流畅展示）
  - IndexedDB本地缓存
  - 防抖自动保存（500ms间隔）
- 主题切换动画：
  - CSS Transition实现
  - 支持HSL色彩空间过渡

### v1.0.0
- 初始版本发布
- 实现基础功能
  - 实时时钟
  - 便签系统
  - 日历功能
  - 天气信息
  - 节假日倒计时
- 支持主题切换
- 提供互动表情

## 贡献指南
1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证
本项目采用MIT许可证，保留所有图标的设计版权。

## 联系方式
- 项目主页：[GitHub仓库地址]
- 问题反馈：[Issues页面]
- 邮件联系：[联系邮箱]

## 致谢
感谢所有为本项目做出贡献的开发者。