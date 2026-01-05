<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const form = ref({
  username: '',
  email: '',
  phone: '',
  role: '',
  desc: '',
  agree: false
})

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑', value: 'editor' },
  { label: '查看者', value: 'viewer' }
]

const handleSubmit = () => {
  if (!form.value.username) {
    ElMessage.error('请输入用户名')
    return
  }
  if (!form.value.agree) {
    ElMessage.error('请同意相关协议')
    return
  }
  ElMessage.success('提交成功！')
  resetForm()
}

const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    phone: '',
    role: '',
    desc: '',
    agree: false
  }
}
</script>

<template>
  <div class="example-form">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>表单示例</span>
        </div>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input 
            v-model="form.email" 
            type="email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>

        <el-form-item label="电话">
          <el-input 
            v-model="form.phone" 
            placeholder="请输入电话号码"
            clearable
          />
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input 
            v-model="form.desc" 
            type="textarea"
            rows="4"
            placeholder="请输入描述信息"
          />
        </el-form-item>

        <el-form-item label="协议">
          <el-checkbox v-model="form.agree">
            我已阅读并同意相关协议
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.example-form {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-form) {
  max-width: 600px;
}
</style>
