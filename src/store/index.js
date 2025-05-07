import { createStore } from 'vuex'
import { login, getUserInfo ,getActiveCarousels} from '@/utils/apis'
import { shuffleArray } from '@/utils/shuffleArray'
import {ElMessage} from 'element-plus'
/*
状态管理设计 ：

- 使用Vuex集中管理用户状态（user）、登录状态（isAuthenticated）和token
- 通过getters提供状态访问接口
- 通过mutations提供状态修改方法
- 通过actions封装业务逻辑（登录、注销、检查登录状态）
*/
export default createStore({
  state: {
    // 用户信息
    user: null,
    // 登录状态
    isAuthenticated: false,
    // token
    token: null,
    // 统一存储图片资源的对象
    images: {
      banner: [],       // 轮播图
      sidebarBg: [],    // 侧边栏背景
      loginBg: [],       // 登录页背景
      avatar: []        // 头像
    },
    // 标记图片资源是否已加载
    imagesLoaded: false
  },
  getters: {
    // 获取当前用户信息
    currentUser: state => state.user,
    // 获取登录状态
    isAuthenticated: state => state.isAuthenticated,
    // 获取token
    getToken: state => state.token,
    // 获取所有图片
    getAllImages: state => state.images,
    // 获取轮播图 (Banner)
    getBanners: state => state.images.banner,
    // 获取侧边栏背景图
    getSidebarBackgrounds: state => state.images.sidebarBg,
    // 获取登录页背景图
    getLoginBackgrounds: state => state.images.loginBg,
    // 获取头像
    getAvatar: state => state.images.avatar,
    // 检查图片是否已加载
    areImagesLoaded: state => state.imagesLoaded
  },
  mutations: {
    // 设置用户信息
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user //!! 用于将任意值转换为布尔值
      // console.log(state.user, state.isAuthenticated) 
    },

    // 设置Token
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token) // 持久化存储 Token
      // console.log(state.token)
    },
    // 清除用户状态和Token
    CLEAR_USER(state) {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      localStorage.removeItem('token') // 清除本地存储的 Token
    },
    /**
     * 设置图片资源，并按类型分类
     * @param {Object} state
     * @param {Array} imageList 从 API 获取的原始图片列表
     */
    SET_IMAGES(state, imageList) {
      // 先清空旧数据
      state.images.banner = []
      state.images.sidebarBg = []
      state.images.loginBg = []
      state.images.avatar = []

      if (imageList && Array.isArray(imageList)) {
        imageList.forEach(img => {
          if (img.type === 'banner') {
            state.images.banner.push(img)
          } else if (img.type === 'sidebar-bg') {
            state.images.sidebarBg.push(img)
          } else if (img.type === 'login-bg') { 
            state.images.loginBg.push(img)
          } else if (img.type === 'avatar') { 
            state.images.avatar.push(img)
          }
        })

        // 对背景图进行随机排序 
        shuffleArray(state.images.sidebarBg)
        shuffleArray(state.images.loginBg)
      }
      // console.log('Vuex images updated:', state.images);
    },
    /**
     * 设置图片加载状态
     * @param {Object} state
     * @param {Boolean} loaded
     */
    SET_IMAGES_LOADED(state, loaded) {
      state.imagesLoaded = loaded
    }

  },
  actions: {
    /**
     * 用户登录
     * @param {Object} context - Vuex上下文
     * @param {Object} loginData - 登录数据 {username, password}
     */
    async login({ commit }, loginData) {
      try {
        // 调用登录API
        const response = await login(loginData)
        // console.log('封装了token和用户信息的LoginResponseVo:', response.data)
        /*
          public class LoginResponseVo {
              private UserInfoVo userInfo;
              private String token;
          }
        */
        // 检查token是否存在
        if ( !response.data) {
          commit('CLEAR_USER')
          throw new Error('登录失败：无效的token')
          }
        // 保存token到Vuex
        commit('SET_TOKEN', response.data.token)
        
        // 获取用户信息并保存到Vuex
        const userId = Number(response.data.userInfo.id)
        const userInfoResponse = await getUserInfo(userId) //调用api获取完整的用户信息
        // console.log('封装了完整用户信息的UserInfoVo:', userInfoResponse)
        commit('SET_USER', userInfoResponse.data)
        
        return Promise.resolve(response)
      } catch (error) {
        commit('CLEAR_USER')
        return Promise.reject(error)
      }
    },
    
     /**
     * 用户注销
     * @param {Object} context - Vuex上下文
     */
     logout({ commit }) {
      // 清除用户信息和token
      commit('CLEAR_USER')
      // 可以在这里添加调用注销API的逻辑
      return Promise.resolve()
    },
    
    /**
     * 检查登录状态
     * @param {Object} context - Vuex上下文
     */
    async checkAuth({ commit }) {
      try {
        // 检查本地是否有token
        const token = localStorage.getItem('token')
        if (token) {
          commit('SET_TOKEN', token)
          // 如果有token，设置token和用户信息
          const userInfoResponse = await getUserInfo()
          if (userInfoResponse && userInfoResponse.code === 200) {
            commit('SET_USER', userInfoResponse.data)
          }else{
            commit('CLEAR_USER')
          }
        }
        return Promise.resolve()
      } catch (error) {
        commit('CLEAR_USER')
        return Promise.reject(error)
      }
    },


    /**
     * 获取所有图片资源 (轮播图、背景图等)
     * @param {Object} context - Vuex 上下文 { commit, state }
     */
    async fetchImages({ commit, state }) {
      // return Promise.resolve()
      // 如果已经加载过，就不再重复加载 (除非强制刷新)
      if (state.imagesLoaded) {
        // console.log('图片资源已加载，跳过 fetchImages');
        return Promise.resolve();
      }

      try {
        const response = await getActiveCarousels() // 调用 API 获取所有类型的图片
        // console.log('获取所有图片资源:', response)
        if (response && response.code === 200) {
          // 调用 mutation 来设置和分类图片
          commit('SET_IMAGES', response.data)
          // 标记为已加载
          commit('SET_IMAGES_LOADED', true)
          return Promise.resolve(response.data);
        } else {
          ElMessage.error(response.msg || '获取图片资源失败')
          commit('SET_IMAGES', []) // 失败时设置为空
          // 注意：这里不设置 imagesLoaded 为 true，允许后续重试
          return Promise.reject(new Error(response.msg || '获取图片资源失败'));
        }
      } catch (error) {
        console.error('获取图片资源异常:', error)
        ElMessage.error('获取图片资源时发生网络错误')
        commit('SET_IMAGES', []) // 失败时设置为空
        // 注意：这里不设置 imagesLoaded 为 true，允许后续重试
        return Promise.reject(error);
      }
    }

  },
  modules: {
  }
})