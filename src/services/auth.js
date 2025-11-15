import api from './api'

export const authService = {
  // 用户注册
  async register(userData) {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },

  // 用户登录
  async login(username, password) {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 获取当前用户信息
  async getCurrentUser() {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  // 退出登录
  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    window.location.href = '/'
  }
}