<template>
  <div class="auth-page">
    <div class="auth-container">
      <LoginForm 
        v-if="currentForm === 'login'"
        @switch-to-register="currentForm = 'register'"
        @login-success="handleLoginSuccess"
      />
      <RegisterForm 
        v-else
        @switch-to-login="currentForm = 'login'"
        @register-success="currentForm = 'login'"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'

const router = useRouter()
const currentForm = ref('login')

const handleLoginSuccess = () => {
  router.push('/')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 450px;
}
</style>