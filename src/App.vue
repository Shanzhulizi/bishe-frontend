<template>
  <div id="app">
     <header class="app-header" v-if="authStore.isAuthenticated">
      <h1>AI角色扮演聊天平台</h1>
      <nav class="nav">
        <span class="user-info">欢迎，{{ authStore.user?.username }}</span>
        <button class="nav-btn" @click="authStore.logout">退出登录</button>
      </nav>
    </header>
    <!-- <main class="main-content">
      <div v-if="currentView === 'home'" class="search-section">
        <div class="search-container">
          <input v-model="searchQuery" type="text" placeholder="搜索角色、场景或对话..." class="search-input"
            @keyup.enter="handleSearch">
          <button class="search-btn" @click="handleSearch">
            🔍
          </button>
        </div>
      </div>

      <Home v-if="currentView === 'home'" :search-query="searchQuery" @clear-search="clearSearch" />
      <div v-else-if="currentView === 'profile'" class="profile-page">
        <h2>个人中心</h2>
        <p>个人中心功能开发中...</p>
      </div>2
    </main> -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import Home from './views/Home.vue'



export default {
  name: 'App',
  components: {
    Home
  },
  setup() {
    const authStore = useAuthStore()

    onMounted(() => {
      authStore.initAuth()
    })

    return { authStore }
  },
  data() {
    return {
      currentView: 'home',
      searchQuery: ''
    }
  },
  methods: {
    handleSearch() {
      if (this.searchQuery.trim()) {
        alert(`搜索: ${this.searchQuery}`)
        // 实际项目中这里会触发搜索逻辑
      }
    },
    clearSearch() {
      this.searchQuery = ''
    }
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

.profile-page {
  text-align: center;
  padding: 2rem;
}



/* 搜索框样式 */
.search-section {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-container:focus-within {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #c0c0c0;
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