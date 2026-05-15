import request from '@/utils/request'

// Dashboard
export function getDashboard() {
  return request.post('/stats/dashboard')
}

// 订单统计
export function getOrderTrend(data) {
  return request.post('/stats/order/trend', data)
}
export function getOrderStatus(data) {
  return request.post('/stats/order/status', data)
}
export function getOrderSummary(data) {
  return request.post('/stats/order/summary', data)
}

// 营收统计
export function getRevenueTrend(data) {
  return request.post('/stats/revenue/trend', data)
}
export function getRevenueCategory(data) {
  return request.post('/stats/revenue/category', data)
}
export function getRevenueSummary(data) {
  return request.post('/stats/revenue/summary', data)
}

// 员工统计
export function getEmployeeRanking(data) {
  return request.post('/stats/employee/ranking', data)
}
export function getEmployeeTrend(data) {
  return request.post('/stats/employee/trend', data)
}
export function getEmployeeDistribution() {
  return request.post('/stats/employee/distribution')
}
export function getEmployeeSummary() {
  return request.post('/stats/employee/summary')
}

// 客户统计
export function getCustomerTrend(data) {
  return request.post('/stats/customer/trend', data)
}
export function getCustomerRetention(data) {
  return request.post('/stats/customer/retention', data)
}
export function getCustomerRegion(data) {
  return request.post('/stats/customer/region', data)
}
export function getCustomerSummary(data) {
  return request.post('/stats/customer/summary', data)
}

// 服务项目统计
export function getServiceRanking(data) {
  return request.post('/stats/service/ranking', data)
}
export function getServiceCategoryDistribution(data) {
  return request.post('/stats/service/category', data)
}
export function getServiceDuration(data) {
  return request.post('/stats/service/duration', data)
}
