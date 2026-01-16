<script setup>
import { addCustomerAddress, updateCustomerAddress, getCustomerAddressList } from '@/api/customer'
import { regionData } from 'element-china-area-data'

const props = defineProps({
  customerId: {
    type: Number,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'refresh'])

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增地址')
const addressFormRef = ref(null)

const addressForm = reactive({
  id: null,
  customerId: null,
  contactName: '',
  contactPhone: '',
  areaCode: [], // 使用数组存储级联选择器的值
  detailAddress: '',
  isDefault: 0
})

const addressRules = computed(() => ({
  contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  areaCode: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}))

const isDefaultOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 0 }
]

// 监听visible变化
watch(() => props.visible, (val) => {
  if (val) {
    fetchAddresses()
  }
})

// 获取地址列表
const fetchAddresses = async () => {
  loading.value = true
  try {
    const res = await getCustomerAddressList({
      customerId: props.customerId,
      pageNo: 1,
      pageSize: 100
    })
    if (res.success) {
      tableData.value = res.data.records || []
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 新增地址
const handleAdd = () => {
  dialogTitle.value = '新增地址'
  Object.assign(addressForm, {
    id: null,
    customerId: props.customerId,
    contactName: '',
    contactPhone: '',
    areaCode: [],
    detailAddress: '',
    isDefault: 0
  })
  dialogVisible.value = true
}

// 编辑地址
const handleEdit = (row) => {
  dialogTitle.value = '编辑地址'
  // 将省市区信息转换为级联选择器格式
  const areaCode = [row.province, row.city, row.district]
  Object.assign(addressForm, {
    ...row,
    areaCode: areaCode
  })
  dialogVisible.value = true
}

// 删除地址
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const { deleteCustomerAddress } = await import('@/api/customer')
      const res = await deleteCustomerAddress(row.id)
      if (res.success) {
        ElMessage.success(res.data || '删除成功')
        fetchAddresses()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除地址失败:', error)
    }
  })
}

// 保存地址
const handleSave = async () => {
  if (!addressFormRef.value) return
  
  await addressFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 将级联选择器的值分解为省市区字段
        const [province, city, district] = addressForm.areaCode
        const saveData = {
          ...addressForm,
          province,
          city,
          district
        }
        
        // 移除不需要的字段
        delete saveData.areaCode
        
        let res
        if (addressForm.id) {
          res = await updateCustomerAddress(saveData)
        } else {
          res = await addCustomerAddress(saveData)
        }
        if (res.success) {
          ElMessage.success(res.data || '保存成功')
          dialogVisible.value = false
          fetchAddresses()
        } else {
          ElMessage.error(res.msg || '保存失败')
        }
      } catch (error) {
        console.error('保存地址失败:', error)
        ElMessage.error('保存地址失败')
      }
    }
  })
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog 
    :model-value="visible" 
    title="客户地址管理" 
    width="80%"
    @update:model-value="val => emit('update:visible', val)"
  >
    <div class="address-management">
      <div class="address-header">
        <el-button type="primary" @click="handleAdd">新增地址</el-button>
      </div>

      <el-table 
        v-loading="loading"
        :data="tableData" 
        stripe 
        border
        style="width: 100%; margin-top: 15px;"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="contactName" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="联系电话" width="120" />
        <el-table-column prop="province" label="省份" width="100" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="district" label="区县" width="100" />
        <el-table-column prop="detailAddress" label="详细地址" min-width="150" show-overflow-tooltip />
        <el-table-column prop="isDefault" label="是否默认" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isDefault === 1 ? 'success' : 'info'">
              {{ row.isDefault === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
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
    </div>

    <!-- 新增 / 编辑 地址对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="addressFormRef" :model="addressForm" :rules="addressRules" label-width="100px">
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="addressForm.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="addressForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="所在地区" prop="areaCode">
          <el-cascader
            v-model="addressForm.areaCode"
            :options="regionData"
            placeholder="请选择所在地区"
            style="width: 100%"
            clearable
            filterable
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input 
            v-model="addressForm.detailAddress" 
            placeholder="请输入详细地址" 
            type="textarea"
            rows="3"
          />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-select v-model="addressForm.isDefault" placeholder="请选择" class="w-100">
            <el-option
              v-for="item in isDefaultOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<style scoped>
.address-management {
  min-height: 300px;
}

.address-header {
  display: flex;
  justify-content: flex-end;
}

.w-100 {
  width: 100%;
}
</style>