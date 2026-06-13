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
  /** Rotação do pivot isométrico (rad). */
  pivotRotX: number
  pivotRotY: number
  pivotRotZ: number
  /** Posição da câmera. */
  cameraX: number
  cameraY: number
  cameraZ: number
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

export const MAGIC_CUBE_PIVOT = {
  rotDeg: { min: -90, max: 90, step: 0.5 },
  cameraX: { min: -4, max: 4, step: 0.05 },
  cameraY: { min: -2, max: 4, step: 0.05 },
  cameraZ: { min: 6, max: 18, step: 0.1 },
} as const

export const MAGIC_CUBE_VIEW_DEFAULTS = {
  pivotRotX: 0.6719517620178169,
  pivotRotY: 0.5061454830783556,
  pivotRotZ: -0.008726646259971648,
  cameraX: 0.2,
  cameraY: -1,
  cameraZ: 12.8,
} as const

export const MAGIC_CUBE_TIMING = {
  sliceDuration: { min: 0.2, max: 2, step: 0.05 },
  explodeDuration: { min: 0.2, max: 3, step: 0.05 },
  resetDuration: { min: 0.2, max: 3, step: 0.05 },
  waitStart: { min: 0, max: 3, step: 0.1 },
  waitBeforeExplode: { min: 0, max: 3, step: 0.1 },
} as const

const DEFAULT_CUBE_MATERIAL: MagicCubeMaterialConfig = {
  roughness: 0.98,
  clearcoat: 0,
  envMapIntensity: 0,
  emissiveIntensity: 1.18,
}

const DEFAULT_ACCENT_MATERIAL: MagicCubeMaterialConfig = {
  roughness: 1,
  clearcoat: 0,
  envMapIntensity: 0.8,
  emissiveIntensity: 0,
}

/** Bevel aprovado — v1 (/cubo-magico). */
export const MAGIC_CUBE_V1_BEVEL_RADIUS = 0.035

/** Defaults aprovados — /cubo-magico */
export const DEFAULT_MAGIC_CUBE_CONFIG: MagicCubeConfig = {
  bevelRadius: 0.035,
  cubeColor: '#cfcfcf',
  accentColor: '#f72f00',
  cubeMaterial: { ...DEFAULT_CUBE_MATERIAL },
  accentMaterial: { ...DEFAULT_ACCENT_MATERIAL },
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  pivotRotX: MAGIC_CUBE_VIEW_DEFAULTS.pivotRotX,
  pivotRotY: MAGIC_CUBE_VIEW_DEFAULTS.pivotRotY,
  pivotRotZ: MAGIC_CUBE_VIEW_DEFAULTS.pivotRotZ,
  cameraX: MAGIC_CUBE_VIEW_DEFAULTS.cameraX,
  cameraY: MAGIC_CUBE_VIEW_DEFAULTS.cameraY,
  cameraZ: MAGIC_CUBE_VIEW_DEFAULTS.cameraZ,
  sliceDuration: 0.6,
  explodeDuration: 1.05,
  resetDuration: 1.45,
  waitStart: 1,
  waitBeforeExplode: 1.3,
}
