import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../src/App.vue'

describe('interactive sample workflow', () => {
  it('loads data, previews reversible changes, edits headers, and inspects values', async () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Choose a CSV')
    const sample = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Try an example'))!
    await sample.trigger('click')
    expect(wrapper.text()).toContain('messy-customers.csv')
    const switches = wrapper.findAll('input[role="switch"]')
    for (const toggle of switches) await toggle.setValue(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(9)
    const change = wrapper.findAll('.cell-button')[0]
    await change.trigger('click')
    expect(wrapper.find('.cell-inspector').text()).toContain('Whitespace removed')
    const header = wrapper.get('input[aria-label="Column 1 name"]')
    await header.setValue('customer_id')
    expect(wrapper.text()).toContain('1 column name edited')
    const originalButton = wrapper.findAll('.view-toggle button')[0]
    await originalButton.trigger('click')
    expect(wrapper.findAll('.removed-row').length).toBeGreaterThan(0)
    const next = wrapper.get('button[aria-label="Next page"]')
    await next.trigger('click')
    expect(wrapper.text()).toContain('Page 2 of 2')
    const reset = wrapper.findAll('button').find((button) => button.text() === 'Reset changes')!
    await reset.trigger('click')
    expect(wrapper.text()).toContain('Page 1 of 2')
    expect(wrapper.findAll('.removed-row')).toHaveLength(0)
    expect((header.element as HTMLInputElement).value).toBe(' customer_id ')
    expect(switches.every((toggle) => !(toggle.element as HTMLInputElement).checked)).toBe(true)
    wrapper.unmount()
  })
})
