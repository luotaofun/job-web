<template>
  <div class="blog-tags-container">
    <div class="page-header">
      <h2>标签管理</h2>
      <el-button type="primary" @click="showAddTagDialog">
        <el-icon><Plus /></el-icon>新建标签
      </el-button>
    </div>

    <!-- 标签列表 -->
    <el-table
      v-loading="loading"
      :data="tags"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="标签名称" min-width="150" />
      <el-table-column prop="postCount" label="文章数量" width="100" sortable />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="showEditTagDialog(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="deleteTag(scope.row)"
            :disabled="scope.row.postCount > 0"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑标签对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新建标签' : '编辑标签'"
      v-model="dialogVisible"
      width="400px"
    >
      <el-form :model="tagForm" :rules="rules" ref="tagFormRef" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTagForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted,computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getBlogTags, 
  createBlogTag, 
  updateBlogTag, 
  deleteBlogTag 
} from '@/utils/apis'
import { useStore } from 'vuex'
const store = useStore()
// 获取当前登录用户ID
const currentUserId = computed(() => store.state.user?.id)

// 标签列表数据
const tags = ref([])
// 加载状态
const loading = ref(false)
// 对话框可见性
const dialogVisible = ref(false)
// 对话框类型：add-新增，edit-编辑
const dialogType = ref('add')
// 标签表单引用
const tagFormRef = ref(null)
// 当前编辑的标签ID
const currentTagId = ref(null)

// 标签表单数据
const tagForm = reactive({
  name: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { max: 50, message: '标签名称不能超过50个字符', trigger: 'blur' }
  ]
}

// 获取标签列表
const fetchTags = async () => {
  loading.value = true
  try {
    const res = await getBlogTags({
      userId: currentUserId.value // 添加用户ID参数
    })
    if (res.code === 200) {
      tags.value = res.data || []
    } else {
      ElMessage.error(res.msg || '获取标签列表失败')
    }
  } catch (error) {
    console.error('获取标签列表出错:', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

// 显示新增标签对话框
const showAddTagDialog = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 显示编辑标签对话框
const showEditTagDialog = (tag) => {
  dialogType.value = 'edit'
  currentTagId.value = tag.id
  console.log(tag.id)
  
  // 填充表单数据
  tagForm.name = tag.name
  
  dialogVisible.value = true
}

// 重置标签表单
const resetTagForm = () => {
  if (tagFormRef.value) {
    tagFormRef.value.resetFields()
  }
  tagForm.name = ''
  currentTagId.value = null
}

// 提交标签表单
const submitTagForm = async () => {
  if (!tagFormRef.value) return
  
  await tagFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      const formData = {
        name: tagForm.name,
        userId: currentUserId.value // 添加当前用户ID
      }

      if (dialogType.value === 'add') {
        const res = await createBlogTag(formData.name) 
        if (res.code === 200) {
          ElMessage.success('标签创建成功')
          dialogVisible.value = false
          fetchTags()
        } else {
          ElMessage.error(res.msg || '创建标签失败')
        }
      } else {
        const res = await updateBlogTag(Number(currentTagId.value), formData.name) 
        console.log(res)
        if (res.code === 200) {
          ElMessage.success('标签更新成功')
          dialogVisible.value = false
          fetchTags()
        } else {
          ElMessage.error(res.msg || '更新标签失败')
        }
      }
    } catch (error) {
      console.error('提交标签表单出错:', error)
      ElMessage.error('操作失败')
    }
  })
}

// 删除标签
const deleteTag = (tag) => {
  if (tag.postCount > 0) {
    ElMessage.warning(`该标签下有${tag.postCount}篇文章，无法删除`)
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除标签"${tag.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteBlogTag(tag.id)
      console.log(res)
      if (res.code === 200) {
        ElMessage.success('标签删除成功')
        fetchTags()
      } else {
        ElMessage.error(res.msg || '删除标签失败')
      }
    } catch (error) {
      console.error('删除标签出错:', error)
      ElMessage.error('删除失败')
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
  fetchTags()
})
</script>

<style scoped>
.blog-tags-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 