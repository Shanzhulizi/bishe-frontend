<template>
    <div class="scene-list">
        <div class="page-header">
            <h1>场景选择</h1>
            <button class="back-btn" @click="goBack">← 返回</button>
        </div>

        <div class="search-section">
            <div class="search-container">
                <input v-model="searchQuery" type="text" placeholder="搜索场景..." class="search-input"
                    @keyup.enter="handleSearch">
                <button class="search-btn" @click="handleSearch">🔍</button>
            </div>
        </div>

        <div class="scenes-grid">
            <div v-for="scene in filteredScenes" :key="scene.id" class="scene-card" @click="selectScene(scene)">
                <div class="scene-image">
                    <div class="scene-emoji">{{ scene.emoji }}</div>
                </div>
                <div class="scene-content">
                    <h3>{{ scene.name }}</h3>
                    <p class="scene-description">{{ scene.description }}</p>
                    <div class="scene-meta">
                        <span class="scene-category">{{ scene.category }}</span>
                        <span class="scene-count">👥 {{ scene.characterCount }} 角色</span>
                    </div>
                    <div class="scene-tags">
                        <span v-for="tag in scene.tags" :key="tag" class="scene-tag">
                            {{ tag }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="filteredScenes.length === 0" class="empty-state">
            <p>暂无场景，请尝试调整搜索条件</p>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'SceneList',
    setup() {
        const router = useRouter()
        const searchQuery = ref('')

        // 模拟场景数据
        const scenes = ref([
            {
                id: 1,
                name: '历史课堂',
                emoji: '🏛️',
                description: '穿越时空，与历史人物面对面交流',
                category: '教育学习',
                characterCount: 8,
                tags: ['历史', '教育', '知识'],
                background: '古代学堂场景，充满文化氛围'
            },
            {
                id: 2,
                name: '科幻世界',
                emoji: '🚀',
                description: '探索未来科技与外星文明',
                category: '科幻冒险',
                characterCount: 6,
                tags: ['科幻', '未来', '冒险'],
                background: '太空站和未来城市景观'
            },
            {
                id: 3,
                name: '心理诊所',
                emoji: '🛋️',
                description: '安全的心灵交流空间',
                category: '情感交流',
                characterCount: 4,
                tags: ['心理', '情感', '咨询'],
                background: '温馨舒适的心理咨询室'
            },
            {
                id: 4,
                name: '语言咖啡馆',
                emoji: '☕',
                description: '轻松愉快的多语言交流环境',
                category: '语言学习',
                characterCount: 5,
                tags: ['语言', '交流', '学习'],
                background: '温馨的咖啡馆氛围'
            },
            {
                id: 5,
                name: '奇幻森林',
                emoji: '🌳',
                description: '魔法与神秘生物的奇幻世界',
                category: '奇幻冒险',
                characterCount: 7,
                tags: ['奇幻', '魔法', '冒险'],
                background: '神秘的魔法森林'
            },
            {
                id: 6,
                name: '商务会议室',
                emoji: '💼',
                description: '专业的商务谈判与沟通场景',
                category: '职业发展',
                characterCount: 3,
                tags: ['商务', '职业', '沟通'],
                background: '现代化的会议室'
            }
        ])

        const filteredScenes = computed(() => {
            if (!searchQuery.value) return scenes.value

            return scenes.value.filter(scene =>
                scene.name.includes(searchQuery.value) ||
                scene.description.includes(searchQuery.value) ||
                scene.tags.some(tag => tag.includes(searchQuery.value))
            )
        })

        const handleSearch = () => {
            // 搜索逻辑
        }

        const selectScene = (scene) => {
            alert(`进入场景: ${scene.name}`)
            // 实际项目中这里会跳转到该场景的角色选择页面
        }

        const goBack = () => {
            router.back()
        }

        return {
            searchQuery,
            filteredScenes,
            handleSearch,
            selectScene,
            goBack
        }
    }
}
</script>

<style scoped>
.scene-list {
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
    margin-bottom: 2rem;
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

.scenes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}

.scene-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.scene-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.scene-image {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
    text-align: center;
}

.scene-emoji {
    font-size: 4rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.scene-content {
    padding: 1.5rem;
}

.scene-content h3 {
    margin-bottom: 0.5rem;
    color: #333;
    font-size: 1.25rem;
}

.scene-description {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.scene-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.scene-category {
    background: #007bff;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 500;
}

.scene-count {
    color: #6c757d;
}

.scene-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.scene-tag {
    padding: 0.25rem 0.75rem;
    background: #e9ecef;
    border-radius: 12px;
    font-size: 0.8rem;
    color: #495057;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #6c757d;
    background: white;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
}
</style>