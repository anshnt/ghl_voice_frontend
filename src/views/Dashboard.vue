<template>
  <section class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Voice AI Observability</h1>
        <p class="muted">Quality, risk, and coaching signals across HighLevel Voice AI calls.</p>
      </div>
      <div class="header-metric">
        <span>Health Index</span>
        <strong>{{ healthIndex }}</strong>
      </div>
    </div>

    <div class="grid score-strip">
      <KpiScoreCard label="Avg Score" :value="avgScore" :tone="scoreTone" trend="All analyzed calls" />
      <KpiScoreCard label="Pass Rate" :value="passRate" :tone="passTone" trend="Score at or above 7.0" />
      <KpiScoreCard label="Critical Calls" :value="criticalCount" tone="critical" trend="Scores below 6.0" />
      <KpiScoreCard label="Avg Duration" :value="avgDuration" trend="Talk time per call" />
      <KpiScoreCard label="Score Range" :value="scoreRange" trend="Lowest to highest" />
      <KpiScoreCard label="Top Failure" :value="topFailure" tone="warning" trend="Most frequent issue" />
    </div>

    <div class="grid analytics-grid">
      <section class="card panel chart-panel wide">
        <div class="panel-heading">
          <h2 class="section-title">Quality Trend</h2>
          <span class="muted">{{ trendWindow }}</span>
        </div>
        <canvas ref="trendChartEl" aria-label="Average score and pass rate trend"></canvas>
      </section>

      <section class="card panel chart-panel">
        <h2 class="section-title">Failure Mix</h2>
        <canvas ref="failureChartEl" aria-label="Failure type mix"></canvas>
      </section>

      <section class="card panel chart-panel">
        <h2 class="section-title">Score Distribution</h2>
        <canvas ref="distributionChartEl" aria-label="Score distribution"></canvas>
      </section>

      <section class="card panel chart-panel wide">
        <h2 class="section-title">Agent Performance</h2>
        <canvas ref="agentChartEl" aria-label="Average score and pass rate per agent"></canvas>
      </section>
    </div>

    <div class="grid insight-grid">
      <section class="card panel">
        <h2 class="section-title">Agent Risk Queue</h2>
        <div v-for="agent in rankedAgents" :key="agent.id" class="agent-row">
          <RouterLink :to="`/agents/${agent.id}`">
            <strong>{{ agent.name }}</strong>
            <span>{{ Number(agent.avg_score || 0).toFixed(1) }} avg · {{ Math.round(agent.pass_rate || 0) }}% pass</span>
          </RouterLink>
          <span :class="['risk-pill', riskTone(agent)]">{{ riskLabel(agent) }}</span>
        </div>
      </section>

      <section class="recommendation-stack">
        <h2 class="section-title">Highest Leverage Fixes</h2>
        <InsightCard
          v-for="item in recommendations"
          :key="item.action"
          :insight="item"
        />
        <div v-if="recommendations.length === 0" class="card empty-state">
          No recommendations have been generated yet.
        </div>
      </section>
    </div>

    <section>
      <h2 class="section-title">Recent Calls</h2>
      <CallTable :calls="calls" />
    </section>
  </section>
</template>

<script setup>
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  ArcElement,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import CallTable from '../components/CallTable.vue';
import InsightCard from '../components/InsightCard.vue';
import KpiScoreCard from '../components/KpiScoreCard.vue';
import { fetchKpiOverview, fetchTranscripts } from '../api/client.js';

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

const summary = ref({ avg_score: 0, pass_rate: 0, analyzed_count: 0, top_failures: [] });
const agents = ref([]);
const calls = ref([]);
const agentChartEl = ref(null);
const trendChartEl = ref(null);
const failureChartEl = ref(null);
const distributionChartEl = ref(null);
let refreshTimer;
const charts = [];

const avgScore = computed(() => Number(summary.value.avg_score || 0).toFixed(1));
const passRate = computed(() => `${Math.round(summary.value.pass_rate || 0)}%`);
const healthIndex = computed(() => `${Math.round((summary.value.avg_score || 0) * 10)}%`);
const criticalCount = computed(() => String(summary.value.critical_count || 0));
const topFailure = computed(() => summary.value.top_failures?.[0]?.type || 'None');
const scoreRange = computed(
  () =>
    `${Number(summary.value.lowest_score || 0).toFixed(1)}-${Number(summary.value.highest_score || 0).toFixed(1)}`
);
const avgDuration = computed(() => formatDuration(Math.round(summary.value.avg_duration_seconds || 0)));
const scoreTone = computed(() => (summary.value.avg_score >= 7 ? 'good' : 'critical'));
const passTone = computed(() => (summary.value.pass_rate >= 60 ? 'good' : 'critical'));
const recommendations = computed(() => (summary.value.recent_recommendations || []).slice(0, 4));
const rankedAgents = computed(() =>
  [...agents.value].sort((a, b) => {
    if ((b.critical_count || 0) !== (a.critical_count || 0)) {
      return (b.critical_count || 0) - (a.critical_count || 0);
    }
    return (a.avg_score || 0) - (b.avg_score || 0);
  })
);
const trendWindow = computed(() => `${summary.value.daily_trend?.length || 0} active days`);

async function loadDashboard() {
  try {
    const [overview, transcriptData] = await Promise.all([
      fetchKpiOverview(),
      fetchTranscripts({ limit: 20, offset: 0 })
    ]);

    summary.value = overview.summary;
    agents.value = overview.agents || [];
    calls.value = transcriptData;
    await nextTick();
    renderCharts();
  } catch {
    summary.value = { avg_score: 0, pass_rate: 0, analyzed_count: 0, top_failures: [] };
  }
}

function destroyCharts() {
  while (charts.length) {
    charts.pop().destroy();
  }
}

function renderCharts() {
  destroyCharts();
  renderTrendChart();
  renderFailureChart();
  renderDistributionChart();
  renderAgentChart();
}

function renderAgentChart() {
  if (!agentChartEl.value) return;

  charts.push(new Chart(agentChartEl.value, {
    type: 'bar',
    data: {
      labels: agents.value.map((agent) => agent.name),
      datasets: [
        {
          label: 'Avg score',
          data: agents.value.map((agent) => Number(agent.avg_score || 0)),
          backgroundColor: '#3b82f6'
        },
        {
          label: 'Pass rate',
          data: agents.value.map((agent) => Number(agent.pass_rate || 0) / 10),
          backgroundColor: '#22c55e'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Agent' } },
        y: { min: 0, max: 10, title: { display: true, text: 'Score' } }
      },
      plugins: {
        legend: { display: true }
      }
    }
  }));
}

function renderTrendChart() {
  if (!trendChartEl.value) return;
  const trend = summary.value.daily_trend || [];

  charts.push(new Chart(trendChartEl.value, {
    type: 'line',
    data: {
      labels: trend.map((item) => formatShortDate(item.day)),
      datasets: [
        {
          label: 'Avg score',
          data: trend.map((item) => Number(item.avg_score || 0)),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          tension: 0.32
        },
        {
          label: 'Pass rate / 10',
          data: trend.map((item) => Number(item.pass_rate || 0) / 10),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          tension: 0.32
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Call date' } },
        y: { min: 0, max: 10, title: { display: true, text: 'Score scale' } }
      },
      plugins: { legend: { display: true } }
    }
  }));
}

function renderFailureChart() {
  if (!failureChartEl.value) return;
  const failures = summary.value.top_failures || [];

  charts.push(new Chart(failureChartEl.value, {
    type: 'doughnut',
    data: {
      labels: failures.map((item) => item.type),
      datasets: [
        {
          label: 'Failures',
          data: failures.map((item) => item.count),
          backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#64748b']
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  }));
}

function renderDistributionChart() {
  if (!distributionChartEl.value) return;
  const distribution = summary.value.score_distribution || [];

  charts.push(new Chart(distributionChartEl.value, {
    type: 'bar',
    data: {
      labels: distribution.map((item) => item.bucket),
      datasets: [
        {
          label: 'Calls',
          data: distribution.map((item) => item.count),
          backgroundColor: '#f59e0b'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Score band' } },
        y: { title: { display: true, text: 'Call count' } }
      },
      plugins: { legend: { display: true } }
    }
  }));
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}

function riskLabel(agent) {
  if ((agent.critical_count || 0) >= 4 || agent.pass_rate < 60) return 'Priority';
  if ((agent.failure_count || 0) >= 8 || agent.avg_score < 7.4) return 'Watch';
  return 'Healthy';
}

function riskTone(agent) {
  return riskLabel(agent).toLowerCase();
}

onMounted(async () => {
  await loadDashboard();
  refreshTimer = window.setInterval(loadDashboard, 60000);
});

onUnmounted(() => {
  if (refreshTimer) window.clearInterval(refreshTimer);
  destroyCharts();
});
</script>

<style scoped>
.header-metric {
  background: #172033;
  border-radius: 8px;
  color: #ffffff;
  min-width: 150px;
  padding: 12px 16px;
}

.header-metric span {
  color: #b6c2d3;
  display: block;
  font-size: 12px;
  font-weight: 800;
}

.header-metric strong {
  display: block;
  font-size: 26px;
  line-height: 1.05;
  margin-top: 4px;
}

.score-strip {
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-bottom: 18px;
}

.analytics-grid {
  align-items: stretch;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 22px;
}

.chart-panel {
  min-height: 330px;
}

.chart-panel.wide {
  min-height: 360px;
}

.panel-heading {
  align-items: baseline;
  display: flex;
  justify-content: space-between;
}

.chart-panel canvas {
  max-height: 320px;
}

.insight-grid {
  align-items: start;
  grid-template-columns: minmax(0, 1fr) 390px;
  margin-bottom: 22px;
}

.agent-row {
  align-items: center;
  border-bottom: 1px solid #e7ecf4;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  padding: 12px 0;
}

.agent-row:first-of-type {
  padding-top: 0;
}

.agent-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.agent-row strong,
.agent-row span {
  display: block;
}

.agent-row a span {
  color: #64748b;
  font-size: 13px;
  margin-top: 2px;
}

.risk-pill {
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  padding: 4px 9px;
}

.risk-pill.priority {
  background: rgba(239, 68, 68, 0.13);
  color: #b91c1c;
}

.risk-pill.watch {
  background: rgba(245, 158, 11, 0.16);
  color: #b45309;
}

.risk-pill.healthy {
  background: rgba(34, 197, 94, 0.13);
  color: #15803d;
}

.recommendation-stack {
  display: grid;
  gap: 12px;
}

@media (max-width: 900px) {
  .score-strip,
  .analytics-grid,
  .insight-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .score-strip,
  .analytics-grid,
  .insight-grid {
    grid-template-columns: 1fr;
  }
}
</style>
