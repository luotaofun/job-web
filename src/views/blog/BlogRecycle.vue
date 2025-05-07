<template>
  <div class="blog-recycle-container">
    <div class="page-header">
      <h2>回收站</h2>
      <div class="header-actions">
        <el-button type="danger" @click="batchDeletePosts" :disabled="selectedPosts.length === 0">
          <el-icon><Delete /></el-icon>永久删除
        </el-button>
        <el-button type="success" @click="batchRestorePosts" :disabled="selectedPosts.length === 0">
          <el-icon><RefreshRight /></el-icon>恢复文章
        </el-button>
      </div>
    </div>

    <!-- 文章列表 -->
    <el-table
      v-loading="loading"
      :data="postList"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="scope">
          <el-tooltip :content="scope.row.title" placement="top" :show-after="1000">
            <span class="post-title">{{ scope.row.title }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="authorName" label="作者" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" sortable />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" type="success" @click="restorePost(scope.row)">恢复</el-button>
          <el-button size="small" type="danger" @click="deletePost(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted ,computed} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getBlogPosts, 
  deleteBlogPost, 
  restoreBlogPostFromRecycleBin 
} from '@/utils/apis'
import { useStore } from 'vuex'
const store = useStore()
// 获取当前登录用户ID
const currentUserId = computed(() => store.state.user?.id)

// 文章列表数据
const postList = ref([])
// 加载状态
const loading = ref(false)
// 选中的文章
const selectedPosts = ref([])
// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取回收站文章列表
const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await getBlogPosts({
      page: currentPage.value,
      size: pageSize.value,
      status: 2 // 回收站状态
    })
    // console.log(res)
    
    if ( res.code === 200) {
      const data = res.data
      postList.value = data.records || []
      total.value = data.total || 0
    } else {
      ElMessage.error(res.data?.msg || '获取回收站文章失败')
    }
  } catch (error) {
    console.error('获取回收站文章出错:', error)
    ElMessage.error('获取回收站文章失败')
  } finally {
    loading.value = false
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedPosts.value = selection
}

// 处理每页显示数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchPosts()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchPosts()
}

// 恢复单篇文章
const restorePost = (post) => {
  ElMessageBox.confirm(
    `确定要恢复文章"${post.title}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {

      const res = await restoreBlogPostFromRecycleBin(currentUserId, post.id)
      
      if ( res.data.code === 200) {
        ElMessage.success('文章已恢复')
        fetchPosts()
      } else {
        ElMessage.error(res.msg || '恢复文章失败')
      }
    } catch (error) {
      console.error('恢复文章出错:', error)
      ElMessage.error('恢复失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 永久删除单篇文章
const deletePost = (post) => {
  ElMessageBox.confirm(
    `确定要永久删除文章"${post.title}"吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      console.log(currentUserId)
      const res = await deleteBlogPost(currentUserId.value, post.id)
      console.log(res)
      if ( res.code === 200) {
        ElMessage.success('文章已永久删除')
        fetchPosts()
      } else {
        ElMessage.error(res.msg || '删除文章失败')
      }
    } catch (error) {
      console.error('删除文章出错:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 批量恢复文章
const batchRestorePosts = () => {
  if (selectedPosts.value.length === 0) {
    return
  }

  ElMessageBox.confirm(
    `确定要恢复选中的 ${selectedPosts.value.length} 篇文章吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {

      const promises = selectedPosts.value.map(post => 
        restoreBlogPostFromRecycleBin(currentUserId.value, post.id)
      )
      
      await Promise.all(promises)
      ElMessage.success('已恢复选中文章')
      fetchPosts()
    } catch (error) {
      console.error('批量恢复文章出错:', error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 批量永久删除文章
const batchDeletePosts = () => {
  if (selectedPosts.value.length === 0) {
    return
  }

  ElMessageBox.confirm(
    `确定要永久删除选中的 ${selectedPosts.value.length} 篇文章吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const promises = selectedPosts.value.map(post => 
        deleteBlogPost(currentUserId.value, post.id)
      )
      
      await Promise.all(promises)
      ElMessage.success('已永久删除选中文章')
      fetchPosts()
    } catch (error) {
      console.error('批量删除文章出错:', error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 组件挂载时获取数据
onMounted(() => {
  if (!currentUserId.value) {
    ElMessage.error('请先登录')
    return
  }
  fetchPosts()
})
</script>

<style scoped>
.blog-recycle-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.post-title {
  display: inline-block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 