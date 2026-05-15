<template>
  <div class="stats-employee">
    <el-row :gutter="16" class="metric-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">员工总数</div>
          <div class="metric-value">{{ summary.totalEmployees }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">在岗率</div>
          <div class="metric-value">{{ pct(summary.activeRate) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">均分</div>
          <div class="metric-value">{{ summary.avgRating }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="metric-label">总完单</div>
          <div class="metric-value">{{ summary.totalCompletedOrders }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>员工状态分布</template>
          <div ref="statusChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>评分分布</template>
          <div ref="ratingChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>员工排行</span>
        <el-radio-group v-model="sortBy" size="small" style="margin-left: 16px" @change="loadRanking">
          <el-radio-button value="orders">接单量</el-radio-button>
          <el-radio-button value="rating">评分</el-radio-button>
          <el-radio-button value="duration">服务时长</el-radio-button>
        </el-radio-group>
      </template>
      <el-table :data="ranking" stripe>
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column prop="completedOrders" label="完单量" width="100" />
        <el-table-column prop="avgRating" label="均分" width="80" />
        <el-table-column prop="totalServiceHours" label="服务时长(h)" width="120" />
        <el-table-column prop="totalRevenue" label="收入" width="120">
          <template #default="{ row }">¥{{ row.totalRevenue?.toFixed(2) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useECharts } from '@/utils/echarts'
import { getEmployeeRanking, getEmployeeDistribution, getEmployeeSummary } from '@/api/stats'

const statusChartRef = ref(null)
const ratingChartRef = ref(null)
const { setOption: setStatusChart } = useECharts(statusChartRef)
const { setOption: setRatingChart } = useECharts(ratingChartRef)

const summary = ref({})
const ranking = ref([])
const sortBy = ref('orders')

function pct(val) { return val != null ? (val * 100).toFixed(1) + '%' : '-' }

function loadRanking() {
  getEmployeeRanking({ sortBy: sortBy.value, limit: 20 }).then(res => {
    ranking.value = res.data.items || []
  })
}

onMounted(() => {
  getEmployeeSummary().then(res => { summary.value = res.data })
  getEmployeeDistribution().then(res => {
    setStatusChart({
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', radius: '70%', data: (res.data.byStatus || []).map(i => ({ name: i.label, value: i.count })) }]
    })
    setRatingChart({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: (res.data.byRating || []).map(i => i.label) },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: (res.data.byRating || []).map(i => i.count), itemStyle: { color: '#409EFF' } }],
      grid: { left: 30, right: 20, top: 20, bottom: 30 }
    })
  })
  loadRanking()
})
</script>

<style scoped>
.metric-row { margin-bottom: 8px; }
.metric-label { font-size: 13px; color: #909399; }
.metric-value { font-size: 24px; font-weight: 600; margin-top: 6px; }
</style>
