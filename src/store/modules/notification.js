import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadCount } from '@/api/notification'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)

  async function fetchUnreadCount() {
    try {
      const res = await getUnreadCount()
      unreadCount.value = res.count ?? 0
    } catch (e) {
      // silent
    }
  }

  function clear() {
    unreadCount.value = 0
  }

  return { unreadCount, fetchUnreadCount, clear }
})
