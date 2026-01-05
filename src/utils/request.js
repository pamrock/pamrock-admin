import axios from 'axios'
import { getToken } from './auth'

const instance = axios.create({
  baseURL: 'http://127.0.0.1:1231',
  timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    const res = response.data

    if (res && res.code && res.code === 1020) {
      return Promise.reject(res.msg)
    }

    return res
  },
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 未授权，跳转到登录页
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
