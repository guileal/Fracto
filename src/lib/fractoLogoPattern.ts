/** Pixels do logotipo Fracto (grade 6×6, origem no canto superior-esquerdo do bloco) */
export const FRACTO_LOGO_PIXELS = [
  { dc: 2, dr: 1, accent: false },
  { dc: 4, dr: 1, accent: true },
  { dc: 1, dr: 2, accent: false },
  { dc: 1, dr: 3, accent: false },
  { dc: 4, dr: 3, accent: false },
  { dc: 2, dr: 4, accent: false },
  { dc: 3, dr: 4, accent: false },
] as const

export interface LogoCellMap {
  /** índice da instância → pixel de destaque laranja */
  cells: Map<number, boolean>
  centerX: number
  centerY: number
}

export function buildLogoCellMap(
  cols: number,
  rows: number,
  baseX: Float32Array,
  baseY: Float32Array,
): LogoCellMap {
  const anchorCol = Math.max(1, Math.floor(cols / 2) - 2)
  const anchorRow = Math.max(1, Math.floor(rows / 2) - 2)
  const cells = new Map<number, boolean>()
  let centerX = 0
  let centerY = 0
  let n = 0

  for (const { dc, dr, accent } of FRACTO_LOGO_PIXELS) {
    const c = anchorCol + dc
    const r = anchorRow + dr
    if (c < 0 || c >= cols || r < 0 || r >= rows) continue
    const idx = r * cols + c
    cells.set(idx, accent)
    centerX += baseX[idx]!
    centerY += baseY[idx]!
    n++
  }

  if (n === 0) {
    return { cells, centerX: 0, centerY: 0 }
  }

  return {
    cells,
    centerX: centerX / n,
    centerY: centerY / n,
  }
}
