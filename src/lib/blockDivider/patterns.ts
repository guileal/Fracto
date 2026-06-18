import type { BlockColor, BlockDividerVariant, PatternBlock } from './types'

const COLS = 64
const ROWS = 3

function parseRows(rows: string[], colorMap: Record<string, BlockColor | null>): PatternBlock[] {
  const blocks: PatternBlock[] = []
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    for (let c = 0; c < row.length; c++) {
      const color = colorMap[row[c]]
      if (color) blocks.push({ c, r, color })
    }
  }
  return blocks
}

const MAP: Record<string, BlockColor | null> = {
  b: 'black',
  w: 'white',
  o: 'orange',
  '.': null,
}

/** Padrão do site fracto.com.br — borda irregular preto → branco. */
const DEFAULT_ROWS = [
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'bbbwwbbbbbbbbwwwwwbbbbbbbbbbwwwwwbbbbbbbbbbbwwwwbbbbbbbbbbwwwbbbbbb',
  'b..w...b....w..o..w....b....ww....b...w....b....o...w....b...w..b.',
]

/** Mesmo desenho com cores invertidas (hero claro). */
const INVERTED_ROWS = [
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwbbwwwwwwwwbbbbbwwwwwwwwwwbbbbbwwwwwwwwwwwbbbbwwwwwwwwwwbbbwwwwww',
  'w..b...w....b..o..b....w....bb....w...b....w....o...b....w...b..w.',
]

/** Menos blocos — transição mais leve. */
const SPARSE_ROWS = [
  '................................................................',
  '....ww.......wwww.......wwwww...........wwww...........www.......',
  '....w........w..o..w...........w........w....o...w........w......',
]

/** Borda mais preenchida — menos gaps. */
const DENSE_ROWS = [
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'bbbwbbbbbbbwwbbbbbbbbbbwwbbbbbbbbbbwwbbbbbbbbbbwwbbbbbbbbbbwbbbbbbbb',
  'bbbwbbbwwbbbwbbbwbbbbwbbwbbbwbbbbwbbwbbbwbbbbwbbwbbbwbbbbwbbwbbbbbb',
]

function variant(id: string, label: string, rows: string[]): BlockDividerVariant {
  return { id, label, cols: COLS, rows: ROWS, blocks: parseRows(rows, MAP) }
}

export const BLOCK_DIVIDER_VARIANTS: BlockDividerVariant[] = [
  variant('default', 'Padrão (preto → branco)', DEFAULT_ROWS),
  variant('inverted', 'Invertido (branco → preto)', INVERTED_ROWS),
  variant('sparse', 'Esparso', SPARSE_ROWS),
  variant('dense', 'Denso', DENSE_ROWS),
]

const variantById = new Map(BLOCK_DIVIDER_VARIANTS.map((v) => [v.id, v]))

export function getBlockDividerVariant(id: string): BlockDividerVariant {
  return variantById.get(id) ?? BLOCK_DIVIDER_VARIANTS[0]
}

export function blockDividerVariantIds(): string[] {
  return BLOCK_DIVIDER_VARIANTS.map((v) => v.id)
}
