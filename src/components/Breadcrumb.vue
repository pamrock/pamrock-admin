<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const breadcrumbs = computed(() => {
  const path = route.path
  const breadcrumb = []
  
  if (path !== '/dashboard') {
    breadcrumb.push({
      title: '首页',
      path: '/dashboard'
    })
  }

  // 从路由名称或meta生成面包屑
  const pathParts = path.split('/').filter(p => p)
  pathParts.forEach((part, index) => {
    breadcrumb.push({
      title: route.meta?.title || part,
      path: '/' + pathParts.slice(0, index + 1).join('/')
    })
  })

  return breadcrumb
})
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item 
      v-for="(item, index) in breadcrumbs" 
      :key="index"
      :to="item.path"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped>
:deep(.el-breadcrumb__inner) {
  color: #606266;
}
</style>
