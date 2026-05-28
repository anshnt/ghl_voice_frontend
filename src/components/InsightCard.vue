<template>
  <article class="card insight-card">
    <span :class="['badge', insight.priority || 'medium']">{{ insight.priority || 'medium' }}</span>
    <h3>{{ insight.action }}</h3>
    <p>{{ insight.reasoning }}</p>
  </article>
</template>

<script setup>
defineProps({
  insight: { type: Object, required: true }
});
</script>

<style scoped>
.insight-card {
  border-radius: 8px;
  padding: 14px 16px;
}

h3 {
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  margin: 10px 0 6px;
}

p {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}
</style>
