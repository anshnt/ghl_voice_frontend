<template>
  <div class="card table-card">
    <table>
      <thead>
        <tr>
          <th @click="setSort('agent_name')">Agent</th>
          <th @click="setSort('call_date')">Date</th>
          <th @click="setSort('duration_seconds')">Duration</th>
          <th @click="setSort('overall_score')">Score</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="call in sortedCalls" :key="call.id" @click="openCall(call.id)">
          <td>
            <RouterLink class="agent-link" :to="`/agents/${call.agent_id}`" @click.stop>
              {{ call.agent_name }}
            </RouterLink>
          </td>
          <td>{{ formatDate(call.call_date) }}</td>
          <td>{{ formatDuration(call.duration_seconds) }}</td>
          <td>{{ formatScore(call.overall_score) }}</td>
          <td>
            <span :class="['badge', call.status === 'Pass' ? 'pass' : 'fail']">
              {{ call.status || 'Pending' }}
            </span>
          </td>
          <td>
            <RouterLink class="open-link" :to="`/transcripts/${call.id}`" @click.stop>
              Review
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="sortedCalls.length === 0" class="empty-state">No calls match the current view.</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  calls: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false }
});

const router = useRouter();
const sortKey = ref('call_date');
const sortDirection = ref('desc');

const sortedCalls = computed(() => {
  return [...props.calls].sort((a, b) => {
    const left = a[sortKey.value] ?? '';
    const right = b[sortKey.value] ?? '';
    const compare = left > right ? 1 : left < right ? -1 : 0;
    return sortDirection.value === 'asc' ? compare : -compare;
  });
});

function setSort(key) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    return;
  }

  sortKey.value = key;
  sortDirection.value = 'desc';
}

function formatDate(value) {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    month: props.compact ? 'short' : 'short',
    day: 'numeric',
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

function formatScore(score) {
  return score === null || score === undefined ? '-' : Number(score).toFixed(1);
}

function openCall(id) {
  router.push(`/transcripts/${id}`);
}
</script>

<style scoped>
.table-card {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  min-width: 760px;
  width: 100%;
}

th,
td {
  border-bottom: 1px solid var(--border);
  padding: 12px 14px;
  text-align: left;
  white-space: nowrap;
}

th {
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
}

tbody tr {
  cursor: pointer;
}

tbody tr:hover {
  background: var(--surface-soft);
}

.agent-link {
  color: var(--primary);
  font-weight: 800;
}

.open-link {
  color: var(--accent);
  font-weight: 700;
}
</style>
