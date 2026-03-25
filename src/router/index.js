// 导入视图组件
import { createRouter, createWebHashHistory } from 'vue-router'

import Layout from '@/layout/index.vue'
import UserLayout from '@/views/user/layout.vue'
import Login from '@/views/login/index.vue'
import Register from '@/views/register/index.vue'
import Dashboard from '@/views/dashboard/index.vue'

// 静态路由（无需权限即可访问或基础路由）
export const constantRoutes = [
  {
    path: '/user/login',
    name: 'UserLogin',
    component: () => import('@/views/user/login.vue'),
    meta: { requiresAuth: false, title: '用户登录', hidden: true }
  },
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/services',
    meta: { title: '用户端', hidden: true },
    children: [
      {
        path: 'services',
        name: 'UserServices',
        component: () => import('@/views/user/services.vue'),
        meta: { title: '服务' }
      },
      {
        path: 'orders',
        name: 'UserOrders',
        component: () => import('@/views/user/orders.vue'),
        meta: { title: '订单' }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/profile.vue'),
        meta: { title: '我的' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, title: '登录', hidden: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, title: '注册', hidden: true }
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
        meta: { title: '仪表板', icon: 'Monitor', affix: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', hidden: true }
      },
      {
        path: 'order/my',
        name: 'MyOrder',
        component: () => import('@/views/order/my/index.vue'),
        meta: { title: '我的订单', hidden: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
})

export default router
