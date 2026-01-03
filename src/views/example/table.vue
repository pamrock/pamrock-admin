<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([
  {
    id: 1,
    name: '小米',
    type: 'food',
    desc: '描述信息',
    status: true,
    tag: 'tag1'
  },
  {
    id: 2,
    name: '花菜',
    type: 'flower',
    desc: '描述信息',
    status: false,
    tag: 'tag2'
  },
  {
    id: 3,
    name: '西红柿',
    type: 'food',
    desc: '描述信息',
    status: true,
    tag: 'tag1'
  },
  {
    id: 4,
    name: '小麦',
    type: 'grain',
    desc: '描述信息',
    status: true,
    tag: 'tag2'
  },
  {
    id: 5,
    name: '香蕉',
    type: 'food',
    desc: '描述信息',
    status: false,
    tag: 'tag3'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增记录')
const form = reactive({
  id: null,
  name: '',
  type: 'food',
  desc: '',
  status: true,
  tag: 'tag1'
})

const typeOptions = [
  { label: '食物', value: 'food' },
  { label: '花卉', value: 'flower' },
  { label: '谷物', value: 'grain' }
]

const tagOptions = [
  { label: 'tag1', value: 'tag1' },
  { label: 'tag2', value: 'tag2' },
  { label: 'tag3', value: 'tag3' }
]

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增记录'
  form.id = null
  form.name = ''
  form.type = 'food'
  form.desc = ''
  form.status = true
  form.tag = 'tag1'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑记录'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 保存
const handleSave = () => {
  if (!form.name) {
    ElMessage.error('请输入名称')
    return
  }

  if (form.id) {
    // 编辑
    const index = tableData.value.findIndex(item => item.id === form.id)
    if (index > -1) {
      Object.assign(tableData.value[index], form)
      ElMessage.success('更新成功')
    }
  } else {
    // 新增
    form.id = Math.max(...tableData.value.map(item => item.id)) + 1
    tableData.value.push({ ...form })
    ElMessage.success('新增成功')
  }

  dialogVisible.value = false
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<template>
  <div class="example-table">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>表格示例</span>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="tag" label="标签" width="100">
          <template #default="{ row }">
            <el-tag type="info">{{ row.tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
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
    </el-card>

    <!-- 编辑 / 新增 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc" type="textarea" rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tag" placeholder="请选择标签">
            <el-option
              v-for="item in tagOptions"
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
.example-table {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-table) {
  border-radius: 4px;
}
</style>
