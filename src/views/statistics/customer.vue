<template>
  <div class="stats-customer">
    <StatsFilter @change="onFilterChange" />

    <el-row :gutter="16" class="metric-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">客户总数</div>
          <div class="metric-value">{{ summary.totalCustomers }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">新增客户</div>
          <div class="metric-value">{{ summary.newCustomers }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">活跃客户</div>
          <div class="metric-value">{{ summary.activeCustomers }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">复购率</div>
          <div class="metric-value">{{ pct(retention.retentionRate) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>客户增长趋势</template>
          <div ref="trendRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>客户地区分布</template>
          <div ref="regionRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useECharts } from '@/utils/echarts'
import { getCustomerTrend, getCustomerRetention, getCustomerRegion, getCustomerSummary } from '@/api/stats'
import StatsFilter from '@/components/StatsFilter.vue'

const trendRef = ref(null)
const regionRef = ref(null)
const { setOption: setTrend } = useECharts(trendRef)
const { setOption: setRegion } = useECharts(regionRef)

const summary = ref({})
const retention = ref({})
const filterParams = ref({})

function pct(val) { return val != null ? (val * 100).toFixed(1) + '%' : '-' }

function onFilterChange(params) { filterParams.value = params }

watch(filterParams, (params) => {
  if (!params.startDate) return
  loadData(params)
}, { deep: true })

function loadData(params) {
  getCustomerTrend(params).then(res => {
    setTrend({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: res.data.labels },
      yAxis: { type: 'value' },
      series: [{ name: '新增客户', data: res.data.current, type: 'line', smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: '#409EFF' } }],
      grid: { left: 40, right: 20, top: 20, bottom: 30 }
    })
  })
  getCustomerRetention(params).then(res => { retention.value = res.data })
  getCustomerSummary(params).then(res => { summary.value = res.data })
  getCustomerRegion(params).then(res => {
    setRegion({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: (res.data.items || []).slice(0, 15).map(i => i.city || i.province), axisLabel: { rotate: 45 } },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: (res.data.items || []).slice(0, 15).map(i => i.count), itemStyle: { color: '#E6A23C' } }],
      grid: { left: 40, right: 20, top: 20, bottom: 60 }
    })
  })
}
</script>

<style scoped>
.metric-row { margin-bottom: 8px; }
.metric-label { font-size: 13px; color: #909399; }
.metric-value { font-size: 24px; font-weight: 600; margin-top: 6px; }
</style>
