import request from '@/utils/request'

// Mock data for categories
let categoryList = [
  {
    id: 1,
    categoryLevel: 1,
    categoryCode: 'CLEAN',
    categoryName: '保洁服务',
    parentCategoryCode: null,
    remark: '家庭保洁',
    children: [
      {
        id: 11,
        categoryLevel: 2,
        categoryCode: 'DAILY_CLEAN',
        categoryName: '日常保洁',
        parentCategoryCode: 'CLEAN',
        remark: '日常家庭清洁',
        children: []
      },
      {
        id: 12,
        categoryLevel: 2,
        categoryCode: 'DEEP_CLEAN',
        categoryName: '深度保洁',
        parentCategoryCode: 'CLEAN',
        remark: '深度清洁服务',
        children: []
      }
    ]
  },
  {
    id: 2,
    categoryLevel: 1,
    categoryCode: 'REPAIR',
    categoryName: '家电维修',
    parentCategoryCode: null,
    remark: '家电维修服务',
    children: []
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

// 获取分类列表 (树状结构)
export function getCategoryList(query) {
  // 在真实场景中，这里会发送请求
  // return request.post('/category/list', query)
  
  // 模拟过滤逻辑 (简单实现)
  let data = categoryList
  if (query && query.categoryName) {
    // 简单过滤第一层，实际应该是递归过滤
    data = categoryList.filter(item => item.categoryName.includes(query.categoryName))
  }
  return mockRequest(data)
}

// 新增分类
export function addCategory(data) {
  // return request.post('/category/add', data)
  const newId = Math.max(...categoryList.map(c => c.id), ...categoryList.flatMap(c => c.children || []).map(c => c.id)) + 1
  const newCategory = { ...data, id: newId, children: [] }
  
  if (!data.parentCategoryCode) {
     categoryList.push(newCategory)
  } else {
     // 简单查找两层
     const parent = categoryList.find(c => c.categoryCode === data.parentCategoryCode)
     if (parent) {
         if (!parent.children) parent.children = []
         parent.children.push(newCategory)
     } else {
         // 尝试在第二层找 (如果支持多级)
          categoryList.forEach(c => {
              if (c.children) {
                  const subParent = c.children.find(sc => sc.categoryCode === data.parentCategoryCode)
                  if (subParent) {
                      if (!subParent.children) subParent.children = []
                      subParent.children.push(newCategory)
                  }
              }
          })
     }
  }
  return mockRequest(null)
}

// 修改分类
export function updateCategory(data) {
  // return request.post('/category/update', data)
  // 简化模拟，不做深度查找更新
  return mockRequest(null)
}

// 删除分类
export function deleteCategory(data) {
  // return request.post('/category/delete', data)
  // 简化模拟
  return mockRequest(null)
}
