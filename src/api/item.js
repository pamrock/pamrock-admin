import request from '@/utils/request'

// 获取服务项目列表
export function getItemList(query) {
  return request.post('/item/list', query)
}

// 新增服务项目
export function addItem(data, file) {
  const formData = new FormData()
  formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (file) {
    formData.append('file', file)
  }
  return request.post('/item/add', formData)
}

// 修改服务项目
export function updateItem(data, file) {
  const formData = new FormData()
  formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (file) {
    formData.append('file', file)
  }
  return request.post('/item/update', formData)
}

// 删除服务项目
export function deleteItem(data) {
  return request.post('/item/delete', data)
}