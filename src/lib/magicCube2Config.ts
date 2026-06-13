import {
  DEFAULT_MAGIC_CUBE_CONFIG,
  DEFAULT_MAGIC_CUBE_LIGHT_CONFIG,
  type MagicCubeConfig,
  type MagicCubeMaterialConfig,
} from './magicCubeConfig'

export type { MagicCubeConfig, MagicCubeMaterialConfig }

export {
  MAGIC_CUBE_BEVEL,
  MAGIC_CUBE_LAYOUT,
  MAGIC_CUBE_MATERIAL,
  MAGIC_CUBE_PIVOT,
  MAGIC_CUBE_TIMING,
  MAGIC_CUBE_V1_BEVEL_RADIUS,
  DEFAULT_MAGIC_CUBE_LIGHT_CONFIG,
} from './magicCubeConfig'

/** Vista aprovada — /cubo-magico-2 */
export const MAGIC_CUBE_2_VIEW_DEFAULTS = {
  pivotRotX: 0.6719517620178169,
  pivotRotY: 0.5061454830783556,
  pivotRotZ: -0.008726646259971648,
  cameraX: 0.2,
  cameraY: -1,
  cameraZ: 12.8,
} as const

/** Variante clara — /cubo-magico-light-2 (materiais = v1 light). */
export const DEFAULT_MAGIC_CUBE_2_LIGHT_CONFIG: MagicCubeConfig = {
  bevelRadius: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.bevelRadius,
  cubeColor: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.cubeColor,
  accentColor: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.accentColor,
  cubeMaterial: { ...DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.cubeMaterial },
  accentMaterial: { ...DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.accentMaterial },
  scale: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.scale,
  offsetX: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.offsetX,
  offsetY: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.offsetY,
  pivotRotX: MAGIC_CUBE_2_VIEW_DEFAULTS.pivotRotX,
  pivotRotY: MAGIC_CUBE_2_VIEW_DEFAULTS.pivotRotY,
  pivotRotZ: MAGIC_CUBE_2_VIEW_DEFAULTS.pivotRotZ,
  cameraX: MAGIC_CUBE_2_VIEW_DEFAULTS.cameraX,
  cameraY: MAGIC_CUBE_2_VIEW_DEFAULTS.cameraY,
  cameraZ: MAGIC_CUBE_2_VIEW_DEFAULTS.cameraZ,
  sliceDuration: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.sliceDuration,
  explodeDuration: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.explodeDuration,
  resetDuration: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.resetDuration,
  waitStart: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.waitStart,
  waitBeforeExplode: DEFAULT_MAGIC_CUBE_LIGHT_CONFIG.waitBeforeExplode,
}

/** Defaults — /cubo-magico-2 (cubos pretos, fundo claro). */
export const DEFAULT_MAGIC_CUBE_2_CONFIG: MagicCubeConfig = {
  bevelRadius: DEFAULT_MAGIC_CUBE_CONFIG.bevelRadius,
  cubeColor: DEFAULT_MAGIC_CUBE_CONFIG.cubeColor,
  accentColor: DEFAULT_MAGIC_CUBE_CONFIG.accentColor,
  cubeMaterial: { ...DEFAULT_MAGIC_CUBE_CONFIG.cubeMaterial },
  accentMaterial: { ...DEFAULT_MAGIC_CUBE_CONFIG.accentMaterial },
  scale: DEFAULT_MAGIC_CUBE_CONFIG.scale,
  offsetX: DEFAULT_MAGIC_CUBE_CONFIG.offsetX,
  offsetY: DEFAULT_MAGIC_CUBE_CONFIG.offsetY,
  pivotRotX: MAGIC_CUBE_2_VIEW_DEFAULTS.pivotRotX,
  pivotRotY: MAGIC_CUBE_2_VIEW_DEFAULTS.pivotRotY,
  pivotRotZ: MAGIC_CUBE_2_VIEW_DEFAULTS.pivotRotZ,
  cameraX: MAGIC_CUBE_2_VIEW_DEFAULTS.cameraX,
  cameraY: MAGIC_CUBE_2_VIEW_DEFAULTS.cameraY,
  cameraZ: MAGIC_CUBE_2_VIEW_DEFAULTS.cameraZ,
  sliceDuration: DEFAULT_MAGIC_CUBE_CONFIG.sliceDuration,
  explodeDuration: DEFAULT_MAGIC_CUBE_CONFIG.explodeDuration,
  resetDuration: DEFAULT_MAGIC_CUBE_CONFIG.resetDuration,
  waitStart: DEFAULT_MAGIC_CUBE_CONFIG.waitStart,
  waitBeforeExplode: DEFAULT_MAGIC_CUBE_CONFIG.waitBeforeExplode,
}
