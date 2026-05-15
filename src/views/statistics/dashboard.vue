<template>
  <div class="stats-dashboard">
    <!-- 今日关键指标 -->
    <el-row :gutter="16" class="metric-cards">
      <el-col :xs="12" :sm="6" v-for="card in metrics" :key="card.label">
        <el-card shadow="hover">
          <div class="metric-label">{{ card.label }}</div>
          <div class="metric-value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="metric-compare" v-if="card.diff != null">
            较昨日 {{ card.diff > 0 ? '+' : '' }}{{ card.diff }}{{ card.unit }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近30天趋势 -->
    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>近30天订单量</template>
          <div ref="orderChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>近30天营收</template>
          <div ref="revenueChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useECharts } from '@/utils/echarts'
import { getDashboard, getOrderTrend, getRevenueTrend } from '@/api/stats'

const orderChartRef = ref(null)
const revenueChartRef = ref(null)
const { setOption: setOrderChart } = useECharts(orderChartRef)
const { setOption: setRevenueChart } = useECharts(revenueChartRef)

const dashboardData = ref({})
const orderTrend = ref({ labels: [], current: [] })
const revenueTrend = ref({ labels: [], current: [] })

const metrics = computed(() => {
  const d = dashboardData.value
  return [
    { label: '今日订单', value: d.todayOrders ?? 0, color: '#409EFF',
      diff: d.todayOrders - (d.yesterdayOrders || 0), unit: '单' },
    { label: '今日营收', value: '¥' + (d.todayRevenue ?? 0).toFixed(2), color: '#67C23A',
      diff: ((d.todayRevenue ?? 0) - (d.yesterdayRevenue ?? 0)).toFixed(2), unit: '元' },
    { label: '在岗员工', value: d.activeEmployees ?? 0, color: '#E6A23C' },
    { label: '待派单', value: d.pendingOrders ?? 0, color: '#F56C6C' }
  ]
})

function loadDashboard() {
  getDashboard().then(res => { dashboardData.value = res.data })
}

function loadTrends() {
  const end = new Date().toISOString().slice(0, 10)
  const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const params = { startDate: start, endDate: end, groupBy: 'day' }

  getOrderTrend(params).then(res => {
    orderTrend.value = res.data
    setOrderChart({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: res.data.labels },
      yAxis: { type: 'value' },
      series: [{ data: res.data.current, type: 'line', smooth: true, areaStyle: { opacity: 0.15 }, itemStyle: { color: '#409EFF' } }],
      grid: { left: 40, right: 20, top: 20, bottom: 30 }
    })
  })

  getRevenueTrend(params).then(res => {
    revenueTrend.value = res.data
    setRevenueChart({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: res.data.labels },
      yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
      series: [{ data: res.data.current, type: 'line', smooth: true, areaStyle: { opacity: 0.15 }, itemStyle: { color: '#67C23A' } }],
      grid: { left: 60, right: 20, top: 20, bottom: 30 }
    })
  })
}

onMounted(() => {
  loadDashboard()
  loadTrends()
})
</script>

<style scoped>
.metric-cards { margin-bottom: 8px; }
.metric-label { font-size: 14px; color: #909399; margin-bottom: 8px; }
.metric-value { font-size: 28px; font-weight: 700; }
.metric-compare { font-size: 12px; color: #909399; margin-top: 8px; }
</style>
