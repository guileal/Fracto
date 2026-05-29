import { computed, ref } from 'vue'
import {
  FALLBACK_YOUTUBE_EMBED,
  parseMediaUrl,
  type EmbedProvider,
} from '../lib/mediaEmbed'

export type PageBackgroundKind = 'embed' | 'image' | 'video'

const kind = ref<PageBackgroundKind>('embed')
const src = ref<string | null>(null)
const embedUrl = ref<string>(FALLBACK_YOUTUBE_EMBED)
const embedProvider = ref<EmbedProvider>('youtube')
const useFallback = ref(true)

let objectUrl: string | null = null

function revokeObjectUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

function isVideoFile(file: File) {
  return file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(file.name)
}

export function usePageBackground() {
  const setFromUrl = (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return

    revokeObjectUrl()
    useFallback.value = false

    const parsed = parseMediaUrl(trimmed)

    if ('embedUrl' in parsed) {
      kind.value = 'embed'
      embedUrl.value = parsed.embedUrl
      embedProvider.value = parsed.provider
      src.value = trimmed
      return
    }

    if (parsed.type === 'video') {
      kind.value = 'video'
      src.value = parsed.url
      return
    }

    kind.value = 'image'
    src.value = parsed.url
  }

  const setFromFile = (file: File) => {
    revokeObjectUrl()
    useFallback.value = false

    objectUrl = URL.createObjectURL(file)
    src.value = objectUrl

    if (isVideoFile(file)) {
      kind.value = 'video'
    } else {
      kind.value = 'image'
    }
  }

  /** Volta ao vídeo YouTube padrão. */
  const clear = () => {
    revokeObjectUrl()
    useFallback.value = true
    kind.value = 'embed'
    src.value = null
    embedUrl.value = FALLBACK_YOUTUBE_EMBED
    embedProvider.value = 'youtube'
  }

  const activeEmbedUrl = computed(() => {
    if (kind.value !== 'embed') return null
    return embedUrl.value
  })

  const backdropStyle = computed(() => {
    if (kind.value !== 'image' || !src.value) return {}
    return {
      backgroundImage: `url("${src.value}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  })

  const hasCustomBackground = computed(() => !useFallback.value)

  const showEmbed = computed(() => kind.value === 'embed' && !!activeEmbedUrl.value)

  const showVideo = computed(() => kind.value === 'video' && !!src.value)

  const showImage = computed(() => kind.value === 'image' && !!src.value)

  return {
    kind,
    src,
    embedUrl: activeEmbedUrl,
    embedProvider,
    useFallback,
    hasCustomBackground,
    showEmbed,
    showVideo,
    showImage,
    backdropStyle,
    setFromUrl,
    setFromFile,
    clear,
  }
}
