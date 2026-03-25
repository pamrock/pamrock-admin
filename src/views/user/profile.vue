<template>
  <div class="profile-container">
    <div class="user-header">
      <div class="avatar">
        <el-avatar :size="64" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
      </div>
      <div class="user-info">
        <h3>微信用户_1234</h3>
        <p>138****5678</p>
      </div>
    </div>

    <div class="stats-panel">
      <div class="stat-item">
        <span class="num">0</span>
        <span class="label">优惠券</span>
      </div>
      <div class="stat-item">
        <span class="num">120</span>
        <span class="label">积分</span>
      </div>
      <div class="stat-item">
        <span class="num">¥0.00</span>
        <span class="label">余额</span>
      </div>
    </div>

    <div class="menu-list">
      <div class="menu-item">
        <div class="menu-left">
          <el-icon class="menu-icon" color="#1e3c72"><Location /></el-icon>
          <span>地址管理</span>
        </div>
        <el-icon color="#999"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item">
        <div class="menu-left">
          <el-icon class="menu-icon" color="#1e3c72"><Service /></el-icon>
          <span>联系客服</span>
        </div>
        <el-icon color="#999"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item">
        <div class="menu-left">
          <el-icon class="menu-icon" color="#1e3c72"><Setting /></el-icon>
          <span>设置</span>
        </div>
        <el-icon color="#999"><ArrowRight /></el-icon>
      </div>
    </div>
    
    <div class="logout-wrap">
      <el-button class="logout-btn" @click="handleLogout">退出登录</el-button>
    </div>
  </div>
</template>

<script setup>
import { Location, Service, Setting, ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const handleLogout = () => {
  ElMessage.success('已退出登录')
  router.push('/user/login')
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 0;
}

.user-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.user-info p {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.stats-panel {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-item .num {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stat-item .label {
  font-size: 12px;
  color: #666;
}

.menu-list {
  background: #fff;
  border-radius: 12px;
  padding: 0 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #333;
}

.menu-icon {
  font-size: 18px;
}

.logout-wrap {
  margin-top: 30px;
  padding: 0 10px;
}

.logout-btn {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  color: #ff4d4f;
  border-color: #ff4d4f;
}
</style>
