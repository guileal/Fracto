export interface GridConfig {
  cols: number
  rows: number
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  cols: 16,
  rows: 12,
}

export const GRID_LIMITS = {
  cols: { min: 6, max: 40 },
  rows: { min: 4, max: 30 },
} as const

export function clampGrid(config: GridConfig): GridConfig {
  return {
    cols: Math.round(
      Math.min(GRID_LIMITS.cols.max, Math.max(GRID_LIMITS.cols.min, config.cols)),
    ),
    rows: Math.round(
      Math.min(GRID_LIMITS.rows.max, Math.max(GRID_LIMITS.rows.min, config.rows)),
    ),
  }
}

export function formatGridReferenceCode(config: GridConfig): string {
  const { cols, rows } = clampGrid(config)
  const total = cols * rows
  return `// —— Referência: grade de cubos (v3) ——
const DEFAULTS = {
  cols: ${cols},
  rows: ${rows},
  cellSize: 1,
} as const
// Total de instâncias: ${total}`
}
