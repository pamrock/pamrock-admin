# 现代化管理后台系统模板

基于 Vue3 + Vite + Element Plus + Vue Router 4 + Pinia 构建的开箱即用的管理后台系统模板。

## 功能特性

### 🎨 界面设计
- **经典三段式布局**：左侧可折叠菜单、顶部导航栏、主内容区
- **TagsView 标签页导航**：支持右键菜单（关闭、关闭其他、关闭全部、刷新）
- **面包屑导航**：清晰的路由导航提示
- **右上角用户菜单**：个人信息、修改密码、退出登录
- **响应式设计**：移动端自动收起侧边栏，顶部显示汉堡按钮
- **深色模式**：一键切换暗黑主题

### 🔐 认证系统
- **登录页面**：卡片式布局、表单验证、演示账号
- **注册页面**：完整的表单验证流程
- **Token 管理**：自动存储到 localStorage 和 Pinia
- **路由守卫**：自动跳转、未登录提示

### 📊 示例页面
- **仪表盘首页**：数据统计卡片、项目进度表、最近活动列表
- **表格示例**：CRUD 操作演示、数据编辑对话框
- **表单示例**：表单验证、输入控件演示
- **用户管理**：用户列表、搜索筛选、新增编辑删除

### 🛠️ 开发工具
- **自动导入**：unplugin-auto-import 和 unplugin-vue-components
- **Element Plus**：最新版本的组件库，支持按需导入
- **Pinia**：最新的状态管理方案
- **请求库**：axios 与拦截器集成
- **主题切换**：Element Plus 官方暗色主题支持

## 项目结构

```
src/
├── api/
│   └── login.js              # 登录相关 API
├── components/
│   ├── Breadcrumb.vue        # 面包屑导航
│   └── SvgIcon.vue           # SVG 图标组件
├── layout/
│   ├── components/
│   │   ├── Header.vue        # 顶部栏
│   │   ├── Sidebar.vue       # 左侧菜单
│   │   ├── TagsView.vue      # 标签页导航
│   │   └── AppMain.vue       # 主内容区
│   └── index.vue             # 布局主文件
├── router/
│   └── index.js              # 路由配置
├── store/
│   ├── index.js              # Pinia 入口
│   └── modules/
│       ├── user.js           # 用户状态
│       ├── app.js            # 应用状态（菜单、主题等）
│       └── tagsView.js       # 标签页状态
├── utils/
│   ├── auth.js               # Token 存取
│   └── request.js            # Axios 实例和拦截器
├── views/
│   ├── login/                # 登录页
│   ├── register/             # 注册页
│   ├── dashboard/            # 仪表盘
│   ├── example/              # 示例页面
│   │   ├── table.vue
│   │   └── form.vue
│   ├── system/               # 系统管理
│   │   └── user.vue          # 用户管理
│   └── 404.vue               # 错误页面
├── App.vue                   # 根组件
├── main.js                   # 应用入口
└── permission.js             # 路由守卫

```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173`

### 3. 生产构建

```bash
npm run build
```

### 4. 预览构建结果

```bash
npm run preview
```

## 演示账号

- 用户名: `admin`
- 密码: `123456`

> 注：演示账号仅用于本地测试，实际应用中需要连接真实后端接口

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4+ | 渐进式 JavaScript 框架 |
| Vite | 5.0+ | 下一代前端构建工具 |
| Element Plus | 2.7+ | Vue 3 组件库 |
| Vue Router | 4.2+ | 官方路由管理器 |
| Pinia | 2.1+ | 官方状态管理库 |
| Axios | 1.6+ | HTTP 客户端库 |
| @vueuse/core | 10.9+ | Vue 3 组合式函数库 |

## 核心特性详解

### 自动导入配置

项目已配置以下自动导入：
- Vue 3 核心 API（ref、reactive、computed 等）
- Vue Router（useRouter、useRoute）
- Pinia（defineStore）

无需手动 import 即可直接使用。

### 状态管理（Pinia）

```javascript
// 使用 defineStore 的组合式 API 写法
export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref('')
  
  // 方法
  const login = (newToken) => {
    token.value = newToken
  }
  
  return { token, login }
})
```

### 路由配置

所有路由配置使用普通对象数组，无 TypeScript 类型注解：

```javascript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { title: '仪表板', requiresAuth: true }
  }
]
```

### 请求拦截器

```javascript
// 自动添加 Authorization 头
instance.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 深色模式切换

```javascript
const appStore = useAppStore()

// 切换主题
appStore.toggleDark()

// 样式会自动应用
// :deep(.dark) .className 用于深色模式特定样式
```

## 菜单配置

菜单数据在 `src/store/modules/app.js` 中配置，支持多级菜单：

```javascript
const menuList = ref([
  {
    id: 1,
    name: '首页',
    path: '/dashboard',
    icon: 'dashboard',
    children: []
  },
  {
    id: 2,
    name: '系统管理',
    icon: 'setting',
    children: [
      {
        id: 21,
        name: '用户管理',
        path: '/system/user',
        icon: 'user'
      }
    ]
  }
])
```

后期可轻松改成接口获取菜单。

## 扩展指南

### 添加新页面

1. 在 `src/views` 中创建新的 `.vue` 文件
2. 在 `src/router/index.js` 中添加路由配置
3. 更新菜单数据（`src/store/modules/app.js`）

### 添加新的 API

1. 在 `src/api` 中创建新的 `.js` 文件
2. 使用 `request` 实例进行请求：

```javascript
export function getList(params) {
  return request.get('/api/list', { params })
}
```

### 添加新的 Store

1. 在 `src/store/modules` 中创建新的 `.js` 文件
2. 使用 `defineStore` 定义：

```javascript
export const useMyStore = defineStore('myStore', () => {
  // 状态和方法
})
```

## 环境配置

### Vite 代理配置

在 `vite.config.js` 中已配置 API 代理：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

修改 `target` 即可切换后端服务地址。

## 浏览器支持

- Chrome（最新）
- Firefox（最新）
- Safari（最新）
- Edge（最新）

## 常见问题

### Q: 如何修改主色调？
A: 可以通过 CSS 变量修改，或在 Element Plus 主题配置中修改。

### Q: 如何添加权限控制？
A: 在 `src/permission.js` 中的守卫中添加权限判断逻辑。

### Q: 菜单如何从后端获取？
A: 修改 `src/store/modules/app.js` 中的 `menuList`，改为调用 API 获取。

### Q: 如何支持国际化？
A: 推荐使用 `vue-i18n`，在 `src/main.js` 中配置并使用。

## 开发建议

1. ✅ 使用 `<script setup>` 语法糖编写组件
2. ✅ 充分利用自动导入功能，避免重复 import
3. ✅ 在 `src/api` 中统一管理所有 API 调用
4. ✅ 使用 Pinia 管理全局状态，避免 Props Drilling
5. ✅ 为路由添加 meta 信息，便于权限和标题管理
6. ✅ 使用深色模式兼容的样式编写

## 许可证

MIT

## 支持

如有问题或建议，欢迎提出 Issues 或 Pull Requests。

---

祝你使用愉快！🎉
