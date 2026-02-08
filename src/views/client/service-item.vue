<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ShoppingCart, ArrowRight, Location, Plus, Edit, Position, Check } from '@element-plus/icons-vue'
import { getItemList} from '@/api/item'
import { getCategoryList } from '@/api/category'
import { getUserInfo } from '@/api/user'
import { getCustomerAddressList } from '@/api/customer'
import { regionData } from 'element-china-area-data'
import AddressDialog from './components/AddressDialog.vue'
import EmployeeSelector from './components/EmployeeSelector.vue'
import { addOrder } from '../../api/order'
import { getEmployeeList } from '../../api/employee'

const loading = ref(false)
const categoryLoading = ref(false)
const submitting = ref(false)

const categories = ref([])
// Two-level category selection
const selectedParentCategory = ref('')
const selectedSubCategory = ref('')

const items = ref([])

const query = reactive({
  pageNo: 1,
  pageSize: 100,
  itemName: '',
  categoryCodes: [],
  status: 0
})

const detailVisible = ref(false)
const showOrderConfirm = ref(false)
const currentItem = ref(null)

const currentUser = ref(null)
const addressList = ref([])
const selectedAddress = ref(null)
const addressDialogVisible = ref(false)
const employeeSelectorVisible = ref(false)
const employeeOptions = ref([])
const employeeLoading = ref(false)

const orderForm = reactive({
  quantity: 1,
  remark: '',
  serviceDate: '',
  visitTimeRange: '',
  serviceTimeRange: '',
  employeeId: null
})

// 上门时间段选项
const visitTimeRangeOptions = [
  { label: '08:00-09:00', value: '08:00-09:00' },
  { label: '09:00-10:00', value: '09:00-10:00' },
  { label: '10:00-11:00', value: '10:00-11:00' },
  { label: '11:00-12:00', value: '11:00-12:00' },
  { label: '12:00-13:00', value: '12:00-13:00' },
  { label: '13:00-14:00', value: '13:00-14:00' },
  { label: '14:00-15:00', value: '14:00-15:00' },
  { label: '15:00-16:00', value: '15:00-16:00' },
  { label: '16:00-17:00', value: '16:00-17:00' },
  { label: '17:00-18:00', value: '17:00-18:00' },
  { label: '18:00-19:00', value: '18:00-19:00' },
  { label: '19:00-20:00', value: '19:00-20:00' },
  { label: '20:00-21:00', value: '20:00-21:00' },
  { label: '21:00-22:00', value: '21:00-22:00' }
]

// 服务时段选项
const serviceTimeRangeOptions = [
  { label: '1小时', value: '1小时' },
  { label: '2小时', value: '2小时' },
  { label: '3小时', value: '3小时' },
  { label: '4小时', value: '4小时' },
  { label: '半天', value: '半天' },
  { label: '全天', value: '全天' }
]

// Level 1 Categories (Roots)
const parentCategoryOptions = computed(() => {
  return categories.value || []
})

// Level 2 Categories (Children of selected parent)
const subCategoryOptions = computed(() => {
  if (!selectedParentCategory.value) return []
  const parent = categories.value.find(c => c.categoryCode === selectedParentCategory.value)
  return parent ? (parent.children || []) : []
})

// Helper to get all descendant codes for a category
const getDescendantCodes = (category) => {
  let codes = [category.categoryCode]
  if (category.children && category.children.length) {
    category.children.forEach(child => {
      codes = codes.concat(getDescendantCodes(child))
    })
  }
  return codes
}

const filteredItems = computed(() => {
  // If no parent selected, show all
  if (!selectedParentCategory.value) return items.value
  
  // If sub category selected, filter by it (exact match usually, or its children if any)
  if (selectedSubCategory.value) {
    const sub = subCategoryOptions.value.find(c => c.categoryCode === selectedSubCategory.value)
    // Assuming sub-categories might have children too, or just be leaf
    // For simplicity, if sub selected, we match that code
    // But better to be safe: match sub and its children
    if (sub) {
        const codes = getDescendantCodes(sub)
        return items.value.filter(item => codes.includes(item.categoryCode))
    }
    return items.value.filter(item => item.categoryCode === selectedSubCategory.value)
  }

  // If only parent selected, show all items under this parent (including children)
  const parent = categories.value.find(c => c.categoryCode === selectedParentCategory.value)
  if (parent) {
    const codes = getDescendantCodes(parent)
    return items.value.filter(item => codes.includes(item.categoryCode))
  }
  
  return items.value
})

const chargingMethodLabel = item => {
  return item.chargingMethod === 0 ? '按次收费' : '按时收费'
}

const loadCategories = () => {
  categoryLoading.value = true
  getCategoryList({})
    .then(res => {
      if (res.success) {
        categories.value = res.data || []
      }
      categoryLoading.value = false
    })
    .catch(() => {
      categoryLoading.value = false
    })
}

const loadItems = () => {
  loading.value = true
  const params = {
    ...query
  }
  
  let targetCodes = []
  if (selectedSubCategory.value) {
     const parent = categories.value.find(c => c.categoryCode === selectedParentCategory.value)
     const sub = parent?.children?.find(c => c.categoryCode === selectedSubCategory.value)
     if (sub) targetCodes = getDescendantCodes(sub)
     else targetCodes = [selectedSubCategory.value]
  } else if (selectedParentCategory.value) {
     const parent = categories.value.find(c => c.categoryCode === selectedParentCategory.value)
     if (parent) targetCodes = getDescendantCodes(parent)
  }
  
  if (targetCodes.length) {
    params.categoryCodes = targetCodes
  } else {
    params.categoryCodes = [] // All
  }

  getItemList(params)
    .then(res => {
      if (res.success) {
        const list = res.data?.records || []
        items.value = list.filter(item => item.status === 0)
      } else {
        ElMessage.error(res.msg || '加载服务项目失败')
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

// Watchers to trigger reload when selection changes
watch(selectedParentCategory, () => {
  selectedSubCategory.value = '' // Reset sub when parent changes
  loadItems()
})

watch(selectedSubCategory, () => {
  loadItems()
})

const handleSearch = () => {
  loadItems()
}

const handleReset = () => {
  query.itemName = ''
  selectedParentCategory.value = ''
  selectedSubCategory.value = ''
  loadItems()
}

const openDetail = item => {
  currentItem.value = item
  detailVisible.value = true
  showOrderConfirm.value = false
  orderForm.quantity = 1
  orderForm.remark = ''
  orderForm.serviceDate = ''
  orderForm.visitTimeRange = ''
  orderForm.serviceTimeRange = ''
  orderForm.employeeId = null
  // Try to pre-load user info if not present, but don't block UI
  ensureCurrentUser().then(user => {
    if (user) loadAddresses(user.customerId)
  })
  // Load employees for selection
  loadEmployees()
}

const ensureCurrentUser = async () => {
  if (currentUser.value && currentUser.value.id) {
    return currentUser.value
  }
  try {
    const res = await getUserInfo(2)
    if (res.success) {
      currentUser.value = res.data
      return currentUser.value
    }
    ElMessage.error(res.msg || '获取当前用户信息失败')
    return null
  } catch (e) {
    ElMessage.error(res.msg)
    return null
  }
}

// Address Handling
const loadAddresses = async (customerId) => {
  try {
    const res = await getCustomerAddressList({
      customerId: customerId,
      pageNo: 1,
      pageSize: 100
    })
    if (res.success) {
      addressList.value = res.data.records || []
      // Auto-select default or first
      if (addressList.value.length > 0) {
        const def = addressList.value.find(a => a.isDefault === 1)
        selectedAddress.value = def || addressList.value[0]
      } else {
        selectedAddress.value = null
      }
    }
  } catch (e) {
    console.error('Failed to load addresses', e)
  }
}

const handleAddressRefresh = () => {
  if (currentUser.value) {
    loadAddresses(currentUser.value.id)
  }
}

const loadEmployees = async () => {
  if (employeeOptions.value.length > 0) return // 已经加载过了
  
  employeeLoading.value = true
  try {
    const res = await getEmployeeList({ pageNo: 1, pageSize: 1000, status: 'ACTIVE' }) // Get all active employees
    if (res.code === 200) {
      // Map the employee list to options format if needed, or just use list directly
      // Assuming res.data.list is the array of employees based on index.vue implementation
      employeeOptions.value = res.data.records || []
    }
  } catch (e) {
    console.error('Failed to load employees', e)
  } finally {
    employeeLoading.value = false
  }
}

const formatAddress = (addr) => {
  if (!addr) return ''
  // Simple check if it's already text or code
  const getAreaText = (pCode, cCode, dCode) => {
    // Basic lookup logic similar to AddressDialog, or simplified
    // Since we imported regionData, we can try to find labels
    // Assuming performance is okay for a single lookup
    const findLabel = (list, code) => {
        const found = list.find(i => i.value === code)
        return found
    }
    const p = findLabel(regionData, pCode)
    const c = p?.children ? findLabel(p.children, cCode) : null
    const d = c?.children ? findLabel(c.children, dCode) : null
    return `${p?.label || pCode || ''} ${c?.label || cCode || ''} ${d?.label || dCode || ''}`.trim()
  }
  
  // If codes are not valid region codes, this might display raw codes. 
  // Assuming AddressDialog saves codes properly.
  const region = getAreaText(addr.province, addr.city, addr.district)
  return `${region} ${addr.detailAddress}`
}

const handleChangeAddress = () => {
  if (!currentUser.value) return
  addressDialogVisible.value = true
}

const handleAddressSelect = (address) => {
  selectedAddress.value = address
  addressDialogVisible.value = false
}

const handleEmployeeSelect = (employee) => {
  orderForm.employeeId = employee.id
}

const getSelectedEmployeeName = computed(() => {
  if (!orderForm.employeeId) return ''
  const emp = employeeOptions.value.find(e => e.id === orderForm.employeeId)
  return emp ? emp.realName : ''
})

const handleStartOrder = async () => {
  const user = await ensureCurrentUser()
  if (!user) return
  
  if (!addressList.value.length) {
     // Try loading again
     await loadAddresses(user.customerId)
  }
  
  showOrderConfirm.value = true
}

const handleConfirmOrder = async () => {
  if (!currentItem.value) return
  const user = await ensureCurrentUser()
  if (!user) return

  if (!selectedAddress.value) {
    ElMessage.warning('请添加或选择收货地址')
    addressDialogVisible.value = true
    return
  }

  if (!orderForm.serviceDate) {
    ElMessage.warning('请选择服务日期')
    return
  }

  if (!orderForm.visitTimeRange) {
    ElMessage.warning('请选择上门时间段')
    return
  }

  submitting.value = true
  try {
    // 构建服务地址字符串
    const serviceAddress = formatAddress(selectedAddress.value)

    const payload = {
      customerId: user.customerId,
      employeeId: orderForm.employeeId, // 如果没有员工选择，可以为null
      serviceItemId: currentItem.value.id,
      serviceDate: orderForm.serviceDate,
      serviceAddress: serviceAddress,
      visitTimeRange: orderForm.visitTimeRange,
      serviceTimeRange: orderForm.serviceTimeRange
    }
    
    const res = await addOrder(payload)
    if (res.success) {
      ElMessage.success(res.data || '下单成功')
      detailVisible.value = false
    } else {
      ElMessage.error(res.msg || '下单失败')
    }
  } catch (e) {
    ElMessage.error('下单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadItems()
})
</script>

<template>
  <div class="service-catalog">
    <!-- Header Section: Unbound Style -->
    <div class="catalog-header">
      <!-- Search Bar -->
      <div class="search-container">
        <el-input
          v-model="query.itemName"
          placeholder="搜索服务项目..."
          clearable
          class="unbound-search"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Level 1 Categories -->
      <div class="category-nav-scroll">
        <div class="category-nav">
          <div 
            class="nav-item"
            :class="{ active: !selectedParentCategory }"
            @click="selectedParentCategory = ''"
          >
            全部
          </div>
          <div
            v-for="c in parentCategoryOptions"
            :key="c.id"
            class="nav-item"
            :class="{ active: selectedParentCategory === c.categoryCode }"
            @click="selectedParentCategory = c.categoryCode"
          >
            {{ c.categoryName }}
          </div>
        </div>
      </div>

      <!-- Level 2 Categories (Conditional) -->
      <div 
        class="sub-category-strip" 
        v-if="selectedParentCategory && subCategoryOptions.length"
      >
        <button
          type="button"
          class="sub-pill"
          :class="{ active: !selectedSubCategory }"
          @click="selectedSubCategory = ''"
        >
          全部
        </button>
        <button
          v-for="sub in subCategoryOptions"
          :key="sub.id"
          type="button"
          class="sub-pill"
          :class="{ active: selectedSubCategory === sub.categoryCode }"
          @click="selectedSubCategory = sub.categoryCode"
        >
          {{ sub.categoryName }}
        </button>
      </div>
    </div>

    <!-- Content Section -->
    <div class="catalog-body">
      <div class="catalog-content">
      <div class="list-header">
        <div class="list-title">
          <span>推荐服务</span>
          <span class="list-count" v-if="items.length">({{ items.length }})</span>
        </div>
      </div>

      <el-empty v-if="!loading && !items.length" description="暂无符合条件的服务" />

      <el-row
        v-else
        v-loading="loading"
        :gutter="24"
        class="card-grid"
      >
        <el-col
          v-for="item in items"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <div class="service-card" @click="openDetail(item)">
            <div class="service-card-header">
              <h3 class="service-name">{{ item.itemName }}</h3>
              <div class="service-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ item.price }}</span>
              </div>
            </div>
            <div class="service-meta">
              <el-tag size="small" type="success" effect="plain" round>{{ chargingMethodLabel(item) }}</el-tag>
              <span v-if="item.costtime" class="meta-text">
                 {{ item.costtime }}
              </span>
            </div>
            <p class="service-desc">
              {{ item.introduction || '暂无服务介绍' }}
            </p>
            <div class="service-footer">
              <span class="service-category">{{ item.categoryName || '未分类' }}</span>
              <div class="action-icon">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      </div>
    </div>

    <!-- Drawer with C-End Style -->
    <el-drawer
      v-model="detailVisible"
      size="500px"
      direction="rtl"
      :with-header="false"
      destroy-on-close
      class="service-detail-drawer"
    >
      <div v-if="currentItem" class="detail-panel">
        <!-- Scrollable Content -->
        <div class="detail-scroll-content">
          <!-- Hero / Header Section -->
          <div class="hero-section">
             <div class="hero-placeholder">
                <span class="hero-icon">{{ currentItem.itemName.charAt(0) }}</span>
             </div>
             <div class="hero-info">
                <div class="hero-price-row">
                   <span class="currency">¥</span>
                   <span class="amount">{{ currentItem.price }}</span>
                   <span class="unit" v-if="currentItem.unit">/ {{ currentItem.unit }}</span>
                </div>
                <h2 class="hero-title">{{ currentItem.itemName }}</h2>
                <div class="hero-category">{{ currentItem.categoryName || '未分类' }}</div>
             </div>
          </div>

          <!-- Tags & Intro Card -->
          <div class="content-card">
            <div class="detail-tags">
              <el-tag type="success" effect="light" class="custom-tag">
                {{ chargingMethodLabel(currentItem) }}
              </el-tag>
              <el-tag v-if="currentItem.costtime" type="info" effect="plain" class="custom-tag">
                时长：{{ currentItem.costtime }}
              </el-tag>
            </div>
            
            <div class="section-divider"></div>
            
            <div class="intro-block">
               <h4 class="card-title">服务详情</h4>
               <p class="detail-intro">
                 {{ currentItem.introduction || '暂无详细介绍信息' }}
               </p>
            </div>
          </div>

          <!-- Address Section (Card Style) -->
          <div v-if="showOrderConfirm" class="content-card">
            <h4 class="card-title">服务地址</h4>
            <div 
              class="address-card-select" 
              :class="{ 'empty': !selectedAddress, 'has-data': selectedAddress }"
              @click="handleChangeAddress"
            >
              <template v-if="selectedAddress">
                <div class="addr-icon-wrapper">
                  <el-icon><Location /></el-icon>
                </div>
                <div class="addr-content">
                  <div class="addr-row-top">
                     <span class="addr-name">{{ selectedAddress.contactName }}</span>
                     <span class="addr-phone">{{ selectedAddress.contactPhone }}</span>
                  </div>
                  <div class="addr-text">{{ formatAddress(selectedAddress) }}</div>
                </div>
                <div class="addr-arrow">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </template>
              <template v-else>
                 <div class="add-icon-circle">
                   <el-icon><Plus /></el-icon>
                 </div>
                 <span class="add-text">点击添加服务地址</span>
              </template>
            </div>
          </div>

           <!-- Order Form (Card Style) -->
           <div v-if="showOrderConfirm" class="content-card">
              <div class="form-row-between">
                 <span class="label-text">购买数量</span>
                 <el-input-number 
                   v-model="orderForm.quantity" 
                   :min="1" 
                   :max="99"
                   size="default" 
                 />
              </div>
              
              <div class="form-col mt-4">
                 <span class="label-text mb-2">选择阿姨</span>
                 <div 
                   class="employee-trigger-card" 
                   @click="employeeSelectorVisible = true"
                   :class="{ 'has-value': orderForm.employeeId }"
                 >
                   <template v-if="orderForm.employeeId">
                     <div class="selected-emp-info">
                       <span class="emp-name">{{ getSelectedEmployeeName }}</span>
                       <span class="emp-change-text">点击更换</span>
                     </div>
                     <el-icon class="check-icon"><Check /></el-icon>
                   </template>
                   <template v-else>
                     <span class="placeholder-text">点击选择为您服务的阿姨（可选）</span>
                     <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                   </template>
                 </div>
              </div>
              
              <div class="form-col mt-4">
                 <span class="label-text mb-2">服务日期</span>
                 <el-date-picker
                   v-model="orderForm.serviceDate"
                   type="date"
                   placeholder="请选择服务日期"
                   format="YYYY-MM-DD"
                   value-format="YYYY-MM-DD"
                   :disabled-date="(date) => date < new Date().setHours(0,0,0,0)"
                   style="width: 100%"
                 />
              </div>
              
              <div class="form-col mt-4">
                 <span class="label-text mb-2">上门时间段</span>
                 <el-select
                   v-model="orderForm.visitTimeRange"
                   placeholder="请选择上门时间段"
                   style="width: 100%"
                 >
                   <el-option
                     v-for="option in visitTimeRangeOptions"
                     :key="option.value"
                     :label="option.label"
                     :value="option.value"
                   />
                 </el-select>
              </div>
              
              <div class="form-col mt-4">
                 <span class="label-text mb-2">服务时段</span>
                 <el-select
                   v-model="orderForm.serviceTimeRange"
                   placeholder="请选择服务时段"
                   style="width: 100%"
                 >
                   <el-option
                     v-for="option in serviceTimeRangeOptions"
                     :key="option.value"
                     :label="option.label"
                     :value="option.value"
                   />
                 </el-select>
              </div>
              
              <div class="form-col mt-4">
                 <span class="label-text mb-2">订单备注</span>
                 <div class="textarea-wrapper">
                   <el-input
                     v-model="orderForm.remark"
                     type="textarea"
                     :rows="3"
                     placeholder="选填：请输入您的特殊需求..."
                     class="remark-input"
                   />
                 </div>
              </div>
           </div>
        </div>

        <!-- Fixed Footer -->
        <div class="detail-footer">
          <div class="footer-left">
            <span class="total-label">合计:</span>
            <div class="price-container">
               <span class="total-symbol">¥</span>
               <span class="total-amount">{{ (currentItem.price * orderForm.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div class="footer-right">
             <el-button 
               v-if="!showOrderConfirm" 
               type="primary" 
               size="large" 
               color="#4c6fff"
               round 
               class="action-btn block-btn"
               @click="handleStartOrder"
             >
               立即预约
             </el-button>
             <template v-else>
               <!-- <el-button size="large" round @click="detailVisible = false">取消</el-button> -->
               <el-button 
                 type="primary" 
                 size="large" 
                 color="#4c6fff"
                 round 
                 class="action-btn block-btn"
                 :loading="submitting"
                 @click="handleConfirmOrder"
               >
                 提交订单
               </el-button>
             </template>
          </div>
        </div>
      </div>
    </el-drawer>

    <AddressDialog 
      v-if="currentUser"
      v-model:visible="addressDialogVisible"
      :customer-id="currentUser.customerId"
      @refresh="handleAddressRefresh"
      @select="handleAddressSelect"
    />

    <EmployeeSelector
      v-model:visible="employeeSelectorVisible"
      :employees="employeeOptions"
      :selected-id="orderForm.employeeId"
      @select="handleEmployeeSelect"
    />
  </div>
</template>

<style scoped>
/* Main Container */
.service-catalog {
  margin: -20px;
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}

/* Body: inner scroll area for service list */
.catalog-body {
  flex: 1;
  overflow-y: auto;
}

/* Header Styles */
.catalog-header {
  background: var(--el-bg-color);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 16px 20px 10px;
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.3s ease;
}

.search-container {
  margin-bottom: 12px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.unbound-search :deep(.el-input__wrapper) {
  border-radius: 999px;
  background-color: var(--el-fill-color-lighter);
  box-shadow: none;
  padding: 4px 16px;
  transition: all 0.3s;
}

.unbound-search :deep(.el-input__wrapper.is-focus) {
  background-color: var(--el-bg-color);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.search-icon {
  font-size: 18px;
  color: var(--el-text-color-placeholder);
}

/* Category Nav (Level 1) */
.category-nav-scroll {
  overflow-x: auto;
  margin: 0 -20px;
  padding: 0 20px;
}

.category-nav-scroll::-webkit-scrollbar {
  display: none;
}

.category-nav {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.nav-item {
  padding: 12px 4px;
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  transition: color 0.3s;
}

.nav-item.active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--el-color-primary);
  border-radius: 2px 2px 0 0;
}

/* Sub Categories (Level 2) */
.sub-category-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 12px 0;
}

.sub-category-strip::-webkit-scrollbar {
  height: 0;
  width: 0;
}

.sub-pill {
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.2s;
}

.sub-pill.active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  font-weight: 500;
}

/* Content Area */
.catalog-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.list-header {
  margin-bottom: 16px;
}

.list-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-count {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
  font-weight: 400;
}

/* Cards */
.service-card {
  background: var(--el-bg-color);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--el-border-color-lighter);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--el-box-shadow-light);
  border-color: var(--el-color-primary-light-5);
}

.service-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.service-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.service-price {
  color: var(--el-color-warning);
  font-weight: 700;
  white-space: nowrap;
}

.price-symbol {
  font-size: 12px;
  margin-right: 1px;
}

.price-value {
  font-size: 18px;
}

.service-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.service-desc {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

.service-category {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.action-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  transition: all 0.2s;
}

.service-card:hover .action-icon {
  background: var(--el-color-primary);
  color: #fff;
}

/* Detail Panel */
.detail-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: var(--el-bg-color);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.detail-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.detail-category {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.detail-price {
  color: var(--el-color-warning);
  font-weight: 700;
  font-size: 24px;
}

.detail-section {
  margin-top: 16px;
}

.detail-intro {
  margin-top: 12px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.order-section {
  margin-top: auto;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 20px;
}

.order-header {
  margin-bottom: 12px;
}

.order-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.order-header p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.user-info-card {
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

.user-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
}

.user-row:last-child {
  margin-bottom: 0;
}

.user-row .label {
  color: var(--el-text-color-secondary);
}

.user-row .value {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

/* List Container */
.list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Responsive Grid Gaps */
@media (max-width: 768px) {
  .card-grid {
    --el-row-gutter: 16px !important;
  }

  .catalog-header {
    padding: 12px 16px 0px;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--el-bg-color);
  }

  .service-catalog {
    margin: -10px;
    padding-bottom: 20px;
  }

  .catalog-content {
    padding: 16px;
  }

  .search-container {
    margin-bottom: 12px;
  }

  .category-nav-scroll {
    margin: 0 -16px;
    padding: 0 16px;
  }

  .nav-item {
    font-size: 14px;
    padding: 10px 4px;
  }

  .detail-panel {
    padding: 16px;
  }
}

:global(html.dark) .service-card:hover {
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  :global(html.dark) .catalog-header {
    background: #020617;
  }
}

/* C-End Drawer Styles (Complete Overhaul) */
.detail-panel {
  padding: 0;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-fill-color-extra-light); /* Light gray bg for contrast with white cards */
}

/* Scrollable Area */
.detail-scroll-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
}

/* Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #e0eaff 0%, #f0f4ff 100%);
  padding: 30px 24px 24px;
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 12px;
}

:global(html.dark) .hero-section {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.hero-placeholder {
  width: 80px;
  height: 80px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

:global(html.dark) .hero-placeholder {
  background: #334155;
}

.hero-icon {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.hero-info {
  flex: 1;
}

.hero-title {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.3;
}

.hero-category {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  background: rgba(255,255,255,0.5);
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
}

:global(html.dark) .hero-category {
  background: rgba(0,0,0,0.2);
}

.hero-price-row {
  margin-bottom: 8px;
  display: flex;
  align-items: baseline;
  color: var(--el-color-danger);
}

.hero-price-row .currency {
  font-size: 14px;
  font-weight: 600;
  margin-right: 2px;
}

.hero-price-row .amount {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.hero-price-row .unit {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
  font-weight: 400;
}

/* Content Cards */
.content-card {
  background: var(--el-bg-color);
  margin: 12px 12px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
}

/* Tags */
.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px; /* Consistent gap */
  margin-bottom: 20px;
}

.custom-tag {
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  height: auto; /* Allow auto height */
}

.section-divider {
  height: 1px;
  background: var(--el-border-color-lighter);
  margin: 0 0 20px;
}

.detail-intro {
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
  margin: 0;
}

/* Address Card */
.address-card-select {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: var(--el-fill-color-lighter);
}

.address-card-select.has-data {
  border-style: solid;
  border-color: transparent;
  background: var(--el-color-primary-light-9);
  justify-content: flex-start;
  gap: 12px;
}

:global(html.dark) .address-card-select.has-data {
  background: rgba(37, 99, 235, 0.1);
}

.addr-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

:global(html.dark) .addr-icon-wrapper {
  background: #1e293b;
}

.addr-content {
  flex: 1;
  overflow: hidden;
}

.addr-row-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.addr-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.addr-phone {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.addr-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.add-icon-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-text-color-placeholder);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.add-text {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

/* Form Styles */
.form-row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.mt-4 { margin-top: 16px; }
.mb-2 { display: block; margin-bottom: 8px; }

.textarea-wrapper {
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  padding: 4px;
}

.remark-input :deep(.el-textarea__inner) {
  background: transparent;
  box-shadow: none;
  border: none;
  resize: none;
  font-size: 14px;
}

/* Footer */
.detail-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px 24px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
  z-index: 100;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.total-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.price-container {
  color: var(--el-color-danger);
  display: flex;
  align-items: baseline;
}

.total-symbol {
  font-size: 14px;
  font-weight: 600;
  margin-right: 2px;
}

.total-amount {
  font-size: 24px;
  font-weight: 800;
}

.footer-right {
  display: flex;
  gap: 12px;
}

.block-btn {
  min-width: 140px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(76, 111, 255, 0.3);
}

.employee-trigger-card {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-fill-color-lighter);
  transition: all 0.2s;
  min-height: 48px;
}

.employee-trigger-card:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.employee-trigger-card.has-value {
  border-style: solid;
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.placeholder-text {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
}

.selected-emp-info {
  display: flex;
  flex-direction: column;
}

.emp-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.emp-change-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.arrow-icon {
  color: var(--el-text-color-secondary);
}

.check-icon {
  color: var(--el-color-primary);
  font-size: 18px;
}

:global(html.dark) .detail-footer {
  box-shadow: 0 -4px 16px rgba(0,0,0,0.3);
}
</style>
