<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const statisticsCards = ref([
  {
    title: '访问量',
    value: '8,846',
    increase: '+15%',
    icon: 'DataAnalysis',
    color: '#667eea'
  },
  {
    title: '销售额',
    value: '¥231,024',
    increase: '+6%',
    icon: 'ShoppingCart',
    color: '#f093d5'
  },
  {
    title: '活跃用户',
    value: '1,234',
    increase: '+12%',
    icon: 'User',
    color: '#fac858'
  },
  {
    title: '系统运行',
    value: '99.98%',
    increase: '+2%',
    icon: 'Monitor',
    color: '#ee6666'
  }
])

const tableData = ref([
  {
    id: 1,
    name: '项目 A',
    status: '进行中',
    progress: 65,
    date: '2024-01-15'
  },
  {
    id: 2,
    name: '项目 B',
    status: '已完成',
    progress: 100,
    date: '2024-01-10'
  },
  {
    id: 3,
    name: '项目 C',
    status: '未开始',
    progress: 0,
    date: '2024-01-20'
  },
  {
    id: 4,
    name: '项目 D',
    status: '进行中',
    progress: 45,
    date: '2024-01-18'
  },
  {
    id: 5,
    name: '项目 E',
    status: '已完成',
    progress: 100,
    date: '2024-01-08'
  }
])

const activityData = ref([
  {
    id: 1,
    content: '用户 张三 完成了项目 A 的开发工作',
    time: '2024-01-15 14:30'
  },
  {
    id: 2,
    content: '系统已完成每日自动备份',
    time: '2024-01-15 03:00'
  },
  {
    id: 3,
    content: '用户 李四 上传了新的设计稿',
    time: '2024-01-14 18:45'
  },
  {
    id: 4,
    content: '新成员 王五 加入了团队',
    time: '2024-01-14 10:20'
  },
  {
    id: 5,
    content: '项目 B 已发布到生产环境',
    time: '2024-01-13 16:00'
  }
])

const getStatusTag = (status) => {
  const statusMap = {
    '进行中': 'warning',
    '已完成': 'success',
    '未开始': 'info'
  }
  return statusMap[status] || 'info'
}
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col 
        v-for="card in statisticsCards"
        :key="card.title"
        :xs="24"
        :sm="12"
        :md="6"
        class="mb-20"
      >
        <div class="statistics-card" :style="{ borderTopColor: card.color }">
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-value">{{ card.value }}</div>
            <div class="card-increase">{{ card.increase }}</div>
          </div>
          <el-icon class="card-icon" :style="{ color: card.color }">
            <component :is="card.icon" />
          </el-icon>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 项目进度表 -->
      <el-col :xs="24" :md="14" class="mb-20">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>项目进度</span>
              <el-button link>查看更多</el-button>
            </div>
          </template>

          <el-table :data="tableData" stripe border>
            <el-table-column prop="name" label="项目名称" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="150">
              <template #default="{ row }">
                <el-progress :percentage="row.progress" />
              </template>
            </el-table-column>
            <el-table-column prop="date" label="更新日期" width="120" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 最近活动 -->
      <el-col :xs="24" :md="10" class="mb-20">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>

          <div class="activity-list">
            <div v-for="activity in activityData" :key="activity.id" class="activity-item">
              <div class="activity-dot"></div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.content }}</p>
                <p class="activity-time">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 0;
}

.mb-20 {
  margin-bottom: 20px;
}

.statistics-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 4px solid;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  cursor: pointer;
}

:deep(.dark) .statistics-card {
  background-color: #262626;
}

.statistics-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.card-content {
  flex: 1;
}

.card-title {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-value {
  color: #333;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

:deep(.dark) .card-value {
  color: #e0e0e0;
}

.card-increase {
  color: #67c23a;
  font-size: 12px;
}

.card-icon {
  font-size: 40px;
  margin-left: 20px;
  opacity: 0.1;
}

:deep(.box-card) {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
  position: relative;
}

:deep(.dark) .activity-item {
  border-bottom-color: #3a3a3a;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0;
  color: #333;
  font-size: 13px;
  line-height: 1.5;
}

:deep(.dark) .activity-text {
  color: #e0e0e0;
}

.activity-time {
  margin: 4px 0 0 0;
  color: #909399;
  font-size: 12px;
}

@media (max-width: 768px) {
  .statistics-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-icon {
    margin-left: 0;
    margin-top: 10px;
    opacity: 0.05;
  }
}
</style>
