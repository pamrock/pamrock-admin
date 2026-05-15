<template>
  <div class="stats-service">
    <StatsFilter @change="onFilterChange" />

    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>热门服务排行</template>
          <div ref="rankRef" style="height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>各品类订单占比</template>
          <div ref="pieRef" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>服务时长统计</template>
      <el-table :data="durations" stripe>
        <el-table-column prop="itemName" label="服务项目" />
        <el-table-column prop="avgDuration" label="平均时长(分钟)" width="140" />
        <el-table-column prop="minDuration" label="最短(分钟)" width="120" />
        <el-table-column prop="maxDuration" label="最长(分钟)" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useECharts } from '@/utils/echarts'
import { getServiceRanking, getServiceCategoryDistribution, getServiceDuration } from '@/api/stats'
import StatsFilter from '@/components/StatsFilter.vue'

const rankRef = ref(null)
const pieRef = ref(null)
const { setOption: setRank } = useECharts(rankRef)
const { setOption: setPie } = useECharts(pieRef)

const durations = ref([])
const filterParams = ref({})

function onFilterChange(params) { filterParams.value = params }

watch(filterParams, (params) => {
  if (!params.startDate) return
  loadData(params)
}, { deep: true })

function loadData(params) {
  getServiceRanking(params).then(res => {
    const items = (res.data.items || []).slice(0, 15).reverse()
    setRank({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value', name: '订单数' },
      yAxis: { type: 'category', data: items.map(i => i.itemName) },
      series: [{ type: 'bar', data: items.map(i => i.orderCount), itemStyle: { color: '#409EFF' }, barMaxWidth: 30 }],
      grid: { left: 120, right: 30, top: 10, bottom: 20 }
    })
  })

  getServiceCategoryDistribution(params).then(res => {
    setPie({
      tooltip: { trigger: 'item', formatter: '{b}: {c}单 ({d}%)' },
      series: [{ type: 'pie', radius: ['45%', '75%'], center: ['50%', '50%'], data: (res.data.items || []).map(i => ({ name: i.categoryName, value: i.amount })) }]
    })
  })

  getServiceDuration(params).then(res => {
    durations.value = res.data.items || []
  })
}

onMounted(() => {
  loadData({ startDate: new Date(Date.now() - 90*86400000).toISOString().slice(0,10), endDate: new Date().toISOString().slice(0,10), groupBy: 'day' })
})
</script>
