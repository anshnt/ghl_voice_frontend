<template>
  <section class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ transcript?.agent_name || 'Transcript' }}</h1>
        <p class="muted">
          {{ formatDate(transcript?.call_date) }} · {{ formatDuration(transcript?.duration_seconds) }} ·
          {{ transcript?.caller_phone || 'Unknown caller' }}
        </p>
      </div>
      <span :class="['badge', score >= 7 ? 'pass' : 'fail']">{{ score.toFixed(1) }}</span>
    </div>

    <div class="grid transcript-grid">
      <section>
        <FlaggedSegment
          v-for="(segment, index) in transcriptMessages"
          :key="`${segment.timestamp}-${index}`"
          :segment="segment"
          :flags="flags"
        />
      </section>

      <aside class="sidebar">
        <h2 class="section-title">Call Recommendations</h2>
        <InsightCard v-for="item in recommendations" :key="item.action" :insight="item" />
        <div v-if="recommendations.length === 0" class="card empty-state">
          No call-level recommendations yet.
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import FlaggedSegment from '../components/FlaggedSegment.vue';
import InsightCard from '../components/InsightCard.vue';
import { fetchTranscript } from '../api/client.js';

const props = defineProps({
  id: { type: String, required: true }
});

const transcript = ref(null);

const score = computed(() => Number(transcript.value?.overall_score || 0));
const transcriptMessages = computed(() => transcript.value?.raw_transcript || []);
const recommendations = computed(() => transcript.value?.recommendations || []);
const flags = computed(() => {
  const failures = (transcript.value?.failures || []).map((item) => ({
    ...item,
    kind: 'failure',
    segment: item.transcript_segment
  }));
  const useActions = (transcript.value?.use_actions || []).map((item) => ({
    ...item,
    kind: 'use_action'
  }));
  return [...failures, ...useActions];
});

function formatDate(value) {
  if (!value) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

async function loadTranscript() {
  try {
    transcript.value = await fetchTranscript(props.id);
  } catch {
    transcript.value = null;
  }
}

onMounted(loadTranscript);
</script>

<style scoped>
.transcript-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
}

.sidebar {
  background: var(--surface-soft);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
}

.sidebar .section-title {
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
}

.sidebar .insight-card {
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 0;
}

.sidebar .insight-card h3 {
  color: var(--text);
}

.sidebar .insight-card p {
  color: var(--muted);
}

.sidebar .empty-state {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--muted);
  text-align: center;
}

@media (max-width: 900px) {
  .transcript-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}
</style>
