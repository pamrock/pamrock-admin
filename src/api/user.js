import request from '@/utils/request'

export function getUserList(data) {
    return request.post('/user/list', data)
}

export function addUser(data) {
    return request.post('/user/addUser', data)
}

export function updateUser(data) {
    return request.post('/user/updateUser', data)
}

export function deleteUser(data) {
    return request.post('/user/deleteUser', data)
}

export function forceLogout(data) {
    return request.post('/user/forceLogout', data)
}

export function isUserInActive() {
    return request.get('/user/isUserInActive')
}
