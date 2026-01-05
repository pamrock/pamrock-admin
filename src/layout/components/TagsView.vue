<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()
const tagsStore = useTagsViewStore()

const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  path: ''
})

// 处理标签右键菜单
const handleTagContextMenu = (e, tag) => {
  e.preventDefault()
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    path: tag.path
  }
}

// 关闭标签
const closeTag = (path) => {
  tagsStore.deleteTag(path)
  if (route.path === path) {
    router.push('/dashboard')
  }
}

// 关闭其他标签
const closeOtherTags = () => {
  tagsStore.deleteOtherTags(contextMenu.value.path)
}

// 关闭所有标签
const closeAllTags = () => {
  tagsStore.deleteAllTags()
  router.push('/dashboard')
}

// 刷新当前页
const refreshTag = () => {
  router.go(0)
}

// 点击其他地方关闭菜单
const handleDocumentClick = () => {
  contextMenu.value.show = false
}

// 标签页导航
const navigateToTag = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="tags-view" @click="handleDocumentClick">
    <div class="tags-container">
      <div
        v-for="tag in tagsStore.tags"
        :key="tag.path"
        class="tag-item"
        :class="{ active: route.path === tag.path }"
        @click="navigateToTag(tag.path)"
        @contextmenu="handleTagContextMenu($event, tag)"
      >
        <span class="tag-label">{{ tag.title }}</span>
        <el-icon 
          v-if="route.path === tag.path || tagsStore.tags.length > 1"
          class="tag-close"
          @click.stop="closeTag(tag.path)"
        >
          <Close />
        </el-icon>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div 
      v-show="contextMenu.show"
      class="context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click="handleDocumentClick"
    >
      <div class="menu-item" @click="closeTag(contextMenu.path)">
        <el-icon><Close /></el-icon>
        <span>关闭当前</span>
      </div>
      <div class="menu-item" @click="closeOtherTags">
        <el-icon><CircleCloseFilled /></el-icon>
        <span>关闭其他</span>
      </div>
      <div class="menu-item" @click="closeAllTags">
        <el-icon><Delete /></el-icon>
        <span>关闭所有</span>
      </div>
      <div class="divider"></div>
      <div class="menu-item" @click="refreshTag">
        <el-icon><Refresh /></el-icon>
        <span>刷新页面</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tags-view {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.dark .tags-view {
  background-color: #262626;
  border-bottom-color: #303030;
}

.tags-container {
  display: flex;
  gap: 6px;
  align-items: center;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: #f0f2f5;
  color: #606266;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.dark .tag-item {
  background-color: #363636;
  color: #a6a6a6;
}

.tag-item:hover {
  background-color: #e9ecef;
}

.dark .tag-item:hover {
  background-color: #464646;
}

.tag-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.tag-close {
  cursor: pointer;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.tag-close:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.context-menu {
  position: fixed;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 999;
  min-width: 150px;
}

.dark .context-menu {
  background-color: #262626;
  border-color: #303030;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 12px;
  color: #606266;
  transition: all 0.3s;
}

.dark .menu-item {
  color: #a6a6a6;
}

.menu-item:hover {
  background-color: #f0f2f5;
  color: #667eea;
}

.dark .menu-item:hover {
  background-color: #363636;
  color: #667eea;
}

.menu-item .el-icon {
  width: 16px;
  height: 16px;
}

.divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 4px 0;
}

.dark .divider {
  background-color: #3a3a3a;
}
</style>
