<template>
  <section class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">AI Assistant</h1>
        <p class="muted">Ask compact questions over summarized call quality data.</p>
      </div>
    </div>

    <div class="grid assistant-grid">
      <section class="card panel">
        <h2 class="section-title">AI Based Suggestions</h2>
        <InsightCard v-for="item in suggestions" :key="item.action" :insight="item" />
      </section>

      <section class="card panel chat-panel">
        <h2 class="section-title">Ask The Data</h2>
        <form class="chat-form" @submit.prevent="sendQuestion">
          <input
            v-model="question"
            maxlength="500"
            placeholder="Which agent needs prompt tuning first?"
            type="text"
          />
          <button :disabled="loading" type="submit">{{ loading ? 'Thinking' : 'Ask' }}</button>
        </form>
        <div class="answer-box">
          <span>Answer</span>
          <p>{{ answer }}</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import InsightCard from '../components/InsightCard.vue';
import { askAiQuestion, fetchAiSuggestions } from '../api/client.js';

const suggestions = ref([]);
const question = ref('Which failure should we fix first?');
const answer = ref('Ask a question about scores, failures, agents, or calls.');
const loading = ref(false);

async function loadSuggestions() {
  try {
    suggestions.value = await fetchAiSuggestions();
  } catch {
    suggestions.value = [];
  }
}

async function sendQuestion() {
  if (!question.value.trim()) return;
  loading.value = true;
  try {
    answer.value = await askAiQuestion(question.value);
  } catch {
    answer.value = 'I could not reach the AI endpoint. Check that the backend is running.';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadSuggestions();
});
</script>

<style scoped>
.assistant-grid {
  align-items: start;
  grid-template-columns: minmax(0, 1fr) 430px;
}

.panel {
  display: grid;
  gap: 12px;
}

.chat-form {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) 92px;
}

input {
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  min-height: 42px;
  padding: 0 12px;
}

input:focus {
  border-color: var(--accent);
  outline: 3px solid rgba(6, 182, 212, 0.16);
}

button {
  background: var(--primary);
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 900;
}

button:hover {
  background: var(--accent);
}

button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.answer-box {
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
}

.answer-box span {
  color: var(--muted);
  display: block;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 6px;
}

.answer-box p {
  margin: 0;
}

@media (max-width: 900px) {
  .assistant-grid {
    grid-template-columns: 1fr;
  }
}
</style>
