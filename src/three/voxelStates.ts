// Legenda:
// 'O' (Orange) = Cubo Laranja (Destaque)
// 'B' (White)  = Cubo Branco (Perolado)
// '-' (Empty)  = Cubo sem cor / padrão

export type VoxelCell = 'O' | 'B' | '-'

/** Matriz 4×4 — linha 0 = topo, coluna 0 = esquerda. */
export type VoxelFace = [
  [VoxelCell, VoxelCell, VoxelCell, VoxelCell],
  [VoxelCell, VoxelCell, VoxelCell, VoxelCell],
  [VoxelCell, VoxelCell, VoxelCell, VoxelCell],
  [VoxelCell, VoxelCell, VoxelCell, VoxelCell],
]

/** @deprecated Use `VoxelFace` */
export type VoxelFace4x4 = VoxelFace

export const voxelFaces: Record<string, VoxelFace> = {
  // 1. iso 02 (Formato "Sorriso / U")
  iso02: [
    ['-', 'B', '-', 'O'],
    ['B', '-', '-', '-'],
    ['B', '-', '-', 'B'],
    ['-', 'B', 'B', '-'],
  ],

  // 2. iso 03 (Formato "Arco Diagonal")
  iso03: [
    ['-', 'B', 'B', '-'],
    ['-', '-', '-', 'B'],
    ['B', '-', '-', '-'],
    ['-', 'B', '-', 'O'],
  ],

  // 3. iso 04 (Formato "Interrogação")
  iso04: [
    ['-', 'B', 'B', '-'],
    ['B', '-', '-', 'B'],
    ['-', '-', '-', 'B'],
    ['-', 'B', 'O', '-'],
  ],

  // 4. iso 05 (Formato "Ziguezague / Disperso")
  iso05: [
    ['-', '-', 'B', '-'],
    ['B', '-', '-', '-'],
    ['O', '-', '-', 'B'],
    ['-', '-', 'B', '-'],
  ],

  // 5. iso 06 (Formato "Cogumelo / Teto")
  iso06: [
    ['-', 'B', 'B', '-'],
    ['B', '-', '-', 'B'],
    ['-', '-', '-', '-'],
    ['-', 'O', 'B', '-'],
  ],

  // 6. isotipo (Logo "G" - A forma principal)
  isotipo: [
    ['-', 'B', '-', 'O'],
    ['B', '-', '-', '-'],
    ['B', '-', '-', 'B'],
    ['-', 'B', 'B', '-'],
  ],
}

export type VoxelFaceId = keyof typeof voxelFaces

export const VOXEL_FACE_SEQUENCE: VoxelFaceId[] = [
  'isotipo',
  'iso02',
  'iso03',
  'iso04',
  'iso05',
  'iso06',
]

/** Alias para compatibilidade com a cena. */
export const VOXEL_PATTERNS = voxelFaces
export type VoxelPatternId = VoxelFaceId
export const VOXEL_PATTERN_SEQUENCE = VOXEL_FACE_SEQUENCE

export const PATTERN_ISOTIPO = voxelFaces.isotipo!
