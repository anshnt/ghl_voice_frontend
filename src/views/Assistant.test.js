import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Assistant from './Assistant.vue';

vi.mock('../api/client.js', () => ({
  fetchAiSuggestions: vi.fn(),
  askAiQuestion: vi.fn()
}));

const api = await import('../api/client.js');

describe('Assistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchAiSuggestions.mockResolvedValue([
      { priority: 'high', action: 'Fix objection handling', reasoning: 'It is the top failure.' }
    ]);
    api.askAiQuestion.mockResolvedValue('Legal Intake AI needs attention first.');
  });

  it('loads suggestions and answers a submitted question', async () => {
    const wrapper = mount(Assistant);
    await Promise.resolve();
    await Promise.resolve();

    expect(wrapper.text()).toContain('Fix objection handling');
    await wrapper.find('form').trigger('submit.prevent');
    await Promise.resolve();
    await Promise.resolve();

    expect(api.askAiQuestion).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Legal Intake AI needs attention first.');
  });
});
