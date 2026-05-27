import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import AgentDetail from './views/AgentDetail.vue';
import Dashboard from './views/Dashboard.vue';
import TranscriptView from './views/TranscriptView.vue';
import './styles.css';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/agents/:id', component: AgentDetail, props: true },
    { path: '/transcripts/:id', component: TranscriptView, props: true }
  ]
});

createApp(App).use(router).mount('#app');
