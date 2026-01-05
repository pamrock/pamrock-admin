import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebar = ref({
    opened: true
  })

  const isDark = ref(localStorage.getItem('theme') === 'dark')

  // 菜单数据
  const menuList = ref([
    {
      id: 1,
      name: '首页',
      path: '/dashboard',
      component: 'Dashboard',
      icon: 'dashboard',
      roles: ['admin', 'user'],
      children: []
    },
    {
      id: 2,
      name: '系统管理',
      icon: 'setting',
      roles: ['admin'],
      children: [
        {
          id: 21,
          name: '用户管理',
          path: '/system/user',
          component: 'System/User',
          icon: 'user',
          roles: ['admin']
        },
        {
          id: 22,
          name: '角色管理',
          path: '/system/role',
          component: 'System/Role',
          icon: 'role',
          roles: ['admin']
        },
        {
          id: 23,
          name: '菜单管理',
          path: '/system/menu',
          component: 'System/Menu',
          icon: 'menu',
          roles: ['admin']
        }
      ]
    },
    {
      id: 3,
      name: '日志管理',
      icon: 'log',
      roles: ['admin'],
      children: [
        {
          id: 31,
          name: '登录日志',
          path: '/log/login',
          component: 'Log/LoginLog',
          icon: 'login-log',
          roles: ['admin']
        }
      ]
    },
    {
      id: 4,
      name: '示例页面',
      icon: 'example',
      roles: ['admin', 'user'],
      children: [
        {
          id: 41,
          name: '表格示例',
          path: '/example/table',
          component: 'Example/Table',
          icon: 'table',
          roles: ['admin', 'user']
        },
        {
          id: 42,
          name: '表单示例',
          path: '/example/form',
          component: 'Example/Form',
          icon: 'form',
          roles: ['admin', 'user']
        }
      ]
    }
  ])

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebar.value.opened = !sidebar.value.opened
  }

  // 切换暗黑模式
  const toggleDark = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // 初始化暗黑模式
  const initDarkMode = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    }
  }

  return {
    sidebar,
    isDark,
    menuList,
    toggleSidebar,
    toggleDark,
    initDarkMode
  }
})
