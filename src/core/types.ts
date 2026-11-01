export interface CsvRow {
  id: number
  cells: string[]
}

export interface CsvDocument {
  headers: string[]
  rows: CsvRow[]
  delimiter: string
  newline: string
}

export interface CleanupOptions {
  trimWhitespace: boolean
  removeEmptyRows: boolean
  removeDuplicates: boolean
  headerOverrides: Record<number, string>
}

export interface CellChange {
  rowId: number
  columnIndex: number
  before: string
  after: string
}

export interface CleanupResult {
  headers: string[]
  rows: CsvRow[]
  changes: CellChange[]
  removedRows: Array<{ rowId: number; reason: 'empty' | 'duplicate' }>
}

export const defaultOptions = (): CleanupOptions => ({
  trimWhitespace: false,
  removeEmptyRows: false,
  removeDuplicates: false,
  headerOverrides: {},
})
