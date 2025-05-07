<template>
  <div>
      <el-row>
        <el-col :span="2">
          <div class="grid-content ep-bg-purple" />
          <div
            class="logo clickable"
            v-if="avatarUrl"
            :style="{ background: `url(${avatarUrl}) no-repeat center center / cover` }"
            @click="goToHome"
          >
          </div>
        </el-col>
        <el-col :span="22" class="header-title clickable" @click="goToHome">
          <div class="grid-content ep-bg-purple-light" />
          Taoの博客
        </el-col>
      </el-row>
  </div>
  
      
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore(); // 获取store实例
const router = useRouter(); // 获取 router 实例

// --- 从 Vuex 获取头像 ---
const avatarList = computed(() => store.getters.getAvatar);
const avatarUrl = computed(() => {
  if (avatarList.value && avatarList.value.length > 0) {
    return avatarList.value[0].imageUrl;
  }
  // 如果没有头像，可以返回一个默认值或者 null
  return null; // 或者返回一个默认头像 URL
});

// --- 跳转到首页的方法 ---
const goToHome = () => {
  router.push('/'); // 使用 router.push 进行页面跳转
};
</script>

<style lang="less" scoped>
  .logo{
      width: 60px;
      height: 60px;
      border-radius: 50%;
      vertical-align: bottom; 
      object-fit: cover;
  }
  .el-row{
      font-weight: bold;
      color:#fff;
      font-size: larger;
      line-height: 60px;
      text-align: left;
      height: 60px;
  }
  
  .header-title {
    padding-left: 40px;
  }
  
  /* 添加一个通用样式，让可点击的元素显示小手鼠标 */
  .clickable {
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .logo {
      width: 40px;
      height: 40px;
      margin: 10px 0;
    }
    
    .el-row {
      font-size: medium;
    }
  }
</style>