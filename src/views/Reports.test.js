import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import Reports from './Reports.vue';

vi.mock('../api/client.js', () => ({
  fetchKpiOverview: vi.fn().mockResolvedValue({
    summary: {
      analyzed_count: 180,
      avg_score: 6.7,
      avg_duration_seconds: 271,
      pass_rate: 42,
      score_distribution: [{ bucket: '6.0-6.9', count: 44 }],
      top_failures: [{ type: 'Goal Completion', count: 20 }]
    },
    agents: [
      {
        id: 1,
        name: 'Dental Intake AI',
        call_count: 36,
        critical_count: 4,
        pass_rate: 56
      }
    ]
  })
}));

describe('Reports', () => {
  it('renders report sections from API data', async () => {
    const wrapper = mount(Reports);
    await Promise.resolve();
    await Promise.resolve();

    expect(wrapper.text()).toContain('Agent Benchmark');
    expect(wrapper.text()).toContain('Dental Intake AI');
    expect(wrapper.text()).toContain('Goal Completion');
  });
});
