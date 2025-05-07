<template>
    <div>
        <el-menu :default-active="activeMenu" class="el-menu-vertical" :collapse="collapse" background-color="#304156"
            text-color="#bfcbd9" active-text-color="#409EFF" router @select="handleMenuSelect">
            <!-- 首页 -->
            <el-menu-item index="/">
                <el-icon>
                    <HomeFilled />
                </el-icon>
                <template #title>首页</template>
            </el-menu-item>

            <!-- 登录菜单项 -->
            <el-menu-item index="/login">
                <el-icon>
                    <User />
                </el-icon>
                <template #title>管理员登录</template>
            </el-menu-item>
            
            <template id="isAdmin" v-if="isAdmin">
                <!-- 管理员菜单项 -->
                <el-menu-item index="/control">
                    <el-icon>
                        <Monitor />
                    </el-icon>
                    <template #title>控制台</template>
                </el-menu-item>
                <el-menu-item index="/analysis">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>数据分析</template>
                </el-menu-item>
                <el-menu-item index="/dataList">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>数据列表</span>
                </el-menu-item>

                <el-menu-item index="/statistics">
                    <el-icon>
                        <PieChart />
                    </el-icon>
                    <span>数据统计</span>
                </el-menu-item>

                <!-- 博客管理菜单 -->
                <el-sub-menu index="/blog">
                    <template #title>
                        <el-icon>
                            <Document />
                        </el-icon>
                        <span>博客管理</span>
                    </template>
                    <el-menu-item index="/blog/posts">
                        <el-icon>
                            <Document />
                        </el-icon>
                        <span>文章管理</span>
                    </el-menu-item>
                    <el-menu-item index="/blog/categories">
                        <el-icon>
                            <Folder />
                        </el-icon>
                        <span>分类管理</span>
                    </el-menu-item>
                    <el-menu-item index="/blog/tags">
                        <el-icon>
                            <Collection />
                        </el-icon>
                        <span>标签管理</span>
                    </el-menu-item>
                    <el-menu-item index="/blog/recycle">
                        <el-icon>
                            <Delete />
                        </el-icon>
                        <span>回收站</span>
                    </el-menu-item>
                </el-sub-menu>
            </template>
        </el-menu>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    Document,
    Odometer,
    PieChart,
    Edit,
    Folder,
    Collection,
    Delete,
    Monitor,
    HomeFilled,
    User,
    DataAnalysis
} from '@element-plus/icons-vue'
import { checkPermission } from '@/utils/permission' // 导入权限检查函数
import { useStore } from 'vuex';

const store = useStore(); // 获取store实例
const router = useRouter();
const isAdmin = computed(() => checkPermission(store, 'ADMIN')) //  检查是否是管理员,isAdmin 计算属性在 Vuex 状态更新后能够重新计算，反映最新的权限状态。

// 接收折叠状态props
const props = defineProps({
    collapse: {
        type: Boolean,
        default: false
    }
})

// 定义emit，用于向父组件发送事件
const emit = defineEmits(['close-menu'])

const route = useRoute()

// 当前激活的菜单
const activeMenu = computed(() => {
    return route.path
})

// 处理菜单选择事件
const handleMenuSelect = (index) => {
    // 在移动端选择菜单项后关闭侧边栏
    if (window.innerWidth <= 768) {
        emit('close-menu')
    }
}

/* 
监听store.state.user的变化,确保 LeftMenu.vue 能够响应 Vuex 状态的变化，从而及时更新用户权限。
当用户信息发生变化时，LeftMenu.vue 会重新计算 isAdmin 的值，从而更新菜单的显示。
*/
watch(
   ()=>store.state.user,
   (newValue, oldValue) => {
       console.log('用户信息发生变化:', newValue.role,oldValue?.role);
       //可选链操作符（Optional Chaining Operator），newValue是否为 null 或 undefined,是则为 undefined，否则继续访问role
       if (newValue?.role === 'ADMIN') {
           console.log('当前用户是管理员',newValue.role);
       } else {
           console.log('当前用户不是管理员',newValue.role);
       }
   }, 
)
</script>

<style lang="less" scoped>
  /* 移动端适配 */
  @media (max-width: 768px) {
    .el-menu-vertical {
      width: 100%; /* 确保菜单占满宽度 */
    }
    
    :deep(.el-menu-item), :deep(.el-sub-menu__title) {
      height: 50px; /* 增加菜单项高度，便于触摸 */
      line-height: 50px;
    }
  }
</style>