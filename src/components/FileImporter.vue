<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ busy: boolean; error: string | null; compact?: boolean }>()
const emit = defineEmits<{ file: [file: File]; sample: [] }>()
const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
function selected(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) emit('file', target.files[0])
  target.value = ''
}
function dropped(event: DragEvent) {
  dragging.value = false
  if (event.dataTransfer?.files[0]) emit('file', event.dataTransfer.files[0])
}
</script>

<template>
  <section
    class="importer"
    :class="{ compact, dragging }"
    aria-label="Import CSV"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="dropped"
  >
    <input
      ref="input"
      class="visually-hidden"
      tabindex="-1"
      type="file"
      accept=".csv,text/csv"
      aria-label="Choose CSV file"
      @change="selected"
    />
    <template v-if="!compact">
      <div class="upload-symbol" aria-hidden="true">↥</div>
      <h2>Bring your messy CSV.</h2>
      <p>Drop a file here. We’ll help you see what needs a little tidying.</p>
    </template>
    <div class="import-actions">
      <button
        class="button"
        :class="compact ? 'secondary' : 'primary'"
        :disabled="busy"
        @click="input?.click()"
      >
        {{ busy ? 'Reading file…' : compact ? 'Open another CSV' : 'Choose a CSV' }}
      </button>
      <button class="button text-button" :disabled="busy" @click="emit('sample')">
        {{ compact ? 'Load example' : 'Try an example →' }}
      </button>
    </div>
    <p v-if="!compact" class="small muted">UTF-8 CSV · up to 5 MB · 100,000 cells</p>
    <p v-if="error" class="error-message" role="alert">
      {{ error }} <span v-if="compact">Your current file is still open.</span>
    </p>
  </section>
</template>
