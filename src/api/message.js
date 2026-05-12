import request from '@/utils/request'

export function getMessages(orderId, data) {
  return request.post(`/order/${orderId}/messages`, data)
}
