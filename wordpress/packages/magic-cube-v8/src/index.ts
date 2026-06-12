import './embed.css'
import { bootstrapFracto3dAutoInit } from '@fracto/lib/fracto3dDomBootstrap'
import { MagicCubeV8Scene } from '@fracto/three/MagicCubeV8Scene'

export const ASSET_ID = 'magic-cube-v8' as const

const LOGO_SELECTOR = `[data-fracto-3d="${ASSET_ID}"]`
const LOGO_CLASS = 'fracto-3d-magic-cube-v8'

export interface SceneHandle {
  dispose: () => void
}

const handles = new WeakMap<HTMLElement, SceneHandle>()

function ensureCanvas(container: HTMLElement): HTMLCanvasElement {
  let canvas = container.querySelector<HTMLCanvasElement>('canvas')
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(canvas)
  }
  return canvas
}

export function mount(container: HTMLElement): SceneHandle {
  unmount(container)
  container.setAttribute('data-fracto-3d', ASSET_ID)
  container.classList.add(LOGO_CLASS)
  const scene = new MagicCubeV8Scene(ensureCanvas(container))
  const handle: SceneHandle = { dispose: () => scene.dispose() }
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

const api = { assetId: ASSET_ID, mount, unmount, autoInit }

if (typeof window !== 'undefined') {
  window.Fracto3d = window.Fracto3d ?? {}
  window.Fracto3d.assets = window.Fracto3d.assets ?? {}
  window.Fracto3d.assets[ASSET_ID] = api
  bootstrapFracto3dAutoInit(autoInit)
}
