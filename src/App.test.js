import { mount } from '@vue/test-utils';
import { createRouter, createWebHashHistory } from 'vue-router';
import { describe, expect, it } from 'vitest';
import App from './App.vue';

const Dummy = { template: '<div>Route content</div>' };

describe('App', () => {
  it('renders sidebar navigation', async () => {
    const router = createRouter({
      history: createWebHashHistory(),
      routes: [
        { path: '/', component: Dummy },
        { path: '/reports', component: Dummy },
        { path: '/insights', component: Dummy },
        { path: '/assistant', component: Dummy }
      ]
    });
    router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    expect(wrapper.text()).toContain('Overview');
    expect(wrapper.text()).toContain('Reports');
    expect(wrapper.text()).toContain('Insights');
    expect(wrapper.text()).toContain('AI Assistant');
  });
});
