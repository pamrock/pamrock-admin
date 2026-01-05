<script setup>
import { useAppStore } from '@/store/modules/app'
import { onMounted, computed, watch } from 'vue'

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

// 监听暗黑模式变化，并应用到 <html> 标签
watch(isDark, (newVal) => {
  const html = document.documentElement
  if (newVal) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}, { immediate: true })

// 初始化主题
onMounted(() => {
  appStore.initDarkMode()
})
</script>

<template>
  <div id="app" :class="{ dark: isDark }">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html.dark {
  --el-fill-color-light: #262626;
  --el-color-info-light-9: #262626;
}

#app {
  width: 100%;
  height: 100%;
}

/* Element Plus 全局样式覆盖 */
:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-input__wrapper) {
  background-color: #fff;
  border-radius: 4px;
}

:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

:deep(.dark .el-card) {
  background-color: #262626;
}

:deep(.el-menu) {
  border: none;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.dark .el-dialog__header) {
  border-bottom-color: #3a3a3a;
}
</style>
