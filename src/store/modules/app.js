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
      name: '示例页面',
      icon: 'example',
      roles: ['admin', 'user'],
      children: [
        {
          id: 31,
          name: '表格示例',
          path: '/example/table',
          component: 'Example/Table',
          icon: 'table',
          roles: ['admin', 'user']
        },
        {
          id: 32,
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
  }

  // 初始化暗黑模式
  const initDarkMode = () => {
    // 状态已在 isDark ref 中通过 localStorage 初始化
    // DOM 操作将在 App.vue 中处理
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
