export interface MagicCubeConfig {
  bevelRadius: number
  cubeColor: string
  accentColor: string
}

export const MAGIC_CUBE_BEVEL = {
  min: 0,
  max: 0.06,
  step: 0.001,
} as const

export const DEFAULT_MAGIC_CUBE_CONFIG: MagicCubeConfig = {
  bevelRadius: 0.012,
  cubeColor: '#000000',
  accentColor: '#f55e1d',
}
