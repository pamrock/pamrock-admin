<template>
  <div class="stats-orders">
    <StatsFilter @change="onFilterChange" />

    <el-row :gutter="16" class="metric-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">总订单</div>
          <div class="metric-value">{{ summary.totalOrders }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">完单率</div>
          <div class="metric-value">{{ pct(summary.completionRate) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">客单价</div>
          <div class="metric-value">¥{{ summary.avgOrderAmount?.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">取消率</div>
          <div class="metric-value">{{ pct(summary.cancellationRate) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :xs="24" :lg="16">
        <el-card>
          <template #header>订单趋势</template>
          <div ref="trendChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card>
          <template #header>订单状态分布</template>
          <div ref="statusChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useECharts } from '@/utils/echarts'
import { getOrderTrend, getOrderStatus, getOrderSummary } from '@/api/stats'
import StatsFilter from '@/components/StatsFilter.vue'

const trendChartRef = ref(null)
const statusChartRef = ref(null)
const { setOption: setTrendChart } = useECharts(trendChartRef)
const { setOption: setStatusChart } = useECharts(statusChartRef)

const summary = ref({})
const filterParams = ref({})

function pct(val) { return val != null ? (val * 100).toFixed(1) + '%' : '-' }

function onFilterChange(params) {
  filterParams.value = params
}

watch(filterParams, (params) => {
  if (!params.startDate) return
  loadData(params)
}, { deep: true })

function loadData(params) {
  getOrderTrend(params).then(res => {
    setTrendChart(buildTrendOption(res.data))
  })
  getOrderStatus(params).then(res => {
    setStatusChart(buildStatusOption(res.data))
  })
  getOrderSummary(params).then(res => {
    summary.value = res.data
  })
}

function buildTrendOption(data) {
  const series = [{ name: '当前', data: data.current, type: 'line', smooth: true, itemStyle: { color: '#409EFF' } }]
  if (data.previous) {
    series.push({ name: '同比', data: data.previous, type: 'line', smooth: true, lineStyle: { type: 'dashed' }, itemStyle: { color: '#909399' } })
  }
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name) },
    xAxis: { type: 'category', data: data.labels },
    yAxis: { type: 'value' },
    series,
    grid: { left: 40, right: 20, top: 40, bottom: 30 }
  }
}

function buildStatusOption(data) {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      data: data.items?.map(i => ({ name: i.statusName, value: i.count })) || [],
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } }
    }]
  }
}
</script>

<style scoped>
.metric-row { margin-bottom: 8px; }
.metric-label { font-size: 13px; color: #909399; }
.metric-value { font-size: 24px; font-weight: 600; margin-top: 6px; }
</style>
