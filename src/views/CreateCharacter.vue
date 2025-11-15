<template>
  <div class="create-character">
    <div class="page-header">
      <h1>创建角色</h1>
      <button class="back-btn" @click="goBack">← 返回</button>
    </div>

    <div v-if="characterStore.error" class="error-message">
      {{ characterStore.error }}
      <button @click="characterStore.clearError()" class="close-error">×</button>
    </div>

    <div class="creation-form">
      <!-- 基础信息 -->
      <div class="form-section">
        <h2>基础信息</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>角色名称 *</label>
            <input 
              v-model="character.name" 
              type="text" 
              placeholder="给角色起个名字"
              required
              :disabled="characterStore.isLoading"
            >
          </div>
          <div class="form-group">
            <label>角色头像</label>
            <div class="avatar-selector">
              <div 
                v-for="emoji in emojiList" 
                :key="emoji"
                :class="['avatar-option', { selected: character.avatar_url === emoji }]"
                @click="character.avatar_url = emoji"
                :disabled="characterStore.isLoading"
              >
                {{ emoji }}
              </div>
            </div>
            <small>选择的emoji将保存为avatar_url</small>
          </div>
        </div>
      </div>

      <!-- 角色设定 -->
      <div class="form-section">
        <h2>角色设定</h2>
        <div class="form-group">
          <label>角色描述</label>
          <textarea 
            v-model="character.description" 
            placeholder="简要描述这个角色的特点..."
            rows="3"
            :disabled="characterStore.isLoading"
          ></textarea>
        </div>
        <div class="form-group">
          <label>性格特点 *</label>
          <textarea 
            v-model="character.personality" 
            placeholder="详细描述角色的性格、说话方式、习惯等..."
            rows="4"
            required
            :disabled="characterStore.isLoading"
          ></textarea>
        </div>
        <div class="form-group">
          <label>背景故事</label>
          <textarea 
            v-model="character.background" 
            placeholder="角色的背景故事、经历等..."
            rows="4"
            :disabled="characterStore.isLoading"
          ></textarea>
        </div>
      </div>

      <!-- 对话设定 -->
      <div class="form-section">
        <h2>对话设定</h2>
        <div class="form-group">
          <label>问候语 *</label>
          <input 
            v-model="character.greeting_message" 
            type="text" 
            placeholder="角色初次见面的问候语"
            required
            :disabled="characterStore.isLoading"
          >
        </div>
        <div class="form-group">
          <label>示例对话</label>
          <textarea 
            v-model="character.example_dialogue" 
            placeholder="提供一些示例对话，帮助AI更好地理解角色..."
            rows="4"
            :disabled="characterStore.isLoading"
          ></textarea>
          <small>格式：用户: 内容\n角色: 内容</small>
        </div>
        <div class="form-group">
          <label>系统提示词 *</label>
          <textarea 
            v-model="character.initial_prompt" 
            placeholder="给AI的核心系统提示词，定义角色的行为和回应方式..."
            rows="4"
            required
            :disabled="characterStore.isLoading"
          ></textarea>
          <small>这是最重要的设定，将直接影响AI的行为</small>
        </div>
      </div>

      <!-- 标签分类 -->
      <div class="form-section">
        <h2>标签分类</h2>
        <div class="form-group">
          <label>选择标签</label>
          <div class="tags-selector">
            <span 
              v-for="tag in availableTags" 
              :key="tag"
              :class="['tag-option', { selected: character.tags.includes(tag) }]"
              @click="toggleTag(tag)"
              :disabled="characterStore.isLoading"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="form-group">
          <label>自定义标签</label>
          <div class="custom-tags">
            <input 
              v-model="newTag" 
              type="text" 
              placeholder="输入新标签"
              @keyup.enter="addCustomTag"
              :disabled="characterStore.isLoading"
            >
            <button @click="addCustomTag" :disabled="characterStore.isLoading">添加</button>
          </div>
          <div class="selected-tags">
            <span 
              v-for="tag in character.tags" 
              :key="tag"
              class="selected-tag"
            >
              {{ tag }}
              <span @click="removeTag(tag)" :disabled="characterStore.isLoading">×</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 可见性设置 -->
      <div class="form-section">
        <h2>可见性设置</h2>
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              v-model="character.is_public" 
              type="checkbox" 
              :disabled="characterStore.isLoading"
            >
            公开此角色（其他用户可以看到和使用）
          </label>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button 
          class="btn-secondary" 
          @click="goBack" 
          :disabled="characterStore.isLoading"
        >
          取消
        </button>
        <button 
          class="btn-primary" 
          @click="saveDraft" 
          :disabled="characterStore.isLoading"
        >
          保存草稿
        </button>
        <button 
          class="btn-success" 
          @click="createCharacter" 
          :disabled="characterStore.isLoading || !isFormValid"
        >
          {{ characterStore.isLoading ? '创建中...' : '创建角色' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/character'

export default {
  name: 'CreateCharacter',
  setup() {
    const router = useRouter()
    const characterStore = useCharacterStore()
    const newTag = ref('')

    const character = reactive({
      name: '',
      avatar_url: '👤',
      description: '',
      personality: '',
      background: '',
      greeting_message: '',
      example_dialogue: '',
      initial_prompt: '',
      tags: [],
      is_public: true
    })

    const emojiList = ['👤', '👨‍🎓', '👩‍💼', '🧙‍♂️', '🤖', '🐱', '🐉', '🌙', '⭐', '🎭', '🎨', '🔬']

    const availableTags = [
      '历史', '科幻', '奇幻', '现实', '教育', '娱乐', 
      '心理', '情感', '职业', '语言', '创意', '技术',
      '幽默', '严肃', '友好', '专业', '休闲'
    ]

    // 表单验证
    const isFormValid = computed(() => {
      return character.name.trim() && 
             character.personality.trim() && 
             character.greeting_message.trim() && 
             character.initial_prompt.trim()
    })

    const toggleTag = (tag) => {
      if (characterStore.isLoading) return
      
      const index = character.tags.indexOf(tag)
      if (index > -1) {
        character.tags.splice(index, 1)
      } else {
        character.tags.push(tag)
      }
    }

    const addCustomTag = () => {
      if (characterStore.isLoading) return
      
      if (newTag.value.trim() && !character.tags.includes(newTag.value.trim())) {
        character.tags.push(newTag.value.trim())
        newTag.value = ''
      }
    }

    const removeTag = (tag) => {
      if (characterStore.isLoading) return
      
      const index = character.tags.indexOf(tag)
      if (index > -1) {
        character.tags.splice(index, 1)
      }
    }

    const createCharacter = async () => {
      if (!isFormValid.value) return


  console.log('提交的角色数据:', character)
      const result = await characterStore.createCharacter(character)
        console.log('创建结果:', result)
      if (result.success) {
console.log('新角色ID:', result.data.id)
    console.log('新角色名称:', result.data.name)
        alert('角色创建成功！')
        router.push(`/chat/${result.data.id}`)
      } else {
        // 错误信息已经在store中，这里可以显示toast等
      }
    }

    const saveDraft = () => {
      const draftData = {
        ...character,
        saved_at: new Date().toISOString()
      }
      localStorage.setItem('character_draft', JSON.stringify(draftData))
      alert('草稿已保存到本地')
    }

    const goBack = () => {
      router.back()
    }

    return {
      character,
      emojiList,
      availableTags,
      newTag,
      characterStore,
      isFormValid,
      toggleTag,
      addCustomTag,
      removeTag,
      createCharacter,
      saveDraft,
      goBack
    }
  }
}
</script>
<style scoped>
.create-character {
  max-width: 800px;
  margin: 0 auto;
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

.creation-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.25rem;
  border-left: 4px solid #007bff;
  padding-left: 0.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-group small {
  color: #666;
  font-size: 0.8rem;
}

.avatar-selector {
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
  transform: scale(1.1);
}

.avatar-option.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.tags-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-option {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-option:hover {
  background: #e9ecef;
}

.tag-option.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.custom-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.custom-tags input {
  flex: 1;
}

.custom-tags button {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: #007bff;
  color: white;
  border-radius: 12px;
  font-size: 0.9rem;
}

.selected-tag span {
  margin-left: 0.5rem;
  cursor: pointer;
  font-weight: bold;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #f0f0f0;
}

.btn-secondary,
.btn-primary,
.btn-success {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success:hover {
  background: #218838;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-error {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #721c24;
}

/* 其他样式保持不变，添加禁用状态样式 */
.avatar-option:disabled,
.tag-option:disabled,
.selected-tag span:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary:disabled,
.btn-primary:disabled,
.btn-success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>