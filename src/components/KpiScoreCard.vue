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
  min-height: 126px;
  padding: 18px;
}

.label {
  color: #64748b;
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 12px;
}

strong {
  display: block;
  font-size: 30px;
  line-height: 1;
  margin-bottom: 12px;
}

.trend {
  color: #3b82f6;
  font-size: 13px;
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
