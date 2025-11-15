<template>
  <div class="chat-page">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <div class="character-info">
        <div class="character-avatar">{{ currentCharacter?.emoji }}</div>
        <div class="character-details">
          <h2>{{ currentCharacter?.name }}</h2>
          <p>{{ currentCharacter?.description }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="toggleVoice" :class="{ active: isVoiceMode }">
          🎤
        </button>
        <button class="action-btn" @click="clearChat">
          🗑️
        </button>
      </div>
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
            {{ message.role === 'user' ? '👤' : currentCharacter?.emoji }}
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" class="message assistant loading">
          <div class="message-avatar">{{ currentCharacter?.emoji }}</div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 语音识别状态 -->
      <div v-if="isListening" class="voice-recognition">
        <div class="voice-animation">
          <div class="voice-bar"></div>
          <div class="voice-bar"></div>
          <div class="voice-bar"></div>
          <div class="voice-bar"></div>
          <div class="voice-bar"></div>
        </div>
        <p>正在聆听... 请说话</p>
        <button class="stop-voice-btn" @click="stopVoiceRecognition">
          停止录音
        </button>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-actions">
          <button 
            class="voice-btn" 
            @click="toggleVoiceRecognition"
            :class="{ active: isListening }"
          >
            {{ isListening ? '⏹️' : '🎤' }}
          </button>
        </div>
        
        <textarea
          v-model="inputMessage"
          @keydown.enter.exact.prevent="sendMessage"
          placeholder="输入消息... (Enter发送)"
          rows="1"
          @input="autoResize"
          ref="textInput"
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
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCharacterStore } from '../stores/character'  // 导入角色store

export default {
  name: 'Chat',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const characterStore = useCharacterStore()  // 使用角色store

    const messagesContainer = ref(null)
    const textInput = ref(null)
    
    // 状态管理
    const inputMessage = ref('')
    const isLoading = ref(false)
    const isListening = ref(false)
    const isVoiceMode = ref(false)
    
    // 语音识别相关
    const recognition = ref(null)
    const speechSynthesis = ref(null)
    
    // 当前角色信息
    const currentCharacter = ref(null)
    
    // 消息列表
    const messages = reactive([])
    
   

    // 初始化角色
    onMounted(async () => {
      const characterId = route.params.characterId
      console.log('聊天页面接收到的角色ID:', characterId)
      
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
            name: '新角色',
            emoji: '👤',
            description: '自定义角色',
            personality: '这是一个新创建的角色'
          }
        }
      } else {
        // 如果没有角色ID，使用默认角色
        currentCharacter.value = {
          id: 1,
          name: 'AI助手',
          emoji: '🤖',
          description: '智能AI助手',
          personality: '我是你的AI助手，很高兴为你服务！'
        }
      }
      
      // 初始化语音识别（如果浏览器支持）
      initSpeechRecognition()
      initSpeechSynthesis()
      
      // 添加欢迎消息
      addMessage({
        id: Date.now(),
        role: 'assistant',
        content: currentCharacter.value.personality ? 
          `${currentCharacter.value.name}：${currentCharacter.value.personality}` :
          `你好！我是${currentCharacter.value.name}，很高兴与你交流！`,
        timestamp: new Date()
      })
    })

    // 初始化语音识别
    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition.value = new SpeechRecognition()
        recognition.value.continuous = false
        recognition.value.interimResults = true
        recognition.value.lang = 'zh-CN'
        
        recognition.value.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('')
          inputMessage.value = transcript
        }
        
        recognition.value.onend = () => {
          isListening.value = false
          if (inputMessage.value.trim() && isVoiceMode.value) {
            sendMessage()
          }
        }
      }
    }

    // 初始化语音合成
    const initSpeechSynthesis = () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.value = window.speechSynthesis
      }
    }

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
        // 模拟AI回复（实际项目中这里会调用后端API）
        await simulateAIResponse(userInput)
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

    // 模拟AI回复
    const simulateAIResponse = async (userInput) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const responses = [
            `这是一个模拟回复。你刚才说："${userInput}"`,
            `很有意思的话题！关于"${userInput}"，你有什么想深入探讨的吗？`,
            `作为${currentCharacter.value.name}，我对"${userInput}"这个话题很感兴趣。`,
            `让我想想怎么回答"${userInput}"... 这确实是个值得讨论的问题。`
          ]
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]
          
          const aiMessage = {
            id: Date.now(),
            role: 'assistant',
            content: randomResponse,
            timestamp: new Date()
          }
          
          addMessage(aiMessage)
          
          // 语音播报
          if (isVoiceMode.value) {
            speakText(randomResponse)
          }
          
          resolve()
        }, 1500 + Math.random() * 1000) // 模拟网络延迟
      })
    }

    // 语音播报
    const speakText = (text) => {
      if (speechSynthesis.value) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'zh-CN'
        utterance.rate = 1.0
        utterance.pitch = 1.0
        speechSynthesis.value.speak(utterance)
      }
    }

    // 切换语音识别
    const toggleVoiceRecognition = () => {
      if (!recognition.value) {
        alert('您的浏览器不支持语音识别功能')
        return
      }
      
      if (isListening.value) {
        stopVoiceRecognition()
      } else {
        startVoiceRecognition()
      }
    }

    // 开始语音识别
    const startVoiceRecognition = () => {
      if (recognition.value) {
        isListening.value = true
        inputMessage.value = ''
        recognition.value.start()
      }
    }

    // 停止语音识别
    const stopVoiceRecognition = () => {
      if (recognition.value) {
        recognition.value.stop()
        isListening.value = false
      }
    }

    // 切换语音模式
    const toggleVoice = () => {
      isVoiceMode.value = !isVoiceMode.value
      if (isVoiceMode.value) {
        alert('已开启语音模式，AI回复将会语音播报')
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

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 清理资源
    onUnmounted(() => {
      if (recognition.value) {
        recognition.value.stop()
      }
      if (speechSynthesis.value) {
        speechSynthesis.value.cancel()
      }
    })

    return {
      inputMessage,
      isLoading,
      isListening,
      isVoiceMode,
      currentCharacter,
      messages,
      messagesContainer,
      textInput,
      sendMessage,
      toggleVoiceRecognition,
      stopVoiceRecognition,
      toggleVoice,
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
}

.character-details p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
}

.action-btn.active {
  background: #007bff;
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
}

.message.user .message-content {
  background: #007bff;
  color: white;
}

.message-text {
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
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

/* 语音识别状态 */
.voice-recognition {
  text-align: center;
  padding: 2rem;
  background: #e3f2fd;
  margin: 1rem;
  border-radius: 12px;
}

.voice-animation {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.voice-bar {
  width: 4px;
  height: 20px;
  background: #007bff;
  border-radius: 2px;
  animation: voicePulse 1.2s infinite ease-in-out;
}

.voice-bar:nth-child(1) { animation-delay: 0s; }
.voice-bar:nth-child(2) { animation-delay: 0.2s; }
.voice-bar:nth-child(3) { animation-delay: 0.4s; }
.voice-bar:nth-child(4) { animation-delay: 0.6s; }
.voice-bar:nth-child(5) { animation-delay: 0.8s; }

@keyframes voicePulse {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(2); }
}

.stop-voice-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
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

.input-actions {
  display: flex;
  gap: 0.5rem;
}

.voice-btn {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
}

.voice-btn.active {
  background: #dc3545;
  color: white;
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
}

.input-container textarea:focus {
  outline: none;
  border-color: #007bff;
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