import { blockRevealOpacity } from './animation'
import { getBlockDividerVariant } from './patterns'
import { computeSectionScrollProgress } from './scroll'
import type { BlockColor, BlockDividerOptions } from './types'

const ROOT_CLASS = 'fracto-block-divider'
const GRID_CLASS = 'fracto-block-divider__grid'
const BLOCK_CLASS = 'fracto-block-divider__block'
const SELECTOR = `[data-fracto-block-divider]`

const COLOR_CLASS: Record<BlockColor, string> = {
  black: 'fracto-block-divider__block--black',
  white: 'fracto-block-divider__block--white',
  orange: 'fracto-block-divider__block--orange',
}

interface MountedState {
  raf: number
  onScroll: () => void
  onResize: () => void
  reducedMotion: boolean
}

const mounted = new WeakMap<HTMLElement, MountedState>()

function parseCompleteAt(container: HTMLElement): number {
  const raw = container.dataset.completeAt
  if (!raw) return 0.4
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : 0.4
}

function buildGrid(container: HTMLElement, options: BlockDividerOptions): void {
  const variantId = options.variant ?? container.dataset.fractoBlockDivider ?? 'default'
  const pattern = getBlockDividerVariant(variantId)
  const accent = options.accentColor ?? container.dataset.accentColor

  container.classList.add(ROOT_CLASS)
  container.dataset.fractoBlockDivider = pattern.id
  container.style.setProperty('--fracto-divider-cols', String(pattern.cols))
  container.style.setProperty('--fracto-divider-rows', String(pattern.rows))
  if (accent) container.style.setProperty('--fracto-divider-accent', accent)

  container.replaceChildren()
  const grid = document.createElement('div')
  grid.className = GRID_CLASS
  grid.setAttribute('aria-hidden', 'true')

  for (const block of pattern.blocks) {
    const el = document.createElement('span')
    el.className = `${BLOCK_CLASS} ${COLOR_CLASS[block.color]}`
    el.style.gridColumn = String(block.c + 1)
    el.style.gridRow = String(block.r + 1)
    el.style.opacity = '0'
    grid.appendChild(el)
  }

  container.appendChild(grid)
}

function tick(container: HTMLElement): void {
  const state = mounted.get(container)
  if (!state) return

  const blocks = container.querySelectorAll<HTMLElement>(`.${BLOCK_CLASS}`)
  const total = blocks.length

  if (state.reducedMotion) {
    blocks.forEach((el) => {
      el.style.opacity = '1'
    })
    return
  }

  const progress = computeSectionScrollProgress(container, parseCompleteAt(container))
  container.style.setProperty('--fracto-divider-progress', String(progress))

  blocks.forEach((el, index) => {
    el.style.opacity = String(blockRevealOpacity(progress, index, total))
  })
}

export function mountBlockDivider(
  container: HTMLElement,
  options: BlockDividerOptions = {},
): () => void {
  unmountBlockDivider(container)
  buildGrid(container, options)

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onScroll = () => {
    const state = mounted.get(container)
    if (!state) return
    cancelAnimationFrame(state.raf)
    state.raf = requestAnimationFrame(() => tick(container))
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })

  mounted.set(container, { raf: 0, onScroll, onResize: onScroll, reducedMotion })
  tick(container)

  return () => unmountBlockDivider(container)
}

export function unmountBlockDivider(container: HTMLElement): void {
  const state = mounted.get(container)
  if (state) {
    cancelAnimationFrame(state.raf)
    window.removeEventListener('scroll', state.onScroll)
    window.removeEventListener('resize', state.onResize)
    mounted.delete(container)
  }
  container.classList.remove(ROOT_CLASS)
  container.replaceChildren()
}

export function autoInitBlockDividers(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
    if (mounted.has(el)) return
    mountBlockDivider(el)
  })
}
