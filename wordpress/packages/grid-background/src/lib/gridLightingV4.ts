import type { SceneLightingConfig } from './gridLighting'

export const V4_LIGHT_INTENSITY = { min: 0, max: 3, step: 0.05 } as const

export const V4_DEFAULT_LIGHTING: SceneLightingConfig = {
  mouse: {
    enabled: true,
    color: '#c4d0e8',
    intensity: 1.35,
    distance: 72,
    decay: 0.65,
    zOffset: 3.2,
  },
}

export function buildV4Lighting(intensity: number, color: string): SceneLightingConfig {
  const base = V4_DEFAULT_LIGHTING.mouse
  return {
    mouse: {
      ...base,
      intensity: Math.min(
        V4_LIGHT_INTENSITY.max,
        Math.max(V4_LIGHT_INTENSITY.min, intensity),
      ),
      color,
    },
  }
}
