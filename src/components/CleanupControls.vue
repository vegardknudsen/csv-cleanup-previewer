<script setup lang="ts">
import type { CleanupOptions } from '../core/types'
defineProps<{ options: CleanupOptions }>()
const emit = defineEmits<{
  change: [key: 'trimWhitespace' | 'removeEmptyRows' | 'removeDuplicates', enabled: boolean]
}>()
const rules = [
  {
    key: 'trimWhitespace' as const,
    title: 'Trim whitespace',
    detail: 'Remove spaces around values. Keep spaces within them.',
  },
  {
    key: 'removeEmptyRows' as const,
    title: 'Remove empty rows',
    detail: 'Remove rows with no values in any column.',
  },
  {
    key: 'removeDuplicates' as const,
    title: 'Remove duplicates',
    detail: 'Keep the first identical row, comparing every column.',
  },
]
</script>

<template>
  <section class="panel rules-panel" aria-labelledby="rules-title">
    <div class="section-eyebrow">01 / CLEANUP RULES</div>
    <h2 id="rules-title">A little less mess.</h2>
    <p class="muted small">Choose what to change. Preview updates instantly.</p>
    <label v-for="rule in rules" :key="rule.key" class="rule">
      <span
        ><strong>{{ rule.title }}</strong
        ><span class="rule-detail">{{ rule.detail }}</span></span
      >
      <input
        type="checkbox"
        role="switch"
        :checked="options[rule.key]"
        :aria-label="rule.title"
        @change="emit('change', rule.key, ($event.target as HTMLInputElement).checked)"
      />
    </label>
    <p class="rule-note">
      Rules run from top to bottom. Trimming can reveal extra duplicates or empty rows.
    </p>
  </section>
</template>
