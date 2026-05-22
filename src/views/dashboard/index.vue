<script setup>
import { onMounted, ref, reactive } from 'vue'
import { getDashboard, getOrderTrend, getRevenueTrend, getServiceCategoryDistribution } from '@/api/stats'
import { getOrderList } from '@/api/order'
import { useECharts } from '@/utils/echarts'

const loading = ref(false)
const dashboardData = ref({})
const recentOrders = ref([])

const metrics = reactive([
  { key: 'todayOrders', title: '今日订单', icon: 'DataAnalysis', color: '#667eea' },
  { key: 'todayRevenue', title: '今日营收', icon: 'ShoppingCart', color: '#f093d5' },
  { key: 'activeEmployees', title: '在岗员工', icon: 'User', color: '#fac858' },
  { key: 'pendingOrders', title: '待派单', icon: 'List', color: '#ee6666' }
])

const orderChartRef = ref(null)
const revenueChartRef = ref(null)
const categoryChartRef = ref(null)

const orderChart = useECharts(orderChartRef)
const revenueChart = useECharts(revenueChartRef)
const categoryChart = useECharts(categoryChartRef)

const today = new Date().toISOString().slice(0, 10)
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

function buildOrderChartOption(data) {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data?.labels || [], boundaryGap: false },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      name: '订单量', type: 'line',
      data: data?.current || [],
      smooth: true,
      areaStyle: { color: 'rgba(102,126,234,0.15)' },
      lineStyle: { color: '#667eea' },
      itemStyle: { color: '#667eea' }
    }]
  }
}

function buildRevenueChartOption(data) {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data?.labels || [], boundaryGap: false },
    yAxis: { type: 'value' },
    series: [{
      name: '营收(元)', type: 'line',
      data: data?.current || [],
      smooth: true,
      areaStyle: { color: 'rgba(240,147,213,0.15)' },
      lineStyle: { color: '#f093d5' },
      itemStyle: { color: '#f093d5' }
    }]
  }
}

function buildCategoryChartOption(data) {
  const list = data?.items || []
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 5, top: 'center' },
    series: [{
      name: '服务分类',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: list.map(item => ({
        name: item.categoryName,
        value: item.amount
      }))
    }]
  }
}

async function loadAllData() {
  loading.value = true
  try {
    const trendParams = { startDate: thirtyDaysAgo, endDate: today, groupBy: 'day' }

    const [dashRes, orderTrendRes, revenueTrendRes, categoryRes, orderListRes] = await Promise.all([
      getDashboard(),
      getOrderTrend(trendParams),
      getRevenueTrend(trendParams),
      getServiceCategoryDistribution({ startDate: thirtyDaysAgo, endDate: today }),
      getOrderList({ pageNo: 1, pageSize: 10 })
    ])

    dashboardData.value = dashRes?.data || {}

    if (orderTrendRes?.data) {
      orderChart.setOption(buildOrderChartOption(orderTrendRes.data))
    }
    if (revenueTrendRes?.data) {
      revenueChart.setOption(buildRevenueChartOption(revenueTrendRes.data))
    }
    if (categoryRes?.data) {
      categoryChart.setOption(buildCategoryChartOption(categoryRes.data))
    }

    const orders = orderListRes?.data?.records || orderListRes?.data?.list || []
    recentOrders.value = Array.isArray(orders) ? orders : []
  } catch (e) {
    console.error('加载仪表盘数据失败', e)
  } finally {
    loading.value = false
  }
}

const statusMap = { '0': '待分配', '1': '待支付', '2': '待派单', '3': '已派单', '4': '服务中', '5': '已完成', '6': '已取消' }
function getStatusText(status) {
  return statusMap[String(status)] || String(status || '-')
}

onMounted(() => {
  loadAllData()
})
</script>

<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :xs="12" :sm="12" :md="6" v-for="metric in metrics" :key="metric.key">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-inner">
            <div class="metric-info">
              <div class="metric-title">{{ metric.title }}</div>
              <div class="metric-value">
                {{ metric.key === 'todayRevenue' ? '¥' : '' }}{{ dashboardData[metric.key] ?? '--' }}
              </div>
            </div>
            <div class="metric-icon" :style="{ background: metric.color }">
              <el-icon :size="28" color="#fff">
                <component :is="metric.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header><span>近30天订单量趋势</span></template>
          <div ref="orderChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header><span>近30天营收趋势</span></template>
          <div ref="revenueChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分类分布 + 最近订单 -->
    <el-row :gutter="20" class="bottom-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header><span>服务分类分布</span></template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="table-card">
          <template #header><span>最近订单</span></template>
          <el-table :data="recentOrders" style="width: 100%" size="small" max-height="360">
            <el-table-column prop="orderId" label="订单号" min-width="100" show-overflow-tooltip />
            <el-table-column prop="employeeRealName" label="员工" min-width="80" show-overflow-tooltip />
            <el-table-column prop="totalAmount" label="金额" min-width="80">
              <template #default="{ row }">¥{{ row.totalAmount ?? '--' }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="70">
              <template #default="{ row }">{{ getStatusText(row.status) }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="时间" min-width="120" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-container { padding: 20px; }

.metrics-row { margin-bottom: 20px; }
.metric-card { margin-bottom: 20px; border-radius: 8px; }
.metric-inner { display: flex; justify-content: space-between; align-items: center; }
.metric-title { font-size: 14px; color: #909399; margin-bottom: 8px; }
.metric-value { font-size: 24px; font-weight: 600; color: #303133; }
.metric-icon {
  width: 56px; height: 56px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}

.charts-row { margin-bottom: 20px; }
.chart-card, .table-card { border-radius: 8px; margin-bottom: 20px; }
.chart-container { width: 100%; height: 320px; }
</style>
