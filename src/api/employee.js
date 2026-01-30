import request from '@/utils/request'

export function getEmployeeList(params) {
  return request({
    url: '/employee/list',
    method: 'get',
    params
  })
}

export function getEmployeeOptions() {
  return request({
    url: '/employee/options',
    method: 'get'
  })
}