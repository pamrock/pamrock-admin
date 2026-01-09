import request from '@/utils/request'

// Mock data for items
let itemList = [
  {
    id: 1,
    itemName: '2小时日常保洁',
    categoryCode: 'DAILY_CLEAN',
    price: 100.00,
    chargingMethod: 1, // 0-按次 1-按时间
    costtime: 'PT2H', // ISO 8601 duration format
    introduction: '包括客厅、卧室、厨房、卫生间表面清洁',
    imageUrl: 'https://placeholder.com/clean.jpg'
  },
  {
    id: 2,
    itemName: '油烟机清洗',
    categoryCode: 'DEEP_CLEAN',
    price: 150.00,
    chargingMethod: 0,
    costtime: null,
    introduction: '专业拆洗油烟机',
    imageUrl: ''
  }
]

// 模拟后端接口延迟
const mockRequest = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        code: 200,
        msg: '操作成功',
        data: data
      })
    }, 200)
  })
}

// 获取服务项目列表
export function getItemList(query) {
  // return request.post('/item/list', query)
  let data = itemList
  if (query) {
      if (query.itemName) {
          data = data.filter(item => item.itemName.includes(query.itemName))
      }
      if (query.categoryCode) {
          data = data.filter(item => item.categoryCode === query.categoryCode)
      }
  }
  
  return mockRequest({
      records: data,
      total: data.length,
      size: query.pageSize || 10,
      current: query.pageNo || 1
  })
}

// 新增服务项目
export function addItem(data) {
  // return request.post('/item/add', data)
  const newId = itemList.length > 0 ? Math.max(...itemList.map(i => i.id)) + 1 : 1
  itemList.push({ ...data, id: newId })
  return mockRequest(null)
}

// 修改服务项目
export function updateItem(data) {
  // return request.post('/item/update', data)
  const index = itemList.findIndex(i => i.id === data.id)
  if (index !== -1) {
      itemList[index] = { ...itemList[index], ...data }
  }
  return mockRequest(null)
}

// 删除服务项目
export function deleteItem(data) {
  // return request.post('/item/delete', data)
  itemList = itemList.filter(i => i.id !== data.id)
  return mockRequest(null)
}
