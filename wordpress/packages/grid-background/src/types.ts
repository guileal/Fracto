import type { SceneLightingConfig } from './lib/gridLighting'

export interface InstancedGridOptions {
  cols?: number
  rows?: number
  cellSize?: number
  lighting?: SceneLightingConfig
  /** Menos pixels, sem AA e ~30fps — útil em mobile ou páginas pesadas. */
  lowPower?: boolean
}

export interface InstancedGridHandle {
  dispose: () => void
  setLighting: (config: SceneLightingConfig) => void
  getLighting: () => SceneLightingConfig
  getCols: () => number
  getRows: () => number
}
