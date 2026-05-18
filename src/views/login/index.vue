<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { login, getCaptcha } from '@/api/login'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

const rememberMe = ref(false)
const captchaId = ref('')
const captchaUrl = ref('')

onMounted(() => {
  if (route.query.session === 'expired') {
    ElMessage.error('登录状态已失效，请重新登录')
  }
  loadRemembered()
  refreshCaptcha()
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

const refreshCaptcha = async () => {
  try {
    const res = await getCaptcha()
    const captchaData = res.data.data || res.data
    captchaId.value = captchaData.captchaId
    captchaUrl.value = captchaData.captchaImage
  } catch (e) {
    console.error('获取验证码失败', e)
  }
}

const loadRemembered = () => {
  try {
    const saved = localStorage.getItem('admin_remember')
    if (saved) {
      const data = JSON.parse(saved)
      loginForm.username = data.username || ''
      loginForm.password = data.password || ''
      rememberMe.value = true
    }
  } catch (e) {
    localStorage.removeItem('admin_remember')
  }
}

const saveRemembered = () => {
  if (rememberMe.value) {
    localStorage.setItem('admin_remember', JSON.stringify({
      username: loginForm.username,
      password: loginForm.password
    }))
  } else {
    localStorage.removeItem('admin_remember')
  }
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const loginData = {
      username: loginForm.username,
      password: loginForm.password,
      captchaId: captchaId.value,
      captchaCode: loginForm.captcha
    }
    const { data } = await login(loginData)
    const token = data.token

    userStore.login(token)
    saveRemembered()
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
      <div class="grid-overlay"></div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">📊</div>
          <h1>家政经营管理系统</h1>
          <p class="subtitle">OPERATION CENTER</p>
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
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            clearable
            show-password
          />
        </el-form-item>

        <el-form-item>
          <div class="captcha-row">
            <el-input
              v-model="loginForm.captcha"
              placeholder="验证码"
              :prefix-icon="Key"
              size="large"
              class="captcha-input"
            />
            <div class="captcha-img" @click="refreshCaptcha">
              <img v-if="captchaUrl" :src="captchaUrl" alt="验证码" class="captcha-image" />
              <span v-else class="captcha-loading">点击获取</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
  overflow: hidden;
  position: relative;
}

.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image:
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: #537fe7;
  top: -100px;
  right: -80px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #537fe7;
  bottom: -80px;
  left: -60px;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: #99b8ff;
  bottom: 180px;
  left: 40px;
  opacity: 0.04;
}

.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
  padding: 36px 36px 28px;
  border: 1px solid rgba(255,255,255,0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 32px;
}

.login-header h1 {
  margin: 0;
  color: #1a1a2e;
  font-size: 18px;
  font-weight: 600;
}

.login-header .subtitle {
  font-size: 10px;
  color: #95a5a6;
  letter-spacing: 3px;
  margin: 0;
}

.captcha-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 100px;
  height: 40px;
  background: linear-gradient(135deg, #e8edf2, #d5dde5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.captcha-loading {
  font-size: 13px;
  color: #95a5a6;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  box-shadow: none !important;
  border-radius: 10px;
}

:deep(.el-input__prefix) {
  color: #b0b8c1;
}

.login-btn {
  width: 100%;
  height: 42px;
  font-size: 15px;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(15,52,96,0.35);
}

.login-btn:hover {
  opacity: 0.9;
}

.login-footer {
  text-align: center;
  margin-top: 8px;
}
</style>
