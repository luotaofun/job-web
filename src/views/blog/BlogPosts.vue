<template>
  <div class="blog-posts-container">
    <div class="page-header">
      <h2>文章管理</h2>
      <el-button type="primary" @click="goToCreatePost">
        <el-icon><Plus /></el-icon>新建文章
      </el-button>
    </div>

    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标题">
          <el-input v-model="searchForm.title" placeholder="请输入文章标题" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable>
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option :label="'草稿'" :value="0" />
            <el-option :label="'已发布'" :value="1" />
            <el-option :label="'回收站'" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
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
      <el-table-column prop="viewCount" label="浏览量" width="100" sortable />
      <el-table-column prop="commentCount" label="评论数" width="100" sortable />
      <el-table-column prop="likeCount" label="点赞数" width="100" sortable />


      <el-table-column prop="likeCount" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" width="180" sortable />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="viewPost(scope.row)">查看</el-button>
          <el-button size="small" type="primary" @click="editPost(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="moveToRecycleBin(scope.row)"
            v-if="scope.row.status !== 2"
          >删除</el-button>
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

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="selectedPosts.length > 0">
      <el-button type="danger" @click="batchMoveToRecycleBin">
        批量删除 ({{ selectedPosts.length }})
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getBlogPosts, getBlogCategories, moveBlogPostToRecycleBin } from '@/utils/apis'

const router = useRouter()
const store = useStore()
// 获取当前登录用户ID
const currentUserId = computed(() => store.state.user?.id)

const loading = ref(false)
const postList = ref([])
const categories = ref([])
const selectedPosts = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  title: '',
  categoryId: '',
  status: ''
})

// 获取文章列表
const fetchPosts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      title: searchForm.title || undefined,
      categoryId: searchForm.categoryId || undefined,
      status: searchForm.status !== '' ? searchForm.status : undefined,
      authorId: currentUserId.value // 只查询当前用户的文章
    }
    
    const res = await getBlogPosts(params)
    // console.log(res)
    if (res.data && res.code === 200) {
      postList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.data.msg || '获取文章列表失败')
    }
  } catch (error) {
    console.error('获取文章列表出错:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getBlogCategories()
    // console.log(res)
    if (res.code === 200) {
      categories.value = res.data || []
    } else {
      ElMessage.error(res.msg || '获取分类列表失败')
      categories.value = [] // 失败时清空分类列表
    }
  } catch (error) {
    console.error('获取分类列表出错:', error)
    ElMessage.error('获取分类列表失败')
    categories.value = [] // 异常时清空分类列表
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchPosts()
}

// 重置搜索
const resetSearch = () => {
  searchForm.title = ''
  searchForm.categoryId = ''
  searchForm.status = ''
  currentPage.value = 1
  fetchPosts()
}

// 页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchPosts()
}

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchPosts()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedPosts.value = selection
}

// 查看文章
const viewPost = (row) => {
  // 这里可以跳转到文章详情页或者打开预览弹窗
  ElMessage.info('查看文章: ' + row.title)
}

// 编辑文章
const editPost = (row) => {
  router.push(`/blog/post/edit/${row.id}`)
}

// 新建文章
const goToCreatePost = () => {
  router.push('/blog/post/create')//路由跳转
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '草稿'
    case 1: return '已发布'
    case 2: return '回收站'
    default: return '未知'
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 0: return 'info'    // 草稿 - 灰色
    case 1: return 'success' // 已发布 - 绿色
    case 2: return 'danger'  // 回收站 - 红色
    default: return 'info'   // 默认返回info类型
  }
}
// 移动到回收站
const moveToRecycleBin = (row) => {
  ElMessageBox.confirm(
    `确定要将文章 "${row.title}" 移至回收站吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {

      const res = await moveBlogPostToRecycleBin(currentUserId.value, row.id)
      // console.log( res)
      if ( res.code === 200) {
        ElMessage.success('已将文章移至回收站')
        fetchPosts()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error('移动到回收站出错:', error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 批量移动到回收站
const batchMoveToRecycleBin = () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请选择要删除的文章')
    return
  }

  ElMessageBox.confirm(
    `确定要将选中的 ${selectedPosts.value.length} 篇文章移至回收站吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const promises = selectedPosts.value.map(post => 
        moveBlogPostToRecycleBin(currentUserId.value, post.id)
      )
      
      await Promise.all(promises)
      ElMessage.success('已将选中文章移至回收站')
      fetchPosts()
    } catch (error) {
      console.error('批量移动到回收站出错:', error)
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
  fetchCategories()
  fetchPosts()
})
</script>

<style scoped>
.blog-posts-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
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

.batch-actions {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style> 