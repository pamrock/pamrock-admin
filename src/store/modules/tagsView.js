import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagsViewStore = defineStore('tagsView', () => {
  const tags = ref([])

  // 添加标签
  const addTag = (tag) => {
    const isExist = tags.value.some(t => t.path === tag.path)
    if (!isExist) {
      tags.value.push({
        path: tag.path,
        name: tag.name || 'Unknown',
        title: tag.title || 'Untitled'
      })
    }
  }

  // 删除标签
  const deleteTag = (path) => {
    tags.value = tags.value.filter(t => t.path !== path)
  }

  // 删除其他标签
  const deleteOtherTags = (path) => {
    tags.value = tags.value.filter(t => t.path === path)
  }

  // 删除所有标签
  const deleteAllTags = () => {
    tags.value = []
  }

  // 清空标签
  const clearTags = () => {
    tags.value = []
  }

  return {
    tags,
    addTag,
    deleteTag,
    deleteOtherTags,
    deleteAllTags,
    clearTags
  }
})
