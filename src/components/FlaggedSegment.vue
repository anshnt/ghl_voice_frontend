<template>
  <div :class="['message', segment.speaker?.toLowerCase(), flagClass]" @click="toggle">
    <span class="speaker">{{ segment.speaker || 'Speaker' }}</span>
    <p>{{ segment.text }}</p>
    <div v-if="open && flag" class="tooltip">{{ flag.description || flag.suggested_action }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  segment: { type: Object, required: true },
  flags: { type: Array, default: () => [] }
});

const open = ref(false);

const flag = computed(() =>
  props.flags.find((item) => props.segment.text.includes(item.segment || item.transcript_segment || ''))
);

const flagClass = computed(() => {
  if (!flag.value) return '';
  return flag.value.kind === 'failure' ? 'failure' : 'use-action';
});

function toggle() {
  if (flag.value) open.value = !open.value;
}
</script>

<style scoped>
.message {
  background: #ffffff;
  border: 1px solid #dfe5ef;
  border-left: 4px solid transparent;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 12px 14px;
  position: relative;
}

.message.agent {
  margin-left: 28px;
}

.message.caller {
  margin-right: 28px;
}

.failure {
  border-left-color: #ef4444;
  cursor: pointer;
}

.use-action {
  border-left-color: #f59e0b;
  cursor: pointer;
}

.speaker {
  color: #64748b;
  display: block;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 4px;
}

p {
  margin: 0;
}

.tooltip {
  background: #172033;
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  margin-top: 10px;
  padding: 10px;
}
</style>
