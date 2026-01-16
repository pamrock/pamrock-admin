import request from '@/utils/request'

export function getItemList(query) {
  return request.post('/item/list', query)
}

export function addItem(data, file) {
  const formData = new FormData()
  formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (file) {
    formData.append('file', file)
  }
  return request.post('/item/add', formData)
}

export function updateItem(data, file) {
  const formData = new FormData()
  formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (file) {
    formData.append('file', file)
  }
  return request.post('/item/update', formData)
}

export function deleteItem(data) {
  return request.post('/item/delete', data)
}

export function createItemOrder(data) {
  return request.post('/item/order/add', data)
}
