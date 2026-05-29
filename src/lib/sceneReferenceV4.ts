import type { GridConfig } from './gridConfig'
import { clampGrid } from './gridConfig'
import type { SceneLightingConfig } from './gridLighting'
import { formatGridReferenceCode } from './gridConfig'
import { formatLightingReferenceCode } from './gridLighting'

export function formatV4SceneCode(
  lighting: SceneLightingConfig,
  grid: GridConfig,
): string {
  const g = clampGrid(grid)
  return `${formatLightingReferenceCode(lighting).replace('grade v3', 'grade v4')}

${formatGridReferenceCode(g).replace('grade de cubos (v3)', 'grade de cubos (v4)')}`
}

export function formatV4AiBriefing(
  lighting: SceneLightingConfig,
  grid: GridConfig,
): string {
  const g = clampGrid(grid)
  const m = lighting.mouse
  return `Contexto Fracto — Landing v4 (grade instanciada + luz difusa do mouse)

Ajustes atuais que quero manter ou usar como referência:
- Luz do mouse: cor ${m.color}, intensidade ${m.intensity.toFixed(2)} (slider único na UI)
- Luz difusa fixa na cena: distance ${m.distance}, decay ${m.decay}, zOffset ${m.zOffset}
- Grade: ${g.cols} colunas × ${g.rows} linhas (${g.cols * g.rows} cubos)
- Atalhos: [ menos cubos, ] mais cubos

A cor da luz NÃO segue a cor de marca global; usa apenas o valor do color picker/input.
Recrie ou ajuste o comportamento com base nesses parâmetros.`
}

export function formatV4ShareUrl(
  lighting: SceneLightingConfig,
  grid: GridConfig,
): string {
  const g = clampGrid(grid)
  const m = lighting.mouse
  const params = new URLSearchParams({
    c: m.color.replace('#', ''),
    i: String(m.intensity),
    cols: String(g.cols),
    rows: String(g.rows),
  })
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${window.location.pathname}?${params}`
  }
  return `/v4?${params}`
}
