// 业务请求
import{request} from './axiosConfig';
// `vue.config.js`中配置了代理解决跨域。前端请求时url带该前缀时走代理请求到target指定的后端服务器上，并且请求路径中的该前缀被去掉，还原成后端接口原来的路径。
const prefix ='/api'
// 请求分页查询岗位数据的接口,参数page是想要获取第几页，即当前选中页码
export function getJobListData(page){
    return request({
        url:prefix + '/job/v1/page/' + page,
        method:'get'
    })
}

// 封装按类别统计的业务请求
export function getJobByCategory(){
    return request({
        url:prefix + '/job/v1/category/statistics',
        method:'get'
    })
}

// 封装按城市统计的业务请求
export function getJobByCity(){
    return request({
        url:prefix + '/job/v1/city/statistics',
        method:'get'
    })
}
// 封装按城市统计的业务请求
export function getJobByProvince(){
    return request({
        url:prefix + '/job/v1/province/statistics',
        method:'get'
    })
}

// =================== 博客管理相关API ===================

// 博客文章相关API
// 获取文章列表
export function getBlogPosts(queryParams) {
    return request({
        url: prefix + '/blog/posts',
        method: 'get',
        params: queryParams
    })
}

// 获取文章详情
export function getBlogPostDetail(postId, increaseViewCount = true) {
    return request({
        url: prefix + `/blog/posts/${postId}`,
        method: 'get',
        params: { increaseViewCount }
    })
}

// 创建文章
export function createBlogPost(userId, postData) {
    return request({
        url: prefix + '/blog/posts',
        method: 'post',
        params: { userId },// 查询参数 如/api/blog/posts?userId=1。
        data: postData
    })
}

// 更新文章
export function updateBlogPost(userId, postId, postData) {
    return request({
        url: prefix + `/blog/posts/${postId}`,
        method: 'put',
        params: { userId },
        data: postData
    })
}


// 永久删除文章
export function deleteBlogPost(userId, postId) {
    return request({
        url: prefix + `/blog/posts/${postId}`,
        method: 'delete',
        params: { userId }
    })
}
// 将文章移至回收站
export function moveBlogPostToRecycleBin(userId, postId) {
    return request({
        url: prefix + `/blog/posts/${postId}/recycle`,
        method: 'put',
        params: { userId }
    })
}

// 恢复文章从回收站
export function restoreBlogPostFromRecycleBin(userId, postId) {
    return request({
        url: prefix + `/blog/posts/${postId}/restore`,
        method: 'put',
        params: { userId }
    })
}

// 获取用户的文章列表
export function getUserBlogPosts(userId, status) {
    return request({
        url: prefix + `/blog/posts/user/${userId}`,
        method: 'get',
        params: { status }
    })
}

// 博客分类相关API
// 获取所有分类
export function getBlogCategories() {
    return request({
        url: prefix + '/blog/categories',
        method: 'get'
    })
}

/**
 * 创建博客分类
 * @param {string} name - 分类名称
 * @param {string} description - 分类描述
 * @param {number} sort - 排序
 * @returns {Promise} - 请求Promise
 */
export function createBlogCategory(name, description = '', sort = 0) {
    return request({
        url: prefix + '/blog/categories',
        method: 'post',
        data: { 
            name,
            description,
            sort
        }
    })
}

// 更新分类
export function updateBlogCategory(categoryId, name, description, sort) {
    // 确保 categoryId 是数值类型
    categoryId = Number(categoryId);
    
    // 只传递非空参数
    const params = {};
    if (name !== undefined && name !== null) params.name = name;
    if (description !== undefined && description !== null) params.description = description;
    if (sort !== undefined && sort !== null) params.sort = sort;
    
    return request({
        url: prefix + `/blog/categories/${categoryId}`,
        method: 'put',
        params: params
    })
}

// 删除分类
export function deleteBlogCategory(categoryId) {
    return request({
        url: prefix + `/blog/categories/${categoryId}`,
        method: 'delete'
    })
}

// 博客标签相关API
// 获取所有标签
export function getBlogTags() {
    return request({
        url: prefix + '/blog/tags',
        method: 'get'
    })
}

// 创建博客标签
export function createBlogTag(name) {
    return request({
        url: prefix + '/blog/tags',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            name: name
        }
    })
}

// 更新标签
export function updateBlogTag(tagId, name) {
    return request({
        url: prefix + `/blog/tags/${tagId}`,
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            name: name
        }
    })
}

// 删除标签
export function deleteBlogTag(tagId) {
    return request({
        url: prefix + `/blog/tags/${tagId}`,
        method: 'delete'
    })
}

// 获取文章的标签
export function getBlogPostTags(postId) {
    return request({
        url: prefix + `/blog/tags/post/${postId}`,
        method: 'get'
    })
}

/**
 * 上传图片文件
 * @param {File[]} files - 图片文件数组
 * @param {string} postTitle - 博客文章标题
 * @param {string} strategy - 冲突处理策略
 * @returns {Promise} - 请求Promise
 */
export function uploadImage(files, postTitle, strategy = 'REJECT') {
    const formData = new FormData();
    // 添加多个文件到FormData
    Array.from(files).forEach(file => {
        formData.append('files', file); 
    });
    formData.append('postTitle', postTitle);
    formData.append('strategy', strategy);
    
    return request({
      url: prefix + '/file/image',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData,
    });
  }

/**
 * 上传Markdown文件
 * @param {File} file - Markdown文件
 * @param {string} strategy - 冲突处理策略
 * @returns {Promise} - 请求Promise
 */
export function uploadMarkdown(file, strategy = 'REJECT') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('strategy', strategy)
  
  return request({
    url: prefix + '/file/markdown',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}

/**
 * 读取Markdown文件内容
 * @param {string} filePath - 文件相对路径
 * @returns {Promise} - 请求Promise
 */
export function readMarkdownContent(filePath) {
  return request({
    url: prefix + '/file/markdown',
    method: 'get',
    params: { filePath }
  })
}

// =================== 用户相关API ===================
// 用户登录
export function login(loginData) {
    return request({
      url: prefix + '/user/login',
      method: 'post',
      data: loginData
    })
  }
  
  // 获取用户信息
  export function getUserInfo(userId) {
    return request({
      url: prefix + '/user/' + userId,
      method: 'get'
    })
  }
  
  // 用户注册
  export function register(registerData) {
    return request({
      url: prefix + '/user/register',
      method: 'post',
      data: registerData
    })
  }
  
  // 用户注销
  export function logout() {
    return request({
      url: prefix + '/user/logout',
      method: 'post'
    })
  }


// 获取作者信息
export function getAuthorld(authorId) {
    return request({
      url: prefix + '/blog/posts/author/' + authorId,
      method: 'get'
    })
  }


  // =================== 轮播图相关API ===================

    // 获取所有启用的轮播图 (给前台展示)
    export function getActiveCarousels() {
        return request({
          url: prefix + '/blog/carousel', // 对应后端的 @GetMapping
          method: 'get',
        })
      }
  
      // 分页获取所有轮播图（给后台管理）
      export function getAllCarouselsForAdmin(page = 1, pageSize = 10) {
        return request({
          url: prefix + '/blog/carousel/admin', // 对应后端的 @GetMapping("/admin")
          method: 'get',
          params: { page, pageSize } // 将分页参数放在 params 中
        })
      }
  
      // 获取单个轮播图详情
      export function getCarouselById(id) {
        return request({
          url: prefix + `/blog/carousel/${id}`, // 对应后端的 @GetMapping("/{id}")
          method: 'get'
        })
      }
  
      // 添加轮播图
      export function addCarousel(carouselData) {
        return request({
          url: prefix + '/blog/carousel', // 对应后端的 @PostMapping
          method: 'post',
          data: carouselData // 将轮播图数据放在 data 中 (请求体)
        })
      }
  
      // 更新轮播图
      export function updateCarousel(id, carouselData) {
        return request({
          url: prefix + `/blog/carousel/${id}`, // 对应后端的 @PutMapping("/{id}")
          method: 'put',
          data: carouselData // 将轮播图数据放在 data 中 (请求体)
        })
      }
  
      // 删除轮播图
      export function deleteCarousel(id) {
        return request({
          url: prefix + `/blog/carousel/${id}`, // 对应后端的 @DeleteMapping("/{id}")
          method: 'delete'
        })
      }
  
      // 更新轮播图状态（启用/禁用）
      export function updateCarouselStatus(id, status) {
        return request({
          url: prefix + `/blog/carousel/${id}/status`, // 对应后端的 @PutMapping("/{id}/status")
          method: 'put',
          params: { status } // 将状态参数放在 params 中
        })
      }
  
      // 记录轮播图点击
      export function recordCarouselClick(id) {
        return request({
          url: prefix + `/blog/carousel/${id}/click`, // 对应后端的 @PutMapping("/{id}/click")
          method: 'put'
        })
      }

    // =================== 获取热门文章列表 ===================
    export function getPopularPosts(limit = 5) {
      return request({
          url: prefix + '/blog/posts/popular',
          method: 'get',
          params: { limit }
      })
  }