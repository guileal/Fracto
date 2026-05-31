export interface FractoLogoMaterialConfig {
  roughness: number
  clearcoat: number
  envMapIntensity: number
  emissiveIntensity: number
}

export interface FractoLogoConfig {
  bevelRadius: number
  cubeColor: string
  accentColor: string
  cubeMaterial: FractoLogoMaterialConfig
  accentMaterial: FractoLogoMaterialConfig
  /** Escala global do isotipo (1 = tamanho base da cena). */
  scale: number
  /** Deslocamento horizontal em unidades de cena (− esquerda, + direita). */
  offsetX: number
  /** Deslocamento vertical em unidades de cena (− baixo, + cima). */
  offsetY: number
}

export const FRACTO_LOGO_BEVEL = {
  min: 0,
  max: 0.06,
  step: 0.001,
} as const

export const FRACTO_LOGO_MATERIAL = {
  roughness: { min: 0, max: 1, step: 0.01 },
  clearcoat: { min: 0, max: 1, step: 0.01 },
  envMapIntensity: { min: 0, max: 1, step: 0.01 },
  emissiveIntensity: { min: 0, max: 1.5, step: 0.01 },
} as const

export const FRACTO_LOGO_LAYOUT = {
  scale: { min: 0.35, max: 1.25, step: 0.01 },
  offsetX: { min: -1.2, max: 1.2, step: 0.02 },
  offsetY: { min: -1.2, max: 1.2, step: 0.02 },
} as const

const DEFAULT_CUBE_MATERIAL: FractoLogoMaterialConfig = {
  roughness: 0.4,
  clearcoat: 0,
  envMapIntensity: 0.8,
  emissiveIntensity: 0,
}

const DEFAULT_ACCENT_MATERIAL: FractoLogoMaterialConfig = {
  roughness: 1,
  clearcoat: 0,
  envMapIntensity: 0.8,
  emissiveIntensity: 0,
}

export const DEFAULT_FRACTO_LOGO_CONFIG: FractoLogoConfig = {
  bevelRadius: 0.02,
  cubeColor: '#000000',
  accentColor: '#f72f00',
  cubeMaterial: { ...DEFAULT_CUBE_MATERIAL },
  accentMaterial: { ...DEFAULT_ACCENT_MATERIAL },
  scale: 0.78,
  offsetX: 0,
  offsetY: 0,
}
