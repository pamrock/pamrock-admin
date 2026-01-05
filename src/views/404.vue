<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGoHome = () => {
  router.push('/dashboard')
}

const handleGoBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="not-found">
    <div class="error-container">
      <div class="error-code">404</div>
      <div class="error-title">页面未找到</div>
      <p class="error-desc">抱歉，您访问的页面不存在或已被删除</p>
      
      <div class="error-actions">
        <el-button type="primary" size="large" @click="handleGoHome">
          返回首页
        </el-button>
        <el-button size="large" @click="handleGoBack">
          返回上一页
        </el-button>
      </div>

      <div class="error-illustration">
        <svg viewBox="0 0 250 250" width="200" height="200">
          <circle cx="125" cy="125" r="120" fill="#f0f2f5" stroke="#667eea" stroke-width="2" />
          <text x="125" y="145" font-size="80" font-weight="bold" text-anchor="middle" fill="#667eea">404</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  text-align: center;
  background: white;
  border-radius: 8px;
  padding: 60px 40px;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

:deep(.dark) .error-container {
  background-color: #262626;
}

.error-code {
  font-size: 80px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10px;
}

.error-title {
  font-size: 24px;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
}

:deep(.dark) .error-title {
  color: #e0e0e0;
}

.error-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 30px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
}

.error-illustration {
  display: flex;
  justify-content: center;
  opacity: 0.3;
}

@media (max-width: 768px) {
  .error-container {
    padding: 40px 20px;
  }

  .error-code {
    font-size: 60px;
  }

  .error-title {
    font-size: 18px;
  }

  .error-actions {
    flex-direction: column;
  }
}
</style>
