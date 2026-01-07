<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { updateUserBySelf } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatTime } from '@/utils/formatool'

const userStore = useUserStore()
const loading = ref(false)
const formRef = ref(null)
const isEditing = ref(false)
const uploadFile = ref(null)

const form = reactive({
  id: null,
  username: '',
  email: '',
  avatar: '',
  roleName: '',
  createTime: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ]
}

const initData = () => {
  const info = userStore.userInfo
  
  form.username = info.username
  form.email = info.email
  form.avatar = info.avatar
  form.roleName = info.roleName
  form.createTime = info.createTime
  uploadFile.value = null
}

onMounted(async () => {
  // Ensure we have latest info
  await userStore.getUserInfo()
  initData()
})

const handleEdit = () => {
  isEditing.value = true
}

const handleCancel = () => {
  initData()
  isEditing.value = false
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleAvatarChange = (file) => {
  form.avatar = URL.createObjectURL(file.raw)
  uploadFile.value = file.raw
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      ElMessageBox.confirm('是否确认修改个人信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        loading.value = true
        try {
          const payload = {
              id: userStore.userInfo.id,
              username: form.username,
              email: form.email,
              avatar: userStore.userInfo.avatar
          }
          
          const res = await updateUserBySelf(payload, uploadFile.value)
          if (res.success) {
            ElMessage.success('个人信息更新成功')
            await userStore.getUserInfo()
            isEditing.value = false
            uploadFile.value = null
          } else {
            ElMessage.error(res.msg || '更新失败')
          }
        } catch (error) {
          ElMessage.error('更新发生错误')
        } finally {
          loading.value = false
        }
      }).catch(() => {
      })
    }
  })
}
</script>

<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span>个人信息</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8" :xs="24" class="text-center">
            <div class="avatar-wrapper">
                <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :auto-upload="false"
                    :on-change="handleAvatarChange"
                    :disabled="!isEditing"
                    accept="image/*"
                >
                    <el-avatar :size="100" :src="form.avatar || 'https://cube.elemecdn.com/0/88/03b0f1ac001e48612fc7f392099a41jpeg.jpeg'" />
                    <div v-if="isEditing" class="avatar-edit-hint">点击更换</div>
                </el-upload>
                <div class="mt-20">
                    <el-tag>{{ form.roleName || '普通用户' }}</el-tag>
                </div>
            </div>
        </el-col>
        <el-col :span="16" :xs="24">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" :disabled="!isEditing" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" :disabled="!isEditing" />
                </el-form-item>
                <el-form-item label="创建时间">
                    <el-input :value="formatTime(form.createTime)" disabled />
                </el-form-item>
                <el-form-item>
                    <template v-if="!isEditing">
                        <el-button type="primary" @click="handleEdit">编辑</el-button>
                    </template>
                    <template v-else>
                        <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
                        <el-button @click="handleCancel">取消</el-button>
                    </template>
                </el-form-item>
            </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped>
.app-container {
    padding: 20px;
}
.text-center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.mt-20 {
    margin-top: 20px;
}
.avatar-uploader {
    cursor: pointer;
    position: relative;
    display: inline-block;
}
.avatar-edit-hint {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 12px;
    padding: 2px 0;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
    /* Approximation for circle avatar bottom */
}
/* Ensure el-upload takes proper shape if needed, but here it wraps avatar */
</style>
