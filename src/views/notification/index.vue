<template>
  <div class="notification-page">
    <div class="page-header">
      <h2>通知中心</h2>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="未读消息" name="unread">
        <div class="noti-list" v-if="unreadList.length" v-loading="loading">
          <div
            v-for="item in unreadList"
            :key="item.id"
            class="noti-card unread"
          >
            <div class="noti-dot"></div>
            <div class="noti-body">
              <div class="noti-title">{{ item.title }}</div>
              <div class="noti-content">{{ item.content }}</div>
              <div class="noti-time">{{ item.createTime }}</div>
            </div>
            <el-button
              size="small"
              type="primary"
              plain
              @click="handleMarkRead(item)"
              :loading="item._reading"
            >标记已读</el-button>
          </div>
          <div v-if="!hasMoreUnread && unreadList.length > 0" class="no-more">— 没有更多了 —</div>
          <div class="load-more-wrap" v-if="hasMoreUnread">
            <el-button text @click="loadMore('unread')" :loading="loadingMore">加载更多</el-button>
          </div>
        </div>
        <el-empty v-else-if="!loading" description="暂无未读消息" :image-size="80" />
      </el-tab-pane>

      <el-tab-pane label="所有消息" name="all">
        <div class="noti-list" v-if="allList.length" v-loading="loading">
          <div
            v-for="item in allList"
            :key="item.id"
            class="noti-card"
            :class="{ read: item.isRead === 1 }"
          >
            <span v-if="item.isRead === 0" class="noti-dot"></span>
            <div class="noti-body">
              <div class="noti-title">{{ item.title }}</div>
              <div class="noti-content">{{ item.content }}</div>
              <div class="noti-time">{{ item.createTime }}</div>
            </div>
            <el-tag v-if="item.isRead === 1" size="small" type="info">已读</el-tag>
          </div>
          <div v-if="!hasMoreAll && allList.length > 0" class="no-more">— 没有更多了 —</div>
          <div class="load-more-wrap" v-if="hasMoreAll">
            <el-button text @click="loadMore('all')" :loading="loadingMore">加载更多</el-button>
          </div>
        </div>
        <el-empty v-else-if="!loading" description="暂无消息" :image-size="80" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNotificationList, markNotificationRead } from '@/api/notification'
import { useNotificationStore } from '@/store/modules/notification'
import { ElMessage } from 'element-plus'

const activeTab = ref('unread')
const loading = ref(false)
const loadingMore = ref(false)
const notificationStore = useNotificationStore()

const allList = ref([])
const allPage = ref(1)
const hasMoreAll = ref(true)

const unreadList = ref([])
const unreadPage = ref(1)
const hasMoreUnread = ref(true)

const PAGE_SIZE = 20

const fetchAll = async (reset = false) => {
  if (reset) { allPage.value = 1; allList.value = []; hasMoreAll.value = true }
  loading.value = true
  try {
    const res = await getNotificationList({ pageNo: allPage.value, pageSize: PAGE_SIZE })
    const records = res.records || []
    if (records.length < PAGE_SIZE) hasMoreAll.value = false
    if (reset) {
      allList.value = records
    } else {
      allList.value = [...allList.value, ...records]
    }
  } catch (e) {
    // silent
  } finally {
    loading.value = false
  }
}

const fetchUnread = async (reset = false) => {
  if (reset) { unreadPage.value = 1; unreadList.value = []; hasMoreUnread.value = true }
  loading.value = true
  try {
    const res = await getNotificationList({ pageNo: unreadPage.value, pageSize: PAGE_SIZE })
    const records = (res.records || []).filter(r => r.isRead === 0).map(r => ({ ...r, _reading: false }))
    if (records.length < PAGE_SIZE) hasMoreUnread.value = false
    if (reset) {
      unreadList.value = records
    } else {
      unreadList.value = [...unreadList.value, ...records]
    }
  } catch (e) {
    // silent
  } finally {
    loading.value = false
  }
}

const loadMore = async (tab) => {
  if (loadingMore.value) return
  loadingMore.value = true
  try {
    if (tab === 'unread') { unreadPage.value++; await fetchUnread(false) }
    else { allPage.value++; await fetchAll(false) }
  } finally {
    loadingMore.value = false
  }
}

const handleTabChange = (tab) => {
  if (tab === 'all' && allList.value.length === 0) fetchAll(true)
  if (tab === 'unread') fetchUnread(true)
}

const handleMarkRead = async (item) => {
  item._reading = true
  try {
    await markNotificationRead({ id: item.id })
    item.isRead = 1
    notificationStore.fetchUnreadCount()
    // Remove from unread list immediately
    unreadList.value = unreadList.value.filter(n => n.id !== item.id)
    // Update in all list too
    const found = allList.value.find(n => n.id === item.id)
    if (found) found.isRead = 1
    ElMessage.success('已标记为已读')
  } catch (e) {
    ElMessage.error('操作失败')
  } finally {
    item._reading = false
  }
}

onMounted(() => {
  fetchUnread(true)
})
</script>

<style scoped>
.notification-page {
  padding: 20px;
  max-width: 800px;
}
.page-header {
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
}
.noti-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.noti-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #ebeef5;
  transition: background 0.2s;
}
.noti-card.unread {
  background: #f4f9ff;
  border-color: #d9ecff;
}
.noti-card.read {
  opacity: 0.7;
}
.noti-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
  margin-top: 6px;
  flex-shrink: 0;
}
.noti-body {
  flex: 1;
  min-width: 0;
}
.noti-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}
.noti-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 6px;
}
.noti-time {
  font-size: 12px;
  color: #c0c4cc;
}
.no-more {
  text-align: center;
  color: #c0c4cc;
  font-size: 12px;
  padding: 10px;
}
.load-more-wrap {
  text-align: center;
  padding: 10px;
}

.dark .noti-card {
  background: #1d1e1f;
  border-color: #303030;
}
.dark .noti-card.unread {
  background: #1a2636;
  border-color: #2a3a4a;
}
.dark .noti-title { color: #e0e0e0; }
.dark .noti-content { color: #a0a0a0; }
</style>
