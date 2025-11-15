<template>
  <div class="feature-card" @click="$emit('click')">
    <div class="card-icon">
      {{ icon }}
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-description">{{ description }}</p>
    </div>
    <div class="card-arrow">→</div>
  </div>
</template>

<script>
export default {
  name: 'FeatureCard',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: '📄'
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.feature-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: #c0c0c0;
}

.card-icon {
  font-size: 2rem;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.card-description {
  color: #666;
  line-height: 1.5;
}

.card-arrow {
  font-size: 1.5rem;
  color: #999;
  margin-left: 1rem;
  transition: transform 0.2s;
}

.feature-card:hover .card-arrow {
  transform: translateX(4px);
  color: #333;
}
</style>