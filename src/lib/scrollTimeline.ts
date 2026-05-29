/** Ponto de keyframe na timeline Summary (0–1). */
export interface ScrollSection {
  id: string
  /** Posição normalizada na timeline (0 = início, 1 = fim). */
  keyframe: number
}

/**
 * Converte scroll da coluna esquerda em progresso 0–1 na timeline Summary,
 * interpolando entre os keyframes de cada seção.
 */
export function progressFromScroll(
  scrollEl: HTMLElement,
  sectionEls: HTMLElement[],
  sections: ScrollSection[],
): number {
  if (sectionEls.length === 0 || sections.length === 0) return 0

  const scrollRect = scrollEl.getBoundingClientRect()
  const focalY = scrollRect.top + scrollRect.height * 0.38

  const points = sectionEls
    .map((el, i) => {
      const rect = el.getBoundingClientRect()
      const section = sections[i]
      if (!section) return null
      return {
        keyframe: Math.max(0, Math.min(1, section.keyframe)),
        centerY: rect.top + rect.height / 2,
      }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => a.centerY - b.centerY)

  if (points.length === 0) return 0
  if (focalY <= points[0]!.centerY) return points[0]!.keyframe
  if (focalY >= points[points.length - 1]!.centerY) return points[points.length - 1]!.keyframe

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!
    const b = points[i + 1]!
    if (focalY >= a.centerY && focalY <= b.centerY) {
      const span = b.centerY - a.centerY || 1
      const t = (focalY - a.centerY) / span
      return a.keyframe + (b.keyframe - a.keyframe) * t
    }
  }

  return points[points.length - 1]!.keyframe
}
