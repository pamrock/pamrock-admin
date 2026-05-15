<template>
  <div class="stats-filter">
    <el-date-picker
      v-model="dateRange"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      value-format="YYYY-MM-DD"
      style="width: 280px"
    />
    <el-radio-group v-model="groupBy" style="margin-left: 16px">
      <el-radio-button value="day">按日</el-radio-button>
      <el-radio-button value="week">按周</el-radio-button>
      <el-radio-button value="month">按月</el-radio-button>
      <el-radio-button value="year">按年</el-radio-button>
    </el-radio-group>
    <span style="margin-left: 16px" v-if="showCompare">
      <el-switch v-model="compare" active-text="同比" />
    </span>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  showCompare: { type: Boolean, default: true }
})

const emit = defineEmits(['change'])

const dateRange = ref([])
const groupBy = ref('day')
const compare = ref(false)

function getPreviousPeriod(start, end) {
  if (!start || !end) return { startDate: null, endDate: null }
  const s = new Date(start)
  const e = new Date(end)
  const diff = e.getTime() - s.getTime()
  const prevEnd = new Date(s.getTime() - 86400000)
  const prevStart = new Date(prevEnd.getTime() - diff)
  return {
    startDate: formatDate(prevStart),
    endDate: formatDate(prevEnd)
  }
}

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

const filterParams = computed(() => {
  const params = {
    startDate: dateRange.value?.[0] || null,
    endDate: dateRange.value?.[1] || null,
    groupBy: groupBy.value,
    previousPeriod: compare.value
  }
  if (compare.value) {
    const prev = getPreviousPeriod(params.startDate, params.endDate)
    params.previousStartDate = prev.startDate
    params.previousEndDate = prev.endDate
  }
  return params
})

watch([dateRange, groupBy, compare], () => {
  emit('change', filterParams.value)
}, { deep: true })
</script>

<style scoped>
.stats-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
</style>
