import request from '@/utils/request'

// 获取服务项目列表
export function getItemList(query) {
  return request.post('/item/list', query)
}

// 新增服务项目
export function addItem(data) {
  return request.post('/item/add', data)
}

// 修改服务项目
export function updateItem(data) {
  return request.post('/item/update', data)
}

// 删除服务项目
export function deleteItem(data) {
  return request.post('/item/delete', data)
}