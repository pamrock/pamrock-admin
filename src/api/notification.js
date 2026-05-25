import request from '@/utils/request'

export function getNotificationList(data) {
  return request.post('/notification/list', data)
}

export function markNotificationRead(data) {
  return request.post('/notification/read', data)
}

export function markAllNotificationRead() {
  return request.post('/notification/read-all', {})
}

export function getUnreadCount() {
  return request.post('/notification/unread-count', {})
}
