// 导入视图组件
import { createRouter, createWebHashHistory } from 'vue-router'

import Layout from '@/layout/index.vue'
import Dashboard from '@/views/dashboard/index.vue'
import Login from '@/views/login/index.vue'
import Register from '@/views/register/index.vue'
import ExampleTable from '@/views/example/table.vue'
import ExampleForm from '@/views/example/form.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, title: '注册' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '仪表板', icon: 'dashboard' }
      },
      {
        path: 'example/table',
        name: 'ExampleTable',
        component: ExampleTable,
        meta: { title: '表格示例', icon: 'table' }
      },
      {
        path: 'example/form',
        name: 'ExampleForm',
        component: ExampleForm,
        meta: { title: '表单示例', icon: 'form' }
      },
      {
        path: 'system/user',
        name: 'SystemUser',
        component: () => import('@/views/system/user.vue'),
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'system/role',
        name: 'SystemRole',
        component: () => import('@/views/system/role.vue'),
        meta: { title: '角色管理', icon: 'role' }
      },
      {
        path: 'system/menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/menu.vue'),
        meta: { title: '菜单管理', icon: 'menu' }
      },
      {
        path: 'log/login',
        name: 'LoginLog',
        component: () => import('@/views/log/loginlog.vue'),
        meta: { title: '登录日志', icon: 'Document' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
