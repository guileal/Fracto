import type { MagicCubeConfig, MagicCubeMaterialConfig } from './magicCubeConfig'
import type { MagicCubeVariant } from './magicCubeReference'

function formatMaterialBlock(name: string, material: MagicCubeMaterialConfig): string {
  return `const ${name}: MagicCubeMaterialConfig = {
  roughness: ${material.roughness},
  clearcoat: ${material.clearcoat},
  envMapIntensity: ${material.envMapIntensity},
  emissiveIntensity: ${material.emissiveIntensity},
}`
}

export function formatMagicCube2DefaultCode(
  config: MagicCubeConfig,
  configConstant = 'DEFAULT_MAGIC_CUBE_2_CONFIG',
): string {
  return `${formatMaterialBlock('DEFAULT_CUBE_MATERIAL', config.cubeMaterial)}

${formatMaterialBlock('DEFAULT_ACCENT_MATERIAL', config.accentMaterial)}

export const ${configConstant}: MagicCubeConfig = {
  bevelRadius: ${config.bevelRadius},
  cubeColor: '${config.cubeColor}',
  accentColor: '${config.accentColor}',
  cubeMaterial: { ...DEFAULT_CUBE_MATERIAL },
  accentMaterial: { ...DEFAULT_ACCENT_MATERIAL },
  scale: ${config.scale},
  offsetX: ${config.offsetX},
  offsetY: ${config.offsetY},
  pivotRotX: ${config.pivotRotX},
  pivotRotY: ${config.pivotRotY},
  pivotRotZ: ${config.pivotRotZ},
  cameraX: ${config.cameraX},
  cameraY: ${config.cameraY},
  cameraZ: ${config.cameraZ},
  sliceDuration: ${config.sliceDuration},
  explodeDuration: ${config.explodeDuration},
  resetDuration: ${config.resetDuration},
  waitStart: ${config.waitStart},
  waitBeforeExplode: ${config.waitBeforeExplode},
}`
}

export function formatMagicCube2CopyPayload(
  config: MagicCubeConfig,
  variant: MagicCubeVariant = 'v2',
): string {
  const isLight = variant === 'v2-light'
  const configConstant = isLight ? 'DEFAULT_MAGIC_CUBE_2_LIGHT_CONFIG' : 'DEFAULT_MAGIC_CUBE_2_CONFIG'
  const code = formatMagicCube2DefaultCode(config, configConstant)
  const route = isLight ? '/cubo-magico-light-2' : '/cubo-magico-2'
  const wpAsset = isLight ? 'magic-cube-v2-light' : 'magic-cube-v2'
  const shortcode = isLight ? '[fracto3d_magic_cube_v2_light]' : '[fracto3d_magic_cube_v2]'

  return `Contexto Fracto — ${route} Cubo Mágico 3D (v2${isLight ? ' claro' : ''})

Use este bloco para fixar os defaults em src/lib/magicCube2Config.ts e, depois, correr npm run build:wp — o bundle ${wpAsset} vai para wordpress/themes/Fracto/assets/3d/ e é enfileirado pelo shortcode ${shortcode}.

Materiais e cores partilhados com v1 (${isLight ? '/cubo-magico-light' : '/cubo-magico'}).

Parâmetros atuais:
- Bevel: ${config.bevelRadius}
- Cor cubos: ${config.cubeColor}
- Cor destaque: ${config.accentColor}
- Material cubos — rugosidade ${config.cubeMaterial.roughness}, verniz ${config.cubeMaterial.clearcoat}, reflexo ${config.cubeMaterial.envMapIntensity}, emissão ${config.cubeMaterial.emissiveIntensity}
- Material laranja — rugosidade ${config.accentMaterial.roughness}, verniz ${config.accentMaterial.clearcoat}, reflexo ${config.accentMaterial.envMapIntensity}, emissão ${config.accentMaterial.emissiveIntensity}
- Layout — tamanho ${config.scale}, horizontal ${config.offsetX}, vertical ${config.offsetY}
- Vista — pivot X ${config.pivotRotX} Y ${config.pivotRotY} Z ${config.pivotRotZ} rad | câmera (${config.cameraX}, ${config.cameraY}, ${config.cameraZ})
- Timing — fatia ${config.sliceDuration}s, explosão ${config.explodeDuration}s, reset ${config.resetDuration}s, pausa inicial ${config.waitStart}s, pausa pré-explosão ${config.waitBeforeExplode}s

Cole no Cursor e peça para:
1. Atualizar ${configConstant} em magicCube2Config.ts
2. Correr npm run build:wp para gerar o embed WP ${wpAsset}

\`\`\`typescript
${code}
\`\`\`
`
}
