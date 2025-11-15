<template>
  <div id="app">
    <header class="app-header" v-if="authStore.isAuthenticated">
      <h1>AI角色扮演聊天平台</h1>
      <nav class="nav">
        <span class="user-info">欢迎，{{ authStore.user?.username }}</span>
        <button class="nav-btn" @click="authStore.logout">退出登录</button>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()

    onMounted(() => {
      authStore.initAuth()
    })

    return { authStore }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}

.app-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-info {
  color: #666;
}

.nav-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f8f9fa;
  border-color: #999;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>