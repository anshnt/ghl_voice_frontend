<template>
  <article class="card score-card">
    <span class="label">{{ label }}</span>
    <strong>{{ value }}</strong>
    <small :class="trendClass">{{ trend }}</small>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  trend: { type: String, default: 'Current period' },
  tone: { type: String, default: 'neutral' }
});

const trendClass = computed(() => ['trend', props.tone]);
</script>

<style scoped>
.score-card {
  min-height: 104px;
  padding: 14px 16px;
}

.label {
  color: #64748b;
  display: block;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 8px;
}

strong {
  display: block;
  font-size: clamp(19px, 1.6vw, 24px);
  letter-spacing: 0;
  line-height: 1.08;
  margin-bottom: 8px;
  overflow-wrap: anywhere;
}

.trend {
  color: #3b82f6;
  display: block;
  font-size: 12px;
  line-height: 1.3;
}

.trend.good {
  color: #22c55e;
}

.trend.critical {
  color: #ef4444;
}

.trend.warning {
  color: #f59e0b;
}
</style>
