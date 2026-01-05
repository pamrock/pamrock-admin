<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import { logout } from '@/api/login'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const showPasswordDialog = ref(false)

// 头像下拉菜单
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(() => {
    logout()
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}

const handleChangePassword = () => {
  showPasswordDialog.value = true
}

const handleUserInfo = () => {
  ElMessage.info('个人信息功能开发中...')
}
</script>

<template>
  <div class="header">
    <div class="header-left">
      <el-icon class="hamburger" @click="appStore.toggleSidebar">
        <component :is="appStore.sidebar.opened ? 'Fold' : 'Expand'" />
      </el-icon>
      
      <Breadcrumb />
    </div>

    <div class="header-right">
      <!-- 暗黑模式切换 -->
      <el-icon class="header-icon" @click="appStore.toggleDark">
        <component :is="appStore.isDark ? 'Sunny' : 'Moon'" />
      </el-icon>

      <!-- 消息 -->
      <el-icon class="header-icon">
        <Bell />
      </el-icon>

      <!-- 用户菜单 -->
      <el-dropdown class="user-dropdown">
        <div class="user-info">
          <el-avatar 
            size="32" 
            src="https://cube.elemecdn.com/0/88/03b0f1ac001e48612fc7f392099a41jpeg.jpeg"
          />
          <span class="username">{{ userStore.userInfo.username || 'Admin' }}</span>
        </div>
        
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleUserInfo">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-dropdown-item>
            <el-dropdown-item @click="handleChangePassword">
              <el-icon><Edit /></el-icon>
              <span>修改密码</span>
            </el-dropdown-item>
            <el-divider style="margin: 5px 0" />
            <el-dropdown-item @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form label-width="80px">
        <el-form-item label="原密码">
          <el-input type="password" placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input type="password" placeholder="请确认新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="showPasswordDialog = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

:deep(.dark) .header {
  background-color: #262626;
  border-bottom-color: #303030;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  min-width: 0;
}

.hamburger {
  cursor: pointer;
  font-size: 20px;
  color: #606266;
  transition: color 0.3s;
}

:deep(.dark) .hamburger {
  color: #a6a6a6;
}

.hamburger:hover {
  color: #667eea;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  cursor: pointer;
  font-size: 18px;
  color: #606266;
  transition: color 0.3s;
}

:deep(.dark) .header-icon {
  color: #a6a6a6;
}

.header-icon:hover {
  color: #667eea;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 10px;
}

.username {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

:deep(.dark) .username {
  color: #a6a6a6;
}

@media (max-width: 768px) {
  .username {
    display: none;
  }

  .header-right {
    gap: 12px;
  }
}
</style>
