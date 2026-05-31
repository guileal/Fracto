import './embed.css'
import { DEFAULT_MAGIC_CUBE_CONFIG } from '@fracto/lib/magicCubeConfig'
import { MagicCubeScene } from '@fracto/three/MagicCubeScene'

export const ASSET_ID = 'logo-01-black' as const

const MC_SELECTOR = `[data-fracto-3d="${ASSET_ID}"]`
const MC_CLASS = 'fracto-3d-logo-01-black'

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
  const scene = new MagicCubeScene(ensureCanvas(container), DEFAULT_MAGIC_CUBE_CONFIG)
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
  defaults: typeof DEFAULT_MAGIC_CUBE_CONFIG
}

declare global {
  interface Window {
    Fracto3d?: {
      assets?: Record<string, MagicCubeApi>
      logo01Black?: MagicCubeApi
    }
    FractoLogo01Black?: MagicCubeApi
  }
}

const api: MagicCubeApi = {
  assetId: ASSET_ID,
  mount,
  unmount,
  autoInit,
  defaults: DEFAULT_MAGIC_CUBE_CONFIG,
}

if (typeof window !== 'undefined') {
  window.Fracto3d = window.Fracto3d ?? {}
  window.Fracto3d.assets = window.Fracto3d.assets ?? {}
  window.Fracto3d.assets[ASSET_ID] = api
  window.Fracto3d.logo01Black = api
  window.FractoLogo01Black = api

  const run = () => autoInit()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run)
  } else {
    run()
  }
}
