import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import KpiScoreCard from './KpiScoreCard.vue';

describe('KpiScoreCard', () => {
  it('renders label, value, trend, and tone class', () => {
    const wrapper = mount(KpiScoreCard, {
      props: {
        label: 'Avg Score',
        value: '6.7',
        trend: 'All analyzed calls',
        tone: 'critical'
      }
    });

    expect(wrapper.text()).toContain('Avg Score');
    expect(wrapper.text()).toContain('6.7');
    expect(wrapper.text()).toContain('All analyzed calls');
    expect(wrapper.find('.trend').classes()).toContain('critical');
  });
});
