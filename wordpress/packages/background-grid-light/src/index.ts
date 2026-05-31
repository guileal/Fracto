import './embed.css'
import {
  bootstrapFracto3dAutoInit,
  resolveGridPointerTarget,
} from '@fracto/lib/fracto3dDomBootstrap'
import { buildV4Lighting } from '@fracto/lib/gridLightingV4'
import { GRID_V5_THEMES } from '@fracto/lib/gridThemeV5'
import type { SceneLightingConfig } from '@fracto/lib/gridLighting'
import type { InstancedGridHandle } from '@fracto/three/instancedGridScene'
import { createInstancedGridSceneV5 } from '@fracto/three/instancedGridSceneV5'

export const ASSET_ID = 'background-grid-light' as const

const lightDefaults = GRID_V5_THEMES.light

/** Defaults do hero claro: 16×12, luz #8890a0 @ 0.10. */
export const BG_DEFAULTS = {
  cols: 16,
  rows: 12,
  lightingIntensity: lightDefaults.defaultLightingIntensity,
  lightingColor: lightDefaults.defaultLightingColor,
  cubeColor: lightDefaults.defaultCubeColor,
} as const

const BG_SELECTOR = `[data-fracto-3d="${ASSET_ID}"]`
const BG_CLASS = 'fracto-3d-background-grid-light'

export interface MountOptions {
  cols?: number
  rows?: number
  lightingIntensity?: number
  lightingColor?: string
  lighting?: SceneLightingConfig
  lowPower?: boolean
  cubeColor?: string
}

const handles = new WeakMap<HTMLElement, InstancedGridHandle>()

function resolveLighting(options: MountOptions): SceneLightingConfig {
  if (options.lighting) return options.lighting
  const intensity = options.lightingIntensity ?? BG_DEFAULTS.lightingIntensity
  const color = options.lightingColor ?? BG_DEFAULTS.lightingColor
  return buildV4Lighting(intensity, color)
}

export function mount(container: HTMLElement, options: MountOptions = {}): InstancedGridHandle {
  const cols = options.cols ?? BG_DEFAULTS.cols
  const rows = options.rows ?? BG_DEFAULTS.rows
  unmount(container)
  container.setAttribute('data-fracto-3d', ASSET_ID)
  container.classList.add(BG_CLASS)
  const handle = createInstancedGridSceneV5(container, {
    cols,
    rows,
    lighting: resolveLighting(options),
    lowPower: options.lowPower,
    pointerTarget: resolveGridPointerTarget(container),
    theme: 'light',
    cubeColor: options.cubeColor,
  })
  handles.set(container, handle)
  return handle
}

export function unmount(container: HTMLElement): void {
  const handle = handles.get(container)
  if (handle) {
    handle.dispose()
    handles.delete(container)
  }
  container.classList.remove(BG_CLASS)
}

function readMountOptions(el: HTMLElement): MountOptions {
  const cols = el.dataset.cols ? Number(el.dataset.cols) : undefined
  const rows = el.dataset.rows ? Number(el.dataset.rows) : undefined
  const lightingIntensity = el.dataset.lightIntensity
    ? Number(el.dataset.lightIntensity)
    : undefined
  return {
    cols: Number.isFinite(cols) ? cols : undefined,
    rows: Number.isFinite(rows) ? rows : undefined,
    lightingIntensity: Number.isFinite(lightingIntensity) ? lightingIntensity : undefined,
    lightingColor: el.dataset.lightColor,
    cubeColor: el.dataset.cubeColor,
    lowPower: el.dataset.lowPower === 'true',
  }
}

export function autoInit(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(BG_SELECTOR).forEach((el) => {
    if (handles.has(el)) return
    mount(el, readMountOptions(el))
  })
}

export function ensureBackground(options: MountOptions = {}): HTMLElement {
  let el = document.querySelector<HTMLElement>(BG_SELECTOR)
  if (!el) {
    el = document.createElement('div')
    el.setAttribute('data-fracto-3d', ASSET_ID)
    el.setAttribute('aria-hidden', 'true')
    document.body.prepend(el)
  }
  mount(el, options)
  return el
}

export interface GridBackgroundApi {
  assetId: typeof ASSET_ID
  mount: typeof mount
  unmount: typeof unmount
  autoInit: typeof autoInit
  ensureBackground: typeof ensureBackground
  defaults: typeof BG_DEFAULTS
}

declare global {
  interface Window {
    Fracto3d?: {
      assets?: Record<string, GridBackgroundApi>
      gridBackgroundLight?: GridBackgroundApi
    }
  }
}

const api: GridBackgroundApi = {
  assetId: ASSET_ID,
  mount,
  unmount,
  autoInit,
  ensureBackground,
  defaults: BG_DEFAULTS,
}

if (typeof window !== 'undefined') {
  window.Fracto3d = window.Fracto3d ?? {}
  window.Fracto3d.assets = window.Fracto3d.assets ?? {}
  window.Fracto3d.assets[ASSET_ID] = api
  window.Fracto3d.gridBackgroundLight = api

  bootstrapFracto3dAutoInit(autoInit)
}
