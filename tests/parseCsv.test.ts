import { describe, expect, it } from 'vitest'
import { MAX_CELLS, MAX_COLUMNS, MAX_FILE_BYTES, parseCsv, readCsvFile } from '../src/core/parseCsv'

describe('parseCsv', () => {
  it('preserves text, leading zeroes, and ambiguous dates', () => {
    const doc = parseCsv('id,date\n00123,03/04/2026')
    expect(doc.rows[0].cells).toEqual(['00123', '03/04/2026'])
  })
  it('reads quoted delimiters, escaped quotes, embedded newlines, and BOMs', () => {
    const doc = parseCsv('\uFEFFname,note\r\n"Chen, Grace","said ""hi""\r\nthen left"\r\n')
    expect(doc.headers).toEqual(['name', 'note'])
    expect(doc.rows[0].cells).toEqual(['Chen, Grace', 'said "hi"\r\nthen left'])
    expect(doc.newline).toBe('\r\n')
    expect(doc.rows).toHaveLength(1)
  })
  it.each([';', '\t', '|'])('detects %s separators', (delimiter) => {
    const doc = parseCsv(`id${delimiter}name\n001${delimiter}Alice\n002${delimiter}Ben`)
    expect(doc.delimiter).toBe(delimiter)
    expect(doc.rows[0].cells).toEqual(['001', 'Alice'])
  })
  it('accepts single-column CSV and header-only files', () => {
    expect(parseCsv('id\n001\n002').rows).toHaveLength(2)
    expect(parseCsv('id,name\n').rows).toEqual([])
  })
  it('preserves duplicate and blank headers by position', () => {
    const doc = parseCsv('name,name,\nAlice,Ben,Clara')
    expect(doc.headers).toEqual(['name', 'name', ''])
    expect(doc.rows[0].cells).toEqual(['Alice', 'Ben', 'Clara'])
  })
  it('retains real blank records but ignores the final record separator', () => {
    const doc = parseCsv('a,b\n1,2\n\n,\n')
    expect(doc.rows).toEqual([
      { id: 1, cells: ['1', '2'] },
      { id: 2, cells: ['', ''] },
      { id: 3, cells: ['', ''] },
    ])
  })
  it('reports unequal field counts with record context', () => {
    expect(() => parseCsv('a,b\n1,2\n3,4,5')).toThrow('Record 3 has 3 fields; the header has 2')
  })
  it('rejects empty, malformed, and binary input', () => {
    expect(() => parseCsv('  \n')).toThrow('empty')
    expect(() => parseCsv('a,b\n"unterminated,2')).toThrow('Could not read CSV')
    expect(() => parseCsv('a\0b')).toThrow('UTF-8')
  })
  it('enforces byte, column, and cell limits', () => {
    expect(() => parseCsv('x'.repeat(MAX_FILE_BYTES + 1))).toThrow('too large')
    expect(() =>
      parseCsv(
        Array(MAX_COLUMNS + 1)
          .fill('h')
          .join(','),
      ),
    ).toThrow('too many columns')
    expect(() => parseCsv(`h\n${'v\n'.repeat(MAX_CELLS)}`)).toThrow('too many cells')
  })
})

describe('readCsvFile', () => {
  const file = (name: string, bytes: Uint8Array, size = bytes.byteLength) =>
    ({ name, size, arrayBuffer: async () => bytes.buffer }) as File
  it('decodes a UTF-8 file', async () => {
    const doc = await readCsvFile(file('people.CSV', new TextEncoder().encode('name\nSøren')))
    expect(doc.rows[0].cells).toEqual(['Søren'])
  })
  it('rejects other extensions, invalid UTF-8, and oversize files', async () => {
    await expect(readCsvFile(file('book.xlsx', new Uint8Array()))).rejects.toThrow('.csv')
    await expect(readCsvFile(file('bad.csv', new Uint8Array([0xff, 0xfe])))).rejects.toThrow(
      'UTF-8',
    )
    await expect(
      readCsvFile(file('big.csv', new Uint8Array(), MAX_FILE_BYTES + 1)),
    ).rejects.toThrow('too large')
  })
})
