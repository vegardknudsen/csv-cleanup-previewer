<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CleanupResult, CsvDocument } from '../core/types'
const props = defineProps<{ original: CsvDocument; result: CleanupResult }>()
const view = ref<'original' | 'preview'>('preview')
const page = ref(1)
const pageSize = 10
const selectedCell = ref<{
  before: string
  after: string
  rowId: number
  columnIndex: number
} | null>(null)
const rows = computed(() => (view.value === 'original' ? props.original.rows : props.result.rows))
const headers = computed(() =>
  view.value === 'original' ? props.original.headers : props.result.headers,
)
const pages = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize)))
const visibleRows = computed(() =>
  rows.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)
const changes = computed(
  () =>
    new Map(
      props.result.changes.map((change) => [`${change.rowId}:${change.columnIndex}`, change]),
    ),
)
const removals = computed(
  () => new Map(props.result.removedRows.map((row) => [row.rowId, row.reason])),
)
const missingCount = computed(() =>
  rows.value.reduce((sum, row) => sum + row.cells.filter((cell) => !cell.trim()).length, 0),
)
watch([() => props.original, () => props.result, view], () => {
  page.value = 1
  selectedCell.value = null
})
function showChange(rowId: number, columnIndex: number) {
  selectedCell.value = changes.value.get(`${rowId}:${columnIndex}`) ?? null
}
</script>

<template>
  <section class="panel preview-panel" aria-labelledby="preview-title">
    <div class="preview-heading">
      <div>
        <div class="section-eyebrow">03 / THE PREVIEW</div>
        <h2 id="preview-title">Every change, in view.</h2>
      </div>
      <div class="view-toggle" role="group" aria-label="Table view">
        <button :aria-pressed="view === 'original'" @click="view = 'original'">Original</button>
        <button :aria-pressed="view === 'preview'" @click="view = 'preview'">Preview</button>
      </div>
    </div>
    <div class="table-meta">
      <span><i class="legend-dot changed-dot"></i> Changed cell · select to inspect</span
      ><span
        >{{ missingCount }} missing {{ missingCount === 1 ? 'value' : 'values' }} · kept as
        empty</span
      >
    </div>
    <div
      class="table-scroll"
      tabindex="0"
      role="region"
      aria-label="CSV data table, scroll horizontally for more columns"
    >
      <table>
        <caption class="visually-hidden">
          {{
            view === 'original' ? 'Original CSV' : 'Cleanup preview'
          }}. Row IDs refer to original data records, excluding the header.
        </caption>
        <thead>
          <tr>
            <th scope="col" class="row-id">ROW</th>
            <th v-for="(header, i) in headers" :key="i" scope="col">
              {{ header || `Unnamed ${i + 1}` }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in visibleRows"
            :key="row.id"
            :class="{ 'removed-row': view === 'original' && removals.has(row.id) }"
          >
            <th scope="row" class="row-id">
              <span>{{ row.id }}</span
              ><span v-if="view === 'original' && removals.has(row.id)" class="removal-tag">{{
                removals.get(row.id)
              }}</span>
            </th>
            <td
              v-for="(cell, i) in row.cells"
              :key="i"
              :class="{ 'changed-cell': view === 'preview' && changes.has(`${row.id}:${i}`) }"
            >
              <button
                v-if="view === 'preview' && changes.has(`${row.id}:${i}`)"
                class="cell-button"
                :aria-label="`Inspect change in row ${row.id}, column ${i + 1}`"
                @click="showChange(row.id, i)"
              >
                <span v-if="cell" class="cell-text">{{ cell }}</span
                ><span v-else class="missing">Empty</span
                ><span class="change-mark" aria-hidden="true">↗</span>
              </button>
              <span v-else-if="cell" class="cell-text">{{ cell }}</span
              ><span v-else class="missing">Empty</span>
            </td>
          </tr>
          <tr v-if="!visibleRows.length">
            <td :colspan="headers.length + 1" class="empty-table">
              No data rows to show. Your headers will still be exported.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="selectedCell" class="cell-inspector" role="status">
      <div>
        <strong>Row {{ selectedCell.rowId }}, column {{ selectedCell.columnIndex + 1 }}</strong
        ><span>Whitespace removed</span>
      </div>
      <code>{{ JSON.stringify(selectedCell.before) }}</code
      ><span aria-hidden="true">→</span><code>{{ JSON.stringify(selectedCell.after) }}</code>
      <button class="link-button" @click="selectedCell = null">Close</button>
    </div>
    <div class="table-footer">
      <span
        >{{ rows.length ? (page - 1) * pageSize + 1 : 0 }}–{{
          Math.min(page * pageSize, rows.length)
        }}
        of {{ rows.length.toLocaleString() }} rows</span
      >
      <div class="pagination">
        <button
          class="button small-button"
          :disabled="page === 1"
          aria-label="Previous page"
          @click="page--"
        >
          ←</button
        ><span>Page {{ page }} of {{ pages }}</span
        ><button
          class="button small-button"
          :disabled="page === pages"
          aria-label="Next page"
          @click="page++"
        >
          →
        </button>
      </div>
    </div>
  </section>
</template>
