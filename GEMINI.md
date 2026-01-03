# GEMINI.md

## 特别注意
* 所有回答使用中文
* 修改代码时，非必要不主动添加注释
* 非必要不过多的换行

## 项目概述


本项目是一款基于 **Vue 3**、**Vite**、**Element Plus**、**Pinia** 和 **Vue Router** 构建的现代**管理后台模板**。它被设计为开箱即用的后端管理系统解决方案，具备经典响应式布局、完善的认证流程，以及一套示例组件和页面。


**核心功能：**
*   **布局：** 经典三栏设计（侧边栏、页眉、主内容区），支持侧边栏折叠与移动端响应。
*   **导航：** 集成标签页视图（标签式导航），支持上下文菜单与面包屑导航。
*   **认证：** 完整的登录/注册页面，包含表单验证、令牌管理（localStorage + Pinia）及路由守卫。
*   **主题：** 内置暗黑模式支持，可通过 UI 切换。
*   **开发体验：** 预配置 Vue API 与组件自动导入，提升开发效率。


## 技术栈


*   **核心框架：** Vue 3.4+
*   **构建工具：** Vite 5.0+
*   **UI 框架：** Element Plus 2.7+
*   **状态管理：** Pinia 2.1+
*   **路由：** Vue Router 4.2+
*   **HTTP 客户端：** Axios 1.6+
*   **工具库：** @vueuse/core


## 构建与运行


项目使用标准 NPM 脚本完成开发与生产流程。


### 前置条件
*   已安装 Node.js 和 npm。


### 命令列表


| 命令 | 描述 |
| :--- | :--- |
| `npm install` | 安装项目依赖 |
| `npm run dev` | 启动本地开发服务器，地址为 `http://localhost:5173` |
| `npm run build` | 构建生产环境应用 |
| `npm run preview` | 预览本地构建的生产版本 |


**演示账号：**
*   **用户名：** `admin`
*   **密码：** `123456`


## 项目结构


```
src/
├── api/             # API 接口定义（如 login.js）
├── components/      # 全局共享组件（面包屑、SvgIcon 等）
├── layout/          # 主布局组件（侧边栏、页眉、标签页视图）
├── router/          # Vue Router 配置
├── store/           # Pinia 状态管理模块
│   ├── app.js       # UI 状态（侧边栏折叠、主题等）
│   ├── user.js      # 用户会话状态（令牌、用户信息）
│   └── tagsView.js  # 标签页导航状态
├── utils/           # 工具函数（Axios 封装 request.js、令牌处理 auth.js）
├── views/           # 页面组件
│   ├── dashboard/   # 仪表盘主页
│   ├── login/       # 登录页
│   ├── register/    # 注册页
│   ├── system/      # 系统管理（含用户管理示例）
│   └── example/     # 组件示例（表单、表格等）
├── App.vue          # 根组件
├── main.js          # 应用入口文件
└── permission.js    # 路由权限守卫
```


## 开发规范


*   **组件语法：** 所有组件统一使用 Vue 3 `<script setup>` 语法。
*   **自动导入：** 项目通过 `unplugin-auto-import` 和 `unplugin-vue-components` 实现自动导入，**无需手动导入** Vue 核心 API（如 `ref`、`computed`）或 Vue Router 钩子（如 `useRouter`、`useRoute`）。
*   **状态管理：** 全局状态使用 Pinia 管理，模块文件存放于 `src/store/modules`。
*   **API 请求：** 所有接口请求封装在 `src/api` 目录，使用 `@/utils/request` 中的封装实例（自动处理令牌注入与错误拦截）。
*   **图标：** 使用 Element Plus 图标库与 SVG 图标。
*   **样式：** 以 Element Plus 为基础 UI 样式，自定义样式可在组件内或全局添加；暗黑模式通过 `.dark` 类实现。


## 注意事项
*   原始项目文档（`README.md` 和 `PROJECT_SUMMARY.md`）为中文版本，包含更详细的功能说明与实现细节。
*   **模拟数据：** 当前项目通过前端逻辑或 mock 文件模拟后端交互（如登录、用户数据），生产环境需对接真实后端 springboot 的 API。