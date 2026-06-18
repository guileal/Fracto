/** Vídeo hero 16:9 — loop-fracto.mp4 */
export const HERO_VIDEO_ASPECT = 16 / 9

/** Hero mais baixo no telemóvel → menos crop lateral no vídeo horizontal. */
export const MOBILE_HERO_HEIGHT_RATIO = 0.47

export function mobileHeroHeight(viewportHeight: number) {
  return viewportHeight * MOBILE_HERO_HEIGHT_RATIO
}

/**
 * Cobre a área do hero — altura cheia em portrait, largura cheia em landscape.
 * Sem faixas pretas; o excesso corta-se nas laterais ou topo/base.
 */
export function computeHeroVideoFrame(viewportWidth: number, frameHeight: number) {
  let height = frameHeight
  let width = height * HERO_VIDEO_ASPECT

  if (width < viewportWidth) {
    width = viewportWidth
    height = width / HERO_VIDEO_ASPECT
  }

  return { width, height }
}
