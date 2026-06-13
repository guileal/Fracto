<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import InstancedGridBackgroundV5 from './InstancedGridBackgroundV5.vue'
import SectionBadge from './landing/SectionBadge.vue'
import { useInView } from '../composables/useInView'
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
import { FractoLogoScene } from '../three/FractoLogoScene'
import { MagicCubeV2Scene } from '../three/MagicCubeV2Scene'
import { MagicCubeV8Scene } from '../three/MagicCubeV8Scene'

export type ShowcaseKind =
  | 'grid-dark'
  | 'grid-light'
  | 'logo-black'
  | 'logo-light'
  | 'cube-v1'
  | 'cube-v2'
  | 'cube-v1-light'
  | 'cube-v2-light'

const props = defineProps<{
  assetId: string
  kind: ShowcaseKind
  badge: string
  title: string
  description: string
  previewTo: string
  theme: 'dark' | 'light'
}>()

const sectionRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { inView } = useInView(sectionRef)

const isGrid = props.kind === 'grid-dark' || props.kind === 'grid-light'
const gridTheme = props.kind === 'grid-light' ? 'light' : 'dark'
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
  switch (props.kind) {
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

onUnmounted(disposeScene)
</script>

<template>
  <section
    :id="assetId"
    ref="sectionRef"
    class="showcase"
    :class="[
      `showcase--${theme}`,
      isGrid ? ['showcase--grid', 'hero', 'hero--grid', gridTheme === 'light' ? 'hero--grid-light' : ''] : 'showcase--split',
    ]"
  >
    <template v-if="isGrid">
      <InstancedGridBackgroundV5
        v-if="inView"
        class="showcase__grid-bg"
        :cols="16"
        :rows="12"
        :lighting="gridLighting"
        :theme="gridTheme"
        :cube-color="gridTheme === 'light' ? GRID_V5_THEMES.light.defaultCubeColor : undefined"
      />
      <div class="hero__vignette hero__vignette--grid" aria-hidden="true" />

      <div class="showcase__grid-copy">
        <SectionBadge :label="badge" />
        <h2 class="showcase__title">{{ title }}</h2>
        <p class="showcase__body">{{ description }}</p>
        <p class="showcase__asset-id">WP: {{ assetId }}</p>
        <RouterLink :to="previewTo" class="showcase__link">Ver preview completo</RouterLink>
      </div>
    </template>

    <template v-else>
      <div class="showcase__split">
        <div class="showcase__copy">
          <SectionBadge :label="badge" />
          <h2 class="showcase__title">{{ title }}</h2>
          <p class="showcase__body">{{ description }}</p>
          <p class="showcase__asset-id">WP: {{ assetId }}</p>
          <RouterLink :to="previewTo" class="showcase__link">Ver preview completo</RouterLink>
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
  gap: clamp(1rem, 2.5vw, 1.35rem);
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
  .showcase__grid-copy {
    top: auto;
    bottom: clamp(5.5rem, 14vw, 6.5rem);
    transform: none;
    max-height: none;
  }

  .showcase__split {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: clamp(2rem, 5vh, 3rem);
    min-height: 100svh;
    min-height: 100dvh;
    padding: clamp(4.5rem, 13vh, 6.5rem) clamp(1.25rem, 5vw, 2rem)
      clamp(5.5rem, 15vh, 7.5rem);
  }

  .showcase__stage {
    order: -1;
    flex: 0 0 auto;
    width: min(100%, 28rem);
    min-height: clamp(260px, 36svh, 380px);
    max-height: none;
  }

  .showcase__copy {
    flex: 0 1 auto;
    width: min(100%, 38rem);
    margin: 0;
    padding: 0;
  }

  .showcase__title {
    font-size: clamp(1.55rem, 6.5vw, 2.1rem);
  }
}
</style>
