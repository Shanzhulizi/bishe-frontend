<template>
    <div class="character-list">
        <div class="page-header">
            <h1>角色推荐</h1>
            <button class="back-btn" @click="goBack">← 返回</button>
        </div>

        <div class="search-section">
            <div class="search-container">
                <input v-model="searchQuery" type="text" placeholder="搜索角色..." class="search-input"
                    @keyup.enter="handleSearch">
                <button class="search-btn" @click="handleSearch">🔍</button>
            </div>
        </div>

        <div class="filter-section">
            <div class="filter-tags">
                <span v-for="tag in tags" :key="tag" :class="['tag', { active: selectedTags.includes(tag) }]"
                    @click="toggleTag(tag)">
                    {{ tag }}
                </span>
            </div>
        </div>

        <!-- 显示加载状态 -->
        <div v-if="characterStore.isLoading" class="loading-state">
            <p>加载中...</p>
        </div>

        <!-- 显示错误信息 -->
        <div v-else-if="characterStore.error" class="error-state">
            <p>{{ characterStore.error }}</p>
            <button @click="loadCharacters">重试</button>
        </div>

        <!-- 显示角色列表 -->
        <div v-else class="characters-grid">
            <div v-for="character in filteredCharacters" :key="character.id" class="character-card"
                @click="startChat(character)">
                <div class="character-avatar">
                    {{ character.avatar_url || '👤' }}
                </div>
                <div class="character-info">
                    <h3>{{ character.name }}</h3>
                    <p class="character-desc">{{ character.description }}</p>
                    <div class="character-tags">
                        <span v-for="tag in character.tags" :key="tag" class="character-tag">
                            {{ tag }}
                        </span>
                    </div>
                    <div class="character-stats">
                        <span>👍 {{ character.rating || 0 }}</span>
                        <span>💬 {{ character.usage_count || 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!characterStore.isLoading && !characterStore.error && filteredCharacters.length === 0" class="empty-state">
            <p>暂无角色，请尝试调整搜索条件</p>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'  // 添加 onMounted 导入
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/character'

export default {
    name: 'CharacterList',
    setup() {
        const router = useRouter()
        const characterStore = useCharacterStore()
        const searchQuery = ref('')
        const selectedTags = ref([])

        // 加载角色数据
        const loadCharacters = async () => {
            await characterStore.fetchPublicCharacters()
        }

        onMounted(async () => {
            await loadCharacters()
        })

        const tags = computed(() => {
            if (!characterStore.characters || characterStore.characters.length === 0) return []
            const allTags = characterStore.characters.flatMap(char => char.tags || [])
            return [...new Set(allTags)].filter(tag => tag) // 过滤掉空标签
        })

        const filteredCharacters = computed(() => {
            if (!characterStore.characters || characterStore.characters.length === 0) return []

            return characterStore.characters.filter(character => {
                if (!character) return false

                const name = character.name || ''
                const description = character.description || ''
                const tags = character.tags || []

                const searchTerm = searchQuery.value.toLowerCase()
                const matchesSearch = name.toLowerCase().includes(searchTerm) ||
                    description.toLowerCase().includes(searchTerm) ||
                    tags.some(tag => tag.toLowerCase().includes(searchTerm))
                    
                const matchesTags = selectedTags.value.length === 0 ||
                    selectedTags.value.some(tag => tags.includes(tag))
                    
                return matchesSearch && matchesTags
            })
        })

        const handleSearch = () => {
            // 搜索逻辑已集成在 computed 属性中
        }

        const toggleTag = (tag) => {
            const index = selectedTags.value.indexOf(tag)
            if (index > -1) {
                selectedTags.value.splice(index, 1)
            } else {
                selectedTags.value.push(tag)
            }
        }

        const startChat = (character) => {
            router.push(`/chat/${character.id}`)
        }

        const goBack = () => {
            router.back()
        }

        return {
            searchQuery,
            selectedTags,
            filteredCharacters,
            tags,
            characterStore,
            handleSearch,
            toggleTag,
            startChat,
            goBack,
            loadCharacters
        }
    }
}
</script>

<style scoped>
.character-list {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2rem;
    color: #333;
}

.back-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
}

.search-section {
    margin-bottom: 1.5rem;
}

.search-container {
    display: flex;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border: 1px solid #e0e0e0;
    overflow: hidden;
    max-width: 500px;
}

.search-input {
    flex: 1;
    padding: 1rem 1.5rem;
    border: none;
    outline: none;
    font-size: 1rem;
}

.search-btn {
    padding: 1rem 1.5rem;
    border: none;
    background: #f8f9fa;
    cursor: pointer;
    font-size: 1.2rem;
}

.filter-section {
    margin-bottom: 2rem;
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tag {
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
}

.tag.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.loading-state, .error-state {
    text-align: center;
    padding: 3rem;
    color: #6c757d;
}

.error-state button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.characters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.character-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border: 1px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.character-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.character-avatar {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 1rem;
}

.character-info h3 {
    margin-bottom: 0.5rem;
    color: #333;
}

.character-desc {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.character-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.character-tag {
    padding: 0.25rem 0.5rem;
    background: #e9ecef;
    border-radius: 12px;
    font-size: 0.8rem;
    color: #495057;
}

.character-stats {
    display: flex;
    justify-content: space-between;
    color: #6c757d;
    font-size: 0.9rem;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #6c757d;
}
</style>