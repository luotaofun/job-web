<template>
  <meta name="referrer" content="never">

  <div class="common-layout">
    <div class="container">
      <!-- 头部 -->
      <header class="header">
        <Header></Header>
        <!-- 移动端菜单按钮 -->
        <div v-if="isMobile" class="mobile-menu-toggle" @click="toggleMobileSidebar">
          <el-icon><Menu /></el-icon>
        </div>
      </header>

      <div class="container-body">
        <!-- 左侧边栏 -->
        <aside
          class="aside"
          v-if="showSidebar"
          :class="{ 'collapsed': isCollapse, 'mobile-aside': isMobile }"
          :style="{
            width: isCollapse ? '50px' : (isMobile ? '100%' : '220px'),
            background: sidebarBgUrl ? `url(${sidebarBgUrl}) no-repeat center center / cover` : '#1f2d3d' 
          }"
        >
          <div v-if="isMobile && !isCollapse" class="mobile-overlay" @click="closeMobileSidebar"></div>

          <div class="sidebar-content">
            <div class="aside-toggle" @click="toggleAside">
              <span class="icon-wrapper">
                <el-icon v-if="isCollapse"><Expand /></el-icon>
                <el-icon v-else><Fold /></el-icon>
              </span>
            </div>
            <LeftMenu :collapse="isCollapse" @close-menu="closeMobileSidebar"></LeftMenu>
          </div>
        </aside>
        <!-- 主体内容 -->
        <main class="main" :style="{ marginLeft: mainMarginLeft }">
          <!-- 路由视图 -->
          <router-view/>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import LeftMenu from '@/components/LeftMenu.vue'
import { useStore } from 'vuex'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Expand, Fold, Menu } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core' // 引入防抖函数

const store = useStore();
const route = useRoute();

// --- Responsive State ---
const isMobile = ref(window.innerWidth <= 768);
const updateMobileState = useDebounceFn(() => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    isCollapse.value = false; // 在桌面模式下重置折叠状态
  }
}, 200);

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', updateMobileState);
  
  // 检查用户登录状态
  store.dispatch('checkAuth');
  // 触发获取所有图片的操作
  store.dispatch('fetchImages');
});

// 在组件卸载时移除事件监听
const onUnmounted = () => {
  window.removeEventListener('resize', updateMobileState);
};

// --- Sidebar State ---
const isCollapse = ref(true);
const showSidebar = computed(() => {
  return sidebarBgUrl.value || true; // 如果有背景图或者其他条件满足就显示
});

// 计算主内容区域的左边距
const mainMarginLeft = computed(() => {
  if (isMobile.value) return '0px'; // 移动端不需要边距
  return isCollapse.value ? '50px' : '220px'; // 桌面端根据侧边栏状态设置边距
});

// --- 从 Vuex 获取侧边栏背景图 ---
const sidebarBgList = computed(() => store.getters.getSidebarBackgrounds);
const sidebarBgUrl = computed(() => {
  if (sidebarBgList.value && sidebarBgList.value.length > 0) {
    return sidebarBgList.value[0].imageUrl;
  }
  return null;
});

// 切换侧边栏折叠状态
const toggleAside = () => {
  isCollapse.value = !isCollapse.value;
};

// 移动端专用：打开/关闭侧边栏
const toggleMobileSidebar = () => {
  if (isMobile.value) {
    isCollapse.value = !isCollapse.value;
  }
};

// 移动端专用：关闭侧边栏
const closeMobileSidebar = () => {
  if (isMobile.value) {
    isCollapse.value = true;
  }
};

// debounce 防抖函数: 限制一个函数的执行频率，确保在一定时间间隔内只执行一次
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  }
}

// 将原始的ResizeObserver保存为_ResizeObserver
const _ResizeObserver = window.ResizeObserver;

// 定义新的ResizeObserver类，重写构造函数，将防抖逻辑集成到其构造函数中
// 在新的构造函数中，传入的回调函数被debounce函数处理，确保回调函数在16毫秒的间隔时间内执行一次
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 16);
    super(callback);
  }
}
</script>

<style lang="less">
.container {
  display: flex;
  flex-direction: column; /*主轴方向从上到下排列*/
}
.header {
  background-color: rgba(35, 75, 111, 1);
  height: 60px; /* 确保 header 高度固定 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10; // 确保在最上层
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.container-body {
  display: flex;
  flex: 1; /*简写flex110 可以拉伸，可以压缩，基准长度为0 */
  overflow: hidden; // 防止内部滚动条影响布局
}

/*
侧边栏
*/
.aside {
  // background-repeat: no-repeat;
  // background-position: center center;
  // background-size: cover;
  // background-size: 100% 100%;
  // background-size: contain;
  height: calc(100vh - 60px);
  position: relative; // 为了定位切换按钮
  transition: width 0.3s ease, background-image 0.5s ease; // 侧边栏收缩过度
  position: relative;
  overflow: hidden;// 折叠时隐藏菜单内容
  display: flex;
  flex-direction: column; // 垂直排列
  z-index: 10;
  
  /* 添加半透明遮罩 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(48, 65, 86, 0.5);  
    z-index: 0;
  }
  
/* 侧边栏折叠按钮 */
  .aside-toggle {
    height: 20px;
    background-color: rgba(31, 45, 61, 0.8);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
    &:hover {
      background-color: rgba(0, 0, 0, 0.6);
    }
  }

  .el-icon {
    color: #fff;
  }

  // /* 菜单样式 */
  .el-menu {
    flex-grow: 1; // 让菜单填充剩余空间
    background-color: transparent !important;  /* 菜单背景透明 */
    border-right: none !important; // 去掉自带的右边框
  }
}

.main {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 60px); 
  background-color: #f0f2f5; // 主内容区背景色
  z-index: 0;
}

/* 优化滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #99a9bf;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f0f2f5;
}

/* 添加移动端适配 */
@media (max-width: 768px) {
  .header {
    .mobile-menu-toggle {
      display: block; // 在移动端显示菜单按钮
    }
  }
  
  .container-body {
    position: relative; // 为绝对定位的侧边栏提供参考
  }
  
  .aside {
    position: fixed; // 固定定位
    top: 60px; // 头部高度
    left: 0;
    height: calc(100vh - 60px) !important; // 覆盖内联样式
    transform: translateX(-100%); // 默认隐藏在屏幕左侧
    transition: transform 0.3s ease, width 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    
    &.mobile-aside {
      &:not(.collapsed) {
        transform: translateX(0); // 显示侧边栏
      }
    }
  }
  
  .main {
    width: 100%;
    padding: 15px;
    box-sizing: border-box;
    margin-left: 0 !important; // 覆盖计算的边距
  }

  .mobile-menu-toggle .el-icon {
    color: #fff;
  }
}
</style>