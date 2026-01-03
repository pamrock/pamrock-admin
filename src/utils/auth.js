/**
 * Token 存取管理
 */

const TOKEN_KEY = 'admin_token'
const TIME_KEY = 'timestamp'
// 设置 Token 过期时间 (2小时)
const TOKEN_TIMEOUT_VALUE = 24 * 3600 * 1000

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TIME_KEY)
}

export function hasToken() {
  return !!getToken()
}

/**
 * 获取时间戳
 */
export function getTimeStamp() {
  return localStorage.getItem(TIME_KEY)
}

/**
 * 设置时间戳
 */
export function setTimeStamp() {
  localStorage.setItem(TIME_KEY, Date.now())
}

/**
 * 检查是否超时
 * @returns {boolean} true 表示已超时
 */
export function isTokenExpired() {
  const time = getTimeStamp()
  if (!time) return true
  const currentTime = Date.now()
  return currentTime - time > TOKEN_TIMEOUT_VALUE
}
