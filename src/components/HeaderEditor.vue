<script setup lang="ts">
import { computed } from 'vue'
import { headerWarnings } from '../core/cleanCsv'
const props = defineProps<{ headers: string[]; originalHeaders: string[] }>()
const emit = defineEmits<{ edit: [index: number, value: string]; trim: [] }>()
const warnings = computed(() => headerWarnings(props.headers))
</script>

<template>
  <section class="panel headers-panel" aria-labelledby="headers-title">
    <div class="section-eyebrow">02 / COLUMN NAMES</div>
    <div class="section-row">
      <h2 id="headers-title">Name things clearly.</h2>
      <button class="link-button" @click="emit('trim')">Trim names</button>
    </div>
    <p class="muted small">Edit names explicitly. Column values stay intact.</p>
    <div class="header-fields">
      <label v-for="(header, index) in headers" :key="index" class="header-field">
        <span
          >Column {{ index + 1 }}
          <span v-if="header !== originalHeaders[index]" class="edited-tag">edited</span></span
        >
        <input
          :value="header"
          :aria-label="`Column ${index + 1} name`"
          :aria-invalid="!!warnings[index]"
          @input="emit('edit', index, ($event.target as HTMLInputElement).value)"
        />
        <span v-if="warnings[index]" class="field-warning">{{ warnings[index] }}</span>
      </label>
    </div>
  </section>
</template>
