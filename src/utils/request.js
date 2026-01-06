import axios from 'axios'
import { getToken, removeToken } from './auth'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: 'http://127.0.0.1:1231',
  timeout: 100000
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
      ElMessage.error(res.msg || '服务器内部错误')
      return Promise.reject({ code: 1020, message: res.msg })
    }

    return res
  },
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 未授权，清除token并跳转到登录页
      removeToken()
      window.location.href = '/#/login?session=expired'
    }
    return Promise.reject(error)
  }
)

export default instance
