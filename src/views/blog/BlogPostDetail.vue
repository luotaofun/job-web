<template>
  <div class="post-detail">
    <el-card>
      <template #header>
        <h1 class="post-title">{{ postData.title }}</h1>
        <div class="post-meta">
          <span>{{ formatDate(postData.createTime) }}</span>
          <el-tag type="info" v-if="postData.category">{{ postData.category.name }}</el-tag>
        </div>
      </template>
      <!-- 封面图 -->
      <div class="post-cover" v-if="postData.coverImage">
         <img :src="postData.coverImage" alt="文章封面" />
      </div>
      <!-- 文章内容 -->
      <v-md-editor 
        :model-value="postData.content" 
        mode="preview"
        class="markdown-body"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { getBlogPostDetail } from '@/utils/apis' 
const route = useRoute()
const postData = ref({})

const fetchPostDetail = async () => {
  try {
    const res = await getBlogPostDetail(route.params.id)
    // console.log('获取文章详情成功:', res.data)
    postData.value = res.data
  } catch (error) {
    console.error('获取文章详情失败:', error)
  }
}

const formatDate = (dateStr) => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchPostDetail()
})
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-cover {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  object-fit: cover;
}

.post-title {
  margin-bottom: 10px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
}

.markdown-body {
  padding: 20px;
}

/* 添加移动端适配 */
@media (max-width: 768px) {
  .post-detail {
    padding: 10px; /* 减小内边距 */
    margin: 0; /* 移除外边距 */
    width: 100%; /* 占满宽度 */
    max-width: none; /* 移除最大宽度限制 */
  }
  
  .post-title {
    font-size: 20px; /* 减小标题字体 */
  }
  
  .post-meta {
    flex-wrap: wrap; /* 允许元数据换行 */
    gap: 10px; /* 减小间距 */
  }
  
  .post-cover {
    max-height: 200px; /* 减小封面图最大高度 */
  }
  
  .markdown-body {
    padding: 10px; /* 减小内容区内边距 */
  }
}
</style>