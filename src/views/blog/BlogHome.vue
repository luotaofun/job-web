<template>

  <div class="blog-home">
    <!-- 轮播图 -->
    <div class="banner" v-if="bannerList.length > 0">
      <el-carousel height="400px" :interval="5000" arrow="always" indicator-position="outside">
        <!-- 遍历从后端获取的轮播图列表 -->
        <el-carousel-item v-for="banner in bannerList" :key="banner.id" @click="handleBannerClick(banner)">
          <!-- 使用 banner.imageUrl 作为背景图 -->
          <div class="banner-content">
            <img :src="banner.imageUrl" :alt="banner.title" class="banner-image">
            <div class="banner-info">
              <!-- 显示标题和描述 -->
              <h2 class="banner-title">{{ banner.title }}</h2>
              <p class="banner-description">{{ banner.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="main-content">
      <!-- 左侧文章列表 -->
      <div class="article-list">
        <div class="section-title">
          <i class="el-icon-document"></i>
          <h2>最新文章</h2>
        </div>

        <div class="article-cards">
          <div v-for="post in postList" :key="post.id" class="article-card" @click="viewDetail(post.id)">
            <div class="article-cover">
              <el-image v-if="post.coverImage" :src="post.coverImage" fit="cover" class="cover-image" :alt="post.title">
                <template #error>
                  <div class="image-placeholder">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="article-info">
              <h3 class="article-title">{{ post.title }}</h3>
              <p class="article-summary">{{ post.summary || truncateContent(post.content) }}</p>
              <div class="article-meta">
                <span class="meta-item">
                  <i class="el-icon-date"></i>
                  {{ formatDate(post.createTime) }}
                </span>
                <span class="meta-item">
                  <i class="el-icon-view"></i>
                  {{ post.viewCount || 0 }} 阅读
                </span>
                <span class="meta-item">
                  <i class="el-icon-chat-dot-square"></i>
                  {{ post.commentCount || 0 }} 评论
                </span>
              </div>
              <div class="article-tags" v-if="post.tags && post.tags.length">
                <el-tag v-for="tag in post.tags" :key="tag" size="small" effect="plain" class="tag-item">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination background layout="prev, pager, next" :total="totalPosts" :page-size="pageSize"
            :current-page="currentPage" @current-change="handlePageChange" />
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 个人信息卡片-->
        <div class="sidebar-card author-card">
          <div class="author-avatar">
            <el-avatar :size="80" :src="authorInfo.avatar" :alt="authorInfo.name"></el-avatar>
          </div>
          <h3 class="author-name">{{ authorInfo.name }}</h3>
          <p class="author-description">{{ authorInfo.description }}</p>
          <div class="author-stats">
            <div class="stat-item">
              <div class="stat-value">{{ authorInfo.articleCount }}</div>
              <div class="stat-label">文章</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ authorInfo.categoryCount }}</div>
              <div class="stat-label">分类</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ authorInfo.tagCount }}</div>
              <div class="stat-label">标签</div>
            </div>
          </div>
          <div class="social-links">
            <a :href="'mailto:' + authorInfo.email" class="social-link" title="邮箱">
              <el-icon>
                <Message />
              </el-icon>
            </a>
            <a :href="authorInfo.socialLinks" class="social-link" title="call">
              <el-icon>
                <Link />
              </el-icon>
            </a>


          </div>
        </div>

        <!-- 热门文章 -->
        <div class="sidebar-card">
          <div class="card-header">
            <i class="el-icon-star-on"></i>
            <h3>热门文章</h3>
          </div>
          <ul class="popular-posts" v-if="popularPosts.length > 0">
            <li v-for="post in popularPosts"
             :key="post.id" class="popular-post-item" 
             @click="viewDetail(post.id)">
              <div class="post-rank">{{ post.rank }}</div>
              <div class="post-info">
                <div class="post-title">{{ post.title }}</div>
                <div class="post-views">{{ post.viewCount || 0 }} 阅读</div>
              </div>
            </li>
          </ul>
          <p v-else class="no-posts">暂无热门文章</p>
        </div>

        <!-- 标签云 -->
        <!-- <div class="sidebar-card">
          <div class="card-header">
            <i class="el-icon-collection-tag"></i>
            <h3>标签云</h3>
          </div>
          <div class="tag-cloud">
            <el-tag v-for="tag in tagCloud" :key="tag.name" :type="tag.type" effect="plain" class="tag-item" :id="tag.id"
              @click="filterByTag(tag.name)">
              {{ tag.name }} ({{ tag.count }})
            </el-tag>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getBlogPosts, recordCarouselClick, getPopularPosts } from '@/utils/apis'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { getAuthorld } from '@/utils/apis'
import { useStore } from 'vuex'
import { launchFireworks } from '@/utils/effects'

const router = useRouter()
const postList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPosts = ref(0)//总页数
// --- 从 Vuex 获取轮播图数据 ---
const store = useStore()
// 获取当前登录用户ID
const currentUserId = computed(() => store.state.user?.id || Number(1));// 如果用户未登录，则默认使用我
const bannerList = computed(() => store.getters.getBanners);

// 新增：处理轮播图点击事件的方法
const handleBannerClick = async (banner) => {
  console.log('点击了轮播图:', banner)
  // 记录点击次数 (异步，不需要等待完成)
  recordCarouselClick(banner.id).catch(err => console.error("记录点击失败:", err));

  // 处理跳转逻辑
  if (banner.linkUrl) {
    // 如果是外部链接
    if (banner.linkUrl.startsWith('http://') || banner.linkUrl.startsWith('https://')) {
      window.open(banner.linkUrl, '_blank') // 在新标签页打开
    } else {
      // 如果是内部路由链接
      router.push(banner.linkUrl)
    }
  } else if (banner.targetType === 'post' && banner.targetId) {
    // 如果是跳转到文章详情
    router.push(`/blog/post/${banner.targetId}`)
  }
  // 可以根据 targetType 添加更多跳转逻辑，比如跳转到活动页面等
}

// 作者信息
const authorInfo = ref({})
// --- 获取作者信息 ---
const fetchAuthorInfo = async () => {
  try {
    const res = await getAuthorld(currentUserId.value)
    //console.log('我的UserInfoVo:', res)
    if (res.code === 200) {
      //个人信息卡片
      authorInfo.value.name = res.data.username
      authorInfo.value.avatar = res.data.avatar
      authorInfo.value.description = res.data.description
      authorInfo.value.articleCount = res.data.articleCount
      authorInfo.value.categoryCount = res.data.categoryCount
      authorInfo.value.tagCount = res.data.tagCount
      authorInfo.value.email = res.data.email
      authorInfo.value.socialLinks = res.data.socialLinks
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}



// 标签云
const tagCloud = ref([
  { name: 'Vue', count: 12, type: '' },
  { name: 'React', count: 8, type: 'success' },
  { name: 'JavaScript', count: 15, type: 'info' },
  { name: 'Spring', count: 10, type: 'warning' },
  { name: 'Java', count: 9, type: 'danger' },
  { name: 'Python', count: 7, type: '' },
  { name: 'Docker', count: 5, type: 'success' },
  { name: '微服务', count: 4, type: 'info' },
  { name: '前端', count: 11, type: 'warning' },
  { name: '后端', count: 9, type: 'danger' }
])
// --- 按标签过滤 ---
const filterByTag = (tagName) => {
  console.log('按标签过滤:', tagName);
  // 跳转到列表页并带上标签参数，或者直接在本页重新获取数据
  // router.push({ path: '/blog', query: { tag: tagName } });
  fetchPosts(1, tagName); // 在当前页重新获取第一页数据，并带上标签
};

// 热门文章
const popularPosts = ref([])
// 获取文章列表
const searchForm = reactive({
  title: '',
  categoryId: '',
  status: ''
})
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
    if (res.code === 200 && res.data) {
      totalPosts.value = res.data.total || 0;
      popularPosts.value = res.data.records.slice(0, 5);//前5条热门

      // 处理文章数据
      postList.value = res.data.records.map(post => ({
        id: post.id,
        title: post.title,
        summary: post.summary,//概要
        content: post.content,
        coverImage: post.coverImage,
        createTime: post.createTime,
        viewCount: post.viewCount,
        commentCount: post.commentCount,
        // tags: post.tags 
      }))
    } else {
      // 如果接口返回错误或没有数据，显示错误信息
      ElMessage.warning('获取文章列表失败: ' + (res.message || '未知错误'))
    popularPosts.value = []; 

    }
  } catch (error) {
    popularPosts.value = []; 

    console.error('获取文章列表失败:', error)
    // 显示错误提示
    ElMessage.error('获取文章列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 生成随机标签（仅用于演示）
const generateRandomTags = () => {
  const allTags = ['Vue', 'React', 'JavaScript', 'Spring', 'Java', 'Python', 'Docker', '微服务', '前端', '后端']
  const count = Math.floor(Math.random() * 3) + 1 // 1-3个标签
  const result = []

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allTags.length)
    if (!result.includes(allTags[randomIndex])) {
      result.push(allTags[randomIndex])
    }
  }

  return result
}

// --- 处理分页改变 ---
const handlePageChange = (page) => {
  fetchPosts(page);
  // 滚动到页面顶部或列表顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- 查看文章详情 ---
const viewDetail = (postId) => {
  router.push(`/post/${postId}`);
};


// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知日期'
  return dayjs(dateStr).format('YYYY-MM-DD')
}

// 内容截断
const truncateContent = (content) => {
  if (!content) return ''
  return content.replace(/<[^>]+>/g, '').substring(0, 100) + '...'
}


onMounted(async () => {
  console.log('onMounted: 开始执行');

  // 检查图片是否已加载，如果未加载则触发获取
  if (!store.getters.areImagesLoaded) {
    // console.log('BlogHome.vue: 图片未加载，尝试获取...');
    await store.dispatch('fetchImages');
  } else {
    // console.log('BlogHome.vue: 图片已加载');
  }
  fetchAuthorInfo();
  fetchPosts();

  console.log('onMounted: 数据获取函数已调用');

  // 仍然建议保留 nextTick，确保页面基本渲染完成
  await nextTick();
  console.log('onMounted: nextTick 完成');

  // --- 调用封装好的烟花函数 ---
  launchFireworks();
});

</script>

<style lang="less" scoped>
.blog-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 轮播图样式 */
.banner {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.banner-content {
  position: relative;
  height: 100%;
  cursor: pointer;
}
.banner-image {
  width: 100%;
  background: no-repeat center center / cover;
}

.banner-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
}

.banner-info h2 {
  margin: 0 0 10px;
  font-size: 24px;
}

.banner-info p {
  margin: 0;
  font-size: 16px;
}

/* 主内容区布局 */
.main-content {
  display: flex;
  gap: 30px;
}

.article-list {
  flex: 1;
}

.sidebar {
  width: 300px;
}

/* 文章列表样式 */
.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title i {
  margin-right: 10px;
  font-size: 20px;
  color: #409EFF;
}

.section-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.article-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
  align-content: center;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.article-cover {
  width: 200px;
  height: 150px;
  overflow: hidden;
}

.cover-image {
  // width: 100%;
  height: 100%;
  background: no-repeat center center / cover;
  transition: transform 0.3s;
}

.article-card:hover .cover-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.article-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.article-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-summary {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-item i {
  margin-right: 5px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag-item {
  cursor: pointer;
}

/* 分页样式 */
.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* 侧边栏样式 */
.sidebar-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header i {
  margin-right: 10px;
  font-size: 18px;
  color: #409EFF;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

/* 作者卡片样式 */
.author-card {
  text-align: center;
}

.author-avatar {
  margin-bottom: 15px;
}

.author-name {
  margin: 0 0 5px;
  font-size: 18px;
  font-weight: 600;
}

.author-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 15px;
}

.author-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f7fa;
  color: #606266;
  font-size: 18px;
  transition: all 0.3s;
}

.social-link:hover {
  background-color: #409EFF;
  color: white;
}

/* 热门文章样式 */
.popular-posts {
  list-style: none;
  padding: 0;
  margin: 0;
}

.popular-post-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.popular-post-item:last-child {
  border-bottom: none;
}

.popular-post-item:hover {
  background-color: #f5f7fa;
}

.post-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #606266;
  font-weight: bold;
  margin-right: 10px;
}

.popular-post-item:nth-child(1) .post-rank {
  background-color: #f56c6c;
  color: white;
}

.popular-post-item:nth-child(2) .post-rank {
  background-color: #e6a23c;
  color: white;
}

.popular-post-item:nth-child(3) .post-rank {
  background-color: #409EFF;
  color: white;
}

.post-info {
  flex: 1;
}

.post-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-views {
  font-size: 12px;
  color: #909399;
}

/* 标签云样式 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .blog-home {
    padding: 0 15px; /* 调整：给最外层容器设置统一的左右内边距 */
  }
  .main-content {
    flex-direction: column;
    gap: 0; /* 移除 main-content 内部的 flex gap */
  }

  .sidebar {
    width: 100%;
    order: 1;
    margin-bottom: 20px; /* 新增：给侧边栏下方添加间距 */
  }

  .article-list {
    order: 2;
    width: 100%; /* 确保文章列表也占满宽度 */
  }

  /* 确保侧边栏卡片之间有间距 */
  .sidebar-card {
     margin-bottom: 20px;
  }
  .sidebar-card:last-child {
     margin-bottom: 0; /* 最后一个卡片不需要下边距 */
  }

  /* 注意：之前的 .article-cover width: 100% 规则移到 max-width: 768px 中 */
  /* 如果你希望在平板尺寸（<992px）封面就占满宽度，可以取消下面的注释 */
  /*
  .article-card {
    flex-direction: column;
  }
  .article-cover {
    width: 100%;
    height: 180px; // 或者你想要的高度
  }
  .article-info {
    width: 100%;
  }
  */
}

@media (max-width: 768px) {
  .blog-home {
    padding: 0 10px; /* 调整：在更小的屏幕上，进一步减小左右内边距 */
  }

  .main-content {
     padding: 0; /* 移除：移除 main-content 的内边距 */
  }

  .article-list, .sidebar {
    padding: 0; /* 移除：移除列表和侧边栏容器的内边距 */
    /* width: 100% 和 box-sizing: border-box 会继承或已设置 */
  }

  .sidebar {
     margin-bottom: 15px; /* 调整侧边栏下方间距 */
  }

   .sidebar-card {
     margin-left: 0; /* 确保卡片在容器内不偏移 */
     margin-right: 0;
     border-radius: 8px; /* 可以统一或调整卡片圆角 */
     /* 卡片内部的 padding 保持不变，用于内容间距 */
   }

  .article-card {
    margin-bottom: 15px;
    flex-direction: column; /* 图片和文字上下排列 */
    border-radius: 8px; /* 统一或调整卡片圆角 */
    overflow: hidden; /* 确保封面圆角生效 */
  }

  .article-cover {
    width: 100%; /* 封面宽度占满 */
    height: 180px; /* 调整封面高度 */
    border-radius: 8px 8px 0 0; /* 新增：只给图片上方设置圆角 */
  }

  .article-info {
    width: 100%; /* 内容宽度占满 */
    padding: 15px; /* 保持内容区域的内边距 */
    box-sizing: border-box; /* 确保内边距不影响宽度计算 */
  }

  .pagination-container {
    margin-top: 20px; /* 调整分页的上边距 */
    padding: 0 10px; /* 新增：给分页器左右留出空间，避免贴边 */
  }

  /* 调整轮播图高度 */
  .el-carousel {
    height: 200px !important;
  }
}

@media (max-width: 576px) {
   .blog-home {
     padding: 0 5px; /* 调整：在非常小的屏幕上，进一步减小左右内边距 */
   }
   .article-cover {
     height: 160px; /* 可以为更小屏幕调整封面高度 */
   }
   .el-carousel {
     height: 180px !important; /* 调整轮播图高度 */
   }
    .pagination-container {
      padding: 0 5px; /* 调整分页器边距 */
    }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .el-carousel {
    height: 150px !important; /* 再次调整轮播图高度 */
  }
  .article-cover {
     height: 150px; /* 调整封面高度 */
   }
  /* ... 其他可能需要的微调 ... */
}
</style>