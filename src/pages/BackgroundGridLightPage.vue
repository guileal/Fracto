<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import GridLightDock from '../components/GridLightDock.vue'
import InstancedGridBackgroundV5 from '../components/InstancedGridBackgroundV5.vue'
import LandingHeroIntro from '../components/landing/LandingHeroIntro.vue'
import LandingButton from '../components/landing/LandingButton.vue'
import PerfMonitor from '../components/PerfMonitor.vue'
import { normalizeHexColor } from '../lib/colorHex'
import {
  clampGrid,
  DEFAULT_GRID_CONFIG,
  MOBILE_GRID_CONFIG,
  type GridConfig,
} from '../lib/gridConfig'
import type { SceneLightingConfig } from '../lib/gridLighting'
import { buildV4Lighting } from '../lib/gridLightingV4'
import { GRID_V5_THEMES } from '../lib/gridThemeV5'
import type { PerfStats } from '../lib/perfMonitor'
import type { InstancedGridHandle } from '../three/instancedGridScene'
import '../styles/landing.css'

const route = useRoute()
const lightDefaults = GRID_V5_THEMES.light

function initialFromQuery(): {
  lighting: SceneLightingConfig
  grid: GridConfig
  cubeColor: string
} {
  const q = route.query
  let color = lightDefaults.defaultLightingColor
  let intensity = lightDefaults.defaultLightingIntensity
  let cubeColor = lightDefaults.defaultCubeColor
  let grid = { ...DEFAULT_GRID_CONFIG }

  if (typeof q.c === 'string') {
    const hex = normalizeHexColor(q.c.startsWith('#') ? q.c : `#${q.c}`)
    if (hex) color = hex
  }
  if (typeof q.i === 'string') {
    const i = Number(q.i)
    if (!Number.isNaN(i)) intensity = i
  }
  if (typeof q.sq === 'string') {
    const hex = normalizeHexColor(q.sq.startsWith('#') ? q.sq : `#${q.sq}`)
    if (hex) cubeColor = hex
  }
  if (typeof q.cols === 'string' && typeof q.rows === 'string') {
    const cols = Number(q.cols)
    const rows = Number(q.rows)
    if (!Number.isNaN(cols) && !Number.isNaN(rows)) {
      grid = clampGrid({ cols, rows })
    }
  }

  return { lighting: buildV4Lighting(intensity, color), grid, cubeColor }
}

const initial = initialFromQuery()
const perfStats = ref<PerfStats | null>(null)
const lighting = ref<SceneLightingConfig>(structuredClone(initial.lighting))
const cubeColor = ref(initial.cubeColor)
const gridConfig = ref<GridConfig>({ ...initial.grid })
const gridBgRef = ref<InstanceType<typeof InstancedGridBackgroundV5> | null>(null)

const DESKTOP_HERO_GRID: GridConfig = { cols: 16, rows: 12 }

function heroGridForViewport(): GridConfig {
  if (typeof window === 'undefined') return { ...DESKTOP_HERO_GRID }
  return window.innerWidth < 768 ? { ...MOBILE_GRID_CONFIG } : { ...DESKTOP_HERO_GRID }
}

const heroGrid = ref<GridConfig>(heroGridForViewport())

function syncHeroGridFromViewport() {
  const next = heroGridForViewport()
  if (next.cols === heroGrid.value.cols && next.rows === heroGrid.value.rows) return
  heroGrid.value = next
  gridConfig.value = { ...next }
  gridBgRef.value?.rebuildGrid(next.cols, next.rows)
}

function onGridReady(handle: InstancedGridHandle) {
  gridConfig.value = {
    cols: handle.getCols(),
    rows: handle.getRows(),
  }
}

function onLightingUpdate(config: SceneLightingConfig) {
  lighting.value = config
  gridBgRef.value?.setLighting(config)
}

function onCubeColorUpdate(color: string) {
  cubeColor.value = color
  gridBgRef.value?.setCubeColor(color)
}

function onUpdateGrid(config: GridConfig) {
  gridConfig.value = config
}

function onApplyGrid(config: GridConfig) {
  gridConfig.value = config
  gridBgRef.value?.rebuildGrid(config.cols, config.rows)
}

onMounted(async () => {
  document.body.dataset.landing = ''
  document.body.dataset.landingGridLight = ''
  heroGrid.value = heroGridForViewport()
  gridConfig.value = { ...heroGrid.value }
  await nextTick()
  gridBgRef.value?.setLighting(lighting.value)
  gridBgRef.value?.setCubeColor(cubeColor.value)
  window.addEventListener('resize', syncHeroGridFromViewport, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', syncHeroGridFromViewport)
  delete document.body.dataset.landing
  delete document.body.dataset.landingGridLight
})
</script>

<template>
  <div class="landing-page landing-grid-light">
    <section class="hero hero--grid hero--grid-light">
      <InstancedGridBackgroundV5
        ref="gridBgRef"
        key="background-grid-light"
        theme="light"
        :cols="heroGrid.cols"
        :rows="heroGrid.rows"
        :lighting="lighting"
        :cube-color="cubeColor"
        @stats="perfStats = $event"
        @ready="onGridReady"
      />
      <PerfMonitor :stats="perfStats" />

      <nav class="hero__nav hero__nav--light">
        <RouterLink to="/" class="hero__nav-link hero__nav-link--light">Índice</RouterLink>
        <RouterLink to="/v5" class="hero__nav-link hero__nav-link--light">v5 (escuro)</RouterLink>
      </nav>

      <LandingHeroIntro class="hero__intro--light">
        <h1 class="hero__headline hero__headline--light">
          Grid claro — mesma grade interativa da <strong>v5</strong>, em fundo branco
        </h1>

        <div class="hero__actions">
          <LandingButton href="#contato">Comece um projeto</LandingButton>
          <LandingButton href="#trabalho" variant="outline">Ver widget WP</LandingButton>
        </div>
      </LandingHeroIntro>
    </section>

    <GridLightDock
      class="landing-grid-light__light-dock"
      show-cube-color
      :lighting="lighting"
      :grid="gridConfig"
      :cube-color="cubeColor"
      @update:lighting="onLightingUpdate"
      @update:cube-color="onCubeColorUpdate"
      @update:grid="onUpdateGrid"
      @apply-grid="onApplyGrid"
    />

    <section id="trabalho" class="section section--white">
      <div class="section__inner">
        <h2 class="section__title section__title--compact">Widget WordPress</h2>
        <p class="section__body">
          Asset <code>background-grid-light</code> — shortcode
          <code>[fracto3d_grid_light]</code> ou classe
          <code>fracto-background-grid-light</code> na row.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-grid-light {
  background: #fff;
}

.hero.hero--grid.hero--grid-light {
  background: #fff !important;
  color: #18181c;
}

.hero.hero--grid.hero--grid-light :deep(.hero__headline),
.hero.hero--grid.hero--grid-light :deep(.hero__headline strong) {
  color: #18181c;
}

.hero__nav--light {
  mix-blend-mode: normal;
}

.hero__nav-link--light {
  color: rgba(24, 24, 28, 0.55);
}

.hero__nav-link--light:hover {
  color: rgba(24, 24, 28, 0.9);
}

.hero__headline--light {
  color: #18181c;
}

.hero__headline--light strong {
  color: #18181c;
}

.landing-grid-light__light-dock :deep(.light-dock-wrap) {
  pointer-events: none;
}

.landing-grid-light__light-dock :deep(.light-dock) {
  background: rgba(255, 255, 255, 0.88);
  border-color: rgba(24, 24, 28, 0.1);
}

.landing-grid-light__light-dock :deep(.light-dock__hex) {
  color: rgba(24, 24, 28, 0.85);
  background: rgba(24, 24, 28, 0.04);
  border-color: rgba(24, 24, 28, 0.1);
}

.landing-grid-light__light-dock :deep(.light-dock__value) {
  color: rgba(24, 24, 28, 0.5);
}

.landing-grid-light__light-dock :deep(.light-dock__hint) {
  color: rgba(24, 24, 28, 0.35);
}

.landing-grid-light__light-dock :deep(.light-dock__hint kbd) {
  background: rgba(24, 24, 28, 0.05);
  border-color: rgba(24, 24, 28, 0.08);
}
</style>
