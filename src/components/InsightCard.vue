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
  padding: 16px;
}

h3 {
  font-size: 15px;
  line-height: 1.35;
  margin: 12px 0 8px;
}

p {
  color: #475569;
  font-size: 14px;
  margin: 0;
}
</style>
