<template>
  <div class="profile">
    <div class="page-header">
      <h1>个人中心</h1>
      <button class="back-btn" @click="goBack">← 返回</button>
    </div>

    <div class="profile-content">
      <!-- 用户信息卡片 -->
      <div class="user-info-card">
        <!-- 头像 -->
        <div class="avatar-section">
          <div class="avatar">
            {{ userInfo?.avatar_url || '👤' }}
          </div>
        </div>

        <!-- 用户名和编辑按钮 -->
        <div class="username-section">
          <h2>{{ userInfo?.username || '未设置用户名' }}</h2>
          <button class="edit-btn" @click="showSettingsModal">
            ✏️ 编辑
          </button>
        </div>

        <!-- 粉丝和关注 -->
        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-number">{{ stats.followers }}</div>
            <div class="stat-label">粉丝</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.following }}</div>
            <div class="stat-label">关注</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.characters }}</div>
            <div class="stat-label">角色</div>
          </div>
        </div>
      </div>

      <!-- 内容类型选择 -->
      <div class="content-type-selector">
        <button 
          v-for="type in contentTypes" 
          :key="type.value"
          :class="['type-btn', { active: selectedContentType === type.value }]"
          @click="selectContentType(type.value)"
        >
          {{ type.label }}
        </button>
      </div>

      <!-- 内容展示区域 -->
      <div class="content-display">
        <div v-if="isLoading" class="loading-state">
          <p>加载中...</p>
        </div>

        <div v-else-if="hasError" class="error-state">
          <p>{{ errorMessage }}</p>
          <button @click="loadContent">重试</button>
        </div>

        <div v-else-if="currentContent.length === 0" class="empty-state">
          <p v-if="selectedContentType === 'characters'">还没有创建任何角色</p>
          <p v-else-if="selectedContentType === 'scenes'">还没有创建任何场景</p>
          <p v-else>还没有创建任何语音</p>
          <button class="create-btn" @click="goToCreate">
            立即创建
          </button>
        </div>

        <div v-else class="content-grid">
          <div 
            v-for="item in currentContent" 
            :key="item.id"
            class="content-card"
            @click="handleContentClick(item)"
          >
            <div class="content-avatar">
              {{ item.avatar_url || getDefaultAvatar(selectedContentType) }}
            </div>
            <div class="content-info">
              <h3>{{ item.name }}</h3>
              <p class="content-desc">{{ item.description }}</p>
              <div class="content-meta">
                <span class="usage-count">使用 {{ item.usage_count || 0 }} 次</span>
                <span class="rating">⭐ {{ item.rating || 0 }}</span>
              </div>
              <div v-if="item.tags && item.tags.length > 0" class="content-tags">
                <span 
                  v-for="tag in item.tags.slice(0, 2)" 
                  :key="tag"
                  class="content-tag"
                >
                  {{ tag }}
                </span>
                <span v-if="item.tags.length > 2" class="more-tags">
                  +{{ item.tags.length - 2 }}
                </span>
              </div>
            </div>
            <div class="content-actions">
              <button class="action-btn delete" @click.stop="deleteContent(item)">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置模态框 -->
    <div v-if="showSettings" class="modal-overlay" @click="hideSettingsModal">
      <div class="settings-modal" @click.stop>
        <div class="modal-header">
          <h3>个人设置</h3>
          <button class="close-btn" @click="hideSettingsModal">×</button>
        </div>
        
        <div class="modal-content">
          <!-- 头像设置 -->
          <div class="setting-group">
            <label>头像</label>
            <div class="avatar-options">
              <div 
                v-for="emoji in avatarOptions" 
                :key="emoji"
                :class="['avatar-option', { selected: selectedAvatar === emoji }]"
                @click="selectedAvatar = emoji"
              >
                {{ emoji }}
              </div>
            </div>
          </div>

          <!-- 用户名设置 -->
          <div class="setting-group">
            <label for="username">用户名</label>
            <input 
              id="username"
              v-model="editedUsername" 
              type="text" 
              placeholder="请输入用户名"
            >
          </div>

          <!-- 个人简介 -->
          <div class="setting-group">
            <label for="bio">个人简介</label>
            <textarea 
              id="bio"
              v-model="editedBio" 
              placeholder="介绍一下自己..."
              rows="3"
            ></textarea>
          </div>

          <!-- 通知设置 -->
          <div class="setting-group">
            <label class="checkbox-label">
              <input 
                v-model="settings.notifications" 
                type="checkbox" 
              >
              接收消息通知
            </label>
          </div>

          <!-- 隐私设置 -->
          <div class="setting-group">
            <label class="checkbox-label">
              <input 
                v-model="settings.isPublic" 
                type="checkbox" 
              >
              公开个人资料
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="hideSettingsModal">取消</button>
          <button class="btn-primary" @click="saveSettings">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCharacterStore } from '../stores/character'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const characterStore = useCharacterStore()

    // 用户信息和统计
    const userInfo = computed(() => authStore.user)
    const stats = reactive({
      followers: 0,
      following: 0,
      characters: 0
    })

    // 内容类型
    const contentTypes = [
      { value: 'characters', label: '角色' },
      { value: 'scenes', label: '场景' },
      { value: 'voices', label: '语音' }
    ]

    const selectedContentType = ref('characters')
    const isLoading = ref(false)
    const hasError = ref(false)
    const errorMessage = ref('')

    // 设置模态框状态
    const showSettings = ref(false)
    const selectedAvatar = ref('👤')
    const editedUsername = ref('')
    const editedBio = ref('')
    const settings = reactive({
      notifications: true,
      isPublic: true
    })

    const avatarOptions = ['👤', '👨', '👩', '🧑', '👦', '👧', '🦸', '🧙', '🤖', '🐱', '🌟', '🎭']

    // 当前显示的内容
    const currentContent = computed(() => {
      switch (selectedContentType.value) {
        case 'characters':
          return characterStore.characters || []
        case 'scenes':
          return [] // 暂时返回空数组，等场景功能实现
        case 'voices':
          return [] // 暂时返回空数组，等语音功能实现
        default:
          return []
      }
    })

    // 获取默认头像
    const getDefaultAvatar = (type) => {
      const avatars = {
        characters: '👤',
        scenes: '🏞️',
        voices: '🎤'
      }
      return avatars[type] || '📄'
    }

    // 加载用户内容
    const loadContent = async () => {
      isLoading.value = true
      hasError.value = false
      
      try {
        if (selectedContentType.value === 'characters') {
          await characterStore.fetchUserCharacters()
          stats.characters = characterStore.characters.length
        }
        // 可以在这里添加场景和语音的加载逻辑
      } catch (error) {
        hasError.value = true
        errorMessage.value = '加载失败，请重试'
        console.error('加载内容失败:', error)
      } finally {
        isLoading.value = false
      }
    }

    // 选择内容类型
    const selectContentType = (type) => {
      selectedContentType.value = type
      loadContent()
    }

    // 处理内容点击
    const handleContentClick = (item) => {
      switch (selectedContentType.value) {
        case 'characters':
          router.push(`/chat/${item.id}`)
          break
        case 'scenes':
          // 跳转到场景详情或使用场景
          break
        case 'voices':
          // 跳转到语音详情
          break
      }
    }

    // 删除内容
    const deleteContent = (item) => {
      if (confirm(`确定要删除"${item.name}"吗？`)) {
        console.log('删除:', item)
        // 实际项目中这里会调用删除API
      }
    }

    // 导航到创建页面
    const goToCreate = () => {
      switch (selectedContentType.value) {
        case 'characters':
          router.push('/create-character')
          break
        case 'scenes':
          // 跳转到创建场景页面
          break
        case 'voices':
          // 跳转到创建语音页面
          break
      }
    }

    // 设置模态框功能
    const showSettingsModal = () => {
      // 初始化设置数据
      selectedAvatar.value = userInfo.value?.avatar_url || '👤'
      editedUsername.value = userInfo.value?.username || ''
      editedBio.value = userInfo.value?.bio || ''
      showSettings.value = true
    }

    const hideSettingsModal = () => {
      showSettings.value = false
    }

    const saveSettings = () => {
      // 保存设置逻辑
      console.log('保存设置:', {
        avatar: selectedAvatar.value,
        username: editedUsername.value,
        bio: editedBio.value,
        settings: { ...settings }
      })
      
      // 实际项目中这里会调用更新用户信息的API
      alert('设置已保存！')
      hideSettingsModal()
    }

    const goBack = () => {
      router.back()
    }

    // 初始化
    onMounted(() => {
      loadContent()
    })

    return {
      userInfo,
      stats,
      contentTypes,
      selectedContentType,
      isLoading,
      hasError,
      errorMessage,
      currentContent,
      showSettings,
      selectedAvatar,
      editedUsername,
      editedBio,
      settings,
      avatarOptions,
      getDefaultAvatar,
      selectContentType,
      handleContentClick,
      deleteContent,
      goToCreate,
      showSettingsModal,
      hideSettingsModal,
      saveSettings,
      goBack,
      loadContent
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
}

.back-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 用户信息卡片 */
.user-info-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  text-align: center;
}

.avatar-section {
  margin-bottom: 1.5rem;
}

.avatar {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.username-section {
  margin-bottom: 1.5rem;
}

.username-section h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.edit-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid #007bff;
  border-radius: 12px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}

.stats-section {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 内容类型选择器 */
.content-type-selector {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.type-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.type-btn:hover:not(.active) {
  background: #f8f9fa;
}

/* 内容展示区域 */
.content-display {
  min-height: 400px;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.error-state button, .create-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.create-btn {
  background: #28a745;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 1rem;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.content-avatar {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.content-info {
  flex: 1;
}

.content-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.content-desc {
  color: #666;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  font-size: 0.9rem;
}

.content-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.content-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.content-tag {
  padding: 0.2rem 0.5rem;
  background: #e9ecef;
  border-radius: 8px;
  font-size: 0.7rem;
  color: #495057;
}

.more-tags {
  font-size: 0.7rem;
  color: #6c757d;
}

.content-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.action-btn.delete {
  color: #dc3545;
  border-color: #dc3545;
}

.action-btn:hover {
  background: #f8f9fa;
}

/* 设置模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-modal {
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-content {
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
}

.avatar-option {
  font-size: 1.5rem;
  text-align: center;
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-option:hover {
  border-color: #007bff;
}

.avatar-option.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.setting-group input,
.setting-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.setting-group input:focus,
.setting-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: 1px solid #6c757d;
  border-radius: 8px;
  background: white;
  color: #6c757d;
  cursor: pointer;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-section {
    gap: 1rem;
  }
  
  .content-type-selector {
    flex-wrap: wrap;
  }
  
  .avatar-options {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>