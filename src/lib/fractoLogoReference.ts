import type { FractoLogoConfig, FractoLogoMaterialConfig } from './fractoLogoConfig'

function formatMaterialBlock(name: string, material: FractoLogoMaterialConfig): string {
  return `const ${name}: FractoLogoMaterialConfig = {
  roughness: ${material.roughness},
  clearcoat: ${material.clearcoat},
  envMapIntensity: ${material.envMapIntensity},
  emissiveIntensity: ${material.emissiveIntensity},
}`
}

export function formatFractoLogoDefaultCode(config: FractoLogoConfig): string {
  return `${formatMaterialBlock('DEFAULT_CUBE_MATERIAL', config.cubeMaterial)}

${formatMaterialBlock('DEFAULT_ACCENT_MATERIAL', config.accentMaterial)}

export const DEFAULT_FRACTO_LOGO_CONFIG: FractoLogoConfig = {
  bevelRadius: ${config.bevelRadius},
  cubeColor: '${config.cubeColor}',
  accentColor: '${config.accentColor}',
  cubeMaterial: { ...DEFAULT_CUBE_MATERIAL },
  accentMaterial: { ...DEFAULT_ACCENT_MATERIAL },
  scale: ${config.scale},
  offsetX: ${config.offsetX},
  offsetY: ${config.offsetY},
}`
}

export function formatFractoLogoCopyPayload(config: FractoLogoConfig): string {
  const code = formatFractoLogoDefaultCode(config)

  return `Contexto Fracto — /v7 Isotipo 3D (Editor de Materiais)

Use este bloco para fixar os defaults em src/lib/fractoLogoConfig.ts e, depois, correr npm run build:wp — o bundle logo-01-black vai para wordpress/themes/Fracto/assets/3d/ e é enfileirado pelo shortcode [fracto3d_logo].

O Editor de Materiais permanece no projeto para ajustes futuros; o objetivo agora é capturar o visual aprovado e gerar um elemento 3D que o cliente adiciona no WP Bakery com um clique.

Parâmetros atuais:
- Bevel: ${config.bevelRadius}
- Cor cubos: ${config.cubeColor}
- Cor destaque: ${config.accentColor}
- Material preto — rugosidade ${config.cubeMaterial.roughness}, verniz ${config.cubeMaterial.clearcoat}, reflexo ${config.cubeMaterial.envMapIntensity}, emissão ${config.cubeMaterial.emissiveIntensity}
- Material laranja — rugosidade ${config.accentMaterial.roughness}, verniz ${config.accentMaterial.clearcoat}, reflexo ${config.accentMaterial.envMapIntensity}, emissão ${config.accentMaterial.emissiveIntensity}
- Layout — tamanho ${config.scale}, horizontal ${config.offsetX}, vertical ${config.offsetY}

Cole no Cursor e peça para:
1. Atualizar DEFAULT_CUBE_MATERIAL, DEFAULT_ACCENT_MATERIAL e DEFAULT_FRACTO_LOGO_CONFIG
2. Preparar o pacote embed WP (como grid-background) com estes materiais baked in

\`\`\`typescript
${code}
\`\`\`
`
}
