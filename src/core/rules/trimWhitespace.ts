import type { CsvRow } from '../types'

export const trimWhitespace = (row: CsvRow): CsvRow => ({
  ...row,
  cells: row.cells.map((cell) => cell.trim()),
})
