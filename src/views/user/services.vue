<template>
  <div class="services-container">
    <div class="header">
      <h2>服务列表</h2>
    </div>
    
    <div class="service-list">
      <div class="service-card" v-for="i in 5" :key="i">
        <div class="service-img">
          <!-- 占位图 -->
          <el-icon :size="40" color="#c0c4cc"><Picture /></el-icon>
        </div>
        <div class="service-info">
          <h3>家政清洁服务 {{ i }}</h3>
          <p class="desc">专业团队，上门服务，让您的家焕然一新</p>
          <div class="price-row">
            <span class="price">¥ {{ 100 * i }}.00</span>
            <el-button type="primary" size="small" round class="order-btn" @click="handleOrder(i)">
              去下单
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const handleOrder = (id) => {
  ElMessage.success(`正在跳转到下单页面（服务 ID: ${id}）`)
  // router.push(`/user/order/create/${id}`)
}
</script>

<style scoped>
.services-container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  font-size: 22px;
  margin: 0;
  color: #333;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.service-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  gap: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.service-img {
  width: 90px;
  height: 90px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.service-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.desc {
  font-size: 12px;
  color: #999;
  margin: 5px 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  color: #ff4d4f;
  font-weight: bold;
  font-size: 18px;
}

.order-btn {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border: none;
}
</style>
