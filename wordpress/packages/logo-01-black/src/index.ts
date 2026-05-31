import './embed.css'
import { bootstrapFracto3dAutoInit } from '@fracto/lib/fracto3dDomBootstrap'
import { DEFAULT_FRACTO_LOGO_CONFIG } from '@fracto/lib/fractoLogoConfig'
import { FractoLogoScene } from '@fracto/three/FractoLogoScene'

export const ASSET_ID = 'logo-01-black' as const

const LOGO_SELECTOR = `[data-fracto-3d="${ASSET_ID}"]`
const LOGO_CLASS = 'fracto-3d-logo-01-black'

export interface FractoLogoHandle {
  dispose: () => void
}

const handles = new WeakMap<HTMLElement, FractoLogoHandle>()

function ensureCanvas(container: HTMLElement): HTMLCanvasElement {
  let canvas = container.querySelector<HTMLCanvasElement>('canvas')
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(canvas)
  }
  return canvas
}

export function mount(container: HTMLElement): FractoLogoHandle {
  unmount(container)
  container.setAttribute('data-fracto-3d', ASSET_ID)
  container.classList.add(LOGO_CLASS)
  const scene = new FractoLogoScene(ensureCanvas(container), DEFAULT_FRACTO_LOGO_CONFIG)
  const handle: FractoLogoHandle = { dispose: () => scene.dispose() }
  handles.set(container, handle)
  return handle
}

export function unmount(container: HTMLElement): void {
  const handle = handles.get(container)
  if (handle) {
    handle.dispose()
    handles.delete(container)
  }
  container.classList.remove(LOGO_CLASS)
}

export function autoInit(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(LOGO_SELECTOR).forEach((el) => {
    if (handles.has(el)) return
    mount(el)
  })
}

export interface FractoLogoApi {
  assetId: typeof ASSET_ID
  mount: typeof mount
  unmount: typeof unmount
  autoInit: typeof autoInit
  defaults: typeof DEFAULT_FRACTO_LOGO_CONFIG
}

declare global {
  interface Window {
    Fracto3d?: {
      assets?: Record<string, FractoLogoApi>
      logo01Black?: FractoLogoApi
    }
    FractoLogo01Black?: FractoLogoApi
  }
}

const api: FractoLogoApi = {
  assetId: ASSET_ID,
  mount,
  unmount,
  autoInit,
  defaults: DEFAULT_FRACTO_LOGO_CONFIG,
}

if (typeof window !== 'undefined') {
  window.Fracto3d = window.Fracto3d ?? {}
  window.Fracto3d.assets = window.Fracto3d.assets ?? {}
  window.Fracto3d.assets[ASSET_ID] = api
  window.Fracto3d.logo01Black = api
  window.FractoLogo01Black = api

  bootstrapFracto3dAutoInit(autoInit)
}
