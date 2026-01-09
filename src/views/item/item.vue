<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getItemList, addItem, updateItem, deleteItem } from '@/api/item'
import { getCategoryList } from '@/api/category'
import { Search, Plus, Refresh, Delete, Edit, Setting } from '@element-plus/icons-vue'
import CategoryDialog from './components/CategoryDialog.vue'

const loading = ref(false)
const itemList = ref([])
const total = ref(0)
const showCategoryDialog = ref(false)
const categoryOptions = ref([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  itemName: '',
  categoryCode: ''
})

const dialog = reactive({
  visible: false,
  title: ''
})

const formRef = ref(null)
const form = reactive({
  id: undefined,
  itemName: '',
  categoryCode: '',
  price: 0,
  chargingMethod: 0, // 0-按次 1-按时间
  costtime: '',
  introduction: '',
  imageUrl: ''
})

const rules = {
  itemName: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  categoryCode: [{ required: true, message: '请选择服务分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  chargingMethod: [{ required: true, message: '请选择收费方式', trigger: 'change' }]
}

// Fetch Items
function getList() {
  loading.value = true
  getItemList(queryParams).then(res => {
    if (res.success) {
      itemList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg)
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function getCategories() {
  getCategoryList({}).then(res => {
    if (res.success) {
      categoryOptions.value = res.data
    }
  })
}

function handleQuery() {
  queryParams.pageNo = 1
  getList()
}

function resetQuery() {
  queryParams.itemName = ''
  queryParams.categoryCode = ''
  handleQuery()
}

function resetForm() {
  form.id = undefined
  form.itemName = ''
  form.categoryCode = ''
  form.price = 0
  form.chargingMethod = 0
  form.costtime = ''
  form.introduction = ''
  form.imageUrl = ''
}

function handleAdd() {
  resetForm()
  dialog.title = '添加服务项目'
  dialog.visible = true
}

function handleUpdate(row) {
  resetForm()
  Object.assign(form, row)
  dialog.visible = true
  dialog.title = '修改服务项目'
}

function handleDelete(row) {
  ElMessageBox.confirm('确认删除服务项目 "' + row.itemName + '" 吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteItem({ id: row.id }).then(res => {
      ElMessage.success('删除成功')
      getList()
    })
  }).catch(() => {})
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.id) {
        updateItem(form).then(res => {
          ElMessage.success('修改成功')
          dialog.visible = false
          getList()
        })
      } else {
        addItem(form).then(res => {
          ElMessage.success('新增成功')
          dialog.visible = false
          getList()
        })
      }
    }
  })
}

function formatChargingMethod(row) {
    return row.chargingMethod === 0 ? '按次收费' : '按时收费'
}

onMounted(() => {
  getList()
  getCategories()
})
</script>

<template>
  <div class="item-management">
    <!-- 搜索区域 -->
    <el-card class="box-card mb-20 search-card">
      <el-form :model="queryParams" label-position="top" class="search-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="服务名称">
              <el-input
                v-model="queryParams.itemName"
                placeholder="请输入服务名称"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="服务分类">
              <el-tree-select
                v-model="queryParams.categoryCode"
                :data="categoryOptions"
                :props="{ value: 'categoryCode', label: 'categoryName', children: 'children' }"
                value-key="categoryCode"
                placeholder="请选择分类"
                check-strictly
                clearable
                class="w-100"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8">
            <div class="action-container" style="margin-top: 30px;">
              <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
              <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 列表区域 -->
    <el-card class="box-card item-list-card">
      <template #header>
        <div class="card-header">
          <span>服务项目列表</span>
          <div class="header-actions">
            <el-button type="success" plain :icon="Setting" @click="showCategoryDialog = true">管理服务分类</el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增服务</el-button>
          </div>
        </div>
      </template>

      <el-table 
        v-loading="loading" 
        :data="itemList" 
        stripe
        border 
        style="width: 100%; flex: 1;"
      >
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="服务名称" prop="itemName" min-width="150" show-overflow-tooltip />
        <el-table-column label="分类编码" prop="categoryCode" width="120" />
        <el-table-column label="价格" prop="price" width="120">
          <template #default="scope">
            <span style="font-weight: bold;">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收费方式" prop="chargingMethod" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.chargingMethod === 0 ? 'success' : 'warning'">
              {{ formatChargingMethod(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时长" prop="costtime" width="100" align="center" />
        <el-table-column label="图片" prop="imageUrl" width="100" align="center">
          <template #default="scope">
            <el-image 
              v-if="scope.row.imageUrl" 
              style="width: 40px; height: 40px; border-radius: 4px;" 
              :src="scope.row.imageUrl" 
              fit="cover" 
              :preview-src-list="[scope.row.imageUrl]"
              preview-teleported
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
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

    <!-- 新增/修改对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="服务名称" prop="itemName">
          <el-input v-model="form.itemName" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="服务分类" prop="categoryCode">
          <el-tree-select
            v-model="form.categoryCode"
            :data="categoryOptions"
            :props="{ value: 'categoryCode', label: 'categoryName', children: 'children' }"
            value-key="categoryCode"
            placeholder="请选择服务分类"
            check-strictly
            class="w-100"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :precision="2" :step="10" :min="0" class="w-100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收费方式" prop="chargingMethod">
              <el-select v-model="form.chargingMethod" class="w-100">
                <el-option :value="0" label="按次收费" />
                <el-option :value="1" label="按时收费" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="服务时长" prop="costtime">
          <el-input v-model="form.costtime" placeholder="例如: PT2H (2小时)" />
        </el-form-item>
        <el-form-item label="服务介绍" prop="introduction">
          <el-input v-model="form.introduction" type="textarea" :rows="3" placeholder="请输入服务介绍" />
        </el-form-item>
        <el-form-item label="图片URL" prop="imageUrl">
          <el-input v-model="form.imageUrl" placeholder="请输入图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 分类管理弹窗 -->
    <CategoryDialog v-model="showCategoryDialog" />
  </div>
</template>

<style scoped>
.item-management {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mb-20 {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.box-card.item-list-card {
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

:deep(.item-list-card .el-card__body) {
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

.action-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}

.w-100 {
  width: 100%;
}
</style>
