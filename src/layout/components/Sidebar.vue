<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'

const appStore = useAppStore()
const permissionStore = usePermissionStore()
const router = useRouter()

const showMenu = computed(() => {
  return permissionStore.routes.filter(route => !route.meta?.hidden)
})

// 路径拼接
const resolvePath = (basePath, routePath) => {
  if (!routePath) return basePath
  if (routePath.startsWith('/')) return routePath
  if (basePath === '/') return basePath + routePath
  return basePath + '/' + routePath
}

// 获取唯一显示的子节点（如果有且仅有一个）
const getOnlyShowingChild = (children = [], parent) => {
  const showingChildren = children.filter(item => !item.meta?.hidden)
  if (showingChildren.length === 1) {
    return showingChildren[0]
  }
  return null
}
</script>

<template>
  <div class="sidebar">
    <div class="logo">
      <div class="logo-img">Admin</div>
      <span class="logo-text" v-show="appStore.sidebar.opened">管理系统</span>
    </div>
    
    <el-menu
      :collapse="!appStore.sidebar.opened"
      :default-active="$route.path"
      class="el-menu-vertical"
      router
    >
      <template v-for="menu in showMenu" :key="menu.path">
        <!-- 逻辑：如果只有一个子节点，且不强制显示父节点，则直接显示该子节点（提升层级） -->
        <!-- 例如：Dashboard 结构是 { path: '/', children: [{ path: 'dashboard' }] } -->
        <!-- 这里会直接渲染 dashboard 为一级菜单 -->
        <template v-if="getOnlyShowingChild(menu.children, menu) && !menu.alwaysShow">
            <el-menu-item 
              :index="resolvePath(menu.path, getOnlyShowingChild(menu.children, menu).path)"
              :key="resolvePath(menu.path, getOnlyShowingChild(menu.children, menu).path)"
            >
              <el-icon v-if="getOnlyShowingChild(menu.children, menu).meta?.icon || menu.meta?.icon">
                <component :is="getOnlyShowingChild(menu.children, menu).meta?.icon || menu.meta?.icon" />
              </el-icon>
              <template #title>
                <span>{{ getOnlyShowingChild(menu.children, menu).meta?.title || getOnlyShowingChild(menu.children, menu).name }}</span>
              </template>
            </el-menu-item>
        </template>

        <!-- 常规情况：有多个子节点，或者没有子节点但自身就是一级菜单 -->
        <template v-else>
            <!-- 无子节点的一级菜单 -->
            <el-menu-item 
              v-if="!menu.children || menu.children.length === 0"
              :index="menu.path"
              :key="menu.path + '_only'"
            >
              <el-icon v-if="menu.meta?.icon">
                <component :is="menu.meta.icon" />
              </el-icon>
              <template #title>
                <span>{{ menu.meta?.title || menu.name }}</span>
              </template>
            </el-menu-item>

            <!-- 有子节点的菜单 (System, Log) -->
            <el-sub-menu 
              v-else
              :index="menu.path"
              :key="menu.path + '_sub'"
            >
              <template #title>
                <el-icon v-if="menu.meta?.icon">
                   <!-- 这里简单映射几个常用图标，实际项目中建议使用动态组件加载所有图标 -->
                  <component :is="menu.meta.icon" />
                </el-icon>
                <span>{{ menu.meta?.title || menu.name }}</span>
              </template>
              
              <template v-for="child in menu.children">
                 <template v-if="!child.meta?.hidden">
                    <el-menu-item 
                        :key="child.path"
                        :index="resolvePath(menu.path, child.path)"
                    >
                        <template #title>
                        <el-icon v-if="child.meta?.icon">
                            <component :is="child.meta.icon" />
                        </el-icon>
                        <span>{{ child.meta?.title || child.name }}</span>
                        </template>
                    </el-menu-item>
                 </template>
              </template>
            </el-sub-menu>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<style scoped>
.sidebar {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #f0f2f5;
  border-right: 1px solid #dcdfe6;
}

.dark .sidebar {
  background-color: #1a1a1a;
  border-right-color: #303030;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 15px;
  border-bottom: 1px solid #dcdfe6;
  overflow: hidden;
  gap: 10px;
}

.dark .logo {
  border-bottom-color: #303030;
}

.logo-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 8px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.dark .logo-text {
  color: #e0e0e0;
}

.el-menu-vertical {
  border-right: none;
  background-color: #f0f2f5;
}

.dark .el-menu-vertical {
  background-color: #1a1a1a;
}

:deep(.el-menu) {
  --el-menu-bg-color: transparent;
}
</style>
