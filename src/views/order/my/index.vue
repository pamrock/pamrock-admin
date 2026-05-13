<template>
  <div class="my-order-container">
    <!-- 头部导航或 Tabs -->
    <el-tabs v-model="activeTab" class="order-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待支付" name="1" />
      <el-tab-pane label="待派单" name="2" />
      <el-tab-pane label="已派单" name="3" />
      <el-tab-pane label="服务中" name="4" />
      <el-tab-pane label="已完成" name="5" />
      <el-tab-pane label="已取消" name="6" />
    </el-tabs>

    <!-- 订单列表区 -->
    <div class="order-list" v-loading="loading">
      <template v-if="orderList.length > 0">
        <div 
          class="order-card" 
          v-for="order in orderList" 
          :key="order.id"
          @click="viewDetail(order.orderId || order.id)"
        >
          <div class="card-header">
            <div class="shop-info">
              <el-icon class="shop-icon"><Shop /></el-icon>
              <span class="shop-name">{{ order.serviceItem }}</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
            <div class="order-status" :class="{ 'text-danger': isUnpaid(order.status) }">
              {{ getStatusText(order.status) }}
            </div>
          </div>
          
          <div class="card-body">
            <div class="goods-info">
              <div class="goods-image">
                <!-- 占位图 -->
                <el-icon class="image-placeholder"><Picture /></el-icon>
              </div>
              <div class="goods-detail">
                <div class="goods-name">{{ order.serviceItem }}</div>
                <div class="goods-time">下单时间：{{ order.createTime }}</div>
              </div>
            </div>
            <div class="order-price-row">
              <span>总价：</span>
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ order.totalAmount }}</span>
            </div>
          </div>
          
          <div class="card-footer" v-if="isUnpaid(order.status) || isRefundable(order.status)">
            <el-button
              v-if="isRefundable(order.status)"
              size="small"
              type="danger"
              round
              @click.stop="handleRefund(order)"
            >
              取消订单
            </el-button>
            <el-button
              v-if="isUnpaid(order.status)"
              type="warning"
              plain
              round
              size="small"
              @click.stop="goPay(order)"
            >
              去支付
            </el-button>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </template>
      
      <el-empty v-else description="暂无订单数据" />
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="订单详情" width="500px">
      <div class="detail-content" v-loading="detailLoading" v-if="currentOrder">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单ID">{{ currentOrder.orderId}}</el-descriptions-item>
          <el-descriptions-item label="服务项目">{{ currentOrder.serviceItem }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥ {{ currentOrder.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType((currentDetail && currentDetail.status) || currentOrder.status)">{{ getStatusText((currentDetail && currentDetail.status) || currentOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <!-- 其他详情字段可以根据实际接口返回补充 -->
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getMyOrderList, getOrderDetail, refundOrder } from '@/api/order'
import { alipayPay } from '@/api/pay'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('all')
const loading = ref(false)
const orderList = ref([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

const dialogVisible = ref(false)
const detailLoading = ref(false)
const currentDetail = ref(null)
const currentOrder = ref(null)

const fetchList = async () => {
  loading.value = true
  try {
    const reqData = { ...queryParams }
    
    // 假设通过 activeTab 过滤状态，后端需要支持 status 字段
    if (activeTab.value !== 'all') {
      reqData.status = activeTab.value
    }

    const res = await getMyOrderList(reqData)
    // 根据通用响应格式适配
    if (res.success || res.code === 200 || res.code === 0) {
      const data = res.data || {}
      orderList.value = data.records || data.list || (Array.isArray(data) ? data : [])
      total.value = data.total || orderList.value.length || 0
    } else {
      orderList.value = res.data?.records || res.data?.list || (Array.isArray(res.data) ? res.data : [])
      total.value = res.data?.total || orderList.value.length || 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  queryParams.pageNum = 1
  fetchList()
}

const handleSizeChange = (val) => {
  queryParams.pageSize = val
  fetchList()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  fetchList()
}

// 判断是否未支付，包含常见状态字符
const isUnpaid = (status) => {
  if (!status) return false
  const s = status.toString()
  return s === '1'
}

function isRefundable(status) {
  return status?.toString() === '2' || status?.toString() === '3'
}

function handleRefund(order) {
  const orderId = order.orderId || order.id
  ElMessageBox.confirm(
    '确认取消订单吗？\n取消后系统将自动退款，金额将原路返回。',
    '提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      const res = await refundOrder({ orderId })
      if (res.success) {
        ElMessage.success('退款成功')
        fetchList()
      } else {
        ElMessage.error(res.msg || '退款失败')
      }
    } catch (e) {
      ElMessage.error('退款失败')
    }
  }).catch(() => {})
}

const getStatusType = (status) => {
  const s = status?.toString()
  if (s === '1') return 'danger'
  if (s === '5') return 'success'
  if (s === '6') return 'info'
  return 'primary'
}

const getStatusText = (status) => {
  const map = {
    '1': '待支付',
    '2': '待派单',
    '3': '已派单',
    '4': '服务中',
    '5': '已完成',
    '6': '已取消'
  }
  return map[status?.toString()] || status
}

const parseCreateTimeGmt8 = (createTime) => {
  if (!createTime || typeof createTime !== 'string') return null
  const parts = createTime.trim().split(' ')
  if (parts.length !== 2) return null
  const [datePart, timePart] = parts
  const dateNums = datePart.split('-').map((v) => Number(v))
  const timeNums = timePart.split(':').map((v) => Number(v))
  if (dateNums.length !== 3 || timeNums.length !== 3) return null
  const [y, m, d] = dateNums
  const [hh, mm, ss] = timeNums
  if (![y, m, d, hh, mm, ss].every((n) => Number.isFinite(n))) return null
  return new Date(Date.UTC(y, m - 1, d, hh - 8, mm, ss))
}

const viewDetail = async (orderId) => {
  dialogVisible.value = true
  detailLoading.value = true
  currentDetail.value = null
  currentOrder.value = orderList.value.find((o) => (o.orderId || o.id) === orderId) || { orderId }
  try {
    const res = await getOrderDetail({ orderId: orderId })
    if (res.success || res.code === 200 || res.code === 0) {
      currentDetail.value = res.data
    } else {
      currentDetail.value = res.data || { orderId }
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    detailLoading.value = false
  }
}

const goPay = async (order) => {
  const orderId = order?.orderId || order?.id
  if (!orderId) {
    ElMessage.warning('订单号不存在，无法支付')
    return
  }

  const createAt = parseCreateTimeGmt8(order?.createTime)
  if (!createAt) {
    await ElMessageBox.alert('订单下单时间异常，请重新下单', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }

  const diffMs = Date.now() - createAt.getTime()
  if (diffMs > 30 * 60 * 1000) {
    await ElMessageBox.alert('订单已超过下单时间 30 分钟，请重新下单', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }

  ElMessage.success(`正在拉起支付,订单：${order.orderId || order.id}，金额：¥${order.totalAmount}`)
  try {
    const payRes = await alipayPay({ orderId })
    const payForm = typeof payRes === 'string' ? payRes : payRes?.data
    if (!payForm) {
      ElMessage.warning('支付跳转失败，请在订单中心继续支付')
      return
    }

    const wrapperId = 'alipay-pay-form-wrapper'
    const oldWrapper = document.getElementById(wrapperId)
    if (oldWrapper) oldWrapper.remove()

    const div = document.createElement('div')
    div.id = wrapperId
    div.style.display = 'none'
    div.innerHTML = payForm
    document.body.appendChild(div)
    const form = div.getElementsByTagName('form')[0]
    if (form) {
      form.submit()
    } else {
      ElMessage.warning('支付跳转失败，请在订单中心继续支付')
    }
  } catch (payError) {
    console.error('Payment Error', payError)
    ElMessage.warning('支付跳转失败，请在订单中心继续支付')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.my-order-container {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.dark .my-order-container {
  background-color: #141414;
}

.order-tabs {
  background: #fff;
  padding: 0 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.dark .order-tabs {
  background: #1d1d1d;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.dark .order-card {
  background: #1d1d1d;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.dark .card-header {
  border-bottom-color: #303030;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  font-size: 15px;
  color: #333;
}

.dark .shop-info {
  color: #e5e5e5;
}

.shop-icon {
  font-size: 16px;
  color: #666;
}

.order-status {
  font-size: 14px;
  color: #666;
}

.dark .order-status {
  color: #999;
}

.text-danger {
  color: #ff4d4f !important;
}

.dark .text-danger {
  color: #ff7875 !important;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goods-info {
  display: flex;
  gap: 12px;
}

.goods-image {
  width: 60px;
  height: 60px;
  background: #f5f5f5;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .goods-image {
  background: #2b2b2b;
}

.image-placeholder {
  font-size: 24px;
  color: #ccc;
}

.goods-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.dark .goods-name {
  color: #e5e5e5;
}

.goods-time {
  font-size: 12px;
  color: #999;
}

.order-price-row {
  text-align: right;
  font-size: 13px;
  color: #666;
}

.dark .order-price-row {
  color: #999;
}

.price-symbol {
  font-size: 12px;
  color: #333;
  font-weight: bold;
}

.price-value {
  font-size: 18px;
  color: #333;
  font-weight: bold;
}

.dark .price-symbol,
.dark .price-value {
  color: #e5e5e5;
}

.card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

.dark .card-footer {
  border-top-color: #303030;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
