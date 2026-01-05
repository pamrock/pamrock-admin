import { isUserInActive } from '@/api/user'

/**
 * Token 存取管理
 */

const TOKEN_KEY = 'admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function hasToken() {
  return !!getToken()
}

/**
 * 检查是否超时 (请求后端验证)
 * @returns {Promise<boolean>} true 表示已超时/失效
 */
export async function isTokenExpired() {
  try {
    await isUserInActive()
    return false
  } catch (error) {
    // 如果是 1020 错误，不视为 Token 过期
    if (error && error.code === 1020) {
      return false
    }
    return true
  }
}
