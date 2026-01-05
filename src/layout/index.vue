<script setup>
import { useAppStore } from '@/store/modules/app'
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import TagsView from './components/TagsView.vue'
import AppMain from './components/AppMain.vue'

const appStore = useAppStore()
const { width } = useWindowSize()

const isMobile = computed(() => width.value < 768)

// 切换侧边栏
const handleToggleSidebar = () => {
  appStore.toggleSidebar()
}

// 小屏幕自动收起侧边栏
if (isMobile.value && appStore.sidebar.opened) {
  appStore.sidebar.opened = false
}
</script>

<template>
  <div class="layout-container" :class="{ collapse: !appStore.sidebar.opened, mobile: isMobile }">
    <!-- 遮罩层，仅移动端显示 -->
    <div
      v-if="isMobile && appStore.sidebar.opened"
      class="layout-mask"
      @click="handleToggleSidebar"
    />

    <!-- 侧边栏 -->
    <div class="layout-sidebar">
      <Sidebar />
    </div>

    <!-- 主内容区 -->
    <div class="layout-main">
      <!-- 顶部 -->
      <Header />

      <!-- 标签栏 -->
      <TagsView />

      <!-- 主体 -->
      <AppMain />
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.layout-sidebar {
  width: 200px;
  height: 100%;
  overflow: hidden;
  background-color: #f0f2f5;
  transition: width 0.3s;
}

:deep(.dark) .layout-sidebar {
  background-color: #1a1a1a;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s;
}

.layout-mask {
  display: none;
}

/* 收起状态 */
.layout-container.collapse .layout-sidebar {
  width: 64px;
}

/* 移动端 */
@media (max-width: 768px) {
  .layout-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1001;
    height: 100vh;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    transform: translateX(0);
  }

  .layout-container.collapse .layout-sidebar {
    width: 200px; /* 移动端展开时宽度固定 */
    transform: translateX(-100%);
  }

  .layout-main {
    width: 100%;
    margin-left: 0;
  }

  .layout-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1000;
    display: block;
  }

  .layout-container.collapse .layout-mask {
    display: none;
  }
}
</style>
