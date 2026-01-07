import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setToken, removeToken, getToken } from '@/utils/auth'
import { getUserInfo as getUserInfoApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const userInfo = ref({
    id: null,
    username: '',
    email: '',
    avatar: '',
    roleName: '',
    createTime: ''
  })

  // 登录
  const login = (newToken) => {
    token.value = newToken
    setToken(newToken)
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const res = await getUserInfoApi()
      if (res.success) {
        setUserInfo(res.data)
        return res.data
      }
      return null
    } catch (error) {
      console.error('获取用户信息失败', error)
      throw error
    }
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
    getUserInfo,
    logout,
    setUserInfo,
    isLoggedIn
  }
})
