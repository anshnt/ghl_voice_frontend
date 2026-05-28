<template>
  <section class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Insights</h1>
        <p class="muted">Coaching priorities and recent calls that need review.</p>
      </div>
    </div>

    <div class="grid insights-layout">
      <section class="recommendation-stack">
        <h2 class="section-title">Recommended Actions</h2>
        <InsightCard v-for="item in recommendations" :key="item.action" :insight="item" />
      </section>

      <section class="card panel">
        <h2 class="section-title">Review Queue</h2>
        <div v-for="call in reviewQueue" :key="call.id" class="review-row">
          <RouterLink :to="`/transcripts/${call.id}`">
            <strong>{{ call.agent_name }}</strong>
            <span>{{ formatDate(call.call_date) }} · {{ Number(call.overall_score || 0).toFixed(1) }} score</span>
          </RouterLink>
          <span :class="['badge', call.status === 'Pass' ? 'pass' : 'fail']">{{ call.status }}</span>
        </div>
      </section>
    </div>

    <section class="card panel">
      <h2 class="section-title">Failure Signals</h2>
      <div class="signal-grid">
        <article v-for="failure in failures" :key="failure.type" class="signal-card">
          <span>{{ failure.count }}</span>
          <strong>{{ failure.type }}</strong>
          <p>Repeated pattern detected across analyzed calls.</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import InsightCard from '../components/InsightCard.vue';
import { fetchKpiOverview, fetchTranscripts } from '../api/client.js';

const summary = ref({});
const calls = ref([]);

const recommendations = computed(() => summary.value.recent_recommendations || []);
const failures = computed(() => summary.value.top_failures || []);
const reviewQueue = computed(() =>
  [...calls.value].filter((call) => call.status === 'Fail').slice(0, 8)
);

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

async function loadInsights() {
  try {
    const [overview, transcriptRows] = await Promise.all([
      fetchKpiOverview(),
      fetchTranscripts({ limit: 40, offset: 0 })
    ]);
    summary.value = overview.summary;
    calls.value = transcriptRows;
  } catch {
    summary.value = {};
    calls.value = [];
  }
}

onMounted(loadInsights);
</script>

<style scoped>
.insights-layout {
  align-items: start;
  grid-template-columns: minmax(0, 1fr) 420px;
  margin-bottom: 22px;
}

.recommendation-stack {
  display: grid;
  gap: 12px;
}

.review-row {
  align-items: center;
  border-bottom: 1px solid #e7ecf4;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 12px 0;
}

.review-row:last-child {
  border-bottom: 0;
}

.review-row strong,
.review-row span {
  display: block;
}

.review-row a span {
  color: #64748b;
  font-size: 13px;
}

.signal-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.signal-card {
  background: #f8fbff;
  border: 1px solid #dfe5ef;
  border-radius: 8px;
  padding: 14px;
}

.signal-card span {
  color: #ef4444;
  display: block;
  font-size: 22px;
  font-weight: 900;
}

.signal-card p {
  color: #64748b;
  font-size: 13px;
  margin: 6px 0 0;
}

@media (max-width: 1000px) {
  .insights-layout,
  .signal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
