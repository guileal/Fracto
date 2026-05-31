/**
 * Inicialização DOM para embeds WordPress / WPBakery (conteúdo dinâmico no editor).
 */
export function resolveGridPointerTarget(container: HTMLElement): HTMLElement {
  return (
    (container.closest('.fracto-row-has-brand-bg') as HTMLElement | null) ??
    (container.closest('.hero--grid') as HTMLElement | null) ??
    (container.closest('.fracto-3d-wrapper')?.parentElement as HTMLElement | null) ??
    (container.closest('.row, .vc_row') as HTMLElement | null) ??
    container
  )
}

export function bootstrapFracto3dAutoInit(run: () => void): void {
  const boot = () => {
    run()
    requestAnimationFrame(run)
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  const schedule = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(boot, 32)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.addedNodes.length > 0) {
          schedule()
          return
        }
      }
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
  }

  document.addEventListener('vc-render-shortcode', boot)
  document.addEventListener('vc.render', boot)

  const jq = (window as Window & { jQuery?: { (d: Document): { on: (...args: unknown[]) => void } } })
    .jQuery
  if (jq) {
    jq(document).on('vc-render-shortcode vc-full-screen-row shortcodes_loaded', boot)
  }
}
