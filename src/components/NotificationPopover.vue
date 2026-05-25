<template>
  <div class="noti-popover">
    <div class="noti-header">
      <span class="noti-title">通知 ({{ unreadCount }})</span>
      <el-button text size="small" type="primary" @click="handleReadAll" :disabled="unreadCount === 0">全部已读</el-button>
    </div>
    <div class="noti-list" v-if="notifications.length">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="noti-item"
        :class="{ unread: item.isRead === 0 }"
      >
        <span v-if="item.isRead === 0" class="noti-dot"></span>
        <div class="noti-body" @click="handleItemClick(item)">
          <div class="noti-item-title">{{ item.title }}</div>
          <div class="noti-item-content">{{ item.content }}</div>
          <div class="noti-item-time">{{ item.createTime }}</div>
        </div>
        <el-button
          v-if="item.isRead === 0"
          text
          size="small"
          type="primary"
          @click.stop="handleMarkRead(item)"
        >已读</el-button>
      </div>
    </div>
    <el-empty v-else description="暂无通知" :image-size="60" />
    <div class="noti-view-all" @click="handleViewAll">查看全部</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotificationList, markNotificationRead, markAllNotificationRead } from '@/api/notification'
import { useNotificationStore } from '@/store/modules/notification'

const emit = defineEmits(['close'])
const router = useRouter()
const notificationStore = useNotificationStore()
const notifications = ref([])
const unreadCount = ref(0)

onMounted(() => {
  loadList()
})

async function loadList() {
  try {
    const res = await getNotificationList({ pageNo: 1, pageSize: 20 })
    notifications.value = res.records || []
    unreadCount.value = res.unreadCount ?? 0
  } catch (e) {
    // silent
  }
}

async function handleItemClick(item) {
  if (item.isRead === 0) {
    await markNotificationRead({ id: item.id })
    item.isRead = 1
    notificationStore.fetchUnreadCount()
  }
  if (item.refId) {
    emit('close')
    router.push('/order')
  }
}

async function handleMarkRead(item) {
  await markNotificationRead({ id: item.id })
  notifications.value = notifications.value.filter(n => n.id !== item.id)
  notificationStore.fetchUnreadCount()
}

async function handleReadAll() {
  await markAllNotificationRead()
  notifications.value = []
  notificationStore.clear()
}

function handleViewAll() {
  emit('close')
  router.push('/notification')
}
</script>

<style scoped>
.noti-popover { max-height: 380px; display: flex; flex-direction: column; }
.noti-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 4px 12px; border-bottom: 1px solid #f0f0f0; }
.noti-title { font-size: 14px; font-weight: 600; }
.noti-list { overflow-y: auto; flex: 1; }
.noti-item { display: flex; align-items: flex-start; gap: 8px; padding: 10px 4px; border-bottom: 1px solid #f5f5f5; }
.noti-item:hover { background: #fafafa; }
.noti-item.unread { background: #fafcff; }
.noti-dot { width: 6px; height: 6px; border-radius: 50%; background: #f56c6c; margin-top: 6px; flex-shrink: 0; }
.noti-body { flex: 1; min-width: 0; cursor: pointer; }
.noti-item-title { font-size: 13px; font-weight: 500; color: #303133; margin-bottom: 2px; }
.noti-item-content { font-size: 12px; color: #909399; line-height: 1.4; margin-bottom: 4px; }
.noti-item-time { font-size: 11px; color: #c0c4cc; }
.noti-view-all {
  text-align: center;
  padding: 10px 4px;
  font-size: 13px;
  color: var(--el-color-primary, #409eff);
  cursor: pointer;
  border-top: 1px solid #f0f0f0;
}
.noti-view-all:hover {
  color: var(--el-color-primary-light-3, #66b1ff);
}
</style>
