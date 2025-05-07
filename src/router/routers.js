export const constantRouter = [
  {
    path: '/',
    name: 'BlogHome',
    component: () => import('@/views/blog/BlogHome.vue'),
    meta: {
      title: '博客首页'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/blog/Login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/post/:id',
    name: 'BlogPostDetail',
    component: () => import('@/views/blog/BlogPostDetail.vue'),
    meta: {
      title: '文章详情'
    }
  },
  // 管理路由
  {
    path: '/control',
    name: 'Control',
    component: () => import('@/views/Control.vue'),
    meta: {
      title: '控制台'
    }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('@/views/Analysis.vue'),
    meta: {
      title: '数据分析'
    }
  },
  {
    path: '/dataList',
    name: 'DataList',
    component: () => import('@/views/DataList.vue'),
    meta: {
      title: '数据列表'
    }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue'),
    meta: {
      title: '数据统计'
    }
  },
  // 博客管理路由
  {
    path: '/blog',
    name: 'Blog',
    redirect: '/blog/posts',
    meta: {
      title: '博客管理'
    },
    children: [
      {
        path: 'posts',
        name: 'BlogPosts',
        component: () => import('@/views/blog/BlogPosts.vue'),
        meta: {
          title: '文章管理'
        }
      },
      {
        path: 'post/create',
        name: 'BlogPostCreate',
        component: () => import('@/views/blog/BlogPostEdit.vue'),
        meta: {
          title: '创建文章'
        }
      },
      {
        path: 'post/edit/:id', // 路径中的动态参数：通过 route.params 可以获取在路由定义中使用占位符（如 :id）来表示可以变化的部分
        name: 'BlogPostEdit',
        component: () => import('@/views/blog/BlogPostEdit.vue'),
        meta: {
          title: '编辑文章'
        }
      },
      {
        path: 'categories',
        name: 'BlogCategories',
        component: () => import('@/views/blog/BlogCategories.vue'),
        meta: {
          title: '分类管理'
        }
      },
      {
        path: 'tags',
        name: 'BlogTags',
        component: () => import('@/views/blog/BlogTags.vue'),
        meta: {
          title: '标签管理'
        }
      },
      {
        path: 'recycle',
        name: 'BlogRecycle',
        component: () => import('@/views/blog/BlogRecycle.vue'),
        meta: {
          title: '回收站'
        }
      }
    ]
  },
 
]