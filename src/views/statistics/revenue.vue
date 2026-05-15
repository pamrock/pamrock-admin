<template>
  <div class="stats-revenue">
    <StatsFilter @change="onFilterChange" />

    <el-row :gutter="16" class="metric-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">总营收</div>
          <div class="metric-value">¥{{ summary.totalRevenue?.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">退款金额</div>
          <div class="metric-value" style="color: #F56C6C">¥{{ summary.totalRefund?.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">净收入</div>
          <div class="metric-value">¥{{ summary.netRevenue?.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">退款率</div>
          <div class="metric-value">{{ pct(summary.refundRate) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :xs="24" :lg="16">
        <el-card>
          <template #header>营收趋势</template>
          <div ref="trendRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card>
          <template #header>收入构成</template>
          <div ref="pieRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useECharts } from '@/utils/echarts'
import { getRevenueTrend, getRevenueCategory, getRevenueSummary } from '@/api/stats'
import StatsFilter from '@/components/StatsFilter.vue'

const trendRef = ref(null)
const pieRef = ref(null)
const { setOption: setTrend } = useECharts(trendRef)
const { setOption: setPie } = useECharts(pieRef)

const summary = ref({})
const filterParams = ref({})

function pct(val) { return val != null ? (val * 100).toFixed(1) + '%' : '-' }

function onFilterChange(params) { filterParams.value = params }

watch(filterParams, (params) => {
  if (!params.startDate) return
  loadData(params)
}, { deep: true })

function loadData(params) {
  getRevenueTrend(params).then(res => {
    setTrend({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: res.data.labels },
      yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
      series: [{ name: '营收', data: res.data.current, type: 'bar', itemStyle: { color: '#67C23A' } }],
      grid: { left: 60, right: 20, top: 20, bottom: 30 }
    })
  })
  getRevenueCategory(params).then(res => {
    setPie({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
      series: [{ type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'], data: res.data.items?.map(i => ({ name: i.categoryName, value: i.amount })) || [] }]
    })
  })
  getRevenueSummary(params).then(res => { summary.value = res.data })
}
</script>

<style scoped>
.metric-row { margin-bottom: 8px; }
.metric-label { font-size: 13px; color: #909399; }
.metric-value { font-size: 24px; font-weight: 600; margin-top: 6px; }
</style>
