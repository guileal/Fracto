import { adjustHexColor } from './colorHex'

export type GridV5Theme = 'dark' | 'light'

export interface GridV5ThemePalette {
  background: number
  clearColor: number
  hemiSky: number
  hemiGround: number
  hemiIntensity: number
  ambient: number
  ambientIntensity: number
  keyLight: number
  keyIntensity: number
  fillLight: number
  fillIntensity: number
  materialColor: number
  specular: number
  shininess: number
  colorRest: number
  colorLift: number
  colorLogoDark: number
  colorLogoWhite: number
  colorBrand: number
  colorFlickerWhite: number
  colorFlickerOrange: number
  defaultLightingIntensity: number
  defaultLightingColor: string
  /** Cor base dos cubos da grade (hex). */
  defaultCubeColor: string
}

export function deriveGridV5LiftColor(cubeHex: string, theme: GridV5Theme = 'light'): string {
  return adjustHexColor(cubeHex, theme === 'light' ? 0.09 : -0.22)
}

export const GRID_V5_THEMES: Record<GridV5Theme, GridV5ThemePalette> = {
  dark: {
    background: 0x000000,
    clearColor: 0x000000,
    hemiSky: 0x7a828c,
    hemiGround: 0x101014,
    hemiIntensity: 0.7,
    ambient: 0x3c3c44,
    ambientIntensity: 0.32,
    keyLight: 0xe8ecf4,
    keyIntensity: 1.15,
    fillLight: 0x9098a8,
    fillIntensity: 0.38,
    materialColor: 0x282830,
    specular: 0x505058,
    shininess: 18,
    colorRest: 0x282830,
    colorLift: 0x5a6270,
    colorLogoDark: 0x0e0e12,
    colorLogoWhite: 0xf4f6fa,
    colorBrand: 0xf55e1d,
    colorFlickerWhite: 0xe8ecf4,
    colorFlickerOrange: 0xf55e1d,
    defaultLightingIntensity: 0.10,
    defaultLightingColor: '#c4d0e8',
    defaultCubeColor: '#282830',
  },
  light: {
    background: 0xffffff,
    clearColor: 0xffffff,
    hemiSky: 0xffffff,
    hemiGround: 0xffffff,
    hemiIntensity: 1.05,
    ambient: 0xffffff,
    ambientIntensity: 0.95,
    keyLight: 0xffffff,
    keyIntensity: 0.35,
    fillLight: 0xffffff,
    fillIntensity: 0.28,
    materialColor: 0xfafafa,
    specular: 0x000000,
    shininess: 0,
    colorRest: 0xfafafa,
    colorLift: 0xe8e8ec,
    colorLogoDark: 0xf4f4f6,
    colorLogoWhite: 0xffffff,
    colorBrand: 0xf55e1d,
    colorFlickerWhite: 0xffffff,
    colorFlickerOrange: 0xf55e1d,
    defaultLightingIntensity: 0.10,
    defaultLightingColor: '#c4d0e8',
    defaultCubeColor: '#fafafa',
  },
}

export function resolveGridV5Theme(theme?: GridV5Theme): GridV5ThemePalette {
  return GRID_V5_THEMES[theme ?? 'dark']
}
