export interface MagicCubeMaterialConfig {
  roughness: number
  clearcoat: number
  envMapIntensity: number
  emissiveIntensity: number
}

export interface MagicCubeConfig {
  bevelRadius: number
  cubeColor: string
  accentColor: string
  cubeMaterial: MagicCubeMaterialConfig
  accentMaterial: MagicCubeMaterialConfig
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

const DEFAULT_CUBE_MATERIAL: MagicCubeMaterialConfig = {
  roughness: 0.6,
  clearcoat: 0,
  envMapIntensity: 0.11,
  emissiveIntensity: 0,
}

const DEFAULT_ACCENT_MATERIAL: MagicCubeMaterialConfig = {
  roughness: 0,
  clearcoat: 0,
  envMapIntensity: 0.27,
  emissiveIntensity: 0,
}

export const DEFAULT_MAGIC_CUBE_CONFIG: MagicCubeConfig = {
  bevelRadius: 0.021,
  cubeColor: '#000000',
  accentColor: '#f72f00',
  cubeMaterial: { ...DEFAULT_CUBE_MATERIAL },
  accentMaterial: { ...DEFAULT_ACCENT_MATERIAL },
}
