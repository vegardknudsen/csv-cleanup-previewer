import { describe, expect, it } from 'vitest'
import { cleanCsv } from '../src/core/cleanCsv'
import { cleanedFilename, exportCsv } from '../src/core/exportCsv'
import { parseCsv } from '../src/core/parseCsv'
import { defaultOptions } from '../src/core/types'

describe('CSV export', () => {
  it.each([',', ';', '\t', '|'])('round-trips values with %s separator', (delimiter) => {
    const original = {
      headers: ['name', 'note'],
      rows: [
        { id: 1, cells: ['00123', 'line 1\r\nline 2'] },
        { id: 2, cells: ['Chen, Grace', 'said "hi"'] },
        { id: 3, cells: ['', ''] },
      ],
      delimiter,
      newline: '\r\n',
    }
    const result = cleanCsv(original, defaultOptions())
    const exported = exportCsv(original, result)
    const parsed = parseCsv(exported)
    expect(parsed.headers).toEqual(result.headers)
    expect(parsed.rows.map((row) => row.cells)).toEqual(result.rows.map((row) => row.cells))
    expect(exported).toContain('\r\n')
  })
  it('preserves a trailing empty row in a single-column CSV', () => {
    const original = parseCsv('name\nAlice\n""')
    const parsed = parseCsv(exportCsv(original, cleanCsv(original, defaultOptions())))
    expect(parsed.rows.map((row) => row.cells)).toEqual([['Alice'], ['']])
  })
  it('exports edited headers and only retained rows', () => {
    const original = parseCsv(' name ,id\n Alice ,001\nAlice,001')
    const result = cleanCsv(original, {
      ...defaultOptions(),
      trimWhitespace: true,
      removeDuplicates: true,
      headerOverrides: { 0: 'name' },
    })
    expect(parseCsv(exportCsv(original, result)).rows[0].cells).toEqual(['Alice', '001'])
    expect(parseCsv(exportCsv(original, result)).headers).toEqual(['name', 'id'])
    expect(parseCsv(exportCsv(original, result)).rows).toHaveLength(1)
  })
  it('preserves formula-like text exactly as previewed', () => {
    const original = parseCsv('value\n=1+1\n@name\n-12')
    const result = cleanCsv(original, defaultOptions())
    expect(parseCsv(exportCsv(original, result)).rows).toEqual(original.rows)
  })
  it('supports header-only exports and reasonable download names', () => {
    const original = parseCsv('a,b')
    expect(parseCsv(exportCsv(original, cleanCsv(original, defaultOptions())))).toEqual(original)
    expect(cleanedFilename('customers.CSV')).toBe('customers.cleaned.csv')
  })
})
