import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/user/login',
      name: 'UserLogin',
      component: { template: '<div>login</div>' },
      meta: { requiresAuth: false }
    },
    {
      path: '/user',
      component: { template: '<div>user</div>' },
      redirect: '/user/services',
      meta: { title: '用户端', hidden: true },
      children: [
        {
          path: 'services',
          name: 'UserServices',
          component: { template: '<div>services</div>' },
          meta: { title: '服务' }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isUserRoute = to.path.startsWith('/user')
  console.log('---')
  console.log('to.path:', to.path)
  console.log('to.meta:', to.meta)

  if (isUserRoute) {
    const hasUserToken = false
    
    if (hasUserToken) {
      if (to.path === '/user/login') {
        next({ path: '/user/services' })
      } else {
        next()
      }
    } else {
      if (to.path === '/user/login' || to.meta.requiresAuth === false) {
        next()
      } else {
        next(`/user/login?redirect=${to.path}`)
      }
    }
    return
  }
  next()
})

router.push('/user/services')
setTimeout(() => {
  console.log('Current route is:', router.currentRoute.value.path)
}, 100)