<template>
  <div class="payment-result-page">
    <el-result
      icon="error"
      title="支付失败"
      sub-title="支付过程中出现问题，请重试或联系客服。"
    >
      <template #extra>
        <el-button type="primary" @click="retry">重新支付</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const retry = () => {
  router.go(-1) // Go back to try again
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.payment-result-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}
</style>
