import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/user',
      component: { template: '<div>user</div>' },
      meta: { requiresAuth: false },
      children: [
        {
          path: 'services',
          name: 'UserServices',
          component: { template: '<div>services</div>' }
        }
      ]
    }
  ]
})

router.push('/user/services')
setTimeout(() => {
  console.log('to.meta for /user/services:', router.currentRoute.value.meta)
}, 100)
