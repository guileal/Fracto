import type { MagicCubeConfig, MagicCubeMaterialConfig } from './magicCubeConfig'

function formatMaterialBlock(name: string, material: MagicCubeMaterialConfig): string {
  return `const ${name}: MagicCubeMaterialConfig = {
  roughness: ${material.roughness},
  clearcoat: ${material.clearcoat},
  envMapIntensity: ${material.envMapIntensity},
  emissiveIntensity: ${material.emissiveIntensity},
}`
}

export function formatMagicCube2DefaultCode(config: MagicCubeConfig): string {
  return `${formatMaterialBlock('DEFAULT_CUBE_MATERIAL', config.cubeMaterial)}

${formatMaterialBlock('DEFAULT_ACCENT_MATERIAL', config.accentMaterial)}

export const DEFAULT_MAGIC_CUBE_2_CONFIG: MagicCubeConfig = {
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

export function formatMagicCube2CopyPayload(config: MagicCubeConfig): string {
  const code = formatMagicCube2DefaultCode(config)

  return `Contexto Fracto — /cubo-magico-2 Cubo Mágico 3D (v2)

Use este bloco para fixar os defaults em src/lib/magicCube2Config.ts e, depois, correr npm run build:wp — o bundle magic-cube-v2 vai para wordpress/themes/Fracto/assets/3d/ e é enfileirado pelo shortcode [fracto3d_magic_cube_v2].

Materiais e cores partilhados com v1 (/cubo-magico). Iluminação: rig partilhado com /logo-fracto-light.

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
1. Atualizar DEFAULT_MAGIC_CUBE_2_CONFIG em magicCube2Config.ts
2. Correr npm run build:wp para gerar o embed WP magic-cube-v2

\`\`\`typescript
${code}
\`\`\`
`
}
