<template>
  <div class="blog-post-edit-container">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑文章' : '创建文章' }}</h2>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="saveAsDraft">保存草稿</el-button>
        <el-button type="success" @click="publishPost">发布文章</el-button>
      </div>
    </div>

    <el-form :model="postForm" :rules="rules" ref="postFormRef" label-width="100px" class="post-form">

      <el-form-item label="文章设置">
        <el-checkbox v-model="postForm.isTop">置顶文章</el-checkbox>
        <el-checkbox v-model="postForm.isOriginal">原创文章</el-checkbox>
      </el-form-item>

      <el-form-item v-if="!postForm.isOriginal" label="原文链接">
        <el-input v-model="postForm.sourceUrl" placeholder="请输入原文链接" />
      </el-form-item>

      <!-- 文章标题 -->
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="postForm.title" placeholder="请输入文章标题" maxlength="200" show-word-limit />
      </el-form-item>

      <el-form-item label="文章分类" prop="categoryId">
        <el-select v-model="postForm.categoryId" placeholder="请选择分类" filterable allow-create default-first-option
          @change="handleCategoryChange">
          <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="文章标签">
        <el-select v-model="postForm.tagIds" multiple filterable allow-create default-first-option placeholder="请选择标签"
          @change="handleTagSelect">
          <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="文章摘要">
        <el-input v-model="postForm.summary" type="textarea" :rows="3" placeholder="请输入文章摘要（选填）" maxlength="500"
          show-word-limit />
      </el-form-item>

      <el-form-item label="文章内容" prop="content">
        <div class="editor-container">
          <v-md-editor 
            v-model="postForm.content" 
            height="400px"
            :disabled-menus="[]"
            @upload-image="handleUploadImage"
          ></v-md-editor>
          
          <!-- 添加 Markdown 编辑器图片上传冲突策略选择 -->
          <div class="conflict-strategy-selector">
            <span>编辑器图片上传冲突策略：</span>
            <el-radio-group v-model="markdownImageUploadStrategy">
              <el-radio value="REJECT">拒绝上传</el-radio>
              <el-radio value="RENAME">重命名</el-radio>
              <el-radio value="OVERWRITE">覆盖</el-radio>
            </el-radio-group>
          </div>
        </div>
      </el-form-item>

      <!-- 图片 -->
      <el-form-item label="图片">
        <div>
          <el-upload
            v-model:file-list="coverFileList"
            :action="uploadImageUrl"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeCoverUpload"
            :headers="uploadHeaders"
            :data="uploadData"
            multiple 
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          
          <!-- 冲突处理策略选择 -->
          <div class="conflict-strategy-selector">
            <span>冲突处理策略：</span>
            <el-radio-group v-model="coverUploadStrategy">
              <el-radio value="REJECT">拒绝上传</el-radio>
              <el-radio value="RENAME">重命名</el-radio>
              <el-radio value="OVERWRITE">覆盖</el-radio>
            </el-radio-group>
          </div>
        </div>

        <el-dialog v-model="dialogVisible">
          <img w-full :src="dialogImageUrl" alt="Preview Image" />
        </el-dialog>
      </el-form-item>

    </el-form>
  </div>

</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getBlogPostDetail,
  createBlogPost,
  updateBlogPost,
  getBlogCategories,
  getBlogTags,
  getBlogPostTags,
  createBlogCategory,
  createBlogTag,
  uploadImage
} from '@/utils/apis'
import axios from 'axios'
import store from '@/store'

const route = useRoute()//当前路由对象
const router = useRouter()
const postFormRef = ref(null)
const categories = ref([])
const tags = ref([])
const tagOptions = ref([])

// 判断是编辑还是创建
const isEdit = computed(() => route.params.id !== undefined) //通过 useRoute().params 获取在路由定义中使用占位符（如 :id）来表示可以变化的部分。
const postId = computed(() => route.params.id)

// 表单数据
const postForm = reactive({
  title: '',
  content: '',
  summary: '',
  coverImages: [],//存储多张图片
  categoryId: null,
  tagIds: [],
  isTop: false,
  isOriginal: true,
  sourceUrl: '',
  status: 0 // 0: 草稿, 1: 已发布
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

// 获取文章详情
const fetchPostDetail = async () => {
  try {
    const res = await getBlogPostDetail(postId.value, false)
    // console.log(res)
    if (res.code === 200) {
      const detail = res.data

      // 填充表单数据
      postForm.title = detail.title
      postForm.content = detail.content
      postForm.summary = detail.summary
      postForm.coverImage = detail.coverImage
      postForm.categoryId = detail.categoryId
      postForm.isTop = detail.isTop
      postForm.isOriginal = detail.isOriginal
      postForm.sourceUrl = detail.sourceUrl

      // 获取文章标签
      const tagsRes = await getBlogPostTags(postId.value)
      // console.log(tagsRes)
      if (tagsRes.code === 200) {
        postForm.tagIds = tagsRes.data.map(tag => tag.id)
      }
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getBlogCategories()
    // console.log(res)
    if (res.code === 200) {
      categories.value = res.data
    } else {
      ElMessage.error(res.msg || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表出错pp:', error)
    ElMessage.error('获取分类列表失败111')
  }
}

// 加载标签列表
const fetchTags = async () => {
  try {
    const res = await getBlogTags()
    // console.log(res)
    if (res.code === 200) {
      // 对数组中的每个tag对象进行映射，生成一个新的对象数组
      tagOptions.value = (res.data || []).map(tag => ({
        value: tag.id,
        label: tag.name
      }))
    }
  } catch (error) {
    console.error('加载标签失败:', error)
    ElMessage.error('加载标签失败')
  }
}

// 添加冲突策略选择变量
const coverUploadStrategy = ref('REJECT') // 默认使用拒绝策略
const markdownImageUploadStrategy = ref('REJECT') // 默认使用拒绝策略

// 封面图片相关变量
const coverFileList = ref([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 上传地址
const uploadImageUrl = ref('/api/file/image')

// 上传请求头
const uploadHeaders = ref({})

// 上传参数
const uploadData = computed(() => {
  return {
    postTitle: postForm.title ,
    strategy: coverUploadStrategy.value
  }
})

// 上传前验证
const beforeCoverUpload = (file) => {
  if (!postForm.title){
    ElMessage.error('请先填写博客标题');
    return false;
  }
  return true
}

// 上传成功处理
const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  if (response.code === 200) {
    const successCount = response.data.success?.length || 0
    const errorCount = response.data.error?.length || 0
    
    // 添加成功文件
    if (successCount > 0) {
      response.data.success.forEach(item => {
        postForm.coverImages.push(item.url);
      });
    }

    // 成功提示
    if (errorCount === 0) {
      ElMessage.success(`成功上传全部 ${successCount} 个文件`);
    } else {
      // 收集失败文件名
      const failedFilenames = response.data.error.map(err => err.filename);
      
      // 构建详细错误信息
      const errorDetails = response.data.error.map(err => 
        `文件 ${err.filename}: ${err.error}`
      ).join('\n');

      // 先显示顶部通知
      ElMessage.warning({
        message: `成功上传 ${successCount} 个，失败 ${errorCount} 个`,
        duration: 5000,
        grouping: true
      });

      // 显示详细错误对话框
      ElMessageBox.alert(
        `部分文件上传失败：\n\n${errorDetails}`,
        '上传结果详情',
        {
          confirmButtonText: '知道了',
          type: 'warning',
          customClass: 'upload-error-dialog',
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        // 用户确认后自动移除失败文件
        coverFileList.value = coverFileList.value.filter(file => 
          !failedFilenames.includes(file.name) && 
          !failedFilenames.includes(file.raw?.name)
        );
      });
    }
  } else {
    ElMessage.error(response?.msg || '图片上传失败')
  }
}

// 上传失败处理
const handleUploadError = (error, uploadFile, uploadFiles) => {
  console.error('上传封面出错:', error)
  ElMessage.error('封面上传失败')
}

// 处理封面图片预览
const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

// 处理封面图片移除
const handleRemove = (file) => {
  postForm.coverImages = postForm.coverImages.filter(
    imgUrl => imgUrl !== file.url
  );
}

// Markdown编辑器图片上传处理函数
const handleUploadImage = async (event, insertImage, files) => {
  try {
    const postTitle = postForm.title 
      if (!postTitle) {
        ElMessage.error('请先填写博客标题');
        return;
      }
      // 上传每张图片
      const res = await uploadImage(
        files, 
        postTitle,
        markdownImageUploadStrategy.value
      )
      // console.log('Markdown图片上传响应:', res)
      if (res.code === 200) {
        const result = res.data
        // 在编辑器中插入图片引用
        res.data.success.forEach(item => {
          insertImage({
          url: item.markdownPath,
          desc: item.fileName
        })
      });
        
        ElMessage.success('图片上传成功')
      } else {
        ElMessage.error(res.msg || '图片上传失败')
      }
  } catch (error) {
    console.error('上传图片出错:', error)
    ElMessage.error('图片上传失败，请检查网络连接')
  }
}

// 编辑器内容变化
const handleEditorChange = (text) => {
  postForm.content = text
}

// 保存草稿
const saveAsDraft = () => {
  postForm.status = 0
  savePost()
}

// 发布文章
const publishPost = () => {
  postForm.status = 1
  savePost()
}

// 保存文章
const savePost = () => {
  postFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请完善表单信息')
      return
    }

    try {
      // 构建请求数据
      const postData = {
        title: postForm.title,
        content: postForm.content,
        summary: postForm.summary,
        coverImage: postForm.coverImage,
        categoryId: postForm.categoryId ? Number(postForm.categoryId) : null,
        tagIds: [],
        isTop: postForm.isTop,
        isOriginal: postForm.isOriginal,
        sourceUrl: postForm.sourceUrl,
        status: postForm.status
      }

      // 处理标签ID
      if (postForm.tagIds && postForm.tagIds.length > 0) {
        postData.tagIds = postForm.tagIds
          .filter(id => id !== null && id !== undefined && id !== "null")
          .map(id => Number(id))
          .filter(id => !isNaN(id));
      }

      // 检查内容长度
      if (postData.content && postData.content.length > 65000) {
        ElMessage.warning('文章内容过长，请适当精简');
        return;
      }

      // 从store获取当前登录用户ID
      const userId = store.state.user?.id
      if(!userId){
        ElMessage.error('用户未登录或登录已过期')
        return
      }
      
      let res
      if (isEdit.value) {
        // 更新文章
        res = await updateBlogPost(userId, postId.value, postData)
      } else {
        // 创建文章
        res = await createBlogPost(userId, postData)
      }
      console.log('保存文章响应:', res)
      if (res && res.code === 200) {
        ElMessage.success(postForm.status === 1 ? '文章发布成功' : '草稿保存成功')
        router.push('/blog/posts') // 路由到文章管理
      } else {
        ElMessage.error(res.msg || '保存失败')
      }
    } catch (error) {
      console.error('保存文章出错:', error)
      ElMessage.error('保存失败，请检查网络连接')
    }
  })
}

// 返回列表
const goBack = () => {
  ElMessageBox.confirm(
    '确定要离开吗？未保存的内容将会丢失',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.push('/blog/posts')
  }).catch(() => {
    // 取消操作
  })
}

// 添加新的响应式变量
const newCategoryName = ref('');
const newTagNames = ref([]);

// 处理分类变化
const handleCategoryChange = async (value) => {
  // 检查是否是新创建的分类（字符串类型）
  if (typeof value === 'string') {
    try {
      // 创建新分类
      const res = await createBlogCategory(value);

      if (res.code === 200) {
        const newCategoryId = res.data;
        ElMessage.success('分类创建成功');

        // 刷新分类列表
        await fetchCategories();

        // 设置选中的分类为新创建的分类
        postForm.categoryId = newCategoryId;
      } else {
        ElMessage.error(res.msg || '创建分类失败');
        // 恢复之前的选择
        postForm.categoryId = null;
      }
    } catch (error) {
      console.error('创建分类出错:', error);
      ElMessage.error('创建分类失败，请检查网络连接');
      postForm.categoryId = null;
    }
  }
};

// 处理标签选择
const handleTagSelect = async (value) => {
  // 找出新创建的标签（字符串类型）
  const newTags = value.filter(item => typeof item === 'string');
  const existingTags = value.filter(item => typeof item === 'number');

  // 保存现有标签ID
  postForm.tagIds = existingTags;

  // 处理新创建的标签
  for (const tagName of newTags) {
    try {
      // 创建新标签
      const res = await createBlogTag(tagName);

      if (res.code === 200) {
        const newTagId = res.data;
        ElMessage.success(`标签"${tagName}"创建成功`);

        // 将新标签ID添加到选中列表
        postForm.tagIds.push(newTagId);

        // 刷新标签列表
        await fetchTags();
      } else {
        ElMessage.error(res.msg || `创建标签"${tagName}"失败`);
      }
    } catch (error) {
      console.error(`创建标签"${tagName}"出错:`, error);
      ElMessage.error(`创建标签"${tagName}"失败，请检查网络连接`);
    }
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchCategories()
  fetchTags()
  if (isEdit.value) {
    fetchPostDetail().then(() => {
      // 如果有封面图片，初始化封面图片列表
      if (postForm.coverImage) {
        coverFileList.value = [{
          name: '封面图片',
          url: postForm.coverImage
        }]
      }
    })
  }
})
</script>

<style scoped>
.blog-post-edit-container {
  padding: 10px;
  background-color: #FFEAD6;
  /* background-color: #234b6f; */
  box-shadow: 0px 0px 10px #666;
  border-radius: 4px;
}

h2 {
  color: #666;
  text-shadow: 0px 0px 20px red;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* 表单 */
.post-form {
  /* background-color: #fff; */
  padding: 20px;
}

/* Markdown */
.editor-container {
  border: 1px solid #dcdfe6;
  width: 100%;
  /* height: 500px; */
}

/* 添加冲突策略选择器样式 */
.conflict-strategy-selector {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.conflict-strategy-selector span {
  margin-right: 10px;
}

/* 封面图片 */
</style>