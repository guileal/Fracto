#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  loadCatalog,
  loadExports,
  loadManifest,
  saveCatalog,
  saveExports,
  toIifeName,
  defaultShortcode,
  defaultRowClass,
  wordpressDir,
} from './manifest.mjs'

const [command, ...rest] = process.argv.slice(2)

function parseFlags(argv) {
  const flags = {}
  const positional = []
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--export') flags.export = true
    else if (arg.startsWith('--')) {
      const key = arg.slice(2)
      flags[key] = argv[i + 1] ?? true
      i += 1
    } else positional.push(arg)
  }
  return { flags, positional }
}

function gridIndexTs(asset) {
  const themeLine =
    asset.gridTheme === 'light'
      ? "\n    theme: 'light',\n    cubeColor: options.cubeColor,"
      : ''
  return `import './embed.css'
import {
  bootstrapFracto3dAutoInit,
  resolveGridPointerTarget,
} from '@fracto/lib/fracto3dDomBootstrap'
import { buildV4Lighting, V4_DEFAULT_LIGHTING } from '@fracto/lib/gridLightingV4'
import type { SceneLightingConfig } from '@fracto/lib/gridLighting'
import type { InstancedGridHandle } from '@fracto/three/instancedGridScene'
import { createInstancedGridSceneV5 } from '@fracto/three/instancedGridSceneV5'

export const ASSET_ID = '${asset.id}' as const

export const BG_DEFAULTS = {
  cols: 16,
  rows: 12,
  lightingIntensity: 0.10,
  lightingColor: V4_DEFAULT_LIGHTING.mouse.color,
} as const

const BG_SELECTOR = \`[data-fracto-3d="\${ASSET_ID}"]\`
const BG_CLASS = 'fracto-3d-${asset.id}'

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
    pointerTarget: resolveGridPointerTarget(container),${themeLine}
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

const api = { assetId: ASSET_ID, mount, unmount, autoInit, defaults: BG_DEFAULTS }

if (typeof window !== 'undefined') {
  window.Fracto3d = window.Fracto3d ?? {}
  window.Fracto3d.assets = window.Fracto3d.assets ?? {}
  window.Fracto3d.assets[ASSET_ID] = api
  bootstrapFracto3dAutoInit(autoInit)
}
`
}

function logoIndexTs(asset) {
  const scene = asset.scene
  const configImport = asset.sceneConfig
    ? `import { ${asset.sceneConfig} } from '@fracto/lib/fractoLogoConfig'\n`
    : ''
  const sceneArgs = asset.sceneConfig ? `ensureCanvas(container), ${asset.sceneConfig}` : 'ensureCanvas(container)'

  return `import './embed.css'
import { bootstrapFracto3dAutoInit } from '@fracto/lib/fracto3dDomBootstrap'
${configImport}import { ${scene} } from '@fracto/three/${scene}'

export const ASSET_ID = '${asset.id}' as const

const LOGO_SELECTOR = \`[data-fracto-3d="\${ASSET_ID}"]\`
const LOGO_CLASS = 'fracto-3d-${asset.id}'

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
  const scene = new ${scene}(${sceneArgs})
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
`
}

function embedCss(asset) {
  if (asset.type === 'grid') {
    const bg = asset.gridTheme === 'light' ? '#fff' : '#000'
    return `[data-fracto-3d='${asset.id}'],
.fracto-3d-${asset.id} {
  position: relative;
  z-index: 0;
  min-width: 120vw;
  margin-left: -10vw;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  pointer-events: none;
  overflow: hidden;
  background: ${bg};
}

[data-fracto-3d='${asset.id}'] canvas,
.fracto-3d-${asset.id} canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
`
  }

  return `[data-fracto-3d='${asset.id}'],
.fracto-3d-${asset.id} {
  position: relative;
  width: 100%;
  min-height: min(420px, 70vh);
  pointer-events: none;
  overflow: hidden;
  background: transparent;
}

[data-fracto-3d='${asset.id}'] canvas,
.fracto-3d-${asset.id} canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
}
`
}

function cmdList() {
  const catalog = loadCatalog()
  const exportIds = new Set(loadExports())
  console.log('ID\texport\tpreview\ttype')
  for (const [id, entry] of Object.entries(catalog)) {
    console.log(
      `${id}\t${exportIds.has(id) ? 'yes' : 'no'}\t${entry.previewRoute ?? '-'}\t${entry.type ?? '-'}`
    )
  }
}

function cmdExport(id, remove = false) {
  if (!id) throw new Error('Uso: wp export <id> | wp unexport <id>')
  const catalog = loadCatalog()
  if (!catalog[id]) throw new Error(`"${id}" não está no catálogo.`)
  let exportIds = loadExports()
  if (remove) exportIds = exportIds.filter((x) => x !== id)
  else if (!exportIds.includes(id)) exportIds.push(id)
  saveExports(exportIds)
  console.log(`[fracto] ${id} → export: ${remove ? 'off' : 'on'}`)
}

function cmdScaffold(argv) {
  const { flags, positional } = parseFlags(argv)
  const id = positional[0]
  if (!id) {
    throw new Error(
      'Uso: wp scaffold <id> --type grid|logo --route /rota --scene NomeCena [--label txt] [--shortcode tag] [--export] [--grid-theme light]'
    )
  }

  const catalog = loadCatalog()
  if (catalog[id] && !flags.force) {
    throw new Error(`"${id}" já existe no catálogo. Use --force para regenerar glue.`)
  }

  const type = flags.type
  if (type !== 'grid' && type !== 'logo') throw new Error('--type deve ser grid ou logo.')
  if (!flags.route) throw new Error('--route é obrigatório (ex.: /cubo-magico).')
  if (!flags.scene && type === 'logo') throw new Error('--scene é obrigatório para type logo.')

  const entry = {
    label: flags.label || id,
    description: flags.description || `Preview ${flags.route}`,
    previewRoute: flags.route,
    type,
    shortcode: flags.shortcode || defaultShortcode(id),
    vcName: flags['vc-name'] || flags.label || id,
    rowClass: flags['row-class'] || defaultRowClass(id),
    packageDir: `packages/${id}`,
    iifeName: flags['iife-name'] || toIifeName(id),
    scene: flags.scene || 'createInstancedGridSceneV5',
    ...(type === 'grid'
      ? {
          gridOptions: ['cols', 'rows', 'light_intensity', 'light_color', 'low_power'],
          ...(flags['grid-theme'] === 'light'
            ? { gridTheme: 'light', gridOptions: ['cols', 'rows', 'light_intensity', 'light_color', 'cube_color', 'low_power'] }
            : {}),
        }
      : {}),
    ...(flags['scene-config'] ? { sceneConfig: flags['scene-config'] } : {}),
  }

  catalog[id] = entry
  saveCatalog(catalog)

  const pkgDir = resolve(wordpressDir, entry.packageDir, 'src')
  mkdirSync(pkgDir, { recursive: true })
  const indexTs = type === 'grid' ? gridIndexTs({ id, ...entry }) : logoIndexTs({ id, ...entry })
  writeFileSync(resolve(pkgDir, 'index.ts'), indexTs)
  writeFileSync(resolve(pkgDir, 'embed.css'), embedCss({ id, ...entry }))

  if (flags.export) cmdExport(id)

  console.log(`[fracto] scaffold OK: ${entry.packageDir}`)
  console.log(`[fracto] catálogo: ${id} | export: ${flags.export ? 'sim' : 'não'}`)
  console.log('[fracto] próximo: npm run build:wp')
}

function cmdSyncPackage(id) {
  if (!id) throw new Error('Uso: wp sync <id> — regenera glue a partir do catálogo.')
  const catalog = loadCatalog()
  const entry = catalog[id]
  if (!entry) throw new Error(`"${id}" não está no catálogo.`)
  const pkgDir = resolve(wordpressDir, entry.packageDir, 'src')
  mkdirSync(pkgDir, { recursive: true })
  const indexTs =
    entry.type === 'grid' ? gridIndexTs({ id, ...entry }) : logoIndexTs({ id, ...entry })
  writeFileSync(resolve(pkgDir, 'index.ts'), indexTs)
  writeFileSync(resolve(pkgDir, 'embed.css'), embedCss({ id, ...entry }))
  console.log(`[fracto] sync OK: ${entry.packageDir}`)
}

try {
  switch (command) {
    case 'list':
      cmdList()
      break
    case 'export':
      cmdExport(parseFlags(rest).positional[0])
      break
    case 'unexport':
      cmdExport(parseFlags(rest).positional[0], true)
      break
    case 'scaffold':
      cmdScaffold(rest)
      break
    case 'sync':
      cmdSyncPackage(parseFlags(rest).positional[0])
      break
    default:
      console.log(`Comandos:
  list
  scaffold <id> --type grid|logo --route /x --scene Nome [--export]
  export <id>
  unexport <id>
  sync <id>   regenera packages/<id> a partir do catálogo`)
  }
} catch (err) {
  console.error(`[fracto] ${err.message}`)
  process.exit(1)
}
