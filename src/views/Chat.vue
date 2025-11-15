<template>
  <div class="chat-page">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <div class="character-info">
        <div class="character-avatar">{{ currentCharacter?.avatar_url || '👤' }}</div>
        <div class="character-details">
          <h2>{{ currentCharacter?.name || 'AI助手' }}</h2>
          <p>{{ currentCharacter?.description || '智能对话助手' }}</p>
        </div>
      </div>
      <button class="clear-btn" @click="clearChat">清空</button>
    </div>

    <!-- 聊天内容区域 -->
    <div class="chat-container">
      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="['message', message.role]"
        >
          <div class="message-avatar">
            {{ message.role === 'user' ? '👤' : (currentCharacter?.avatar_url || '🤖') }}
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" class="message assistant loading">
          <div class="message-avatar">{{ currentCharacter?.avatar_url || '🤖' }}</div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <textarea
          v-model="inputMessage"
          @keydown.enter.exact.prevent="sendMessage"
          placeholder="输入消息... (Enter发送)"
          rows="1"
          @input="autoResize"
          ref="textInput"
          :disabled="isLoading"
        ></textarea>
        
        <button 
          class="send-btn" 
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
        >
          {{ isLoading ? '⏳' : '📤' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCharacterStore } from '../stores/character'

export default {
  name: 'Chat',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const characterStore = useCharacterStore()
    
    const messagesContainer = ref(null)
    const textInput = ref(null)
    
    // 状态管理
    const inputMessage = ref('')
    const isLoading = ref(false)
    const currentCharacter = ref(null)
    
    // 消息列表
    const messages = reactive([])

    // 初始化角色
    onMounted(async () => {
      const characterId = route.params.characterId
      console.log('聊天页面角色ID:', characterId)
      
      if (characterId) {
        // 从API获取真实角色数据
        const result = await characterStore.fetchCharacterDetail(characterId)
        if (result.success) {
          currentCharacter.value = result.data
          console.log('成功加载角色:', currentCharacter.value)
        } else {
          console.error('获取角色详情失败:', result.error)
          // 如果获取失败，使用默认角色
          currentCharacter.value = {
            id: characterId,
            name: 'AI助手',
            avatar_url: '🤖',
            description: '智能对话助手',
            personality: '我是你的AI助手，很高兴为你服务！'
          }
        }
      } else {
        // 如果没有角色ID，使用默认角色
        currentCharacter.value = {
          id: 1,
          name: 'AI助手',
          avatar_url: '🤖',
          description: '智能对话助手',
          personality: '我是你的AI助手，很高兴为你服务！'
        }
      }
      
      // 添加欢迎消息
      addMessage({
        id: Date.now(),
        role: 'assistant',
        content: currentCharacter.value.personality ? 
          `你好！我是${currentCharacter.value.name}。${currentCharacter.value.personality}` :
          `你好！我是${currentCharacter.value.name}，很高兴与你交流！`,
        timestamp: new Date()
      })
    })

    // 添加消息
    const addMessage = (message) => {
      messages.push(message)
      scrollToBottom()
    }

    // 发送消息
    const sendMessage = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return
      
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: inputMessage.value.trim(),
        timestamp: new Date()
      }
      
      addMessage(userMessage)
      const userInput = inputMessage.value.trim()
      inputMessage.value = ''
      isLoading.value = true
      
      resetTextareaHeight()
      
      try {
        // 调用后端聊天API
        await sendToBackend(userInput)
      } catch (error) {
        console.error('发送消息失败:', error)
        addMessage({
          id: Date.now() + 1,
          role: 'assistant',
          content: '抱歉，我暂时无法回复，请稍后再试。',
          timestamp: new Date()
        })
      } finally {
        isLoading.value = false
      }
    }

    // 调用后端API
    const sendToBackend = async (userInput) => {
      try {
        // 构建请求数据
        const requestData = {
          character_id: currentCharacter.value.id,
          message: userInput,
          conversation_history: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }

        console.log('发送到后端的数据:', requestData)

        // 调用后端API
        const response = await fetch('http://localhost:8000/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(requestData)
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('后端返回:', data)

        // 添加AI回复
        const aiMessage = {
          id: Date.now(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        }
        
        addMessage(aiMessage)

      } catch (error) {
        console.error('API调用失败:', error)
        
        // 如果API调用失败，使用模拟回复
        const responses = [
          `我理解你说的是："${userInput}"。这是一个模拟回复，实际会连接AI服务。`,
          `关于"${userInput}"，我觉得这个话题很有意思！`,
          `作为${currentCharacter.value.name}，我对"${userInput}"很感兴趣。`,
          `让我思考一下"${userInput}"... 这确实值得探讨。`
        ]
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const aiMessage = {
          id: Date.now(),
          role: 'assistant',
          content: randomResponse,
          timestamp: new Date()
        }
        
        addMessage(aiMessage)
      }
    }

    // 清空聊天
    const clearChat = () => {
      if (confirm('确定要清空聊天记录吗？')) {
        messages.splice(0, messages.length)
        addMessage({
          id: Date.now(),
          role: 'assistant',
          content: `你好！我是${currentCharacter.value.name}，让我们开始新的对话吧！`,
          timestamp: new Date()
        })
      }
    }

    // 自动调整输入框高度
    const autoResize = () => {
      nextTick(() => {
        if (textInput.value) {
          textInput.value.style.height = 'auto'
          textInput.value.style.height = textInput.value.scrollHeight + 'px'
        }
      })
    }

    // 重置输入框高度
    const resetTextareaHeight = () => {
      if (textInput.value) {
        textInput.value.style.height = 'auto'
      }
    }

    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    // 加载会话历史
    const loadConversationHistory = async (characterId) => {
      try {
        // 这里可以调用API获取最近的会话
        // 暂时先创建新会话
        await createNewConversation(characterId)
      } catch (error) {
        console.error('加载会话历史失败:', error)
        await createNewConversation(characterId)
      }
    }

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    return {
      inputMessage,
      isLoading,
      currentCharacter,
      messages,
      messagesContainer,
      textInput,
      sendMessage,
      clearChat,
      autoResize,
      formatTime,
      goBack
    }
  }
}
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  background: white;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.back-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  margin-right: 1rem;
}

.character-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.character-avatar {
  font-size: 2rem;
  margin-right: 1rem;
}

.character-details h2 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.character-details p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.clear-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dc3545;
  border-radius: 8px;
  background: white;
  color: #dc3545;
  cursor: pointer;
}

.clear-btn:hover {
  background: #dc3545;
  color: white;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  background: white;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.assistant {
  align-self: flex-start;
}

.message-avatar {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.message-content {
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  position: relative;
  max-width: 100%;
}

.message.user .message-content {
  background: #007bff;
  color: white;
}

.message-text {
  margin-bottom: 0.25rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  text-align: right;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem 0;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background: #666;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
  30% { transform: scale(1.2); opacity: 1; }
}

/* 输入区域 */
.input-container {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.input-container textarea {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  max-height: 120px;
  min-height: 40px;
}

.input-container textarea:focus {
  outline: none;
  border-color: #007bff;
}

.input-container textarea:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.send-btn {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  min-width: 50px;
  height: 50px;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message {
    max-width: 90%;
  }
  
  .character-details h2 {
    font-size: 1.1rem;
  }
  
  .character-details p {
    font-size: 0.8rem;
  }
}
</style>