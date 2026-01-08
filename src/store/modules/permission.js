import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMenuList } from '@/api/menu'
import Layout from '@/layout/index.vue'

// 匹配 views 里面所有的 .vue 文件
const modules = import.meta.glob('../../views/**/*.vue')

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref([])
  const addRoutes = ref([])

  // 生成路由
  const generateRoutes = async (roles) => {
    // 动态导入以避免循环依赖
    const { constantRoutes } = await import('@/router')

    return new Promise((resolve, reject) => {
      getMenuList({}).then(res => {
        // 安全检查
        const data = res.data || []
        const accessedRoutes = filterAsyncRoutes(data, roles)
        
        // 最后添加 404 路由
        accessedRoutes.push({
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('@/views/404.vue'),
            meta: { hidden: true }
        })

        routes.value = constantRoutes.concat(accessedRoutes)
        addRoutes.value = accessedRoutes
        resolve(accessedRoutes)
      }).catch(error => {
        reject(error)
      })
    })
  }

  return {
    routes,
    addRoutes,
    generateRoutes
  }
})

// 遍历后台传来的路由字符串，转换为组件对象
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = {
      path: route.path,
      component: null,
      // 尝试生成一个 name，用于 keep-alive
      name: route.path.replace(/^\//, '').split('/').map(str => str.charAt(0).toUpperCase() + str.slice(1)).join('') || ('Route' + route.id),
      meta: {
        title: route.menuName,
        icon: (route.icon && route.icon !== '#') ? route.icon : '',
        hidden: route.visible === '1' // 假设 1 是隐藏
      }
    }

    // 处理组件
    if (route.menuType === 'M') {
      tmp.component = Layout
    } else if (route.menuType === 'C') {
      // 清理组件路径：/views/system/user -> system/user
      let compPath = route.component
      if (compPath) {
        compPath = compPath.replace(/^\/views\//, '').replace(/^\//, '')

        const fullPath = `../../views/${compPath}.vue`
        const indexPath = `../../views/${compPath}/index.vue`

        if (modules[fullPath]) {
          tmp.component = modules[fullPath]
        } else if (modules[indexPath]) {
          tmp.component = modules[indexPath]
        } else {
          tmp.component = () => import('@/views/404.vue')
        }
      }
    }

    // 处理子菜单
    if (route.children && route.children.length > 0) {
      tmp.children = filterAsyncRoutes(route.children, roles)
    }

    res.push(tmp)
  })

  return res
}
