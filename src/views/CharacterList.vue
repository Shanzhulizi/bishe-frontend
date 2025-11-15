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

        <div class="characters-grid">
            <div v-for="character in filteredCharacters" :key="character.id" class="character-card"
                @click="startChat(character)">
                <div class="character-avatar">
                    {{ character.emoji }}
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
                        <span>👍 {{ character.rating }}</span>
                        <span>💬 {{ character.usageCount }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="filteredCharacters.length === 0" class="empty-state">
            <p>暂无角色，请尝试调整搜索条件</p>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'CharacterList',
    setup() {
        const router = useRouter()
        const searchQuery = ref('')
        const selectedTags = ref([])

        // 模拟角色数据
        const characters = ref([
            {
                id: 1,
                name: '历史学者',
                emoji: '📚',
                description: '博学的历史教授，精通世界历史',
                tags: ['历史', '教育', '学者'],
                rating: 4.8,
                usageCount: 1234
            },
            {
                id: 2,
                name: '科幻作家',
                emoji: '🚀',
                description: '富有想象力的科幻小说作家',
                tags: ['科幻', '创意', '写作'],
                rating: 4.6,
                usageCount: 856
            },
            {
                id: 3,
                name: '心理导师',
                emoji: '🧠',
                description: '专业的心理咨询师，善于倾听和引导',
                tags: ['心理', '情感', '咨询'],
                rating: 4.9,
                usageCount: 2107
            },
            {
                id: 4,
                name: '语言伙伴',
                emoji: '🗣️',
                description: '多语言交流伙伴，帮助提升语言能力',
                tags: ['语言', '学习', '交流'],
                rating: 4.5,
                usageCount: 932
            }
        ])

        const tags = computed(() => {
            const allTags = characters.value.flatMap(char => char.tags)
            return [...new Set(allTags)]
        })

        const filteredCharacters = computed(() => {
            // 确保 characters.value 存在
            if (!characters.value) return []

            return characters.value.filter(character => {
                const matchesSearch = character.name.includes(searchQuery.value) ||
                    character.description.includes(searchQuery.value)
                const matchesTags = selectedTags.value.length === 0 ||
                    selectedTags.value.some(tag => character.tags.includes(tag))
                return matchesSearch && matchesTags
            })
        })

        const handleSearch = () => {
            // 搜索逻辑
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
            alert(`开始与 ${character.name} 聊天`)
            // 实际项目中这里会跳转到聊天页面
        }

        const goBack = () => {
            router.back()
        }

        return {
            searchQuery,
            selectedTags,
            filteredCharacters,
            tags,
            handleSearch,
            toggleTag,
            startChat,
            goBack
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.characters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.character-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.character-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
