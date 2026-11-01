import type { CsvRow } from '../types'

export function isDuplicate(row: CsvRow, seen: Set<string>): boolean {
  const key = JSON.stringify(row.cells)
  if (seen.has(key)) return true
  seen.add(key)
  return false
}
