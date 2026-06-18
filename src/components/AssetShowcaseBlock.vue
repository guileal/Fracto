<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AssetUsageGuide from './AssetUsageGuide.vue'
import BlockDivider from './BlockDivider.vue'
import InstancedGridBackgroundV5 from './InstancedGridBackgroundV5.vue'
import SectionBadge from './landing/SectionBadge.vue'
import { useInView } from '../composables/useInView'
import type { WpAssetCatalogEntry } from '../lib/wpAssetsCatalog'
import { MOBILE_GRID_CONFIG } from '../lib/gridConfig'
import {
  DEFAULT_FRACTO_LOGO_CONFIG,
  DEFAULT_FRACTO_LOGO_LIGHT_CONFIG,
} from '../lib/fractoLogoConfig'
import {
  DEFAULT_MAGIC_CUBE_2_CONFIG,
  DEFAULT_MAGIC_CUBE_2_LIGHT_CONFIG,
} from '../lib/magicCube2Config'
import {
  DEFAULT_MAGIC_CUBE_CONFIG,
  DEFAULT_MAGIC_CUBE_LIGHT_CONFIG,
} from '../lib/magicCubeConfig'
import { buildV4Lighting } from '../lib/gridLightingV4'
import { GRID_V5_THEMES } from '../lib/gridThemeV5'
import type { ShowcaseKind } from '../lib/showcaseKinds'
import { FractoLogoScene } from '../three/FractoLogoScene'
import { MagicCubeV2Scene } from '../three/MagicCubeV2Scene'
import { MagicCubeV8Scene } from '../three/MagicCubeV8Scene'

export type { ShowcaseKind }

const props = defineProps<{
  asset: WpAssetCatalogEntry
}>()

const sectionRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { inView } = useInView(sectionRef)

const gridCols = ref(16)
const gridRows = ref(12)

function syncGridForViewport() {
  const narrow = window.innerWidth < 768
  gridCols.value = narrow ? MOBILE_GRID_CONFIG.cols : 16
  gridRows.value = narrow ? MOBILE_GRID_CONFIG.rows : 12
}

onMounted(() => {
  syncGridForViewport()
  window.addEventListener('resize', syncGridForViewport, { passive: true })
})

const kind = props.asset.kind
const isGrid = kind === 'grid-dark' || kind === 'grid-light'
const isDivider = kind === 'block-divider'
const gridTheme = kind === 'grid-light' ? 'light' : 'dark'
const gridLighting =
  gridTheme === 'light'
    ? buildV4Lighting(
        GRID_V5_THEMES.light.defaultLightingIntensity,
        GRID_V5_THEMES.light.defaultLightingColor,
      )
    : buildV4Lighting(0.1, '#c4d0e8')

type SceneHandle = FractoLogoScene | MagicCubeV8Scene | MagicCubeV2Scene
let scene: SceneHandle | null = null

function createScene(canvas: HTMLCanvasElement) {
  switch (kind) {
    case 'logo-black':
      return new FractoLogoScene(canvas, DEFAULT_FRACTO_LOGO_CONFIG)
    case 'logo-light':
      return new FractoLogoScene(canvas, DEFAULT_FRACTO_LOGO_LIGHT_CONFIG)
    case 'cube-v1':
      return new MagicCubeV8Scene(canvas, DEFAULT_MAGIC_CUBE_CONFIG)
    case 'cube-v2':
      return new MagicCubeV2Scene(canvas, DEFAULT_MAGIC_CUBE_2_CONFIG)
    case 'cube-v1-light':
      return new MagicCubeV8Scene(canvas, DEFAULT_MAGIC_CUBE_LIGHT_CONFIG)
    case 'cube-v2-light':
      return new MagicCubeV2Scene(canvas, DEFAULT_MAGIC_CUBE_2_LIGHT_CONFIG)
    default:
      return null
  }
}

function disposeScene() {
  scene?.dispose()
  scene = null
}

watch(
  inView,
  async (visible) => {
    disposeScene()
    if (!visible) return

    await nextTick()
    if (!canvasRef.value) return
    scene = createScene(canvasRef.value)
  },
  { flush: 'post' },
)

onUnmounted(() => {
  window.removeEventListener('resize', syncGridForViewport)
  disposeScene()
})
</script>

<template>
  <section
    :id="asset.assetId"
    ref="sectionRef"
    class="showcase"
    :class="[
      `showcase--${asset.theme}`,
      isGrid ? ['showcase--grid', 'hero', 'hero--grid', gridTheme === 'light' ? 'hero--grid-light' : ''] : '',
      isDivider ? 'showcase--split' : '',
      !isGrid && !isDivider ? 'showcase--split' : '',
    ]"
  >
    <template v-if="isGrid">
      <InstancedGridBackgroundV5
        v-if="inView"
        class="showcase__grid-bg"
        :cols="gridCols"
        :rows="gridRows"
        :lighting="gridLighting"
        :theme="gridTheme"
        :cube-color="gridTheme === 'light' ? GRID_V5_THEMES.light.defaultCubeColor : undefined"
        low-power
      />
      <div class="hero__vignette hero__vignette--grid" aria-hidden="true" />

      <div class="showcase__grid-copy">
        <SectionBadge :label="asset.badge" />
        <h2 class="showcase__title">{{ asset.title }}</h2>
        <p class="showcase__body">{{ asset.description }}</p>
        <p class="showcase__asset-id">WP: {{ asset.assetId }}</p>
        <RouterLink :to="asset.previewTo" class="showcase__link">Ver preview completo</RouterLink>
        <AssetUsageGuide :asset="asset" />
      </div>
    </template>

    <template v-else-if="isDivider">
      <div class="showcase__split">
        <div class="showcase__copy">
          <SectionBadge :label="asset.badge" />
          <h2 class="showcase__title">{{ asset.title }}</h2>
          <p class="showcase__body">{{ asset.description }}</p>
          <p class="showcase__hint">Faz scroll pela página para ver os blocos formarem.</p>
          <p class="showcase__asset-id">WP: {{ asset.assetId }}</p>
          <RouterLink :to="asset.previewTo" class="showcase__link">Ver preview completo</RouterLink>
          <AssetUsageGuide :asset="asset" />
        </div>

        <div class="showcase__stage showcase__stage--divider" aria-hidden="true">
          <div class="showcase__divider-frame">
            <div class="showcase__divider-frame-top" />
            <BlockDivider v-if="inView" variant="default" :complete-at="0.4" />
            <div class="showcase__divider-frame-bottom" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="showcase__split">
        <div class="showcase__copy">
          <SectionBadge :label="asset.badge" />
          <h2 class="showcase__title">{{ asset.title }}</h2>
          <p class="showcase__body">{{ asset.description }}</p>
          <p class="showcase__asset-id">WP: {{ asset.assetId }}</p>
          <RouterLink :to="asset.previewTo" class="showcase__link">Ver preview completo</RouterLink>
          <AssetUsageGuide :asset="asset" />
        </div>

        <div class="showcase__stage" aria-hidden="true">
          <canvas v-if="inView" ref="canvasRef" class="showcase__canvas" />
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.showcase {
  position: relative;
  overflow: hidden;
}

.showcase--grid {
  min-height: 100vh;
  min-height: 100svh;
  color: #fff;
}

.showcase--grid.hero--grid-light {
  color: #18181c;
}

.showcase--dark {
  background: #0a0a0a;
  color: #f2f2f2;
}

.showcase--light {
  background: #fff;
  color: var(--fracto-black, #0a0a0a);
}

.showcase__grid-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.showcase__grid-copy {
  position: absolute;
  z-index: 4;
  top: 50%;
  left: clamp(1.25rem, 4vw, 2.5rem);
  transform: translateY(-50%);
  width: min(36rem, calc(100vw - 2.5rem));
  max-height: calc(100svh - 7rem);
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
}

.showcase--grid .showcase__title,
.showcase--grid .showcase__body {
  text-shadow: 0 2px 32px rgba(0, 0, 0, 0.85);
}

.showcase--grid.hero--grid-light .showcase__title,
.showcase--grid.hero--grid-light .showcase__body {
  text-shadow: none;
}

.showcase--split {
  min-height: 100vh;
  min-height: 100svh;
}

.showcase__hint {
  margin: 0;
  font-size: 0.82rem;
  opacity: 0.55;
  font-style: italic;
}

.showcase--light .showcase__hint {
  color: var(--fracto-muted, #6b6b6b);
  opacity: 1;
}

.showcase__stage--divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 5vw, 3.5rem);
  background: #0a0a0a;
}

.showcase__divider-frame {
  width: min(100%, 500px);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
}

.showcase__divider-frame-top {
  height: clamp(96px, 16vw, 148px);
  background: #000;
}

.showcase__divider-frame-bottom {
  height: clamp(64px, 10vw, 100px);
  background: #fff;
}

.showcase__divider-frame :deep(.fracto-block-divider) {
  margin: 0;
}

.showcase__divider-frame :deep(.fracto-block-divider-wrap) {
  margin: 0;
}

.showcase__split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: stretch;
  min-height: inherit;
}

.showcase__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(0.65rem, 2vw, 1rem);
  width: min(100%, 38rem);
  padding: clamp(5rem, 10vw, 7rem) clamp(1.5rem, 5vw, 3.5rem);
}

.showcase--dark .showcase__copy {
  text-shadow: none;
}

.showcase__title {
  margin: 0;
  font-size: clamp(1.85rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.showcase__body {
  margin: 0;
  font-size: clamp(1rem, 1.6vw, 1.05rem);
  line-height: 1.7;
  color: inherit;
  opacity: 0.78;
  max-width: 32rem;
}

.showcase--light .showcase__body {
  color: var(--fracto-muted, #6b6b6b);
  opacity: 1;
}

.showcase__asset-id {
  margin: 0;
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  opacity: 0.55;
}

.showcase__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--fracto-brand);
  text-decoration: none;
}

.showcase__link:hover {
  color: var(--fracto-brand-hover);
}

.showcase__stage {
  position: relative;
  align-self: stretch;
  min-height: min(100svh, 760px);
  background: transparent;
}

.showcase__canvas {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
}

@media (min-width: 900px) and (max-width: 1180px) {
  .showcase__split {
    grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
  }

  .showcase__copy {
    padding: clamp(1rem, 3vh, 2rem) clamp(1.25rem, 3vw, 2rem);
  }

  .showcase__title {
    font-size: clamp(1.65rem, 3.1vw, 2.35rem);
  }

  .showcase__stage {
    min-height: min(88svh, 680px);
  }
}

@media (max-width: 899px) {
  .showcase--grid {
    min-height: min(88svh, 720px);
  }

  .showcase--split {
    min-height: auto;
  }

  .showcase__grid-copy {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    transform: none;
    max-height: none;
    width: 100%;
    padding: clamp(5.5rem, 14vw, 6.5rem) clamp(1.25rem, 5vw, 1.75rem)
      calc(1.35rem + env(safe-area-inset-bottom, 0px));
    gap: 0.65rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.55) 55%, transparent 100%);
  }

  .showcase--grid.hero--grid-light .showcase__grid-copy {
    background: linear-gradient(to top, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.72) 55%, transparent 100%);
  }

  .showcase__stage--divider {
    order: -1;
    min-height: clamp(280px, 50svh, 400px);
    padding: 1.25rem;
  }

  .showcase__split {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    row-gap: clamp(1.25rem, 4vh, 2rem);
    min-height: auto;
    padding: calc(3.75rem + env(safe-area-inset-top, 0px)) clamp(1.25rem, 5vw, 1.75rem)
      calc(2.5rem + env(safe-area-inset-bottom, 0px));
  }

  .showcase__stage {
    order: -1;
    flex: 0 0 auto;
    width: 100%;
    min-height: clamp(220px, 44svh, 360px);
    max-height: none;
  }

  .showcase__copy {
    flex: 0 1 auto;
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 0;
    gap: 0.85rem;
  }

  .showcase__title {
    font-size: clamp(1.45rem, 6.2vw, 1.95rem);
    line-height: 1.14;
  }

  .showcase__body {
    font-size: 0.95rem;
    line-height: 1.65;
    max-width: none;
  }

  .showcase__link {
    min-height: 2.75rem;
    align-items: center;
    padding-top: 0.15rem;
  }
}

@media (max-width: 480px) {
  .showcase--grid {
    min-height: min(82svh, 640px);
  }

  .showcase__stage {
    min-height: clamp(200px, 40svh, 300px);
  }

  .showcase__grid-copy {
    padding-top: clamp(4.75rem, 12vw, 5.5rem);
  }
}
</style>
