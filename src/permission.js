import router from './router'
import { useUserStore } from '@/store/modules/user'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { hasToken, isTokenExpired } from '@/utils/auth'
import { ElMessage } from 'element-plus'

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const hasTokenFlag = hasToken()

  // 已登录的情况
  if (hasTokenFlag) {
    // 验证 Token 是否有效
    const expired = await isTokenExpired()
    if (expired) {
      // 如果 Token 已失效
      userStore.logout()
      next('/login?session=expired')
    } else {
      // Token 有效
      // 如果是登录页，重定向到首页
      if (to.path === '/login' || to.path === '/register') {
        next('/dashboard')
      } else {
        // 判断当前用户是否已拉取完user_info信息
        if (!userStore.userInfo.username) {
          try {
            await userStore.getUserInfo()
            next()
          } catch (error) {
            // 获取用户信息失败，清除token
            userStore.logout()
            ElMessage.error(error.message || '获取用户信息失败')
            next(`/login?redirect=${to.path}`)
          }
        } else {
          next()
        }
      }
    }
  } else {
    // 未登录的情况
    // 如果访问的是不需要认证的页面，直接进入
    console.log(to.meta);
    if (to.meta.requiresAuth === false) {
      next()
    } else {
      // 其他页面都需要登录
      next('/login')
    }
  }
})

// 路由后置守卫 - 用于添加 tags 和更新页面标题
router.afterEach((to) => {
  const tagsViewStore = useTagsViewStore()

  // 排除登录和注册页面
  if (to.path !== '/login' && to.path !== '/register') {
    tagsViewStore.addTag({
      path: to.path,
      title: to.meta?.title || to.name || 'Unknown',
      name: to.name
    })
  }

  // 设置页面标题
  document.title = (to.meta?.title || 'Admin') + ' - 管理系统'
})
