<template>
  <div class="orders-container">
    <div class="header">
      <h2>我的订单</h2>
    </div>

    <!-- 订单状态 Tab -->
    <div class="status-tabs">
      <div 
        class="tab-item" 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="{ active: currentTab === index }"
        @click="currentTab = index"
      >
        {{ tab }}
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <div class="order-card" v-for="i in 3" :key="i">
        <div class="order-header">
          <span class="order-no">订单号: 20240501000{{ i }}</span>
          <span class="order-status">待服务</span>
        </div>
        <div class="order-content">
          <div class="order-img">
            <el-icon :size="30" color="#c0c4cc"><Picture /></el-icon>
          </div>
          <div class="order-info">
            <h4>家政清洁服务 - 深度保洁</h4>
            <p>服务时间: 2024-05-20 14:00</p>
          </div>
        </div>
        <div class="order-footer">
          <span class="price">实付: ¥ 200.00</span>
          <div class="actions">
            <el-button size="small" round>联系客服</el-button>
            <el-button size="small" type="primary" round class="main-btn">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Picture } from '@element-plus/icons-vue'

const tabs = ['全部', '待付款', '待服务', '已完成']
const currentTab = ref(0)
</script>

<style scoped>
.orders-container {
  padding: 20px;
}

.header {
  margin-bottom: 15px;
}

.header h2 {
  font-size: 22px;
  margin: 0;
  color: #333;
}

.status-tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 10px;
}

.status-tabs .tab-item {
  font-size: 14px;
  color: #666;
  padding-bottom: 5px;
  position: relative;
}

.status-tabs .tab-item.active {
  color: #1e3c72;
  font-weight: bold;
}

.status-tabs .tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #1e3c72;
  border-radius: 2px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.order-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.order-status {
  color: #1e3c72;
  font-weight: bold;
}

.order-content {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.order-img {
  width: 60px;
  height: 60px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-info {
  flex: 1;
}

.order-info h4 {
  margin: 0 0 5px 0;
  font-size: 15px;
  color: #333;
}

.order-info p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.actions .main-btn {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border: none;
}
</style>
