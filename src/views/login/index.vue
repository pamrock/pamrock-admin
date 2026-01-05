<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/login'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: ''
})

onMounted(() => {
  if (route.query.session === 'expired') {
    ElMessage.error('登录状态已失效，请重新登录')
  }
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '用户名长度 3 到 15 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度最少 6 个字符', trigger: 'blur' }
  ]
}

const formRef = ref()
const loading = ref(false)

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true

    const loginData = {
      username: loginForm.username,
      password: loginForm.password
    }
    const { data } = await login(loginData)
    const token = data.token
    
    userStore.login(token)
    userStore.setUserInfo({
      username: data.username,
      email: data.email,
      avatar: data.avatar
    })
    ElMessage.success('登录成功')
    router.push('/dashboard')
    loading.value = false
  } catch (error) {
    loading.value = false
  }
}

const handleRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-background">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-img">Admin</div>
          <h1>管理系统</h1>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            clearable
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <el-link type="primary" @click="handleRegister">
          还没有账号？立即注册
        </el-link>
      </div>

      <div class="tips">
        <p>演示账号：admin / 123456</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  position: relative;
}

.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: #fff;
  border-radius: 50%;
  top: -50px;
  left: -50px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #fff;
  border-radius: 50%;
  bottom: -100px;
  right: -100px;
  animation-delay: 2s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: #fff;
  bottom: 200px;
  right: 50px;
  border-radius: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(30px);
  }
}

.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.logo-img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.login-header h1 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-input__prefix) {
  color: #999;
}

.login-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
  letter-spacing: 2px;
  margin-top: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.login-btn:hover {
  opacity: 0.9;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.tips {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.tips p {
  margin: 0;
  line-height: 1.5;
}
</style>
