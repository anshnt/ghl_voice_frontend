<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">VC</span>
        <span>Voice Copilot</span>
      </RouterLink>
      <nav class="side-nav" aria-label="Primary">
        <RouterLink to="/">Overview</RouterLink>
        <RouterLink to="/reports">Reports</RouterLink>
        <RouterLink to="/insights">Insights</RouterLink>
      </nav>
      <div class="sidebar-footer">
        <span class="status-dot"></span>
        <span>Live monitor</span>
      </div>
    </aside>
    <div class="content-shell">
      <header class="topbar">
        <div>
          <span class="eyebrow">HighLevel Voice AI</span>
          <strong>Observability Copilot</strong>
        </div>
      </header>
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>
