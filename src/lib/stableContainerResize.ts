/**
 * ResizeObserver que ignora micro-mudanças de altura (barra do Safari/Chrome no celular)
 * e agrupa updates em rAF + debounce curto.
 */
export interface StableContainerResizeOptions {
  onResize: () => void
  /** Ignora só-altura abaixo deste delta em touch (px). */
  mobileHeightThreshold?: number
  debounceMs?: number
}

export function observeStableContainerResize(
  container: HTMLElement,
  options: StableContainerResizeOptions,
): () => void {
  const mobileHeightThreshold = options.mobileHeightThreshold ?? 96
  const debounceMs = options.debounceMs ?? 80
  let lastW = 0
  let lastH = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let raf = 0

  const isCoarseMobile = () =>
    window.matchMedia('(hover: none), (pointer: coarse)').matches

  const apply = () => {
    raf = 0
    const w = Math.round(container.clientWidth)
    const h = Math.round(container.clientHeight)
    if (w < 1 || h < 1) return

    if (lastW > 0) {
      const dw = Math.abs(w - lastW)
      const dh = Math.abs(h - lastH)
      if (dw < 1 && dh < 1) return
      if (isCoarseMobile() && dw < 2 && dh < mobileHeightThreshold) return
    }

    lastW = w
    lastH = h
    options.onResize()
  }

  const schedule = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(apply)
    }, debounceMs)
  }

  const observer = new ResizeObserver(schedule)
  observer.observe(container)
  apply()

  return () => {
    if (timer !== undefined) clearTimeout(timer)
    if (raf) cancelAnimationFrame(raf)
    observer.disconnect()
  }
}
