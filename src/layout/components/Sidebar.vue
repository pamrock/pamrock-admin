<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
const router = useRouter()

const showMenu = computed(() => {
  return appStore.menuList
})

// 处理菜单点击
const handleMenuSelect = (index) => {
  const menuItem = findMenuById(parseInt(index))
  if (menuItem && menuItem.path) {
    router.push(menuItem.path)
  }
}

// 递归查找菜单
const findMenuById = (id, list = appStore.menuList) => {
  for (let item of list) {
    if (item.id === id) return item
    if (item.children?.length) {
      const result = findMenuById(id, item.children)
      if (result) return result
    }
  }
  return null
}

// 获取菜单的唯一key
const getMenuKey = (menu) => {
  return menu.path || String(menu.id)
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
      <template v-for="menu in showMenu" :key="menu.id">
        <!-- 有子菜单 -->
        <el-sub-menu 
          v-if="menu.children && menu.children.length > 0"
          :index="String(menu.id)"
        >
          <template #title>
            <el-icon v-if="menu.icon">
              <component :is="menu.icon === 'dashboard' ? 'Monitor' : menu.icon === 'setting' ? 'Setting' : menu.icon === 'example' ? 'Operation' : 'Menu'" />
            </el-icon>
            <span>{{ menu.name }}</span>
          </template>
          
          <el-menu-item 
            v-for="child in menu.children"
            :key="child.id"
            :index="child.path"
          >
            <template #title>
              <el-icon v-if="child.icon">
                <component :is="child.icon === 'user' ? 'User' : child.icon === 'role' ? 'Avatar' : child.icon === 'permission' ? 'Key' : child.icon === 'table' ? 'Grid' : child.icon === 'form' ? 'DocumentCopy' : 'Menu'" />
              </el-icon>
              <span>{{ child.name }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子菜单 -->
        <el-menu-item 
          v-else
          :index="menu.path"
          :key="menu.id"
        >
          <template #title>
            <el-icon v-if="menu.icon">
              <component :is="menu.icon === 'dashboard' ? 'Monitor' : 'Menu'" />
            </el-icon>
            <span>{{ menu.name }}</span>
          </template>
        </el-menu-item>
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
