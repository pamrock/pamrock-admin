<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { UserFilled, Female, Male, Phone, Medal, Check, Warning } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  employees: {
    type: Array,
    default: () => []
  },
  selectedId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:visible', 'select'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const selectedEmployeeId = ref(props.selectedId)
const activeIndex = ref(-1) // For keyboard navigation
const listContainer = ref(null)

watch(() => props.selectedId, (val) => {
  selectedEmployeeId.value = val
})

watch(() => props.visible, (val) => {
  if (val) {
    // Reset focus or scroll to selected
    nextTick(() => {
      if (selectedEmployeeId.value) {
        const idx = props.employees.findIndex(e => e.id === selectedEmployeeId.value)
        if (idx !== -1) {
          activeIndex.value = idx
          scrollToIndex(idx)
        }
      } else {
        activeIndex.value = -1
      }
    })
  }
})

const handleSelect = (employee) => {
  selectedEmployeeId.value = employee.id
  emit('select', employee)
  handleClose()
}

const handleClose = () => {
  dialogVisible.value = false
}

// Keyboard Navigation
const handleKeydown = (e) => {
  if (!props.visible) return
  
  const list = props.employees
  if (!list.length) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % list.length
    scrollToIndex(activeIndex.value)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + list.length) % list.length
    scrollToIndex(activeIndex.value)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (activeIndex.value !== -1) {
      handleSelect(list[activeIndex.value])
    }
  }
}

const scrollToIndex = (index) => {
  const el = listContainer.value?.children[index]
  if (el) {
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

// Formatters
const getGenderIcon = (gender) => {
  return gender === 'MALE' ? Male : (gender === 'FEMALE' ? Female : UserFilled)
}

const getGenderColor = (gender) => {
  return gender === 'MALE' ? '#409eff' : (gender === 'FEMALE' ? '#f56c6c' : '#909399')
}

const formatAge = (age) => {
  return age ? `${age}岁` : '未知'
}

// Mock avatar placeholder color based on name
const getAvatarColor = (name) => {
  const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399', '#79bbff', '#b3e19d']
  let hash = 0
  for (let i = 0; i < (name?.length || 0); i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

window.addEventListener('keydown', handleKeydown)
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    width="720px"
    top="5vh"
    :show-close="false"
    class="employee-selector-dialog"
    destroy-on-close
    append-to-body
  >
    <template #header>
      <div class="dialog-header">
        <h3 class="header-title">✨ 选择您的专属服务人员</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
    </template>

    <div class="dialog-content" ref="listContainer">
      <div 
        v-for="(emp, index) in employees" 
        :key="emp.id"
        class="employee-card"
        :class="{ 
          'is-selected': selectedEmployeeId === emp.id,
          'is-active': activeIndex === index 
        }"
        @click="handleSelect(emp)"
        @mouseenter="activeIndex = index"
      >
        <!-- Avatar Section -->
        <div class="avatar-wrapper">
          <img v-if="emp.avatar" :src="emp.avatar" class="avatar-img" alt="avatar" />
          <div v-else class="avatar-placeholder" :style="{ backgroundColor: getAvatarColor(emp.realName) }">
            {{ emp.realName?.charAt(0) }}
          </div>
          <div class="gender-badge" :style="{ backgroundColor: getGenderColor(emp.gender) }">
            <el-icon><component :is="getGenderIcon(emp.gender)" /></el-icon>
          </div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <div class="info-row top-row">
            <span class="name">{{ emp.realName }}</span>
            <span class="age-tag">{{ formatAge(emp.age) }}</span>
            <div class="health-status" :class="emp.healthCertificate === 'VALID' ? 'valid' : 'invalid'">
              <el-icon v-if="emp.healthCertificate === 'VALID'"><Check /></el-icon>
              <el-icon v-else><Warning /></el-icon>
              <span>{{ emp.healthCertificate === 'VALID' ? '健康证有效' : '健康证异常' }}</span>
            </div>
          </div>

          <div class="info-row mid-row">
            <div class="star-rating" role="img" :aria-valuenow="emp.starRating" aria-label="星级评分">
              <el-rate
                v-model="emp.starRating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}分"
                :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
              />
            </div>
            <div class="orders-count">
              <el-icon><Medal /></el-icon>
              <span>已服务 {{ emp.completedOrders || 0 }} 单</span>
            </div>
          </div>

          <div class="info-row bot-row">
             <div class="phone-tag" @click.stop>
               <el-icon><Phone /></el-icon>
               <span>{{ emp.phone }}</span>
             </div>
          </div>
        </div>

        <!-- Action Section -->
        <div class="action-section">
           <div class="select-radio">
             <div class="radio-inner"></div>
           </div>
           <span class="select-text">{{ selectedEmployeeId === emp.id ? '已选择' : '选择' }}</span>
        </div>
      </div>
      
      <div v-if="employees.length === 0" class="empty-state">
         暂无可用人员
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
/* Dialog Customization */
:global(.employee-selector-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  background: var(--el-bg-color);
  padding: 0;
}

:global(.employee-selector-dialog .el-dialog__header) {
  margin: 0;
  padding: 0;
}

:global(.employee-selector-dialog .el-dialog__body) {
  padding: 0;
}

/* Header */
.dialog-header {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}

.dialog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E");
  opacity: 0.15;
  pointer-events: none;
}

.header-title {
  margin: 0;
  color: white;
  font-size: 22px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 1;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255,255,255,0.4);
  transform: rotate(90deg);
}

/* Content List */
.dialog-content {
  padding: 20px;
  max-height: 65vh;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
}

.dialog-content::-webkit-scrollbar {
  width: 6px;
}
.dialog-content::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

/* Employee Card */
.employee-card {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 16px;
  background: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.employee-card:hover, .employee-card.is-active {
  transform: scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-8);
  z-index: 1;
}

.employee-card.is-selected {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

/* Avatar */
.avatar-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  margin-right: 20px;
}

.avatar-img, .avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 3px solid #fff;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  font-weight: 600;
}

.gender-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid #fff;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Info Section */
.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.name {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.age-tag {
  background: var(--el-fill-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.health-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.health-status.valid {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.health-status.invalid {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.mid-row {
  justify-content: flex-start;
}

.orders-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
}

.phone-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: text;
  user-select: text;
}

/* Action Section */
.action-section {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-left: 1px solid var(--el-border-color-lighter);
  padding-left: 16px;
  margin-left: 16px;
}

.select-radio {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.radio-inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  transform: scale(0);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.is-selected .select-radio {
  border-color: var(--el-color-primary);
}

.is-selected .radio-inner {
  transform: scale(1);
}

.select-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.is-selected .select-text {
  color: var(--el-color-primary);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--el-text-color-placeholder);
}
</style>
