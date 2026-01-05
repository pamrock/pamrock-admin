<script setup>
import { getUserList, addUser, updateUser, deleteUser, forceLogout } from '@/api/user'
import { formatTime } from '@/utils/formatool'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'


const loading = ref(false)
const tableData = ref([])
const multipleSelection = ref([])
const isExpanded = ref(false)

const searchForm = reactive({
  username: '',
  roleName: '',
  status: '',
  loginStatus: '',
  createTime: []
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const userForm = reactive({
  id: null,
  username: '',
  email: '',
  password: '',
  role: '',
  status: '0'
})

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '用户', value: 'user' },
  { label: '员工', value: 'employee' }
]

const statusOptions = [
  { label: '激活', value: '0' },
  { label: '禁用', value: '1' }
]

const loginStatusOptions = [
  { label: '在线', value: '0' },
  { label: '离线', value: '1' }
]

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

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
    const res = await getUserList(params)
    console.log(res)
    if (res.success) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
    }else{
      ElMessage.error(res.message)
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
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
  searchForm.username = ''
  searchForm.roleName = ''
  searchForm.status = ''
  searchForm.loginStatus = ''
  searchForm.createTime = []
  pagination.currentPage = 1
  fetchData()
}

// 展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 获取状态标签类型
const getStatusType = (status) => {
  return status === '0' ? 'success' : 'info'
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

// ... (rest of the script)

</script>

<template>
  <div class="user-management">
    <el-card class="box-card mb-20 search-card">

      <el-form :model="searchForm" label-position="top" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="用户名">
              <el-input 
                v-model="searchForm.username" 
                placeholder="请输入用户名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="角色">
              <el-select v-model="searchForm.roleName" placeholder="请选择角色" clearable class="w-100">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
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
          <el-col :span="6">
            <el-form-item label="登录状态">
              <el-select v-model="searchForm.loginStatus" placeholder="请选择登录状态" clearable class="w-100">
                <el-option
                  v-for="item in loginStatusOptions"
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

    <el-card class="box-card user-list-card">

      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="header-actions">
            <el-button type="danger" @click="handleBatchForceLogout" :disabled="multipleSelection.length === 0">批量强制退出</el-button>
            <el-button type="primary" @click="handleAdd">新增用户</el-button>
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
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status === '0' ? '激活' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="角色" width="100" />
        <el-table-column prop="remainTime" label="有效剩余时间" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleForceLogout(row)">
              强制退出
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

    <!-- 新增 / 编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="userForm.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.roleName" placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-management {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mb-20 {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.box-card.user-list-card {
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

:deep(.user-list-card .el-card__body) {
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
</style>
