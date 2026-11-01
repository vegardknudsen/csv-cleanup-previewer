<script setup lang="ts">
import { computed } from 'vue'
import type { CleanupResult, CsvDocument } from '../core/types'
const props = defineProps<{ original: CsvDocument; result: CleanupResult }>()
const empty = computed(
  () => props.result.removedRows.filter((row) => row.reason === 'empty').length,
)
const duplicates = computed(
  () => props.result.removedRows.filter((row) => row.reason === 'duplicate').length,
)
const headers = computed(
  () =>
    props.result.headers.filter((header, index) => header !== props.original.headers[index]).length,
)
</script>

<template>
  <section class="stats-grid" aria-label="Cleanup summary" aria-live="polite" aria-atomic="true">
    <div class="stat">
      <span class="stat-value"
        >{{ result.rows.length.toLocaleString()
        }}<small>/ {{ original.rows.length.toLocaleString() }}</small></span
      ><span>Rows to keep</span>
    </div>
    <div class="stat">
      <span class="stat-value accent">{{ result.changes.length.toLocaleString() }}</span
      ><span>Cells trimmed <small>in kept rows</small></span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ empty }}</span
      ><span>Empty rows removed</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ duplicates }}</span
      ><span>Duplicates removed</span>
    </div>
  </section>
  <p v-if="headers" class="small muted header-summary">
    {{ headers }} column {{ headers === 1 ? 'name' : 'names' }} edited.
  </p>
</template>
