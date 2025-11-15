<template>
  <div class="register-form">
    <h2>注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>用户名</label>
        <input 
          v-model="registerData.username"
          type="text" 
          required
          placeholder="请输入用户名"
        >
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input 
          v-model="registerData.email"
          type="email" 
          required
          placeholder="请输入邮箱"
        >
      </div>
      <div class="form-group">
        <label>密码</label>
        <input 
          v-model="registerData.password"
          type="password" 
          required
          placeholder="请输入密码"
        >
      </div>
      <div class="form-group">
        <label>确认密码</label>
        <input 
          v-model="confirmPassword"
          type="password" 
          required
          placeholder="请再次输入密码"
        >
      </div>
      <button type="submit" :disabled="isLoading" class="submit-btn">
        {{ isLoading ? '注册中...' : '注册' }}
      </button>
    </form>
    <p class="switch-text">
      已有账号？<a href="#" @click="switchToLogin">立即登录</a>
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['switch-to-login', 'register-success'])

const authStore = useAuthStore()
const isLoading = ref(false)

const registerData = ref({
  username: '',
  email: '',
  password: ''
})

const confirmPassword = ref('')
const passwordError = ref('')

watch([() => registerData.value.password, confirmPassword], () => {
  if (registerData.value.password && confirmPassword.value && 
      registerData.value.password !== confirmPassword.value) {
    passwordError.value = '两次输入的密码不一致'
  } else {
    passwordError.value = ''
  }
})

const handleRegister = async () => {
  if (registerData.value.password !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }
  
  if (registerData.value.password.length < 6) {
    alert('密码长度至少6位')
    return
  }
  
  isLoading.value = true
  const result = await authStore.register(registerData.value)
  
  if (result.success) {
    alert('注册成功！请登录')
    emit('register-success')
    switchToLogin()
  } else {
    alert(result.message)
  }
  isLoading.value = false
}

const switchToLogin = () => {
  emit('switch-to-login')
}
</script>

<style scoped>
.register-form {
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
  background: #28a745;
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
  background: #218838;
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