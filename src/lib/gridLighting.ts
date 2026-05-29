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

/** Snippet para colar em instancedGridScene.ts */
export function formatLightingReferenceCode(config: SceneLightingConfig): string {
  const m = config.mouse
  const hex = m.color.replace('#', '')
  const colorNum = `0x${hex}`

  return `// —— Referência: luz do mouse (grade v3) ——
const mouseLight = new THREE.PointLight(${colorNum}, ${m.intensity}, ${m.distance}, ${m.decay})
// Ao seguir o cursor (grid local):
// mouseLight.position.set(mouseGridX, mouseGridY, ${m.zOffset})
// Quando inativo: mouseLight.intensity = 0
// enabled: ${m.enabled}`
}
