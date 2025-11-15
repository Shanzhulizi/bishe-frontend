import { defineStore } from 'pinia'
import { ref } from 'vue'
import { characterService } from '../services/character'

export const useCharacterStore = defineStore('character', () => {
  const characters = ref([])
  const currentCharacter = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // 获取用户创建的角色
  const fetchUserCharacters = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await characterService.getUserCharacters()
      characters.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err.response?.data?.detail || '获取角色列表失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 获取公开角色
  const fetchPublicCharacters = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await characterService.getPublicCharacters()
      characters.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err.response?.data?.detail || '获取公开角色失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 创建角色
  const createCharacter = async (characterData) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await characterService.createCharacter(characterData)
      characters.value.push(data)
      return { success: true, data }
    } catch (err) {
      error.value = err.response?.data?.detail || '创建角色失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 获取角色详情
  const fetchCharacterDetail = async (characterId) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await characterService.getCharacterDetail(characterId)
      currentCharacter.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err.response?.data?.detail || '获取角色详情失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 清空错误
  const clearError = () => {
    error.value = null
  }

  return {
    characters,
    currentCharacter,
    isLoading,
    error,
    fetchUserCharacters,
    fetchPublicCharacters,
    createCharacter,
    fetchCharacterDetail,
    clearError
  }
})