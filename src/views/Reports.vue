<template>
  <section class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Reports</h1>
        <p class="muted">Score bands, agent benchmarks, and failure concentration.</p>
      </div>
    </div>

    <div class="grid report-grid">
      <section class="card panel">
        <h2 class="section-title">Agent Benchmark</h2>
        <div v-for="agent in agents" :key="agent.id" class="benchmark-row">
          <div>
            <strong>{{ agent.name }}</strong>
            <span>{{ agent.call_count }} calls · {{ agent.critical_count }} critical</span>
          </div>
          <div class="meter">
            <span :style="{ width: `${Math.min(agent.pass_rate || 0, 100)}%` }"></span>
          </div>
          <b>{{ Math.round(agent.pass_rate || 0) }}%</b>
        </div>
      </section>

      <section class="card panel">
        <h2 class="section-title">Score Distribution</h2>
        <div v-for="bucket in distribution" :key="bucket.bucket" class="bar-row">
          <span>{{ bucket.bucket }}</span>
          <div class="bar-track">
            <i :style="{ width: `${barWidth(bucket.count)}%` }"></i>
          </div>
          <b>{{ bucket.count }}</b>
        </div>
      </section>

      <section class="card panel">
        <h2 class="section-title">Failure Concentration</h2>
        <div v-for="failure in failures" :key="failure.type" class="failure-row">
          <strong>{{ failure.type }}</strong>
          <span>{{ failure.count }} flagged calls</span>
        </div>
      </section>

      <section class="card panel">
        <h2 class="section-title">Operating Snapshot</h2>
        <dl class="snapshot-list">
          <div>
            <dt>Total analyzed</dt>
            <dd>{{ summary.analyzed_count || 0 }}</dd>
          </div>
          <div>
            <dt>Average score</dt>
            <dd>{{ Number(summary.avg_score || 0).toFixed(1) }}</dd>
          </div>
          <div>
            <dt>Average duration</dt>
            <dd>{{ formatDuration(summary.avg_duration_seconds || 0) }}</dd>
          </div>
          <div>
            <dt>Pass rate</dt>
            <dd>{{ Math.round(summary.pass_rate || 0) }}%</dd>
          </div>
        </dl>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { fetchKpiOverview } from '../api/client.js';

const summary = ref({});
const agents = ref([]);

const distribution = computed(() => summary.value.score_distribution || []);
const failures = computed(() => summary.value.top_failures || []);
const maxBucket = computed(() => Math.max(...distribution.value.map((item) => item.count), 1));

function barWidth(count) {
  return (count / maxBucket.value) * 100;
}

function formatDuration(seconds) {
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = String(rounded % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

async function loadReports() {
  try {
    const overview = await fetchKpiOverview();
    summary.value = overview.summary;
    agents.value = overview.agents || [];
  } catch {
    summary.value = {};
    agents.value = [];
  }
}

onMounted(loadReports);
</script>

<style scoped>
.report-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.benchmark-row {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(180px, 1fr) minmax(130px, 220px) 46px;
  padding: 12px 0;
}

.benchmark-row + .benchmark-row,
.failure-row + .failure-row,
.snapshot-list div + div {
  border-top: 1px solid var(--border);
}

.benchmark-row span,
.failure-row span,
dt {
  color: var(--muted);
  display: block;
  font-size: 13px;
}

.meter,
.bar-track {
  background: #ebe7ff;
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
}

.meter span {
  background: var(--accent);
  display: block;
  height: 100%;
}

.bar-row {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 72px minmax(0, 1fr) 34px;
  padding: 10px 0;
}

.bar-track i {
  background: var(--primary);
  display: block;
  height: 100%;
}

.failure-row {
  padding: 13px 0;
}

.snapshot-list {
  margin: 0;
}

.snapshot-list div {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
}

dd {
  font-size: 20px;
  font-weight: 900;
  margin: 0;
}

@media (max-width: 900px) {
  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>
