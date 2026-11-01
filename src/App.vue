<script setup lang="ts">
import { computed } from 'vue'
import FileImporter from './components/FileImporter.vue'
import CleanupControls from './components/CleanupControls.vue'
import HeaderEditor from './components/HeaderEditor.vue'
import ChangeSummary from './components/ChangeSummary.vue'
import DataPreview from './components/DataPreview.vue'
import ExportButton from './components/ExportButton.vue'
import { useCsvCleanup } from './composables/useCsvCleanup'

const {
  original,
  options,
  filename,
  importError,
  busy,
  notice,
  result,
  importFile,
  loadSample,
  reset,
  download,
} = useCsvCleanup()
const edited = computed(
  () =>
    !!(
      result.value &&
      original.value &&
      (result.value.changes.length ||
        result.value.removedRows.length ||
        result.value.headers.some((h, i) => h !== original.value!.headers[i]))
    ),
)
function trimHeaders() {
  result.value?.headers.forEach((header, index) => {
    options.headerOverrides[index] = header.trim()
  })
}
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <a href="./" class="brand"
        ><span class="brand-symbol" aria-hidden="true">▦</span
        ><span>CSV <strong>Cleanup</strong><span class="brand-suffix"> / previewer</span></span></a
      ><span class="privacy-pill"><span aria-hidden="true">●</span> Your data stays here</span>
    </header>
    <main>
      <div class="intro">
        <div class="section-eyebrow">SMALL FIXES. BETTER DATA.</div>
        <h1>Messy data.<br /><span>Clear decisions.</span></h1>
        <p>
          Clean up your CSV, see exactly what changes,<br class="desktop-break" />
          and take the tidy version with you.
        </p>
      </div>
      <FileImporter
        v-if="!original"
        :busy="busy"
        :error="importError"
        @file="importFile"
        @sample="loadSample"
      />
      <template v-if="original && result">
        <div class="file-bar">
          <div class="file-info">
            <span class="file-icon" aria-hidden="true">CSV</span>
            <div>
              <strong>{{ filename }}</strong
              ><span
                >{{ original.headers.length }} columns ·
                {{
                  original.delimiter === '\t'
                    ? 'Tab'
                    : original.delimiter === ';'
                      ? 'Semicolon'
                      : original.delimiter === '|'
                        ? 'Pipe'
                        : 'Comma'
                }}
                separated · UTF-8</span
              >
            </div>
          </div>
          <FileImporter
            compact
            :busy="busy"
            :error="importError"
            @file="importFile"
            @sample="loadSample"
          />
        </div>
        <ChangeSummary :original="original" :result="result" />
        <div class="workspace">
          <aside>
            <CleanupControls
              :options="options"
              @change="(key, enabled) => (options[key] = enabled)"
            /><HeaderEditor
              :headers="result.headers"
              :original-headers="original.headers"
              @edit="(index, value) => (options.headerOverrides[index] = value)"
              @trim="trimHeaders"
            />
          </aside>
          <div class="preview-column">
            <DataPreview :original="original" :result="result" />
            <div class="export-bar">
              <div>
                <strong>{{ edited ? 'Your tidy version is ready.' : 'You’re in control.' }}</strong>
                <p>
                  {{
                    edited
                      ? 'Download includes exactly the previewed values and headers.'
                      : 'Select a rule, or export your data as it is.'
                  }}
                </p>
              </div>
              <div class="export-actions">
                <button class="link-button" :disabled="!edited" @click="reset">Reset changes</button
                ><ExportButton :disabled="busy" @download="download" />
              </div>
            </div>
            <details class="review-note">
              <summary>What happens to dates, numbers, and formulas?</summary>
              <p>
                Values stay as text. Leading zeroes and ambiguous dates are preserved. Missing
                values are highlighted, never filled. CSV quoting is normalized on export; values
                and detected separators are retained. Spreadsheet apps may interpret values as
                dates, numbers, or formulas when opening a CSV. Import columns as text if you need
                to preserve their interpretation.
              </p>
            </details>
          </div>
        </div>
      </template>
      <div v-else class="empty-features">
        <div>
          <span>01</span><strong>Choose your fixes</strong>
          <p>Whitespace, empty rows, duplicates. One rule at a time.</p>
        </div>
        <div>
          <span>02</span><strong>See the difference</strong>
          <p>A transparent preview. Your original always stays intact.</p>
        </div>
        <div>
          <span>03</span><strong>Keep it local</strong>
          <p>No uploads, accounts, or servers. Just your browser.</p>
        </div>
      </div>
      <p class="visually-hidden" role="status" aria-live="polite">{{ notice }}</p>
    </main>
    <footer class="site-footer">
      <span>A little tidying goes a long way.</span
      ><span>Built with Vue · Processed in your browser</span>
    </footer>
  </div>
</template>
