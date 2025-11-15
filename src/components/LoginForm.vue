<template>
  <div class="login-form">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>用户名</label>
        <input 
          v-model="loginData.username"
          type="text" 
          required
          placeholder="请输入用户名"
        >
      </div>
      <div class="form-group">
        <label>密码</label>
        <input 
          v-model="loginData.password"
          type="password" 
          required
          placeholder="请输入密码"
        >
      </div>
      <button type="submit" :disabled="isLoading" class="submit-btn">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
    </form>
    <p class="switch-text">
      还没有账号？<a href="#" @click="switchToRegister">立即注册</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['switch-to-register', 'login-success'])

const authStore = useAuthStore()
const isLoading = ref(false)

const loginData = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  isLoading.value = true
  const result = await authStore.login(loginData.value.username, loginData.value.password)
  
  if (result.success) {
    emit('login-success')
  } else {
    alert(result.message)
  }
  isLoading.value = false
}

const switchToRegister = () => {
  emit('switch-to-register')
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #007bff;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.switch-text {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>