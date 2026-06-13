import type { MagicCubeConfig } from './magicCubeConfig'
import { MAGIC_CUBE_VIEW_DEFAULTS } from './magicCubeConfig'

const RAD_TO_DEG = 180 / Math.PI

export function formatMagicCubeViewCode(
  config: MagicCubeConfig,
  target: 'v1' | 'v2' = 'v1',
): string {
  const viewDefaultsName = target === 'v2' ? 'MAGIC_CUBE_2_VIEW_DEFAULTS' : 'MAGIC_CUBE_VIEW_DEFAULTS'
  const defaultConfigName = target === 'v2' ? 'DEFAULT_MAGIC_CUBE_2_CONFIG' : 'DEFAULT_MAGIC_CUBE_CONFIG'
  const configPath = target === 'v2' ? 'magicCube2Config.ts' : 'magicCubeConfig.ts'

  return `export const ${viewDefaultsName} = {
  pivotRotX: ${config.pivotRotX},
  pivotRotY: ${config.pivotRotY},
  pivotRotZ: ${config.pivotRotZ},
  cameraX: ${config.cameraX},
  cameraY: ${config.cameraY},
  cameraZ: ${config.cameraZ},
} as const

// Em ${defaultConfigName} (${configPath}):
  pivotRotX: ${config.pivotRotX},
  pivotRotY: ${config.pivotRotY},
  pivotRotZ: ${config.pivotRotZ},
  cameraX: ${config.cameraX},
  cameraY: ${config.cameraY},
  cameraZ: ${config.cameraZ},`
}

export function formatMagicCubeViewCopyPayload(
  config: MagicCubeConfig,
  target: 'v1' | 'v2' = 'v1',
): string {
  const code = formatMagicCubeViewCode(config, target)
  const route = target === 'v2' ? '/cubo-magico-2' : '/cubo-magico'
  const configPath =
    target === 'v2'
      ? 'src/lib/magicCube2Config.ts (MAGIC_CUBE_2_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_2_CONFIG)'
      : 'src/lib/magicCubeConfig.ts (MAGIC_CUBE_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_CONFIG)'

  return `Contexto Fracto — ${route} Vista (pivot + câmera)

Parâmetros aprovados:
- Pivot rotação X: ${config.pivotRotX} rad (${(config.pivotRotX * RAD_TO_DEG).toFixed(1)}°)
- Pivot rotação Y: ${config.pivotRotY} rad (${(config.pivotRotY * RAD_TO_DEG).toFixed(1)}°)
- Pivot rotação Z: ${config.pivotRotZ} rad (${(config.pivotRotZ * RAD_TO_DEG).toFixed(1)}°)
- Câmera: (${config.cameraX}, ${config.cameraY}, ${config.cameraZ})

Cole no Cursor e peça para fixar em ${configPath}.

\`\`\`typescript
${code}
\`\`\`
`
}

export function resetMagicCubeViewDefaults(): Pick<
  MagicCubeConfig,
  'pivotRotX' | 'pivotRotY' | 'pivotRotZ' | 'cameraX' | 'cameraY' | 'cameraZ'
> {
  return { ...MAGIC_CUBE_VIEW_DEFAULTS }
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function radToDeg(rad: number): number {
  return rad * RAD_TO_DEG
}
