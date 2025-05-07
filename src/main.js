import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
// 引入element-plus组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import VueMarkdownEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

import Prism from 'prismjs';

VueMarkdownEditor.use(vuepressTheme, {
  Prism,
});
// 定义特性标志解决控制台警告：在生产环境中，为了获得更好的树摇优化，Vue 需要特定的特性标志，以减小生成的生产包的大小。
window.__VUE_PROD_DEVTOOLS__ = false;
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(store) // vuex状态管理
app.use(router)
app.use(ElementPlus)
app.use(VueMarkdownEditor)

app.mount('#app') // 绑定到id为app的元素上
