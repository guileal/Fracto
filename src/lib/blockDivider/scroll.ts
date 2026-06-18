/**
 * Progresso 0→1 enquanto a secção sobe até entrar no viewport.
 * A formação completa quando `completeAt` do percurso foi percorrido
 * (ex.: 0.4 = blocos montados aos 40% do caminho até estar no viewport).
 */
export function computeSectionScrollProgress(
  el: HTMLElement,
  completeAt = 0.4,
): number {
  const vh = window.innerHeight
  if (vh <= 0) return 0

  const rect = el.getBoundingClientRect()
  const safeComplete = Math.max(0.05, Math.min(1, completeAt))

  // 0 quando o topo da secção está no fundo do viewport; sobe à medida que entra.
  const traveled = vh - rect.top
  const formationDistance = vh * safeComplete

  if (formationDistance <= 0) return 0
  return Math.max(0, Math.min(1, traveled / formationDistance))
}
