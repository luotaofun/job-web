import axios from 'axios';
import store from '@/store';
/*
Axios 的核心设计允许通过传递配置对象来动态定义请求行为。
当你调用 instance(config) 时，Axios 会将 config 合并到实例的默认配置中（如 baseURL 和 timeout），然后发起请求。
调用 request(config) 发起 HTTP 请求。
如果请求成功，进入 .then 回调，response 是 Axios 返回的响应对象。
如果请求失败（如网络错误或服务器返回错误状态码），进入 .catch 回调.
*/
// 声明函数并将其导出，以便在其他模块中使用。config 参数是一个对象，包含请求的配置信息。
export function request(config){
    // 创建Axios的实例本质上是一个函数，可以直接接收一个配置对象（config）作为参数，并根据该配置发起 HTTP 请求。
    const instance = axios.create({
        baseURL:"", // 请求的基础 URL
        timeout:8000,// 请求超时时间
    })
    
    // 请求拦截器 - 添加token到请求头
  instance.interceptors.request.use(
    config => {
      // 从store获取token
      const token = store.getters.getToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )
  
  /*
    - 请求拦截器：自动添加token到请求头
    - 响应拦截器：统一处理错误（特别是401未授权错误）
    - 自动保存响应中的token到store
  */
  instance.interceptors.response.use(
    response => {
      // 如果响应数据中有token，保存到store
      if (response.data.token) {
        store.commit('SET_TOKEN', response.data.token)
      }
      return response.data
    },
    error => {
      // 处理401未授权错误
      if (error.response && error.response.status === 401) {
        store.dispatch('logout')
        // 可以在这里添加跳转到登录页的逻辑
      }
      return Promise.reject(error.response?.data || error.message)
    }
  )
    
    return instance(config); //使用刚刚创建的 Axios 实例发送请求。Axios 实例会根据这些配置发送请求，并返回一个 Promise，该 Promise 解析为响应数据。
}
