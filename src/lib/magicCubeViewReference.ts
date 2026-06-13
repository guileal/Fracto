import type { MagicCubeConfig } from './magicCubeConfig'
import { MAGIC_CUBE_VIEW_DEFAULTS } from './magicCubeConfig'

const RAD_TO_DEG = 180 / Math.PI

export function formatMagicCubeViewCode(config: MagicCubeConfig): string {
  return `export const MAGIC_CUBE_VIEW_DEFAULTS = {
  pivotRotX: ${config.pivotRotX},
  pivotRotY: ${config.pivotRotY},
  pivotRotZ: ${config.pivotRotZ},
  cameraX: ${config.cameraX},
  cameraY: ${config.cameraY},
  cameraZ: ${config.cameraZ},
} as const

// Em DEFAULT_MAGIC_CUBE_CONFIG:
  pivotRotX: ${config.pivotRotX},
  pivotRotY: ${config.pivotRotY},
  pivotRotZ: ${config.pivotRotZ},
  cameraX: ${config.cameraX},
  cameraY: ${config.cameraY},
  cameraZ: ${config.cameraZ},`
}

export function formatMagicCubeViewCopyPayload(config: MagicCubeConfig): string {
  const code = formatMagicCubeViewCode(config)

  return `Contexto Fracto — /cubo-magico Vista (pivot + câmera)

Parâmetros aprovados:
- Pivot rotação X: ${config.pivotRotX} rad (${(config.pivotRotX * RAD_TO_DEG).toFixed(1)}°)
- Pivot rotação Y: ${config.pivotRotY} rad (${(config.pivotRotY * RAD_TO_DEG).toFixed(1)}°)
- Pivot rotação Z: ${config.pivotRotZ} rad (${(config.pivotRotZ * RAD_TO_DEG).toFixed(1)}°)
- Câmera: (${config.cameraX}, ${config.cameraY}, ${config.cameraZ})

Cole no Cursor e peça para fixar em src/lib/magicCubeConfig.ts (MAGIC_CUBE_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_CONFIG).

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
