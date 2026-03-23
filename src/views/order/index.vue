<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, View } from '@element-plus/icons-vue'
import { getOrderList, getOrderDetail, addOrder, updateOrder, updateOrderStatus, deleteOrder, dispatchOrder } from '@/api/order'
import { getNotWorkingEmployees } from '@/api/employee'

const loading = ref(false)
const orderList = ref([])
const total = ref(0)
const showDetail = ref(false)
const currentOrder = ref({})
const currentDetail = ref({})

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: '',
  status: undefined
})

const statusOptions = [
  { value: '1', label: '待支付' },
  { value: '2', label: '待派单' },
  { value: '3', label: '已派单' },
  { value: '4', label: '服务中' },
  { value: '5', label: '已完成' },
  { value: '6', label: '已取消' }
]

const form = reactive({
  id: undefined,
  orderId: '',
  customerId: '',
  employeeId: '',
  serviceItemId: '',
  status: '1'
})

const dialog = reactive({
  title: '',
  visible: false
})

const dispatchDialogVisible = ref(false)
const availableEmployees = ref([])

const formRef = ref(null)

const rules = {
  orderId: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// Fetch Order List
function getList() {
  loading.value = true
  getOrderList(queryParams).then(res => {
    if (res.success) {
      orderList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '获取订单列表失败')
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.pageNo = 1
  getList()
}

function resetQuery() {
  queryParams.orderId = ''
  queryParams.status = undefined
  handleQuery()
}

function getStatusLabel(status) {
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.label : status
}

function getStatusType(status) {
  const map = {
    '1': 'warning',
    '2': 'info',
    '3': 'primary',
    '4': 'primary',
    '5': 'success',
    '6': 'danger'
  }
  return map[status] || ''
}

// View Detail
function handleView(row) {
  loading.value = true
  getOrderDetail({ orderId: row.orderId }).then(res => {
    if (res.success) {
      currentOrder.value = row
      currentDetail.value = res.data || {}
      showDetail.value = true
    } else {
      ElMessage.error(res.msg || '获取详情失败')
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// Delete
function handleDelete(row) {
  ElMessageBox.confirm('确认删除订单 "' + row.orderId + '" 吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteOrder({ orderId: row.orderId }).then(res => {
      if (res.success) {
        ElMessage.success('删除成功')
        getList()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

// Dispatch Order
function openDispatchDialog() {
  loading.value = true
  getNotWorkingEmployees({}).then(res => {
    loading.value = false
    if (res.success) {
      // Handle both array and single object response
      if (Array.isArray(res.data)) {
        availableEmployees.value = res.data
      } else if (res.data) {
        availableEmployees.value = [res.data]
      } else {
        availableEmployees.value = []
      }
      dispatchDialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取可派单员工失败')
    }
  }).catch(() => {
    loading.value = false
  })
}

function confirmDispatch(employeeId) {
  dispatchOrder({ orderId: currentOrder.value.orderId, employeeId }).then(res => {
    if (res.success) {
      ElMessage.success('派单成功')
      dispatchDialogVisible.value = false
      // Update local data
      currentOrder.value.employeeId = employeeId
      // Refresh list
      getList()
    } else {
      ElMessage.error(res.msg || '派单失败')
    }
  })
}

// Status Update
function handleStatusChange(row, newStatus) {
  updateOrderStatus({ orderId: row.orderId, status: newStatus }).then(res => {
    if (res.success) {
      ElMessage.success('状态更新成功')
      row.status = newStatus
      getList()
    } else {
      ElMessage.error(res.msg || '状态更新失败')
    }
  })
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="order-management">
    <!-- 搜索区域 -->
    <el-card class="box-card mb-20 search-card">
      <el-form :model="queryParams" label-position="top" class="search-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="订单号">
              <el-input
                v-model="queryParams.orderId"
                placeholder="请输入订单号"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="状态">
              <el-select v-model="queryParams.status" placeholder="全部" clearable class="w-100">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24">
            <div class="action-container" style="margin-top: 10px;">
              <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
              <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 列表区域 -->
    <el-card class="box-card order-list-card">
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
        </div>
      </template>

      <el-table 
        v-loading="loading" 
        :data="orderList" 
        stripe
        border 
        style="width: 100%; flex: 1;"
      >
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="订单号" prop="orderId" min-width="150" show-overflow-tooltip />
        <el-table-column label="客户ID" prop="customerId" width="120" />
        <el-table-column label="服务项目ID" prop="serviceItemId" width="120" />
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
        <el-table-column label="创建人" prop="createdBy" width="120" />
        <el-table-column label="更新时间" prop="updateTime" width="180" align="center" />
        <el-table-column label="更新人" prop="updatedBy" width="120" />
        <el-table-column label="状态" prop="status" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary" :icon="View" @click="handleView(scope.row)">详情</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="showDetail" title="订单详情" size="50%">
      <div class="detail-container">
        <el-descriptions title="基础信息" :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderId }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusLabel(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="客户ID">{{ currentOrder.customerId }}</el-descriptions-item>
          <el-descriptions-item label="员工ID">
            {{ currentOrder.employeeId }}
            <el-button 
              v-if="!currentOrder.employeeId" 
              type="primary" 
              link 
              size="small" 
              @click="openDispatchDialog"
              style="margin-left: 10px;"
            >
              派单
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentOrder.updateTime }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="服务详情" :column="1" border>
          <el-descriptions-item label="明细号">{{ currentDetail.orderDetailNo }}</el-descriptions-item>
          <el-descriptions-item label="服务日期">{{ currentDetail.serviceDate }}</el-descriptions-item>
          <el-descriptions-item label="服务地址">{{ currentDetail.serviceAddress }}</el-descriptions-item>
          <el-descriptions-item label="上门时间段">{{ currentDetail.visitTimeRange }}</el-descriptions-item>
          <el-descriptions-item label="服务时段">{{ currentDetail.serviceTimeRange }}</el-descriptions-item>
          <el-descriptions-item label="实际开始时间">{{ currentDetail.actualStartTime }}</el-descriptions-item>
          <el-descriptions-item label="实际结束时间">{{ currentDetail.actualEndTime }}</el-descriptions-item>
          <el-descriptions-item label="取消原因" v-if="currentDetail.cancelReason">{{ currentDetail.cancelReason }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="status-action">
          <h3>状态管理</h3>
          <el-radio-group v-model="currentOrder.status" @change="(val) => handleStatusChange(currentOrder, val)">
            <el-radio-button v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </el-drawer>

    <!-- 派单弹窗 -->
    <el-dialog v-model="dispatchDialogVisible" title="选择派单员工" width="700px" append-to-body>
      <el-table :data="availableEmployees" border style="width: 100%" max-height="400px">
        <el-table-column prop="id" label="员工ID" width="80" align="center" />
        <el-table-column prop="realName" label="姓名" width="120" align="center" />
        <el-table-column prop="phone" label="手机号" width="120" align="center" />
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="scope">
            {{ scope.row.gender === 'MALE' ? '男' : (scope.row.gender === 'FEMALE' ? '女' : scope.row.gender) }}
          </template>
        </el-table-column>
        <el-table-column prop="starRating" label="星级" width="80" align="center" />
        <el-table-column prop="completedOrders" label="已完成单量" width="100" align="center" />
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="confirmDispatch(scope.row.id)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<style scoped>
.order-management {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.mb-20 {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.box-card.order-list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

:deep(.order-list-card .el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 20px;
}

.w-100 {
  width: 100%;
}

.detail-container {
  padding: 0 20px;
}

.status-action {
  margin-top: 20px;
}
</style>
