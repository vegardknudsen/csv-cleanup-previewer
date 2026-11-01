import Papa from 'papaparse'
import type { CleanupResult, CsvDocument } from './types'

export function exportCsv(document: CsvDocument, result: CleanupResult): string {
  // Quote empty records so a one-column empty row survives a round trip.
  return Papa.unparse([result.headers, ...result.rows.map((row) => row.cells)], {
    delimiter: document.delimiter,
    newline: document.newline,
    quotes: true,
    skipEmptyLines: false,
    escapeFormulae: false,
  })
}

export const cleanedFilename = (name: string) =>
  `${name.replace(/\.csv$/i, '') || 'data'}.cleaned.csv`

export function downloadCsv(contents: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
