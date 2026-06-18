export type BlockColor = 'black' | 'white' | 'orange'

export interface PatternBlock {
  c: number
  r: number
  color: BlockColor
}

export interface BlockDividerVariant {
  id: string
  label: string
  cols: number
  rows: number
  blocks: PatternBlock[]
}

export interface BlockDividerOptions {
  variant?: string
  /** Fração do percurso até a secção estar no viewport em que a formação termina (0–1). */
  completeAt?: number
  accentColor?: string
}
