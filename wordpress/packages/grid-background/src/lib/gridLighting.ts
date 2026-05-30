export interface MouseLightConfig {
  enabled: boolean
  color: string
  intensity: number
  distance: number
  decay: number
  zOffset: number
}

export interface SceneLightingConfig {
  mouse: MouseLightConfig
}

export const DEFAULT_SCENE_LIGHTING: SceneLightingConfig = {
  mouse: {
    enabled: true,
    color: '#f55e1d',
    intensity: 2.1,
    distance: 18,
    decay: 2,
    zOffset: 4,
  },
}

export function mergeLighting(
  base: SceneLightingConfig,
  patch: Partial<SceneLightingConfig> & { mouse?: Partial<MouseLightConfig> },
): SceneLightingConfig {
  return {
    mouse: { ...base.mouse, ...patch.mouse },
  }
}
