import type { CsvRow } from '../types'

// Without the trim rule, whitespace remains meaningful content.
export const isEmptyRow = (row: CsvRow) => row.cells.every((cell) => cell === '')
