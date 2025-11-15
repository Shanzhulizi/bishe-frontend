<template>
  <div class="home">
    <!-- 个人中心 -->
    <FeatureCard 
      title="个人中心"
      description="管理您的个人信息、聊天历史和偏好设置"
      icon="👤"
      @click="navigateToProfile"
    />

    <!-- 角色推荐 -->
    <FeatureCard 
      title="角色推荐"
      description="发现为您精心推荐的AI角色，开始有趣的对话"
      icon="🎭"
      @click="showCharacters"
    />

    <!-- 场景 -->
    <FeatureCard 
      title="场景"
      description="选择不同的对话场景，体验多样化的聊天环境"
      icon="🏞️"
      @click="showScenes"
    />

    <!-- 创建角色 -->
    <FeatureCard 
      title="创建角色"
      description="自定义您专属的AI角色，设定性格和背景故事"
      icon="🛠️"
      @click="createCharacter"
    />
  </div>
</template>

<script>
import FeatureCard from '../components/FeatureCard.vue'

export default {
  name: 'Home',
  components: {
    FeatureCard
  },
  methods: {
    navigateToProfile() {
      alert('跳转到个人中心页面')
      // 实际项目中这里会使用路由跳转
    },
    showCharacters() {
      alert('显示角色推荐列表')
    },
    showScenes() {
      alert('显示场景选择')
    },
    createCharacter() {
      alert('打开角色创建界面')
    }
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}
</style>