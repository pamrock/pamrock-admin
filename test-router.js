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
      path: '/user/services',
      name: 'UserServices',
      component: { template: '<div>services</div>' },
      meta: { title: '服务' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isUserRoute = to.path.startsWith('/user')

  if (isUserRoute) {
    const hasUserToken = false
    console.log('Navigating to:', to.path, 'hasUserToken:', hasUserToken)
    
    if (hasUserToken) {
      if (to.path === '/user/login') {
        next({ path: '/user/services' })
      } else {
        next()
      }
    } else {
      if (to.path === '/user/limport { createRouter, createMemoryHistory } from 