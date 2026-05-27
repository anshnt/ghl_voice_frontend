import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000
});

export async function fetchAgents() {
  const response = await api.get('/agents');
  return response.data.agents;
}

export async function fetchAgentInsights(agentId) {
  const response = await api.get(`/agents/${agentId}/insights`);
  return response.data;
}

export async function fetchKpiSummary(agentId = null) {
  const response = await api.get('/kpi/summary', {
    params: agentId ? { agentId } : {}
  });
  return response.data.summary;
}

export async function fetchKpiOverview() {
  const response = await api.get('/kpi/summary');
  return response.data;
}

export async function fetchTranscripts(params = {}) {
  const response = await api.get('/transcripts', { params });
  return response.data.transcripts;
}

export async function fetchTranscript(id) {
  const response = await api.get(`/transcripts/${id}`);
  return response.data.transcript;
}
