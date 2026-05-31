import './embed.css'
import { buildV4Lighting, V4_DEFAULT_LIGHTING } from '@fracto/lib/gridLightingV4'
import type { SceneLightingConfig } from '@fracto/lib/gridLighting'
import type { InstancedGridHandle } from '@fracto/three/instancedGridScene'
import { createInstancedGridSceneV5 } from '@fracto/three/instancedGridSceneV5'

export const ASSET_ID = 'background-grid-black' as const

/** Defaults do hero /v5 (desktop): 16×12, luz #c4d0e8 @ 1.35. */
export const BG_DEFAULTS = {
  cols: 16,
  rows: 12,
  lightingIntensity: 1.35,
  lightingColor: V4_DEFAULT_LIGHTING.mouse.color,
} as const

const BG_SELECTOR = `[data-fracto-3d="${ASSET_ID}"]`
const BG_CLASS = 'fracto-3d-background-grid-black'

export interface MountOptions {
  cols?: number
  rows?: number
  lightingIntensity?: number
  lightingColor?: string
  lighting?: SceneLightingConfig
  lowPower?: boolean
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
      gridBackground?: GridBackgroundApi
    }
    /** @deprecated use Fracto3d.gridBackground */
    FractoGridBg?: GridBackgroundApi
    FractoGridV5?: GridBackgroundApi
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
  window.Fracto3d.gridBackground = api
  window.FractoGridBg = api
  window.FractoGridV5 = api

  const run = () => autoInit()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run)
  } else {
    run()
  }
}
