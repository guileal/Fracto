import type { FractoLogoMaterialConfig } from './fractoLogoConfig'

export type MagicCubeMaterialConfig = FractoLogoMaterialConfig

export interface MagicCubeConfig {
  bevelRadius: number
  cubeColor: string
  accentColor: string
  cubeMaterial: MagicCubeMaterialConfig
  accentMaterial: MagicCubeMaterialConfig
  /** Escala global do cubo (1 = tamanho base da cena). */
  scale: number
  /** Deslocamento horizontal em unidades de cena (− esquerda, + direita). */
  offsetX: number
  /** Deslocamento vertical em unidades de cena (− baixo, + cima). */
  offsetY: number
  sliceDuration: number
  explodeDuration: number
  resetDuration: number
  waitStart: number
  waitBeforeExplode: number
}

export const MAGIC_CUBE_BEVEL = {
  min: 0,
  max: 0.06,
  step: 0.001,
} as const

export const MAGIC_CUBE_MATERIAL = {
  roughness: { min: 0, max: 1, step: 0.01 },
  clearcoat: { min: 0, max: 1, step: 0.01 },
  envMapIntensity: { min: 0, max: 1, step: 0.01 },
  emissiveIntensity: { min: 0, max: 1.5, step: 0.01 },
} as const

export const MAGIC_CUBE_LAYOUT = {
  scale: { min: 0.35, max: 1.35, step: 0.01 },
  offsetX: { min: -1.2, max: 1.2, step: 0.02 },
  offsetY: { min: -1.2, max: 1.2, step: 0.02 },
} as const

export const MAGIC_CUBE_TIMING = {
  sliceDuration: { min: 0.2, max: 2, step: 0.05 },
  explodeDuration: { min: 0.2, max: 2, step: 0.05 },
  resetDuration: { min: 0.2, max: 2.5, step: 0.05 },
  waitStart: { min: 0, max: 3, step: 0.1 },
  waitBeforeExplode: { min: 0, max: 2, step: 0.1 },
} as const

/** Materiais alinhados a DEFAULT_FRACTO_LOGO_LIGHT_CONFIG (logo-fracto-light). */
const DEFAULT_CUBE_MATERIAL: MagicCubeMaterialConfig = {
  roughness: 0.4,
  clearcoat: 0,
  envMapIntensity: 0.8,
  emissiveIntensity: 0,
}

const DEFAULT_ACCENT_MATERIAL: MagicCubeMaterialConfig = {
  roughness: 1,
  clearcoat: 0,
  envMapIntensity: 0.8,
  emissiveIntensity: 0,
}

/** Defaults visuais: tamanho v1 + materiais/luz/bevel de /logo-fracto-light. */
export const DEFAULT_MAGIC_CUBE_CONFIG: MagicCubeConfig = {
  bevelRadius: 0.02,
  cubeColor: '#ffffff',
  accentColor: '#f72f00',
  cubeMaterial: { ...DEFAULT_CUBE_MATERIAL },
  accentMaterial: { ...DEFAULT_ACCENT_MATERIAL },
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  sliceDuration: 0.7,
  explodeDuration: 0.85,
  resetDuration: 1.05,
  waitStart: 1,
  waitBeforeExplode: 0.5,
}
