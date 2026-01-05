<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoleList, addRole, updateRole, deleteRole, getRoleMenu } from '@/api/role'
import { getMenuList } from '@/api/menu'
import { formatTime } from '@/utils/formatool'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])
const isExpanded = ref(false)

const searchForm = reactive({
  roleName: '',
  roleKey: '',
  status: '',
  createTime: []
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const roleForm = reactive({
  id: null,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  status: '0',
  menuIds: [],
  remark: ''
})

const menuOptions = ref([])
const menuRef = ref(null)
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const queryParams = reactive({
  menuName: undefined,
  status: undefined
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

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
      params.startTime = params.createTime[0]
      params.endTime = params.createTime[1]
    }
    delete params.createTime
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    const res = await getRoleList(params)
    if (res.success) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 查询菜单树结构 */
function getMenuTreeselect() {
  getMenuList(queryParams).then(response => {
    menuOptions.value = response.data
  })
}

onMounted(() => {
  fetchData()
  getMenuTreeselect() // 预加载菜单数据
})

const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

const handleReset = () => {
  searchForm.roleName = ''
  searchForm.roleKey = ''
  searchForm.status = ''
  searchForm.createTime = []
  pagination.currentPage = 1
  fetchData()
}

// 展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleAdd = () => {
  dialogTitle.value = '新增角色'
  Object.assign(roleForm, {
    id: null,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    menuIds: [],
    remark: '',
    delFlag: '0'
  })
  if (menuRef.value) {
    menuRef.value.setCheckedKeys([])
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  Object.assign(roleForm, row)
  dialogVisible.value = true
  nextTick(() => {
    if (menuRef.value) {
        menuRef.value.setCheckedKeys([]); // 重置勾选
    }
    getRoleMenu({ roleName: row.roleName }).then(response => {
        if (response.success && response.data && response.data.menuRoleList && response.data.menuRoleList.length > 0) {
            const roleData = response.data.menuRoleList[0];
            const menuIds = roleData.menuIdList;
            if (menuRef.value) {
                const checkedLeafKeys = [];
                const traverse = (nodes) => {
                    nodes.forEach(node => {
                        if (node.children && node.children.length > 0) {
                            traverse(node.children);
                        } else {
                            if (menuIds.includes(node.id)) {
                                checkedLeafKeys.push(node.id);
                            }
                        }
                    });
                };
                traverse(menuOptions.value);
                menuRef.value.setCheckedKeys(checkedLeafKeys);
            }
            roleForm.menuIds = menuIds;
        }
    })
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await updateRole({
        id: row.id,
        delFlag: '1'
      })
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除角色失败:', error)
    }
  }).catch(() => {})
}

// 所有菜单节点数据
function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}

const handleSave = async () => {
  if (!roleForm.roleName) {
    ElMessage.error('请输入角色名称')
    return
  }
  if (!roleForm.roleKey) {
    ElMessage.error('请输入权限字符')
    return
  }

  // 获取选中的菜单
  roleForm.menuIds = getMenuAllCheckedKeys()

  try {
    if (roleForm.id) {
      await updateRole(roleForm)
      ElMessage.success('修改成功')
    } else {
      const res = await addRole(roleForm)
      if (res.success) {
        await updateRole(roleForm)
        ElMessage.success(res.data)
      } else{
        ElMessage.error(res.msg)
      }
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存角色失败:', error)
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

const getStatusType = (status) => {
  return status === '0' ? 'success' : 'danger'
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}

// 树权限（展开/折叠）
const handleCheckedTreeExpand = (value) => {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
        menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
}

// 树权限（全选/全不选）
const handleCheckedTreeNodeAll = (value) => {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
}

const handleCheckedTreeConnect = (value) => {
    roleForm.menuCheckStrictly = value ? true : false;
}
</script>

<template>
  <div class="role-management">
    <el-card class="box-card mb-20 search-card">
      <template #header>
        <div class="card-header">
          <span>搜索条件</span>
        </div>
      </template>

      <el-form :model="searchForm" label-position="top" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="角色名称">
              <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="权限字符">
              <el-input v-model="searchForm.roleKey" placeholder="请输入权限字符" clearable @keyup.enter="handleSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="角色状态" clearable class="w-100">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
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
          <template v-if="isExpanded">
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

    <el-card class="box-card role-list-card">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe border style="width: 100%; flex: 1;">
        <el-table-column prop="id" label="角色编号" width="100" />
        <el-table-column prop="roleName" label="角色名称" :show-overflow-tooltip="true" width="150" />
        <el-table-column prop="roleKey" label="权限字符" :show-overflow-tooltip="true" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" width="100" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="{ row }">
            <span>{{ formatTime(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateBy" label="更新人" width="100" />
        <el-table-column prop="updateTime" label="更新时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" append-to-body>
      <el-form ref="roleRef" :model="roleForm" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="roleForm.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model="roleForm.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="roleForm.status">
            <el-radio v-for="dict in statusOptions" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
             <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event)">展开/折叠</el-checkbox>
             <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
             <!-- <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event)">父子联动</el-checkbox> -->
             <el-tree
                class="tree-border"
                :data="menuOptions"
                show-checkbox
                ref="menuRef"
                node-key="id"
                empty-text="加载中，请稍候"
                :props="{ label: 'menuName', children: 'children' }"
             ></el-tree>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="roleForm.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSave">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.role-management {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mb-20 {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.box-card.role-list-card {
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

:deep(.role-list-card .el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 20px;
}

:deep(.el-table) {
  border-radius: 4px;
}

.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7;
  background: #FFFFFF none;
  border-radius: 4px;
  width: 100%;
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
</style>