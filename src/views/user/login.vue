<template>
  <div class="user-login-container">
    <div class="login-header">
      <h2>欢迎登录</h2>
      <p>用户端服务平台</p>
    </div>
    
    <div class="login-form">
      <el-input 
        v-model="loginForm.phone" 
        placeholder="请输入手机号" 
        class="mb-20 input-item"
        size="large"
      >
        <template #prefix>
          <el-icon><Iphone /></el-icon>
        </template>
      </el-input>
      
      <el-input 
        v-model="loginForm.password" 
        type="password" 
        placeholder="请输入密码" 
        class="mb-20 input-item"
        show-password
        size="large"
      >
        <template #prefix>
          <el-icon><Lock /></el-icon>
        </template>
      </el-input>

      <el-button type="primary" class="login-btn" size="large" @click="handleLogin">
        登 录
      </el-button>
      
      <div class="links">
        <span>注册账号</span>
        <span>忘记密码？</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Iphone, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginForm = reactive({
  phone: '',
  password: ''
})

const handleLogin = () => {
  if (!loginForm.phone || !loginForm.password) {
    ElMessage.warning('请输入手机号和密码')
    return
  }
  // 模拟登录成功，设置用户独立 token，跳转到服务列表页
  localStorage.setItem('user_token', 'mock_user_token_12345')
  ElMessage.success('登录成功')
  router.push('/user/services')
}
</script>

<style scoped>
.user-login-container {
  height: 100vh;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background-color: #ffffff;
  padding: 40px 30px;
  box-sizing: border-box;
}

.login-header {
  margin-top: 60px;
  margin-bottom: 50px;
}

.login-header h2 {
  font-size: 28px;
  color: #333;
  margin: 0 0 10px 0;
}

.login-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.mb-20 {
  margin-bottom: 20px;
}

/* 覆盖 Element Plus 默认样式，使其更像移动端输入框 */
:deep(.el-input__wrapper) {
  background-color: #f7f8fa;
  box-shadow: none !important;
  border-radius: 8px;
  padding: 0 15px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #1e3c72 inset !important;
}

.login-btn {
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border: none;
  font-size: 16px;
  margin-top: 10px;
  height: 44px;
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 14px;
  color: #1e3c72;
}
</style>
