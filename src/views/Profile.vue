<template>
  <div class="profile">
    <div class="profile-header">
      <h1>个人中心</h1>
      <button class="back-btn" @click="goBack">← 返回</button>
    </div>

    <div class="profile-content">
      <!-- 用户信息卡片 -->
      <div class="info-card">
        <h2>基本信息</h2>
        <div class="info-item">
          <label>用户名：</label>
          <span>{{ userInfo?.username || '未登录' }}</span>
        </div>
        <div class="info-item">
          <label>邮箱：</label>
          <span>{{ userInfo?.email || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>注册时间：</label>
          <span>{{ formatDate(userInfo?.created_at) }}</span>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-card">
        <h2>使用统计</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">0</div>
            <div class="stat-label">对话次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">0</div>
            <div class="stat-label">创建角色</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">0</div>
            <div class="stat-label">收藏角色</div>
          </div>
        </div>
      </div>

      <!-- 功能设置 -->
      <div class="settings-card">
        <h2>功能设置</h2>
        <div class="setting-item">
          <label>消息通知</label>
          <input type="checkbox" v-model="notifications" />
        </div>
        <div class="setting-item">
          <label>深色模式</label>
          <input type="checkbox" v-model="darkMode" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const notifications = ref(true)
    const darkMode = ref(false)

    const userInfo = computed(() => {
      try {
        const user = localStorage.getItem('user_info')
        return user ? JSON.parse(user) : null
      } catch {
        return null
      }
    })

    const goBack = () => {
      router.back()
    }

    const formatDate = (dateString) => {
      if (!dateString) return '未知'
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    return {
      userInfo,
      notifications,
      darkMode,
      goBack,
      formatDate
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-header h1 {
  font-size: 2rem;
  color: #333;
}

.back-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f8f9fa;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card, .stats-card, .settings-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
}

.info-card h2, .stats-card h2, .settings-card h2 {
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 500;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  color: #666;
  margin-top: 0.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}
</style>