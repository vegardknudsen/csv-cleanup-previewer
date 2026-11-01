import type { CleanupOptions, CleanupResult, CsvDocument } from './types'
import { trimWhitespace } from './rules/trimWhitespace'
import { isEmptyRow } from './rules/removeEmptyRows'
import { isDuplicate } from './rules/removeDuplicates'

export function cleanCsv(document: CsvDocument, options: CleanupOptions): CleanupResult {
  const result: CleanupResult = {
    headers: document.headers.map((header, index) => options.headerOverrides[index] ?? header),
    rows: [],
    changes: [],
    removedRows: [],
  }
  const seen = new Set<string>()
  for (const original of document.rows) {
    const row = options.trimWhitespace
      ? trimWhitespace(original)
      : { ...original, cells: [...original.cells] }
    if (options.removeEmptyRows && isEmptyRow(row)) {
      result.removedRows.push({ rowId: row.id, reason: 'empty' })
      continue
    }
    if (options.removeDuplicates && isDuplicate(row, seen)) {
      result.removedRows.push({ rowId: row.id, reason: 'duplicate' })
      continue
    }
    result.rows.push(row)
    row.cells.forEach((after, columnIndex) => {
      const before = original.cells[columnIndex]
      if (before !== after) result.changes.push({ rowId: row.id, columnIndex, before, after })
    })
  }
  return result
}

export function headerWarnings(headers: string[]): string[] {
  const counts = new Map<string, number>()
  for (const header of headers) counts.set(header, (counts.get(header) ?? 0) + 1)
  return headers.map((header) =>
    !header.trim()
      ? 'Blank column name'
      : (counts.get(header) ?? 0) > 1
        ? 'Duplicate column name'
        : '',
  )
}
