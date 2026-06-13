/** Bloco da face frontal do isotipo (Z = 1.5). */
export interface IsotipoBrandingBlock {
  pos: [number, number, number]
  color: number
}

export const FRONT_FACE_Z = 1.5
export const ISOTIPO_ACCENT_COLOR = 0xf72f00
export const ISOTIPO_CUBE_COLOR = 0xffffff

/** Chance de um bloco fora da face frontal ficar visível (Math.random() > threshold). */
export const FRAGMENT_VISIBLE_THRESHOLD = 0.6

/** Face frontal do isotipo Fracto — linha 0 = topo, col 0 = esquerda. */
const FRONT_PATTERN = [
  ['-', 'B', '-', 'O'],
  ['B', '-', '-', '-'],
  ['B', '-', '-', 'B'],
  ['-', 'B', 'B', '-'],
] as const

function patternRowFromGrid(iy: number): number {
  return 3 - iy
}

function gridToPos(ix: number, iy: number, iz: number): [number, number, number] {
  return [(ix - 1.5), (iy - 1.5), (iz - 1.5)]
}

function buildIsotipoBranding(): IsotipoBrandingBlock[] {
  const blocks: IsotipoBrandingBlock[] = []

  for (let iy = 0; iy < 4; iy++) {
    for (let ix = 0; ix < 4; ix++) {
      const cell = FRONT_PATTERN[patternRowFromGrid(iy)]![ix]!
      if (cell === '-') continue

      blocks.push({
        pos: gridToPos(ix, iy, 3),
        color: cell === 'O' ? ISOTIPO_ACCENT_COLOR : ISOTIPO_CUBE_COLOR,
      })
    }
  }

  return blocks
}

/** Blocos exactos visíveis na face frontal — logo "C" cravado. */
export const ISOTIPO_BRANDING = buildIsotipoBranding()

export function isotipoPosKey(x: number, y: number, z: number): string {
  const snap = (value: number): number => Math.round(value * 2) / 2
  return `${snap(x)},${snap(y)},${snap(z)}`
}

export function buildIsotipoBrandingLookup(): Map<string, number> {
  const map = new Map<string, number>()
  for (const block of ISOTIPO_BRANDING) {
    map.set(isotipoPosKey(...block.pos), block.color)
  }
  return map
}

export function isFrontFacePosition(z: number): boolean {
  return Math.abs(z - FRONT_FACE_Z) < 0.01
}

export function isAccentIsotipoColor(color: number): boolean {
  return color === ISOTIPO_ACCENT_COLOR
}
