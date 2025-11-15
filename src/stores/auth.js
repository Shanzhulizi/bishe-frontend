import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // 初始化认证状态
  const initAuth = () => {
    const token = localStorage.getItem('access_token')
    const userInfo = localStorage.getItem('user_info')
    
    if (token && userInfo) {
      user.value = JSON.parse(userInfo)
      isAuthenticated.value = true
    }
  }

  // 用户登录
  const login = async (username, password) => {
    isLoading.value = true
    try {
      const data = await authService.login(username, password)
      
      // 保存token和用户信息
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user_info', JSON.stringify(data.user))
      
      user.value = data.user
      isAuthenticated.value = true
      
      return { success: true, message: '登录成功' }
    } catch (error) {
      const message = error.response?.data?.detail || '登录失败'
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  // 用户注册
  const register = async (userData) => {
    isLoading.value = true
    try {
      const data = await authService.register(userData)
      return { success: true, message: '注册成功', data }
    } catch (error) {
      const message = error.response?.data?.detail || '注册失败'
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  // 退出登录
  const logout = () => {
    authService.logout()
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    initAuth,
    login,
    register,
    logout
  }
})