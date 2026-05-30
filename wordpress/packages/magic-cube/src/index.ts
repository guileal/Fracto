import './embed.css'
import { MagicCubeScene } from './MagicCubeScene'
import { MC_DEFAULTS } from './magicCubeConfig'

export const ASSET_ID = 'magic-cube' as const

const MC_SELECTOR = `[data-fracto-3d="${ASSET_ID}"]`
const MC_CLASS = 'fracto-3d-magic-cube'

export interface MagicCubeHandle {
  dispose: () => void
}

const handles = new WeakMap<HTMLElement, MagicCubeHandle>()

function ensureCanvas(container: HTMLElement): HTMLCanvasElement {
  let canvas = container.querySelector<HTMLCanvasElement>('canvas')
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(canvas)
  }
  return canvas
}

export function mount(container: HTMLElement): MagicCubeHandle {
  unmount(container)
  container.setAttribute('data-fracto-3d', ASSET_ID)
  container.classList.add(MC_CLASS)
  const scene = new MagicCubeScene(ensureCanvas(container), MC_DEFAULTS)
  const handle: MagicCubeHandle = { dispose: () => scene.dispose() }
  handles.set(container, handle)
  return handle
}

export function unmount(container: HTMLElement): void {
  const handle = handles.get(container)
  if (handle) {
    handle.dispose()
    handles.delete(container)
  }
  container.classList.remove(MC_CLASS)
}

export function autoInit(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(MC_SELECTOR).forEach((el) => {
    if (handles.has(el)) return
    mount(el)
  })
}

export interface MagicCubeApi {
  assetId: typeof ASSET_ID
  mount: typeof mount
  unmount: typeof unmount
  autoInit: typeof autoInit
  defaults: typeof MC_DEFAULTS
}

declare global {
  interface Window {
    Fracto3d?: {
      assets?: Record<string, MagicCubeApi>
      magicCube?: MagicCubeApi
    }
    FractoMagicCube?: MagicCubeApi
  }
}

const api: MagicCubeApi = {
  assetId: ASSET_ID,
  mount,
  unmount,
  autoInit,
  defaults: MC_DEFAULTS,
}

if (typeof window !== 'undefined') {
  window.Fracto3d = window.Fracto3d ?? {}
  window.Fracto3d.assets = window.Fracto3d.assets ?? {}
  window.Fracto3d.assets[ASSET_ID] = api
  window.Fracto3d.magicCube = api
  window.FractoMagicCube = api

  const run = () => autoInit()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run)
  } else {
    run()
  }
}
