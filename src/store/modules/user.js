import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setToken, removeToken, getToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const userInfo = ref({
    username: '',
    email: '',
    avatar: ''
  })

  // 登录
  const login = (newToken) => {
    token.value = newToken
    setToken(newToken)
  }

  // 登出
  const logout = () => {
    token.value = ''
    removeToken()
    userInfo.value = {
      username: '',
      email: '',
      avatar: ''
    }
  }

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
  }

  // 是否已登录
  const isLoggedIn = computed(() => !!token.value)

  return {
    token,
    userInfo,
    login,
    logout,
    setUserInfo,
    isLoggedIn
  }
})
