import { describe, expect, it } from 'vitest'
import { cleanCsv, headerWarnings } from '../src/core/cleanCsv'
import { parseCsv } from '../src/core/parseCsv'
import { defaultOptions } from '../src/core/types'

describe('cleanup pipeline', () => {
  it('keeps the original immutable and preserves internal whitespace', () => {
    const doc = parseCsv('name,id\n Alice  Jensen , 00123 ')
    const before = structuredClone(doc)
    const result = cleanCsv(doc, { ...defaultOptions(), trimWhitespace: true })
    expect(result.rows[0].cells).toEqual(['Alice  Jensen', '00123'])
    expect(result.changes).toHaveLength(2)
    expect(doc).toEqual(before)
    result.rows[0].cells[0] = 'mutated preview'
    expect(doc).toEqual(before)
  })
  it('trims before removing empty rows and duplicates, keeping stable row IDs', () => {
    const doc = parseCsv('id,name\n1, Alice \n1,Alice\n , \n2,Ben\n2,Ben')
    const result = cleanCsv(doc, {
      ...defaultOptions(),
      trimWhitespace: true,
      removeEmptyRows: true,
      removeDuplicates: true,
    })
    expect(result.rows.map((row) => row.id)).toEqual([1, 4])
    expect(result.removedRows).toEqual([
      { rowId: 2, reason: 'duplicate' },
      { rowId: 3, reason: 'empty' },
      { rowId: 5, reason: 'duplicate' },
    ])
    expect(result.changes).toEqual([
      { rowId: 1, columnIndex: 1, before: ' Alice ', after: 'Alice' },
    ])
  })
  it('does not treat whitespace or partial rows as completely empty without trimming', () => {
    const result = cleanCsv(parseCsv('a,b\n,\n ,\nvalue,'), {
      ...defaultOptions(),
      removeEmptyRows: true,
    })
    expect(result.rows.map((row) => row.id)).toEqual([2, 3])
  })
  it('compares every cell, including delimiter characters and case', () => {
    const doc = parseCsv('a,b\n"a,b",c\na,"b,c"\nAlice,1\nalice,1\nAlice,1')
    const result = cleanCsv(doc, { ...defaultOptions(), removeDuplicates: true })
    expect(result.rows.map((row) => row.id)).toEqual([1, 2, 3, 4])
  })
  it('restores the original after every rule is disabled', () => {
    const doc = parseCsv(' name ,id\n Alice ,001\nAlice,001\n,')
    cleanCsv(doc, {
      trimWhitespace: true,
      removeEmptyRows: true,
      removeDuplicates: true,
      headerOverrides: { 0: 'name' },
    })
    const reset = cleanCsv(doc, defaultOptions())
    expect(reset.headers).toEqual(doc.headers)
    expect(reset.rows).toEqual(doc.rows)
    expect(reset.changes).toEqual([])
    expect(reset.removedRows).toEqual([])
  })
  it('edits headers by position without overwriting duplicate columns', () => {
    const doc = parseCsv('name,name,\nAlice,Ben,Clara')
    const result = cleanCsv(doc, {
      ...defaultOptions(),
      headerOverrides: { 1: 'second name', 2: 'third name' },
    })
    expect(result.headers).toEqual(['name', 'second name', 'third name'])
    expect(result.rows).toEqual(doc.rows)
    expect(headerWarnings(['name', 'name', ' '])).toEqual([
      'Duplicate column name',
      'Duplicate column name',
      'Blank column name',
    ])
  })
})
