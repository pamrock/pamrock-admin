<script setup>
import { getUserList, addUser, updateUser, deleteUser } from '@/api/user'
import { formatTime } from '@/utils/formatool'


const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  username: '',
  roleName: '',
  status: ''
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
    // 过滤掉空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    const res = await getUserList(params)
    if (res.success) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
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
  pagination.currentPage = 1
  fetchData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  Object.assign(userForm, {
    id: null,
    username: '',
    email: '',
    password: '',
    roleName: '',
    status: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  Object.assign(userForm, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      Object.assign(userForm, {
    userId: row.id
  })
      const res = await deleteUser(userForm)
      ElMessage.success(res.data)
      fetchData()
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }).catch(() => {})
}

// 保存
const handleSave = async () => {
  if (!userForm.username) {
    ElMessage.error('请输入用户名')
    return
  }

  // 过滤掉空值参数
  const data = { ...userForm }
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] === null || data[key] === undefined) {
      delete data[key]
    }
  })

  try {
    if (userForm.id) {
      const res = await updateUser(data)
      if (res.success) {
        ElMessage.success(res.data)
      } else {
        ElMessage.error(res.msg)
      }
    } else {
      const res = await addUser(data)
      ElMessage.success(res.data)
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error('保存用户失败:' + error)
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 获取状态标签类型
const getStatusType = (status) => {
  return status === '0' ? 'success' : 'info'
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
  <div class="user-management">
    <el-card class="box-card mb-20">
      <template #header>
        <div class="card-header">
          <span>搜索条件</span>
        </div>
      </template>

      <el-form :model="searchForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="用户名">
              <el-input 
                v-model="searchForm.username" 
                placeholder="请输入用户名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="角色">
              <el-select v-model="searchForm.roleName" placeholder="请选择角色" clearable>
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="box-card user-list-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <el-table 
        v-loading="loading"
        :data="tableData" 
        stripe 
        border
        style="width: 100%; flex: 1;"
      >
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
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
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
</style>
