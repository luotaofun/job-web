<template>
  <div class="blog-categories-container">
    <div class="page-header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="showAddCategoryDialog">
        <el-icon><Plus /></el-icon>新建分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <el-table
      v-loading="loading"
      :data="categories"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" min-width="150" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column prop="postCount" label="文章数量" width="100" sortable />
      <el-table-column prop="sort" label="排序" width="80" sortable />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="showEditCategoryDialog(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="deleteCategory(scope.row)"
            :disabled="scope.row.postCount > 0"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑分类对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新建分类' : '编辑分类'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="categoryForm" :rules="rules" ref="categoryFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入分类描述" 
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { 
  getBlogCategories, 
  createBlogCategory, 
  updateBlogCategory, 
  deleteBlogCategory 
} from '@/utils/apis'

const store = useStore()
// 获取当前登录用户ID
const currentUserId = computed(() => store.state.user?.id)

// 分类列表数据
const categories = ref([])
// 加载状态
const loading = ref(false)
// 对话框可见性
const dialogVisible = ref(false)
// 对话框类型：add-新增，edit-编辑
const dialogType = ref('add')
// 分类表单引用
const categoryFormRef = ref(null)
// 当前编辑的分类ID
const currentCategoryId = ref(null)

// 分类表单数据
const categoryForm = reactive({
  name: '',
  description: '',
  sort: 0
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 50, message: '分类名称不能超过50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getBlogCategories()
    if (res.code === 200) {
      categories.value = res.data || []
    } else {
      ElMessage.error(res.msg || '获取分类列表失败')
      categories.value = [] // 确保失败时清空列表
    }
  } catch (error) {
    console.error('获取分类列表出错:', error)
    ElMessage.error('获取分类列表失败')
    categories.value = [] // 确保异常时清空列表
  } finally {
    loading.value = false
  }
}

// 显示新增分类对话框
const showAddCategoryDialog = () => {
  dialogType.value = 'add'
  resetCategoryForm()
  dialogVisible.value = true
}

// 显示编辑分类对话框
const showEditCategoryDialog = (category) => {
  dialogType.value = 'edit'
  
  // 确保 category.id 是有效的数值
  currentCategoryId.value = Number(category.id)
  
  // 填充表单数据
  categoryForm.name = category.name
  categoryForm.description = category.description || ''
  categoryForm.sort = category.sort || 0
  
  dialogVisible.value = true
}

// 重置分类表单
const resetCategoryForm = () => {
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields()
  }
  categoryForm.name = ''
  categoryForm.description = ''
  categoryForm.sort = 0
  currentCategoryId.value = null
}

// 提交分类表单
const submitCategoryForm = async () => {
  if (!categoryFormRef.value) return
  
  await categoryFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      const formData = {
        ...categoryForm,
        userId: currentUserId.value // 添加当前用户ID
      }

      if (dialogType.value === 'add') {
        const res = await createBlogCategory(formData)
        if (res.code === 200) {
          ElMessage.success('分类创建成功')
          dialogVisible.value = false
          fetchCategories()
        } else {
          ElMessage.error(res.msg || '创建分类失败')
        }
      } else {
        if (!currentCategoryId.value) {
          ElMessage.error('分类ID无效')
          return
        }
        
        const res = await updateBlogCategory(currentCategoryId.value, formData)
        if (res.code === 200) {
          ElMessage.success('分类更新成功')
          dialogVisible.value = false
          fetchCategories()
        } else {
          ElMessage.error(res.msg || '更新分类失败')
        }
      }
    } catch (error) {
      console.error('提交分类表单出错:', error)
      ElMessage.error('操作失败')
    }
  })
}

// 删除分类
const deleteCategory = (category) => {
  if (category.postCount > 0) {
    ElMessage.warning(`该分类下有${category.postCount}篇文章，无法删除`)
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除分类"${category.name}"吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteBlogCategory(category.id)
      if (res.code === 200) {
        ElMessage.success('分类删除成功')
        fetchCategories()
      } else {
        ElMessage.error(res.msg || '删除分类失败')
      }
    } catch (error) {
      console.error('删除分类出错:', error)
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
  fetchCategories()
})
</script>

<style scoped>
.blog-categories-container {
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