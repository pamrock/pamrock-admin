# iFlow 上下文文件 - my-admin 项目

## 项目概述

这是一个基于 Vue 3 + Vite + Element Plus 构建的现代化管理后台系统模板，采用最新的前端技术栈和最佳实践。项目提供了完整的身份认证、路由管理、状态管理和响应式布局等功能，可直接用于开发各类管理后台系统。

## 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **构建工具**: Vite 5.0+
- **UI 组件库**: Element Plus 2.7+
- **路由管理**: Vue Router 4.2+
- **状态管理**: Pinia 2.1+
- **HTTP 客户端**: Axios 1.6+
- **工具库**: @vueuse/core 10.9+
- **CSS 预处理器**: Sass 1.70+

## 项目结构

```
D:\VSCode\my-admin\
├───src/
│   ├───api/                    # API 接口定义
│   │   └───login.js           # 登录相关接口
│   ├───assets/                # 静态资源
│   ├───components/            # 公共组件
│   │   ├───Breadcrumb.vue    # 面包屑导航
│   │   ├───HelloWorld.vue    # 示例组件
│   │   └───SvgIcon.vue       # SVG 图标组件
│   ├───layout/               # 布局组件
│   │   ├───index.vue         # 布局主组件
│   │   └───components/       # 布局子组件
│   │       ├───AppMain.vue   # 主内容区
│   │       ├───Header.vue    # 顶部导航栏
│   │       ├───Sidebar.vue   # 侧边栏菜单
│   │       └───TagsView.vue  # 标签页导航
│   ├───router/               # 路由配置
│   │   └───index.js          # 路由定义
│   ├───store/                # 状态管理
│   │   ├───index.js          # Pinia 入口
│   │   └───modules/          # 状态模块
│   │       ├───app.js        # 应用状态（菜单、主题等）
│   │       ├───tagsView.js   # 标签页状态
│   │       └───user.js       # 用户状态
│   ├───utils/                # 工具函数
│   │   ├───auth.js           # Token 存取
│   │   └───request.js        # Axios 实例和拦截器
│   ├───views/                # 页面组件
│   │   ├───404.vue           # 404 错误页面
│   │   ├───dashboard/        # 仪表盘
│   │   ├───example/          # 示例页面
│   │   ├───login/            # 登录页
│   │   ├───register/         # 注册页
│   │   └───system/           # 系统管理
│   ├───App.vue               # 根组件
│   ├───main.js               # 应用入口
│   └───permission.js         # 路由守卫
├───public/                   # 公共资源
├───vite.config.js            # Vite 配置
└───package.json              # 项目依赖
```

## 核心功能

### 1. 认证系统
- 基于 Token 的身份认证
- 登录/注册页面
- 路由守卫自动跳转
- Token 自动存储和失效处理
- 演示账号: admin/123456

### 2. 布局系统
- 经典三段式布局（侧边栏、顶部栏、主内容区）
- 可折叠侧边栏
- 响应式设计
- 深色模式切换
- 面包屑导航
- TagsView 标签页导航

### 3. 状态管理
- 使用 Pinia 进行状态管理
- 用户状态（token、用户信息）
- 应用状态（菜单、主题、侧边栏）
- 标签页状态

### 4. 路由系统
- 动态路由加载
- 路由守卫
- 权限控制
- 页面标题自动设置

### 5. API 请求
- Axios 封装
- 请求/响应拦截器
- 自动添加 Authorization 头
- 401 未授权自动跳转

## 构建和运行

### 开发模式
```bash
npm run dev
# 访问 http://localhost:5173
```

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 开发规范

### 1. 组件编写
- 使用 `<script setup>` 语法糖
- 优先使用 Composition API
- 组件名使用 PascalCase
- 文件名使用 kebab-case

### 2. 自动导入
项目已配置自动导入以下内容:
- Vue 3 核心 API (ref, reactive, computed 等)
- Vue Router (useRouter, useRoute)
- Pinia (defineStore)
- Element Plus 组件

### 3. 状态管理
- 使用 `defineStore` 定义 store
- 优先使用组合式 API 写法
- 按功能模块拆分 store

### 4. API 管理
- 所有 API 调用集中在 `src/api` 目录
- 使用 request 实例进行请求
- 接口命名使用动词+名词形式

### 5. 路由配置
- 路由配置使用普通对象数组
- 添加 meta 信息用于权限和标题管理
- 使用懒加载优化性能

## 配置说明

### Vite 配置 (vite.config.js)
- 配置了 `@` 别名指向 `src` 目录
- 开发服务器端口: 5173
- API 代理: `/api` -> `http://localhost:3000`

### 自动导入配置
- Vue 3 核心 API
- Vue Router
- Pinia
- Element Plus 组件

### 主题配置
- 支持亮色/暗色主题切换
- 主题状态保存在 localStorage
- 使用 Element Plus 官方暗色主题

## 扩展指南

### 添加新页面
1. 在 `src/views` 中创建 `.vue` 文件
2. 在 `src/router/index.js` 中添加路由
3. 更新菜单数据（`src/store/modules/app.js`）

### 添加新 API
1. 在 `src/api` 中创建新的 `.js` 文件
2. 使用 `request` 实例进行请求

### 添加新状态
1. 在 `src/store/modules` 中创建新的 `.js` 文件
2. 使用 `defineStore` 定义状态和方法

## 开发建议

1. 充分利用自动导入功能，避免重复 import
2. 使用 Composition API 和 `<script setup>` 语法
3. 在 `src/api` 中统一管理所有 API 调用
4. 使用 Pinia 管理全局状态
5. 为路由添加 meta 信息，便于权限和标题管理
6. 编写兼容深色模式的样式

## 注意事项

- 项目使用 Vite 作为构建工具，不支持 CommonJS 语法
- 所有组件都应使用 Vue 3 的 Composition API
- API 代理配置在 `vite.config.js` 中，可根据后端服务地址修改
- Token 存储在 localStorage 中，实际生产环境建议考虑安全性
- 演示账号仅用于本地测试，实际应用需要连接真实后端接口