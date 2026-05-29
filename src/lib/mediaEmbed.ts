/** Vídeo padrão da landing v2 (fallback). */
export const FALLBACK_YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v=n7XCPnV0GDU'
export const FALLBACK_YOUTUBE_ID = 'n7XCPnV0GDU'

export type EmbedProvider = 'youtube' | 'vimeo' | 'iframe'

export interface ParsedEmbed {
  provider: EmbedProvider
  embedUrl: string
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId,
    controls: '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0',
    enablejsapi: '0',
  })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return id && id.length === 11 ? id : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (u.pathname.startsWith('/watch')) {
        const id = u.searchParams.get('v')
        return id && id.length === 11 ? id : null
      }
      if (u.pathname.startsWith('/embed/') || u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/')[2]
        return id && id.length === 11 ? id : null
      }
    }
  } catch {
    /* URL inválida */
  }
  return null
}

export function parseVimeoId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null

    const parts = u.pathname.split('/').filter(Boolean)
    const id = parts[parts.length - 1]
    return id && /^\d+$/.test(id) ? id : null
  } catch {
    return null
  }
}

export function buildVimeoEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    muted: '1',
    loop: '1',
    background: '1',
    autopause: '0',
    title: '0',
    byline: '0',
    portrait: '0',
  })
  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`
}

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

/** Converte link colado em embed (YouTube/Vimeo), vídeo direto ou imagem. */
export function parseMediaUrl(url: string): ParsedEmbed | { type: 'video'; url: string } | { type: 'image'; url: string } {
  const trimmed = url.trim()

  const ytId = parseYouTubeId(trimmed)
  if (ytId) {
    return {
      provider: 'youtube',
      embedUrl: buildYouTubeEmbedUrl(ytId),
    }
  }

  const vimeoId = parseVimeoId(trimmed)
  if (vimeoId) {
    return {
      provider: 'vimeo',
      embedUrl: buildVimeoEmbedUrl(vimeoId),
    }
  }

  try {
    const u = new URL(trimmed)
    if (u.pathname.includes('/embed/') || u.hostname.includes('player.')) {
      return { provider: 'iframe', embedUrl: trimmed }
    }
  } catch {
    /* segue */
  }

  if (isDirectVideoUrl(trimmed)) {
    return { type: 'video', url: trimmed }
  }

  return { type: 'image', url: trimmed }
}

export const FALLBACK_YOUTUBE_EMBED = buildYouTubeEmbedUrl(FALLBACK_YOUTUBE_ID)
