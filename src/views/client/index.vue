<script setup>
import { getCustomerList, addCustomer, updateCustomer, deleteCustomer } from '@/api/customer'
import { formatTime } from '@/utils/formatool'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import AddressDialog from './components/AddressDialog.vue'

const loading = ref(false)
const tableData = ref([])
const multipleSelection = ref([])
const isExpanded = ref(false)

const searchForm = reactive({
  realName: '',
  phone: '',
  level: '',
  status: '',
  createTime: []
})

const customerFormRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('新增客户')
const customerForm = reactive({
  id: null,
  userId: null,
  realName: '',
  phone: '',
  gender: null,
  level: 1,
  remark: '',
  status: 1
})

const customerRules = computed(() => ({
  userId: [{ required: true, message: '请输入关联用户ID', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  level: [{ required: true, message: '请选择客户等级', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}))

const genderOptions = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]

const levelOptions = [
  { label: 'VIP 1', value: 1 },
  { label: 'VIP 2', value: 2 },
  { label: 'VIP 3', value: 3 },
  { label: '普通', value: 0 }
]

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 }
]

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 地址对话框
const addressDialogVisible = ref(false)
const selectedCustomerId = ref(null)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    // 处理时间范围
    if (params.createTime && params.createTime.length === 2) {
      params.createTimeBegin = params.createTime[0]
      params.createTimeEnd = params.createTime[1]
    }
    delete params.createTime
    // 过滤掉空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    const res = await getCustomerList(params)
    if (res.success) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    console.error('获取客户列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.realName = ''
  searchForm.phone = ''
  searchForm.level = ''
  searchForm.status = ''
  searchForm.createTime = []
  pagination.currentPage = 1
  fetchData()
}

// 展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增客户'
  Object.assign(customerForm, {
    id: null,
    userId: null,
    realName: '',
    phone: '',
    gender: null,
    level: 1,
    remark: '',
    status: 1
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑客户'
  Object.assign(customerForm, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCustomer(row.id)
      if (res.success) {
        ElMessage.success(res.data || '删除成功')
        fetchData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除客户失败:', error)
    }
  }).catch(() => {
    // 取消删除，无需操作
  })
}

// 管理地址
const handleManageAddress = (row) => {
  selectedCustomerId.value = row.id
  addressDialogVisible.value = true
}

// 保存
const handleSave = async () => {
  if (!customerFormRef.value) return
  
  await customerFormRef.value.validate(async (valid) => {
    if (valid) {
      const data = { ...customerForm }
      // 过滤掉空值参数
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null || data[key] === undefined) {
          delete data[key]
        }
      })

      try {
        let res
        if (customerForm.id) {
          res = await updateCustomer(data)
        } else {
          res = await addCustomer(data)
        }
        if (res.success) {
          ElMessage.success(res.data || '保存成功')
        } else {
          ElMessage.error(res.msg || '保存失败')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('保存客户失败:', error)
        ElMessage.error('保存客户失败:' + error)
      }
    }
  })
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 获取等级标签类型
const getLevelType = (level) => {
  const levelMap = {
    3: 'danger',    // VIP 3 - 使用金色
    2: 'warning',   // VIP 2 - 使用银色
    1: 'primary',   // VIP 1 - 使用铜色
    0: 'info'       // 普通 - 使用灰色
  }
  return levelMap[level] || 'info'
}

// 获取状态标签类型
const getStatusType = (status) => {
  return status === 1 ? 'success' : 'danger'
}

// 获取性别标签
const getGenderLabel = (gender) => {
  const genderMap = {
    0: '未知',
    1: '男',
    2: '女'
  }
  return genderMap[gender] || '未知'
}

// 获取等级标签
const getLevelLabel = (level) => {
  const levelMap = {
    1: 'VIP 1',
    2: 'VIP 2',
    3: 'VIP 3',
    0: '普通'
  }
  return levelMap[level] || '普通'
}

// 表格选中项变化
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 分页变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}
</script>

<template>
  <div class="customer-management">
    <el-card class="box-card mb-20 search-card">

      <el-form :model="searchForm" label-position="top" class="search-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="真实姓名">
              <el-input 
                v-model="searchForm.realName" 
                placeholder="请输入真实姓名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="电话">
              <el-input 
                v-model="searchForm.phone" 
                placeholder="请输入电话"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="客户等级">
              <el-select v-model="searchForm.level" placeholder="请选择客户等级" clearable class="w-100">
                <el-option
                  v-for="item in levelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="w-100">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <template v-if="isExpanded">
            <el-col :span="6">
              <el-form-item label="创建时间">
                <el-date-picker
                  v-model="searchForm.createTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  class="w-100"
                />
              </el-form-item>
            </el-col>
          </template>
        </el-row>

        <el-row :gutter="20" class="action-row">
          <el-col :span="24">
            <div class="action-container">
              <div class="left-actions">
                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="handleReset">重置</el-button>
              </div>
              <div class="right-actions">
                <el-button link type="primary" @click="toggleExpand">
                  {{ isExpanded ? '收起' : '展开' }}
                  <el-icon class="el-icon--right">
                    <component :is="isExpanded ? ArrowUp : ArrowDown" />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="box-card customer-list-card">

      <template #header>
        <div class="card-header">
          <span>客户列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">新增客户</el-button>
          </div>
        </div>
      </template>

      <el-table 
        v-loading="loading"
        :data="tableData" 
        stripe 
        border
        style="width: 100%; flex: 1;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ getGenderLabel(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column prop="level" label="客户等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">
              {{ getLevelLabel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createdBy" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedBy" label="更新人" width="100" />
        <el-table-column prop="updateTime" label="更新时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="primary" size="small" @click="handleManageAddress(row)">
              地址
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增 / 编辑 客户对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="customerFormRef" :model="customerForm" :rules="customerRules" label-width="100px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model.number="customerForm.userId" placeholder="请输入关联用户ID" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="customerForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="customerForm.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="customerForm.gender" placeholder="请选择性别" class="w-100">
            <el-option
              v-for="item in genderOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户等级" prop="level">
          <el-select v-model="customerForm.level" placeholder="请选择客户等级" class="w-100">
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="customerForm.status" placeholder="请选择状态" class="w-100">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="customerForm.remark" 
            placeholder="请输入备注"
            type="textarea"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 客户地址管理对话框 -->
    <AddressDialog 
      v-if="selectedCustomerId"
      :customer-id="selectedCustomerId"
      :visible="addressDialogVisible"
      @update:visible="addressDialogVisible = $event"
    />
  </div>
</template>

<style scoped>
.customer-management {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mb-20 {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.box-card.customer-list-card {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

:deep(.customer-list-card .el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 20px;
}

:deep(.el-table) {
  border-radius: 4px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-card :deep(.el-card__body) {
  padding-bottom: 15px;
}

.action-row {
  margin-top: 15px;
}

.action-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.w-100 {
  width: 100%;
}

.ml-10 {
  margin-left: 10px;
}

:deep(.el-tag--danger) {
  background: linear-gradient(145deg, #c41e3a, #8b0000);
  border: 1px solid #a52a2a;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  box-shadow: 
    inset 0 1px 3px rgba(255,255,255,0.4),
    0 2px 6px rgba(0,0,0,0.3);
}

:deep(.el-tag--warning) {
  background: linear-gradient(145deg, #ffd700, #b8860b);
  border: 1px solid #daa520;
  color: #1a0d00;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
  box-shadow: inset 0 1px 4px rgba(255,255,255,0.8), 0 3px 8px rgba(0,0,0,0.3);
}

:deep(.el-tag--primary) {
  background: linear-gradient(145deg, #4169e1, #2f4f9e);
  border: 1px solid #3a5bb8;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  box-shadow: 
    inset 0 1px 3px rgba(255,255,255,0.35),
    0 2px 6px rgba(0,0,0,0.3);
}

:deep(.el-tag--info) {
  background: linear-gradient(145deg, #d0d0d0, #a0a0a0);
  border: 1px solid #b0b0b0;
  color: #2c2c2c;
  text-shadow: 0 1px 1px rgba(255,255,255,0.7);
  box-shadow: 
    inset 0 1px 2px rgba(255,255,255,0.6),
    0 2px 4px rgba(0,0,0,0.15);
}
</style>
