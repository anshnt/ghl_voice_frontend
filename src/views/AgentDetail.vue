<template>
  <section class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ agent?.name || 'Agent' }}</h1>
        <p class="muted">{{ agent?.goal || 'No goal configured yet.' }}</p>
      </div>
      <RouterLink class="back-link" to="/">Back</RouterLink>
    </div>

    <div class="grid detail-grid">
      <section class="card panel">
        <h2 class="section-title">KPI Breakdown</h2>
        <div v-for="criterion in criteria" :key="criterion.name" class="criterion-row">
          <div>
            <strong>{{ criterion.name }}</strong>
            <p>{{ criterion.description }}</p>
          </div>
          <span>{{ formatScore(criterion.score) }} {{ criterion.trend }}</span>
        </div>
      </section>

      <section class="insights">
        <h2 class="section-title">AI Recommendations</h2>
        <InsightCard v-for="item in recommendations" :key="item.action" :insight="item" />
        <div v-if="recommendations.length === 0" class="card empty-state">
          No recommendations for this agent yet.
        </div>
      </section>
    </div>

    <section>
      <h2 class="section-title">Last 10 Calls</h2>
      <CallTable :calls="calls" compact />
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import CallTable from '../components/CallTable.vue';
import InsightCard from '../components/InsightCard.vue';
import { fetchAgentInsights, fetchTranscripts } from '../api/client.js';

const props = defineProps({
  id: { type: String, required: true }
});

const agent = ref(null);
const recommendations = ref([]);
const breakdown = ref([]);
const calls = ref([]);

const criteria = computed(() => {
  const configured = agent.value?.kpi_config?.criteria || [];
  return configured.map((criterion) => {
    const match = breakdown.value.find((item) => item.name === criterion.name);
    return {
      ...criterion,
      score: match?.score ?? 0,
      trend: match?.trend ?? '→'
    };
  });
});

function formatScore(score) {
  return Number(score || 0).toFixed(1);
}

async function loadAgent() {
  try {
    const [insights, transcriptRows] = await Promise.all([
      fetchAgentInsights(props.id),
      fetchTranscripts({ agentId: props.id, limit: 10, offset: 0 })
    ]);

    agent.value = insights.agent;
    recommendations.value = insights.recommendations || [];
    breakdown.value = insights.kpi_breakdown || [];
    calls.value = transcriptRows;
  } catch {
    agent.value = null;
    recommendations.value = [];
  }
}

onMounted(loadAgent);
</script>

<style scoped>
.back-link {
  color: #3b82f6;
  font-weight: 800;
}

.detail-grid {
  grid-template-columns: minmax(0, 1fr) 360px;
  margin-bottom: 22px;
}

.criterion-row {
  align-items: center;
  border-bottom: 1px solid #e7ecf4;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 13px 0;
}

.criterion-row:last-child {
  border-bottom: 0;
}

.criterion-row strong {
  display: block;
  margin-bottom: 4px;
}

.criterion-row p {
  color: #64748b;
  font-size: 13px;
  margin: 0;
}

.criterion-row span {
  color: #172033;
  font-weight: 900;
  white-space: nowrap;
}

.insights {
  display: grid;
  gap: 12px;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
