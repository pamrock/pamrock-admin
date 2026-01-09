/**
 * 时间格式化
 * @param {string} timeStr 
 * @returns {string}
 */
export function formatTime(timeStr) {
    if (!timeStr) return '-'
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

/**
 * 过滤对象中为空的属性
 * @param {Object} obj 
 * @returns {Object}
 */
export function filterObj(obj) {
    const newObj = {}
    Object.keys(obj).forEach(key => {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            newObj[key] = obj[key]
        }
    })
    return newObj
}