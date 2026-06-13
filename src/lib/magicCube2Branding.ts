import type { IsotipoBrandingBlock } from './magicCubeBranding'
import {
  buildIsotipoBrandingLookup,
  FRAGMENT_VISIBLE_THRESHOLD,
  ISOTIPO_ACCENT_COLOR,
  isAccentIsotipoColor,
  isFrontFacePosition,
  isotipoPosKey,
} from './magicCubeBranding'

export {
  buildIsotipoBrandingLookup,
  FRAGMENT_VISIBLE_THRESHOLD,
  isAccentIsotipoColor,
  isFrontFacePosition,
  isotipoPosKey,
}

/** Laranjas fixos fora da face frontal — só na versão 2. */
export const FRAGMENT_ACCENT_BLOCKS: IsotipoBrandingBlock[] = [
  { pos: [1.5, 1.5, -1.5], color: ISOTIPO_ACCENT_COLOR },
  { pos: [-1.5, -0.5, 0.5], color: ISOTIPO_ACCENT_COLOR },
]

export function buildFragmentAccentLookup(): Map<string, number> {
  const map = new Map<string, number>()
  for (const block of FRAGMENT_ACCENT_BLOCKS) {
    map.set(isotipoPosKey(...block.pos), block.color)
  }
  return map
}
