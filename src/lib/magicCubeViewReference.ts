import type { MagicCubeConfig } from './magicCubeConfig'
import type { MagicCubeVariant } from './magicCubeReference'
import { MAGIC_CUBE_VIEW_DEFAULTS } from './magicCubeConfig'

const RAD_TO_DEG = 180 / Math.PI

function viewVariantMeta(variant: MagicCubeVariant) {
  switch (variant) {
    case 'v2-light':
      return {
        route: '/cubo-magico-light-2',
        viewDefaultsName: 'MAGIC_CUBE_2_VIEW_DEFAULTS',
        defaultConfigName: 'DEFAULT_MAGIC_CUBE_2_LIGHT_CONFIG',
        configPath: 'magicCube2Config.ts',
        configHint:
          'src/lib/magicCube2Config.ts (MAGIC_CUBE_2_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_2_LIGHT_CONFIG)',
      }
    case 'v2':
      return {
        route: '/cubo-magico-2',
        viewDefaultsName: 'MAGIC_CUBE_2_VIEW_DEFAULTS',
        defaultConfigName: 'DEFAULT_MAGIC_CUBE_2_CONFIG',
        configPath: 'magicCube2Config.ts',
        configHint:
          'src/lib/magicCube2Config.ts (MAGIC_CUBE_2_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_2_CONFIG)',
      }
    case 'v1-light':
      return {
        route: '/cubo-magico-light',
        viewDefaultsName: 'MAGIC_CUBE_VIEW_DEFAULTS',
        defaultConfigName: 'DEFAULT_MAGIC_CUBE_LIGHT_CONFIG',
        configPath: 'magicCubeConfig.ts',
        configHint:
          'src/lib/magicCubeConfig.ts (MAGIC_CUBE_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_LIGHT_CONFIG)',
      }
    default:
      return {
        route: '/cubo-magico',
        viewDefaultsName: 'MAGIC_CUBE_VIEW_DEFAULTS',
        defaultConfigName: 'DEFAULT_MAGIC_CUBE_CONFIG',
        configPath: 'magicCubeConfig.ts',
        configHint:
          'src/lib/magicCubeConfig.ts (MAGIC_CUBE_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_CONFIG)',
      }
  }
}

export function formatMagicCubeViewCode(
  config: MagicCubeConfig,
  variant: MagicCubeVariant = 'v1',
): string {
  const { viewDefaultsName, defaultConfigName, configPath } = viewVariantMeta(variant)

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
  variant: MagicCubeVariant = 'v1',
): string {
  const code = formatMagicCubeViewCode(config, variant)
  const { route, configHint } = viewVariantMeta(variant)

  return `Contexto Fracto — ${route} Vista (pivot + câmera)

Parâmetros aprovados:
- Pivot rotação X: ${config.pivotRotX} rad (${(config.pivotRotX * RAD_TO_DEG).toFixed(1)}°)
- Pivot rotação Y: ${config.pivotRotY} rad (${(config.pivotRotY * RAD_TO_DEG).toFixed(1)}°)
- Pivot rotação Z: ${config.pivotRotZ} rad (${(config.pivotRotZ * RAD_TO_DEG).toFixed(1)}°)
- Câmera: (${config.cameraX}, ${config.cameraY}, ${config.cameraZ})

Cole no Cursor e peça para fixar em ${configHint}.

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
