/** Sequência de opacidade — piscar rápido tipo glitch / boot tech. */
const FLICKER = [0, 1, 0.12, 0.95, 0.25, 1, 0.55, 1] as const

/**
 * Opacidade de um bloco dado o progresso global (0–1) e o índice na ordem de revelação.
 */
export function blockRevealOpacity(
  globalProgress: number,
  index: number,
  total: number,
): number {
  if (total <= 0) return 1
  if (globalProgress <= 0) return 0
  if (globalProgress >= 1) return 1

  const spread = 0.82
  const windowSize = 0.1
  const stagger = (index / Math.max(1, total - 1)) * spread
  const local = (globalProgress - stagger) / windowSize

  if (local <= 0) return 0
  if (local >= 1) return 1

  const step = Math.min(FLICKER.length - 1, Math.floor(local * FLICKER.length))
  return FLICKER[step]
}
