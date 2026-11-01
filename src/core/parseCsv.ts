import Papa from 'papaparse'
import type { CsvDocument } from './types'

export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const MAX_CELLS = 100_000
export const MAX_COLUMNS = 200

export function parseCsv(text: string): CsvDocument {
  if (new TextEncoder().encode(text).length > MAX_FILE_BYTES) {
    throw new Error('This file is too large. Choose a CSV of 5 MB or less.')
  }
  const input = text.replace(/^\uFEFF/, '')
  if (!input.trim()) throw new Error('This file is empty. Include a header row and your data.')
  if (input.includes('\0'))
    throw new Error('This file is not UTF-8 CSV text. Export it as UTF-8 CSV and try again.')

  const parsed = Papa.parse<string[]>(input, {
    header: false,
    dynamicTyping: false,
    skipEmptyLines: false,
    delimitersToGuess: [',', ';', '\t', '|'],
  })
  // Papa reports an undetectable delimiter for valid single-column CSVs.
  const error = parsed.errors.find((issue) => issue.code !== 'UndetectableDelimiter')
  if (error)
    throw new Error(
      `Could not read CSV: ${error.message}${error.row === undefined ? '' : ` (record ${error.row + 1})`}.`,
    )

  const records = parsed.data.map((cells) => [...cells])
  // A final record separator is formatting, not an additional empty row.
  if (/[\r\n]$/.test(input) && records.at(-1)?.length === 1 && records.at(-1)?.[0] === '')
    records.pop()
  const headers = records.shift() ?? []
  if (headers.length > MAX_COLUMNS)
    throw new Error(`This file has too many columns. The limit is ${MAX_COLUMNS}.`)
  if ((records.length + 1) * headers.length > MAX_CELLS)
    throw new Error('This file has too many cells. The limit is 100,000, including headers.')

  const rows = records.map((cells, index) => {
    // Physical blank lines are empty rows, even in multi-column CSVs.
    const normalized = cells.length === 1 && cells[0] === '' ? headers.map(() => '') : cells
    if (normalized.length !== headers.length) {
      throw new Error(
        `Record ${index + 2} has ${normalized.length} fields; the header has ${headers.length}. Fix the column count and try again.`,
      )
    }
    return { id: index + 1, cells: normalized }
  })
  return {
    headers,
    rows,
    delimiter: parsed.meta.delimiter || ',',
    newline: parsed.meta.linebreak || '\n',
  }
}

export async function readCsvFile(file: File): Promise<CsvDocument> {
  if (!/\.csv$/i.test(file.name))
    throw new Error('Choose a .csv file. Excel workbooks are not supported.')
  if (file.size > MAX_FILE_BYTES)
    throw new Error('This file is too large. Choose a CSV of 5 MB or less.')
  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer())
  } catch {
    throw new Error('Could not read this file as UTF-8. Export it as UTF-8 CSV and try again.')
  }
  return parseCsv(text)
}
