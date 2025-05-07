<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-layout">
        <!-- 左侧公告区 -->
        <div class="login-left">
          <div class="login-info" :style="{background: `url(${loginBgUrl}) no-repeat center center / cover`}">
          </div>
        </div>

        <!-- 分割线 (在移动端隐藏) -->
        <el-divider direction="vertical" class="divider" />

        <!-- 右侧表单区 -->
        <div class="login-right">
          <div class="login-header">
            <h2 class="title">Taoの博客</h2>
            <p class="subtitle">欢迎登录后台系统</p>
          </div>

          <el-form
            ref="formRef"
            :model="loginForm"
            :rules="rules"
            @submit.prevent="handleSubmit"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                size="large"
                :prefix-icon="Lock"
              />
            </el-form-item>

            <el-button
              native-type="submit"
              type="primary"
              size="large"
              :loading="loading"
              class="submit-btn"
            >
              立即登录
            </el-button>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { login,getUserInfo } from '@/utils/apis' 
const router = useRouter()
const store = useStore()  // 引入Vuex
// --- 从 Vuex 获取登录背景图 ---
const loginBgList = computed(()=>store.getters.getLoginBackgrounds);
const loginBgUrl = computed(() => {
if (loginBgList.value && loginBgList.value.length > 0) {
  // 使用 Vuex 中 shuffle 后的第一个
  return loginBgList.value[0].imageUrl;
}
// 返回一个默认的背景色或渐变
return 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)';
});

// 表单数据
const loginForm = ref({
username: '',
password: ''
})

// 表单验证规则
const rules = {
username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
}

// 加载状态
const loading = ref(false)
const formRef = ref(null)
// 处理登录提交,确保登录成功后调用 store.commit 更新 user 和 token
const handleSubmit = async () => {
try {
    await formRef.value.validate() // 先触发表单校验再请求
    loading.value = true

    // 调用Vuex的action来处理登录逻辑
    await store.dispatch('login',loginForm.value)

    // 登录成功提示
    ElMessage.success('登录成功')

    // 跳转到首页
    router.push('/')
} catch (error) {
    // 登录失败提示
    // 尝试从 error 对象中获取更具体的错误信息
    const message = error?.response?.data?.message || error?.message || '登录失败，请检查用户名和密码';
    ElMessage.error(message)
} finally {
    loading.value = false
}
}

// --- 组件挂载时执行 ---
onMounted(async () => {
// 检查图片是否已加载，如果未加载则触发获取
if (!store.getters.areImagesLoaded) {
  // console.log('Login.vue: 图片未加载，尝试获取...');
  await store.dispatch('fetchImages');
} else {
  // console.log('Login.vue: 图片已加载');
}
// console.log(store.getters.getLoginBackgrounds)
});
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; // 使用 min-height 保证内容超出时能滚动
  background: #f0f2f5;
  padding: 20px 0; // 上下加点边距，防止贴边
}

.login-card {
  width: 900px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  overflow: hidden; // 防止子元素溢出圆角

  :deep(.el-card__body) {
    padding: 0;
  }
}

// 使用 Flex 布局来控制左右排列
.login-layout {
  display: flex;
  // height: 520px; // 固定高度可能导致移动端显示问题，移除或调整
  min-height: 520px; // 使用最小高度
}

.login-left {
  flex: 14; // 使用 flex 比例分配宽度
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-sizing: border-box; // 内边距包含在宽度内

  .login-info {
    width: 100%;
    height: 100%;
    min-height: 440px; // 保证最小高度
    border-radius: 6px; // 轻微圆角
  }
}

.divider {
  height: auto; // 高度自适应
  margin: 30px 0;
  align-self: stretch; // 拉伸以填充 flex 容器高度
}

.login-right {
  flex: 9; // 使用 flex 比例分配宽度
  padding: 40px 30px;
  display: flex; // 使用 flex 布局方便垂直居中（如果需要）
  flex-direction: column; // 内部元素垂直排列
  justify-content: center; // 垂直居中表单内容
  box-sizing: border-box; // 内边距包含在宽度内

  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .title {
      font-size: 24px;
      color: #1f2d3d;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #99a9bf;
      font-size: 14px;
    }
  }

  .submit-btn {
    width: 100%;
    margin-top: 20px;
  }
}

/* 添加移动端适配 */
@media (max-width: 900px) { // 调整断点，让平板也能适配
  .login-card {
    width: 90%; /* 占屏幕宽度的90% */
    max-width: 450px; /* 设置最大宽度 */
  }

  .login-layout {
    flex-direction: column; /* 核心：改为垂直排列 */
    height: auto; /* 高度自适应 */
  }

  .login-left {
    // display: none; /* 不再隐藏 */
    width: 100%; /* 占据全部宽度 */
    flex: none; /* 取消 flex 比例 */
    padding: 20px 20px 0 20px; /* 调整内边距，底部留空 */
    order: 1; /* 确保图片在上面 */

    .login-info {
        min-height: 200px; // 移动端减小图片高度
        height: 200px;
    }
  }

  .divider {
    display: none; /* 隐藏分割线 */
  }

  .login-right {
    width: 100%; /* 占据全部宽度 */
    flex: none; /* 取消 flex 比例 */
    padding: 30px 20px; /* 调整内边距 */
    order: 2; /* 确保表单在下面 */
    justify-content: flex-start; // 移动端不需要垂直居中，从顶部开始

    .login-header {
      margin-bottom: 30px; /* 减小标题下边距 */

      .title {
        font-size: 22px; /* 减小标题字体 */
      }
    }
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .login-card {
    width: 95%; /* 占更多屏幕宽度 */
    box-shadow: none; /* 移除阴影 */
    border: 1px solid #eee; // 加个边框区分
  }

  .login-left {
      padding: 15px 15px 0 15px; // 进一步减小内边距
      .login-info {
          min-height: 150px; // 更小的高度
          height: 150px;
      }
  }

  .login-right {
    padding: 25px 15px; /* 进一步减小内边距 */
  }
}
</style>

