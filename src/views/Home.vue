<template>
  <div class="home">
    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索角色、场景或对话..." 
          class="search-input"
          @keyup.enter="handleSearch"
        >
        <button class="search-btn" @click="handleSearch">
          🔍
        </button>
      </div>
    </div>

    <!-- 功能卡片 -->
    <FeatureCard 
      title="个人中心" 
      description="管理您的个人信息、聊天历史和偏好设置" 
      icon="👤" 
      @click="navigateToProfile" 
    />

    <FeatureCard 
      title="角色推荐" 
      description="发现为您精心推荐的AI角色，开始有趣的对话" 
      icon="🎭" 
      @click="navigateToCharacters" 
    />

    <FeatureCard 
      title="场景" 
      description="选择不同的对话场景，体验多样化的聊天环境" 
      icon="🏞️" 
      @click="navigateToScenes" 
    />

    <FeatureCard 
      title="创建角色" 
      description="自定义您专属的AI角色，设定性格和背景故事" 
      icon="🛠️" 
      @click="navigateToCreateCharacter" 
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import FeatureCard from '../components/FeatureCard.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  components: {
    FeatureCard
  },
  setup() {
    const router = useRouter()  // 添加这一行
    const searchQuery = ref('')

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        alert(`搜索: ${searchQuery.value}`)
      }
    }

     const navigateToProfile = () => {
      router.push('/profile')
    }

    const navigateToCharacters = () => {
      router.push('/characters')
    }

    const navigateToScenes = () => {
      router.push('/scenes')
    }

    const navigateToCreateCharacter = () => {
      router.push('/create-character')
    }


    return {
      searchQuery,
      handleSearch,
      navigateToProfile,
      navigateToCharacters,
      navigateToScenes,
      navigateToCreateCharacter
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

.search-section {
  margin-bottom: 1rem;
}

.search-container {
  display: flex;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.3s ease;
}



.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
}

.search-input::placeholder {
  color: #999;
}

.search-btn {
  padding: 1rem 1.5rem;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1.2rem;
}

.search-btn:hover {
  background: #e9ecef;
}
</style>