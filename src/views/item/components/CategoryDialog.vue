<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryList, addCategory, updateCategory, deleteCategory } from '@/api/category'
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import { filterObj } from '@/utils/formatool'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const categoryList = ref([])
const refreshTable = ref(true)
const isExpandAll = ref(false)

// Inner dialog for Add/Edit Category
const innerDialog = reactive({
  visible: false,
  title: ''
})

const formRef = ref(null)
const form = reactive({
  id: undefined,
  categoryLevel: 1,
  categoryCode: '',
  categoryName: '',
  parentCategoryCode: '',
  remark: ''
})

const rules = {
  categoryCode: [{ required: true, message: '请输入分类码', trigger: 'blur' }],
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const queryParams = reactive({
  categoryName: ''
})

// Get Data
function getList() {
  loading.value = true
  const params = filterObj(queryParams)
  getCategoryList(params).then(res => {
    if (res.success) {
      categoryList.value = res.data
    } else {
      ElMessage.error(res.msg)
    }
    loading.value = false
  }).catch(e => {
    loading.value = false
    ElMessage.error('加载分类失败')
  })
}

function handleQuery() {
  getList()
}

function resetQuery() {
  queryParams.categoryName = ''
  handleQuery()
}

// Reset Form
function reset() {
  form.id = undefined
  form.categoryLevel = 1
  form.categoryCode = ''
  form.categoryName = ''
  form.parentCategoryCode = ''
  form.remark = ''
}

// Open Add Dialog
function handleAdd(row) {
  reset()
  if (row && row.categoryCode) {
    form.parentCategoryCode = row.categoryCode
    form.categoryLevel = (row.categoryLevel || 1) + 1
  } else {
    form.parentCategoryCode = ''
    form.categoryLevel = 1
  }
  innerDialog.title = '添加服务分类'
  innerDialog.visible = true
}

// Open Edit Dialog
function handleUpdate(row) {
  reset()
  Object.assign(form, row)
  innerDialog.title = '修改服务分类'
  innerDialog.visible = true
}

// Submit Form
function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.id) {
        updateCategory(form).then(res => {
          ElMessage.success('修改成功')
          innerDialog.visible = false
          getList()
        })
      } else {
        addCategory(form).then(res => {
          ElMessage.success('新增成功')
          innerDialog.visible = false
          getList()
        })
      }
    }
  })
}

// Delete
function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除名称为"' + row.categoryName + '"的分类?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return deleteCategory({ categoryCode: row.categoryCode })
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

function handleClose() {
    visible.value = false
}

// Load data when dialog opens
import { watch } from 'vue'
watch(() => props.modelValue, (val) => {
  if (val) {
    getList()
  }
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="服务类别管理"
    width="900px"
    :before-close="handleClose"
    append-to-body
  >
    <div class="category-container">
      <el-form :inline="true" :model="queryParams" class="mb-2">
        <el-form-item label="分类名称">
          <el-input v-model="queryParams.categoryName" placeholder="请输入分类名称" clearable @keyup.enter="handleQuery"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain :icon="Plus" @click="handleAdd(null)">新增一级分类</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
        </el-col>
      </el-row>

      <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="categoryList"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        style="width: 100%; margin-top: 10px;"
      >
        <el-table-column prop="categoryName" label="分类名称" min-width="150" />
        <el-table-column prop="categoryCode" label="分类码" width="150" />
        <el-table-column prop="categoryLevel" label="层级" width="80" align="center" />
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button link type="primary" :icon="Plus" @click="handleAdd(scope.row)">新增下级</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Inner Dialog for Add/Edit -->
    <el-dialog
      v-model="innerDialog.visible"
      :title="innerDialog.title"
      width="500px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上级分类" v-if="form.parentCategoryCode">
             <el-input v-model="form.parentCategoryCode" disabled />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类码" prop="categoryCode">
          <el-input v-model="form.categoryCode" placeholder="请输入分类码" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="innerDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<style scoped>
.category-container {
  padding: 10px;
}
.mb8 {
  margin-bottom: 8px;
}
</style>
