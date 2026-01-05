<script setup>
import { getLoginLogList } from '@/api/log'
import { formatTime } from '@/utils/formatool'

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  username: '',
  loginStatus: '',
  loginType: ''
})

const loginTypeOptions = [
  { label: '账号密码', value: 1 },
  { label: 'Token', value: 2 },
  { label: '第三方', value: 3 }
]

const loginStatusOptions = [
  { label: '成功', value: 0 },
  { label: '失败', value: 1 }
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
    const res = await getLoginLogList(params)
    if (res.success) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取登录日志失败:', error)
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
  searchForm.loginStatus = ''
  searchForm.loginType = ''
  pagination.currentPage = 1
  fetchData()
}

// 获取登录状态标签类型
const getLoginStatusType = (status) => {
  return status === 0 ? 'success' : 'danger'
}

// 获取登录状态文本
const getLoginStatusText = (status) => {
  return status === 0 ? '成功' : '失败'
}

// 获取登录类型文本
const getLoginTypeText = (type) => {
  const map = {
    1: '账号密码',
    2: 'Token',
    3: '第三方'
  }
  return map[type] || '未知'
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
  <div class="log-container">
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
            <el-form-item label="登录类型">
              <el-select v-model="searchForm.loginType" placeholder="请选择类型" clearable>
                <el-option
                  v-for="item in loginTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="登录状态">
              <el-select v-model="searchForm.loginStatus" placeholder="请选择状态" clearable>
                <el-option
                  v-for="item in loginStatusOptions"
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

    <el-card class="box-card log-list-card">
      <template #header>
        <div class="card-header">
          <span>登录日志列表</span>
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
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="loginType" label="登录类型" width="100">
          <template #default="{ row }">
            {{ getLoginTypeText(row.loginType) }}
          </template>
        </el-table-column>
        <el-table-column prop="loginStatus" label="登录状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getLoginStatusType(row.loginStatus)">
              {{ getLoginStatusText(row.loginStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="failReason" label="失败原因" width="150" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="region" label="地区" width="120" />
        <el-table-column prop="deviceType" label="设备类型" width="100" />
        <el-table-column prop="os" label="操作系统" width="120" />
        <el-table-column prop="browser" label="浏览器" width="120" />
        <el-table-column prop="loginTime" label="登录时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.loginTime) }}
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
  </div>
</template>

<style scoped>
.log-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mb-20 {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.box-card.log-list-card {
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

:deep(.log-list-card .el-card__body) {
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
