import { createRouter, createWebHashHistory } from 'vue-router'
import {constantRouter} from '@/router/routers'
import store from '@/store'

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRouter
})

//路由导航守卫
router.beforeEach((to, from, next) => {
//    // 从store获取登录状态
//    const isLogin = store.getters.isAuthenticated
   document.title = to.meta.title 
//    if (isLogin) {
       next()
//    } else {
//      // 如果未登录且目标路由不是登录页面和控制台，则重定向到登录页面
//      if (to.name !== 'Login'&& to.name !== 'Control') {
//         next('/login');
//       } else {
//         next();
//       }
//    }

})


export default router
