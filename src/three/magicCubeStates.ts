/** Posição 3D de um cubo em um estado da animação */
export type Vec3 = [number, number, number]

export interface MagicCubeState {
  positions: Vec3[]
}

/** Índice do cubo laranja de destaque (pixel accent do isotipo Fracto) */
export const ACCENT_CUBE_INDEX = 1

/** Grade 6×6 do isotipo — 7 cubos, posições normalizadas ao centro */
const LOGO_ISOTYPE: Vec3[] = [
  [-0.26, 0.78, 0],
  [0.78, 0.78, 0],
  [-0.78, 0.26, 0],
  [-0.78, -0.26, 0],
  [0.78, -0.26, 0],
  [-0.26, -0.78, 0],
  [0.26, -0.78, 0],
]

/** Estado disperso — cubos flutuando em profundidade */
const SCATTERED: Vec3[] = [
  [-1.85, 1.05, -0.45],
  [1.72, 0.92, 0.35],
  [-1.42, -0.18, 0.62],
  [-0.95, -1.28, -0.55],
  [1.58, -0.72, 0.48],
  [-0.35, -1.65, 0.22],
  [0.48, 1.55, -0.38],
]

/** Estado em arco — reorganização circular mantendo leitura do símbolo */
const ARC_FORMATION: Vec3[] = [
  [-0.55, 0.95, 0.18],
  [0.95, 0.72, -0.12],
  [-1.05, 0.05, 0.42],
  [-0.82, -0.55, -0.28],
  [0.88, -0.35, 0.35],
  [-0.12, -1.05, 0.08],
  [0.35, 0.35, -0.45],
]

export const CUBE_COUNT = LOGO_ISOTYPE.length

export const MAGIC_CUBE_STATES: MagicCubeState[] = [
  { positions: LOGO_ISOTYPE },
  { positions: SCATTERED },
  { positions: ARC_FORMATION },
]
