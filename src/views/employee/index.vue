<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getEmployeeList, 
  addEmployee, 
  updateEmployee, 
  auditEmployee, 
  leaveEmployee, 
  blacklistEmployee 
} from '@/api/employee'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  realName: '',
  employeeNo: '',
  status: null,
  minStarRating: null,
  maxStarRating: null
})

const statusOptions = [
  { label: '待审核', value: 'PENDING', type: 'info' },
  { label: '在职', value: 'ACTIVE', type: 'success' },
  { label: '暂停', value: 'SUSPENDED', type: 'warning' },
  { label: '离职', value: 'RESIGNED', type: 'danger' },
  { label: '黑名单', value: 'BLACKLISTED', type: 'danger' }
]

const genderOptions = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]

const healthOptions = [
  { label: '无', value: 0, type: 'info' },
  { label: '有效', value: 1, type: 'success' },
  { label: '过期', value: 2, type: 'danger' }
]

// Dialog
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const formData = reactive({
  id: null,
  userId: null,
  realName: '',
  gender: 1,
  phone: '',
  idCard: '',
  birthDate: '',
  healthCertificate: 0,
  certificateExpiryDate: '',
  workYears: 0
})

const rules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }]
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getEmployeeList(queryParams)
    if (res.code === 200) {
      console.log(res.data)
      tableData.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取列表失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNo = 1
  getList()
}

const handleReset = () => {
  queryParams.realName = ''
  queryParams.employeeNo = ''
  queryParams.status = null
  queryParams.minStarRating = null
  queryParams.maxStarRating = null
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '添加员工'
  formData.id = null
  formData.userId = null
  formData.realName = ''
  formData.gender = 1
  formData.phone = ''
  formData.idCard = ''
  formData.birthDate = ''
  formData.healthCertificate = 0
  formData.certificateExpiryDate = ''
  formData.workYears = 0
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑员工'
  formData.id = row.id
  formData.userId = row.userId
  formData.realName = row.realName
  formData.gender = row.gender === 'MALE' ? 1 : (row.gender === 'FEMALE' ? 2 : 0)
  formData.phone = row.phone
  formData.idCard = row.idCard 
  formData.birthDate = row.birthDate
  formData.healthCertificate = row.healthCertificate === 'VALID' ? 1 : (row.healthCertificate === 'EXPIRED' ? 2 : 0)
  formData.certificateExpiryDate = row.certificateExpiryDate
  formData.workYears = row.workYears ?? 0
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (formData.userId) {
          const res = await updateEmployee({ id: formData.userId, healthCertificate: formData.healthCertificate, certificateExpiryDate: formData.certificateExpiryDate, workYears: formData.workYears} )
          if (res.success) {
            ElMessage.success('更新成功')
          } else {
            ElMessage.error(res.msg || '更新失败')
          }
        } else {
          const res = await addEmployee(formData)
          if (res.success) {
            ElMessage.success('添加成功')
          } else {
            ElMessage.error(res.msg || '添加失败')
          }
        }
        dialogVisible.value = false
        getList()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const handleAudit = (row) => {
  ElMessageBox.confirm(`确认审核通过员工 "${row.realName}" 吗？`, '审核确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await auditEmployee({ id: row.id })
      ElMessage.success('审核成功')
      getList()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {
    ElMessage.info('已取消审核')
  })
}

const handleLeave = (row) => {
  ElMessageBox.confirm(`确认将员工 "${row.realName}" 标记为离职吗？此操作不可逆。`, '离职确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await leaveEmployee({ id: row.id })
      ElMessage.success('办理成功')
      getList()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleBlacklist = (row) => {
  ElMessageBox.confirm(`确认将员工 "${row.realName}" 加入黑名单吗？加入后将无法接单。`, '拉黑确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      await blacklistEmployee({ id: row.id })
      ElMessage.success('操作成功')
      getList()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleSizeChange = (val) => {
  queryParams.pageSize = val
  getList()
}

const handleCurrentChange = (val) => {
  queryParams.pageNo = val
  getList()
}

const getStatusLabel = (val) => {
  const item = statusOptions.find(opt => opt.value === val)
  return item ? item.label : '未知'
}

const getStatusTag = (val) => {
  const item = statusOptions.find(opt => opt.value === val)
  return item ? item.type : ''
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="姓名">
          <el-input v-model="queryParams.realName" placeholder="请输入姓名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="工号">
          <el-input v-model="queryParams.employeeNo" placeholder="请输入工号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增员工</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" style="margin-top: 20px">
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="employeeNo" label="工号" width="150" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 'MALE' ? '男' : (row.gender === 'FEMALE' ? '女' : '未知') }}
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workYears" label="从业年限" width="100px">
          <template #default="scope">
            {{ scope.row.workYears ?? 0 }} 年
          </template>
        </el-table-column>
        <el-table-column prop="healthCertificate" label="健康证" width="100px">
          <template #default="scope">
            <el-tag :type="scope.row.healthCertificate === 'VALID' ? 'success' : scope.row.healthCertificate === 'EXPIRED' ? 'danger' : 'info'">
              {{ scope.row.healthCertificate === 'VALID' ? '有效' : scope.row.healthCertificate === 'EXPIRED' ? '过期' : '无' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="星级" width="173">
          <template #default="{ row }">
            <el-rate
              v-model="row.starRating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column prop="completedOrders" label="完成单数" width="100" />
        <el-table-column label="操作" min-width="250">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.status === 'PENDING'" type="success" link @click="handleAudit(row)">审核</el-button>
            <el-button v-if="row.status === 'ACTIVE'" type="warning" link @click="handleLeave(row)">离职</el-button>
            <el-button v-if="row.status !== 'BLACKLISTED'" type="danger" link @click="handleBlacklist(row)">拉黑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" style="margin-top: 20px; text-align: right">
        <el-pagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="formData.realName" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <template v-if="!formData.id">
          <!-- Only show for Add -->
          <el-form-item label="性别">
            <el-radio-group v-model="formData.gender">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="formData.idCard" />
          </el-form-item>
          <el-form-item label="出生日期" prop="birthDate">
             <el-date-picker
                v-model="formData.birthDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
          </el-form-item>
        </template>
        
        <el-form-item label="健康证">
           <el-select v-model="formData.healthCertificate" style="width: 100%">
             <el-option v-for="item in healthOptions" :key="item.value" :label="item.label" :value="item.value" />
           </el-select>
        </el-form-item>
        <el-form-item label="从业年限">
          <el-input-number v-model="formData.workYears" :min="0" :step="1" placeholder="请输入从业年限" />
        </el-form-item>
        <el-form-item label="证件有效期" v-if="formData.healthCertificate !== 0">
           <el-date-picker
              v-model="formData.certificateExpiryDate"
              type="date"
              placeholder="选择有效期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
