import api from './api'

export const characterService = {
  // 获取用户创建的角色
  async getUserCharacters() {
    const response = await api.get('/api/characters/')
    return response.data
  },

  // 获取公开角色
  async getPublicCharacters() {
    const response = await api.get('/api/characters/public')
    return response.data
  },

  // 创建角色
  async createCharacter(characterData) {
    const response = await api.post('/api/characters/', characterData)
    return response.data
  },

  // 获取角色详情
  async getCharacterDetail(characterId) {
    const response = await api.get(`/api/characters/${characterId}`)
    return response.data
  },

  // 更新角色
  async updateCharacter(characterId, characterData) {
    const response = await api.put(`/api/characters/${characterId}`, characterData)
    return response.data
  },

  // 删除角色
  async deleteCharacter(characterId) {
    const response = await api.delete(`/api/characters/${characterId}`)
    return response.data
  }
}