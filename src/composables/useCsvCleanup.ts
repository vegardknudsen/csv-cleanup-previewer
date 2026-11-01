import { computed, reactive, ref, shallowRef } from 'vue'
import { cleanCsv } from '../core/cleanCsv'
import { parseCsv, readCsvFile } from '../core/parseCsv'
import { defaultOptions, type CsvDocument } from '../core/types'
import { cleanedFilename, downloadCsv, exportCsv } from '../core/exportCsv'
import sample from '../samples/messy-customers.csv?raw'

export function useCsvCleanup() {
  const original = shallowRef<CsvDocument | null>(null)
  const options = reactive(defaultOptions())
  const filename = ref('')
  const importError = ref<string | null>(null)
  const busy = ref(false)
  const notice = ref('')
  let requestId = 0
  const result = computed(() => (original.value ? cleanCsv(original.value, options) : null))

  function replace(document: CsvDocument, name: string) {
    original.value = document
    filename.value = name
    Object.assign(options, defaultOptions())
    importError.value = null
    notice.value = `Opened ${name}. Select a cleanup rule to begin.`
  }
  async function importFile(file: File) {
    const request = ++requestId
    busy.value = true
    importError.value = null
    try {
      const document = await readCsvFile(file)
      if (request === requestId) replace(document, file.name)
    } catch (error) {
      if (request === requestId)
        importError.value = error instanceof Error ? error.message : 'Could not open this file.'
    } finally {
      if (request === requestId) busy.value = false
    }
  }
  function loadSample() {
    requestId++
    busy.value = false
    replace(parseCsv(sample), 'messy-customers.csv')
  }
  function reset() {
    Object.assign(options, defaultOptions())
    notice.value = 'All changes reset. Original values restored.'
  }
  function download() {
    if (!original.value || !result.value) return
    downloadCsv(exportCsv(original.value, result.value), cleanedFilename(filename.value))
    notice.value = 'Cleaned CSV downloaded.'
  }
  return {
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
  }
}
