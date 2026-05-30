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

/** Visual aprovado v7 — baked no embed WP */
const DEFAULT_CUBE_MATERIAL: MagicCubeMaterialConfig = {
  roughness: 0.60,
  clearcoat: 0.14,
  envMapIntensity: 0.11,
  emissiveIntensity: 0,
}

const DEFAULT_ACCENT_MATERIAL: MagicCubeMaterialConfig = {
  roughness: 1,
  clearcoat: 0,
  envMapIntensity: 0.27,
  emissiveIntensity: 0,
}

export const MC_DEFAULTS: MagicCubeConfig = {
  bevelRadius: 0.020,
  cubeColor: '#000000',
  accentColor: '#f72f00',
  cubeMaterial: { ...DEFAULT_CUBE_MATERIAL },
  accentMaterial: { ...DEFAULT_ACCENT_MATERIAL },
}
