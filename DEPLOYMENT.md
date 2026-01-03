# 项目部署和使用指南

## ✅ 项目完整性检查清单

### 依赖和配置文件
- ✅ `package.json` - 已更新所有必要的依赖
- ✅ `vite.config.js` - 完整配置（自动导入、Element Plus、代理等）
- ✅ `index.html` - HTML 入口文件
- ✅ `README.md` - 完整的项目文档

### 核心文件
- ✅ `src/main.js` - 应用入口，集成 Vue Router、Pinia、Element Plus
- ✅ `src/App.vue` - 根组件，支持深色模式初始化
- ✅ `src/permission.js` - 路由守卫和标签页管理

### 路由和布局
- ✅ `src/router/index.js` - 路由配置
- ✅ `src/layout/index.vue` - 主布局
- ✅ `src/layout/components/Header.vue` - 顶部栏（含用户菜单、主题切换）
- ✅ `src/layout/components/Sidebar.vue` - 左侧菜单（可折叠、支持多级菜单）
- ✅ `src/layout/components/TagsView.vue` - 标签页导航（支持右键菜单）
- ✅ `src/layout/components/AppMain.vue` - 主内容区

### 状态管理（Pinia）
- ✅ `src/store/index.js` - Pinia 入口
- ✅ `src/store/modules/user.js` - 用户状态（token、用户信息、登录/登出）
- ✅ `src/store/modules/app.js` - 应用状态（菜单、侧边栏、主题）
- ✅ `src/store/modules/tagsView.js` - 标签页状态

### API 和工具
- ✅ `src/api/login.js` - 登录相关 API
- ✅ `src/utils/auth.js` - Token 存取管理
- ✅ `src/utils/request.js` - Axios 实例和拦截器

### 页面组件
- ✅ `src/views/login/index.vue` - 登录页（含表单验证、演示账号提示）
- ✅ `src/views/register/index.vue` - 注册页（含表单验证）
- ✅ `src/views/dashboard/index.vue` - 仪表盘（统计卡片、表格、活动列表）
- ✅ `src/views/example/table.vue` - 表格示例（CRUD 操作）
- ✅ `src/views/example/form.vue` - 表单示例（表单控件演示）
- ✅ `src/views/system/user.vue` - 用户管理（完整的列表、搜索、CRUD）
- ✅ `src/views/404.vue` - 404 错误页面

### 通用组件
- ✅ `src/components/Breadcrumb.vue` - 面包屑导航
- ✅ `src/components/SvgIcon.vue` - SVG 图标组件

### 样式文件
- ✅ `src/style.css` - 全局样式（响应式、暗黑模式支持）

## 🚀 快速开始步骤

### 步骤 1：安装依赖
```bash
cd d:\VSCode\my-admin
npm install
```

### 步骤 2：启动开发服务器
```bash
npm run dev
```

### 步骤 3：打开浏览器
访问 `http://localhost:5173`

### 步骤 4：使用演示账号登录
- 用户名: `admin`
- 密码: `123456`

### 步骤 5：生产构建
```bash
npm run build
```

## 📋 核心功能验证清单

### 认证功能
- [ ] 登录页面可以访问
- [ ] 注册页面可以访问且表单验证正常
- [ ] 使用演示账号登录成功
- [ ] 登录后 Token 存储在 localStorage
- [ ] 刷新页面后仍保持登录状态
- [ ] 未登录访问受保护页面自动跳转到登录页

### 布局功能
- [ ] 左侧菜单正确显示
- [ ] 菜单可以折叠和展开
- [ ] 多级菜单正确显示和点击导航
- [ ] 顶部栏显示面包屑导航
- [ ] TagsView 标签页正确显示访问过的页面
- [ ] 标签页支持右键菜单（关闭、关闭其他、关闭全部、刷新）
- [ ] 右上角用户菜单显示正确

### 主题功能
- [ ] 点击顶部暗黑模式按钮可以切换主题
- [ ] 主题切换后所有组件都应用了正确的样式
- [ ] 刷新页面后主题设置仍保持

### 示例页面
- [ ] 仪表盘页面正确显示统计数据
- [ ] 表格示例页面可以新增、编辑、删除数据
- [ ] 表单示例页面表单验证正常
- [ ] 用户管理页面可以搜索、新增、编辑、删除用户
- [ ] 404 页面在访问不存在的路由时显示

### 响应式设计
- [ ] 在桌面端显示完整的三段式布局
- [ ] 在平板设备上布局正确
- [ ] 在手机上自动收起侧边栏，显示汉堡按钮

## 📝 主要代码特性

### 所有 Vue 文件使用 `<script setup>` 语法
✅ 无 TypeScript，全部使用 JavaScript

### 自动导入配置生效
- ✅ 无需 import，直接使用 `ref`、`reactive`、`computed` 等
- ✅ 无需 import，直接使用 `useRouter`、`useRoute`
- ✅ 无需 import，直接使用 `defineStore`

### Element Plus 按需导入
✅ 无需手动配置，自动导入使用的组件

### 菜单数据
✅ 写死在 `src/store/modules/app.js` 中，便于后期改成接口获取

### Token 管理
✅ 同时存储在 localStorage 和 Pinia，请求时自动添加到 Authorization 头

## 🔧 常见配置修改

### 修改 API 基础 URL
编辑 `vite.config.js` 中的代理配置：
```javascript
proxy: {
  '/api': {
    target: 'http://你的后端地址:端口',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### 修改主色调
在各个 Vue 组件的 style 部分修改渐变色：
```css
background: linear-gradient(135deg, #你的颜色1 0%, #你的颜色2 100%);
```

### 修改菜单数据为接口获取
在 `src/store/modules/app.js` 中，将硬编码的 menuList 改为调用 API：
```javascript
const getMenus = async () => {
  const response = await request.get('/menus')
  menuList.value = response.data
}
```

### 添加新页面
1. 在 `src/views` 中创建 `.vue` 文件
2. 在 `src/router/index.js` 中添加路由
3. 在 `src/store/modules/app.js` 中添加菜单项

## 📚 项目依赖说明

| 包名 | 版本 | 用途 |
|------|------|------|
| vue | 3.4.21 | 核心框架 |
| vue-router | 4.2.5 | 路由管理 |
| pinia | 2.1.7 | 状态管理 |
| element-plus | 2.7.7 | UI 组件库 |
| axios | 1.6.8 | HTTP 客户端 |
| @vueuse/core | 10.9.0 | 组合式函数库 |
| vite | 5.0.11 | 构建工具 |
| unplugin-auto-import | 0.17.5 | 自动导入插件 |
| unplugin-vue-components | 0.26.0 | 自动导入组件 |
| unplugin-element-plus | 0.8.1 | Element Plus 自动导入 |

## ⚠️ 注意事项

1. **演示账号**：仅用于本地测试，实际应用需要连接真实后端
2. **API 代理**：修改 `vite.config.js` 中的代理地址为实际后端地址
3. **权限控制**：路由守卫中目前只检查 Token，需要添加角色和权限判断
4. **错误处理**：request.js 中的错误处理需要根据实际 API 响应格式调整
5. **国际化**：如需多语言支持，推荐集成 vue-i18n

## 🐛 故障排除

### 问题：npm install 失败
解决：检查 Node.js 版本（需要 14.0+），尝试清空缓存后重新安装
```bash
npm cache clean --force
npm install
```

### 问题：开发服务器无法启动
解决：检查端口 5173 是否被占用，修改 vite.config.js 中的 port 配置

### 问题：样式未应用
解决：确保 Element Plus CSS 在 main.js 中正确导入，检查深色模式相关样式

### 问题：自动导入不生效
解决：重启开发服务器或重新加载编辑器

## 📞 获得帮助

- 查看 README.md 了解详细文档
- 检查各个文件中的注释说明
- 参考 Element Plus 官方文档：https://element-plus.org
- 参考 Vue 3 官方文档：https://vuejs.org
- 参考 Pinia 官方文档：https://pinia.vuejs.org

---

祝你使用愉快！如有问题，欢迎反馈。🎉
