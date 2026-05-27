# Voice AI Observability Copilot - Frontend

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.5-green?style=flat-square" alt="Vue.js">
  <img src="https://img.shields.io/badge/Vite-6.0-blue?style=flat-square" alt="Vite">
  <img src="https://img.shields.io/badge/Chart.js-4.4-orange?style=flat-square" alt="Chart.js">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License">
</p>

The frontend dashboard for the Voice AI Observability Copilot. A Vue.js 3 application that provides real-time analytics, agent insights, and transcript analysis. Designed to work standalone or embedded within HighLevel (GHL) via iframe.

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Views & Components](#-views--components)
- [API Integration](#-api-integration)
- [Routing](#-routing)
- [State Management](#-state-management)
- [Styling](#-styling)
- [GHL Embed](#-ghl-embed)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Architecture

### Application Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND ARCHITECTURE                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                              VUE APPLICATION                                   │  │
│  │                                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                           APP SHELL (App.vue)                          │  │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                         TOPBAR HEADER                            │  │  │  │
│  │  │  │  ┌──────────┐  ┌─────────────────────────────────────────────┐  │  │  │  │
│  │  │  │  │   Brand  │  │              RouterView                      │  │  │  │  │
│  │  │  │  │  "Copilot"│  │  (Dashboard / AgentDetail / TranscriptView)│  │  │  │  │
│  │  │  │  └──────────┘  └─────────────────────────────────────────────┘  │  │  │  │
│  │  │  └──────────────────────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                       │                                          │  │
│  │  ┌────────────────────────────────────┼────────────────────────────────────┐  │  │
│  │  │                           VUE ROUTER                                   │  │  │
│  │  │                                                                          │  │  │
│  │  │    ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐   │  │  │
│  │  │    │  /          │    │ /agents/:id│    │ /transcripts/:id       │   │  │  │
│  │  │    │  Dashboard  │    │AgentDetail │    │ TranscriptView          │   │  │  │
│  │  │    └─────────────┘    └─────────────┘    └─────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                       │                                          │  │
│  │  ┌────────────────────────────────────┼────────────────────────────────────┐  │  │
│  │  │                        COMPONENT LAYER                                 │  │  │
│  │  │                                                                          │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │  │
│  │  │  │KpiScoreCard │  │ InsightCard  │  │CallTable    │  │FlaggedSeg │  │  │  │
│  │  │  │(Metric disp)│  │(Recommend.) │  │(Call list)  │  │(Transcript│  │  │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                       │                                          │  │
│  │  ┌────────────────────────────────────┼────────────────────────────────────┐  │  │
│  │  │                        API CLIENT LAYER                               │  │  │
│  │  │                                                                          │  │  │
│  │  │                         ┌─────────────────┐                             │  │  │
│  │  │                         │   AXIOS INSTANCE│                             │  │  │
│  │  │                         │  (api/client.js)│                            │  │  │
│  │  │                         └────────┬────────┘                             │  │  │
│  │  │                                  │                                      │  │  │
│  │  │    ┌─────────────────────────────┼─────────────────────────────┐       │  │  │
│  │  │    │                             │                             │       │  │  │
│  │  │    ▼                             ▼                             ▼       │  │  │
│  │  │  ┌─────────────┐         ┌─────────────┐              ┌───────────┐  │  │  │
│  │  │  │fetchAgents  │         │fetchKpiSumm │              │fetchTrans │  │  │  │
│  │  │  │fetchAgentIn │         │fetchKpiOver │              │cripts     │  │  │  │
│  │  │  │sights      │         │view         │              │fetchTrans │  │  │  │
│  │  │  └─────────────┘         └─────────────┘              │cript(id) │  │  │  │
│  │  │                                                  └───────────┘  │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                              │
│                                       ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           BACKEND API (Express.js)                           │  │
│  │                    http://localhost:3000 (or production URL)                  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Analytics Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD DATA FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   API Response                    Data Processing              Visualization          │
│   ────────────                    ──────────────              ──────────────          │
│                                                                                      │
│   ┌─────────────┐                                                               │
│   │ KPI Summary│                                                               │
│   │ {          │                                                               │
│   │   avgScore │──────┐                                                         │
│   │   passRate │      │                                                         │
│   │   critical │      │                                                         │
│   │ }          │      │                                                         │
│   └─────────────┘      │                    ┌─────────────────┐                  │
│                        │                    │  KpiScoreCard  │                  │
│   ┌─────────────┐      │                    │  Components    │                  │
│   │ Agents     │      │                    └─────────────────┘                  │
│   │ [          │      │                                                         │
│   │   {id,     │──────┼──┐                                                         │
│   │    name,   │      │  │         ┌─────────────────┐                           │
│   │    avgScore│     │  │────────▶│  Chart.js      │                           │
│   │   }        │      │  │         │  Visualizations│                           │
│   │ ]          │      │  │         └─────────────────┘                           │
│   └─────────────┘      │  │                                                         │
│                        │  │         ┌─────────────────┐                           │
│   ┌─────────────┐      │  │         │  CallTable     │                           │
│   │ Transcripts │      │  │         │  Component     │                           │
│   │ [           │──────┼──┤         └─────────────────┘                           │
│   │   {id,      │      │  │                                                     │
│   │    caller,  │      │  │         ┌─────────────────┐                           │
│   │    score,   │      │  │         │  InsightCard   │                           │
│   │    status}  │      │  │         │  Components    │                           │
│   │ ]           │      │  │         └─────────────────┘                           │
│   └─────────────┘      │  │                                                     │
│                        │  │         ┌─────────────────┐                           │
│   ┌─────────────┐      │  │         │  Agent Risk   │                           │
│   │ Recommends  │──────┴──┤         │  Queue        │                           │
│   │ [            │         │         └─────────────────┘                           │
│   │   {action,  │         │                                                     │
│   │    reasoning}         │                                                     │
│   │ ]            │         │                                                     │
│   └─────────────┘         │                                                     │
│                            │                                                     │
│   ┌─────────────┐         │                                                     │
│   │ Score       │─────────┘                                                     │
│   │ History     │                                                               │
│   │ [score,...] │                                                               │
│   └─────────────┘                                                               │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
frontend/
│
├── package.json                 # NPM dependencies and scripts
├── eslint.config.js            # ESLint configuration
├── vite.config.js              # Vite build configuration
├── index.html                  # HTML entry point
├── .env.example               # Environment template
├── .gitignore                  # Git ignore patterns
│
└── src/
    │
    ├── main.js                # Vue application bootstrap
    ├── App.vue                # Root component
    ├── styles.css             # Global styles
    │
    ├── api/
    │   └── client.js          # Axios API client
    │
    ├── components/            # Reusable Vue components
    │   ├── CallTable.vue      # Call listing table
    │   ├── FlaggedSegment.vue # Highlighted transcript segment
    │   ├── InsightCard.vue    # Recommendation insight card
    │   └── KpiScoreCard.vue   # KPI metric display card
    │
    └── views/                 # Page-level components
        ├── Dashboard.vue      # Main dashboard with analytics
        ├── AgentDetail.vue    # Agent-specific insights
        └── TranscriptView.vue # Full transcript viewer
```

---

## 🛠️ Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| Vue.js | ^3.5 | Progressive JavaScript framework |
| Vue Router | ^4.5 | Client-side routing |
| Vite | ^6.0 | Next-generation build tool |
| Axios | ^1.7 | HTTP client |
| Chart.js | ^4.4 | Data visualization library |
| ESLint | ^9.19 | JavaScript linting |
| Prettier | ^3.4 | Code formatter |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- Backend service running on port 3000

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000
```

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

---

## 📱 Views & Components

### Dashboard View (`Dashboard.vue`)

The main landing page providing a comprehensive overview of voice AI call quality.

**Features:**
- Health Index display
- KPI Score Cards (Avg Score, Pass Rate, Critical Calls, etc.)
- Quality Trend Chart (line chart)
- Failure Mix Chart (doughnut chart)
- Score Distribution Chart (bar chart)
- Agent Performance Chart (bar chart)
- Agent Risk Queue
- Recommendations Stack
- Recent Calls Table

**Data Fetched:**
- `/kpi/summary` - Overall KPI metrics
- `/agents` - Agent list with scores
- `/transcripts` - Recent transcripts
- `/agents/:id/insights` - Recommendations

### Agent Detail View (`AgentDetail.vue`)

Detailed view of a specific agent's performance.

**Features:**
- Agent header with name and average score
- KPI breakdown by criterion
- Score history chart
- Recent calls for this agent
- Agent-specific recommendations

**Route:** `/agents/:id`

### Transcript View (`TranscriptView.vue`)

Full transcript viewer with AI analysis.

**Features:**
- Call metadata (date, duration, caller)
- Full transcript text
- Overall score display
- KPI scores breakdown
- Flagged failure segments
- AI recommendations

**Route:** `/transcripts/:id`

---

## 🔌 API Integration

### API Client (`api/client.js`)

The frontend uses Axios for API communication:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000
});
```

### Available API Functions

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchAgents()` | GET `/agents` | Get all agents with scores |
| `fetchAgentInsights(id)` | GET `/agents/:id/insights` | Get agent insights |
| `fetchKpiSummary(id?)` | GET `/kpi/summary` | Get KPI summary |
| `fetchKpiOverview()` | GET `/kpi/summary` | Get full KPI overview |
| `fetchTranscripts(params)` | GET `/transcripts` | Get transcripts list |
| `fetchTranscript(id)` | GET `/transcripts/:id` | Get single transcript |

### Usage Example

```javascript
import { fetchKpiSummary, fetchAgents } from '@/api/client';

// Fetch dashboard data
const { summary } = await fetchKpiSummary();
const agents = await fetchAgents();
```

---

## 🛤️ Routing

### Route Configuration

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Main dashboard view |
| `/agents/:id` | AgentDetail | Agent details page |
| `/transcripts/:id` | TranscriptView | Transcript viewer |

### Router Setup

```javascript
// src/main.js
import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import AgentDetail from './views/AgentDetail.vue';
import TranscriptView from './views/TranscriptView.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/agents/:id', component: AgentDetail },
  { path: '/transcripts/:id', component: TranscriptView }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});
```

> **Note:** Uses `createWebHashHistory()` for iframe compatibility with GHL.

---

## 🎨 Components

### KpiScoreCard.vue

Displays a single KPI metric with styling.

**Props:**
- `label` (String) - Metric label
- `value` (String/Number) - Metric value
- `tone` (String) - Visual tone: 'positive', 'warning', 'critical'
- `trend` (String) - Description of the metric

**Usage:**
```vue
<KpiScoreCard 
  label="Avg Score" 
  :value="avgScore" 
  tone="positive" 
  trend="All analyzed calls" 
/>
```

### InsightCard.vue

Displays AI-generated recommendations.

**Props:**
- `insight` (Object) - Insight data with action, reasoning, priority

**Usage:**
```vue
<InsightCard 
  v-for="item in recommendations"
  :key="item.action"
  :insight="item"
/>
```

### CallTable.vue

Displays a table of calls with scores.

**Props:**
- `calls` (Array) - Array of call objects

**Features:**
- Sortable columns
- Status badges (Pass/Fail)
- Link to transcript detail

### FlaggedSegment.vue

Highlights problematic transcript segments.

**Props:**
- `segment` (Object) - Segment with text and issue type
- `index` (Number) - Segment index

---

## 🎨 Styling

### Global Styles (`styles.css`)

The application uses custom CSS with CSS variables:

```css
:root {
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;
  --color-text: #0f172a;
  --color-muted: #64748b;
  --color-primary: #3b82f6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-critical: #ef4444;
}
```

### Layout Classes

- `.app-shell` - Main application container
- `.topbar` - Header bar
- `.page` - Content page wrapper
- `.page-header` - Page header with title
- `.grid` - CSS Grid layout container
- `.card` - Card component wrapper
- `.panel` - Panel component wrapper

---

## 🔧 GHL Embed

### Embed Widget

The frontend is designed to work embedded in HighLevel using the widget in `widget/embed.js`.

### Configuration

Edit `widget/embed.js` to set your deployment URLs:

```javascript
var config = {
  frontendUrl: 'https://your-frontend-url.example.com',
  apiBaseUrl: 'https://your-backend-url.example.com'
};
```

### GHL Integration Steps

1. Deploy frontend and backend
2. Edit `widget/embed.js` with your URLs
3. In GHL: Settings → Custom JS
4. Paste the embed script
5. Save and reload

### Hash Routing

The app uses hash-based routing (`/#/`, `/#/agents/1`) for iframe compatibility:
- Works inside GHL iframe
- No server-side route configuration needed
- Direct linking via URL hash

---

## 💻 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

### Adding New Components

1. Create component in `src/components/`:

```vue
<!-- src/components/MyComponent.vue -->
<template>
  <div class="my-component">
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Hello'
  }
});
</script>

<style scoped>
.my-component {
  padding: 1rem;
}
</style>
```

2. Import in view:

```vue
<script setup>
import MyComponent from '@/components/MyComponent.vue';
</script>

<template>
  <MyComponent message="Hello World" />
</template>
```

### Adding New Views

1. Create view in `src/views/`
2. Add route in `src/main.js`

---

## 🔍 Troubleshooting

### CORS Errors

Ensure backend has correct CORS configuration:

```javascript
// backend/src/index.js
app.use(cors({ 
  origin: process.env.FRONTEND_URL || true 
}));
```

### API Connection Failed

1. Verify backend is running on port 3000
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Check browser network tab for failed requests

### Charts Not Rendering

1. Ensure Chart.js is installed
2. Check canvas element has proper refs
3. Verify data is loaded before chart creation

### Iframe Not Loading

1. Verify hash routing is working
2. Check GHL allows iframe embedding
3. Verify URLs are accessible publicly

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">Built with ❤️ for Voice AI Quality Assurance</p>