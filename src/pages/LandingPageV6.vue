<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import FractoLogo from '../components/FractoLogo.vue'
import GridLightDock from '../components/GridLightDock.vue'
import HeroGlbSlot from '../components/HeroGlbSlot.vue'
import InstancedGridBackgroundV5 from '../components/InstancedGridBackgroundV5.vue'
import { ISOTIPO_ANIM_GLB } from '../lib/heroModels'
import LandingButton from '../components/landing/LandingButton.vue'
import PerfMonitor from '../components/PerfMonitor.vue'
import SectionBadge from '../components/landing/SectionBadge.vue'
import { normalizeHexColor } from '../lib/colorHex'
import { clampGrid, DEFAULT_GRID_CONFIG, type GridConfig } from '../lib/gridConfig'
import type { SceneLightingConfig } from '../lib/gridLighting'
import { buildV4Lighting, V4_DEFAULT_LIGHTING } from '../lib/gridLightingV4'
import type { PerfStats } from '../lib/perfMonitor'
import type { InstancedGridHandle } from '../three/instancedGridScene'
import '../styles/landing.css'

const route = useRoute()

function initialFromQuery(): { lighting: SceneLightingConfig; grid: GridConfig } {
  const q = route.query
  let color = V4_DEFAULT_LIGHTING.mouse.color
  let intensity = V4_DEFAULT_LIGHTING.mouse.intensity
  let grid = { ...DEFAULT_GRID_CONFIG }

  if (typeof q.c === 'string') {
    const hex = normalizeHexColor(q.c.startsWith('#') ? q.c : `#${q.c}`)
    if (hex) color = hex
  }
  if (typeof q.i === 'string') {
    const i = Number(q.i)
    if (!Number.isNaN(i)) intensity = i
  }
  if (typeof q.cols === 'string' && typeof q.rows === 'string') {
    const cols = Number(q.cols)
    const rows = Number(q.rows)
    if (!Number.isNaN(cols) && !Number.isNaN(rows)) {
      grid = clampGrid({ cols, rows })
    }
  }

  return { lighting: buildV4Lighting(intensity, color), grid }
}

const V6_GRID_DEFAULT: GridConfig = { cols: 12, rows: 9 }

const initial = initialFromQuery()
const perfStats = ref<PerfStats | null>(null)
const lighting = ref<SceneLightingConfig>(structuredClone(initial.lighting))
const gridConfig = ref<GridConfig>(
  initial.grid.cols === DEFAULT_GRID_CONFIG.cols ? { ...V6_GRID_DEFAULT } : { ...initial.grid },
)
const gridBgRef = ref<InstanceType<typeof InstancedGridBackgroundV5> | null>(null)

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

function onUpdateGrid(config: GridConfig) {
  gridConfig.value = config
}

function onApplyGrid(config: GridConfig) {
  gridConfig.value = config
  gridBgRef.value?.rebuildGrid(config.cols, config.rows)
}

onMounted(async () => {
  document.body.dataset.landing = ''
  document.body.dataset.landingV6 = ''
  await nextTick()
  gridBgRef.value?.setLighting(lighting.value)
})

const services = [
  {
    title: 'Branding',
    text: 'Identidade, posicionamento e narrativa de marca com clareza estratégica.',
  },
  {
    title: 'Consultoria',
    text: 'Diagnóstico, arquitetura de discurso e direção para decisões de comunicação.',
  },
  {
    title: 'Comunicação digital',
    text: 'Campanhas, conteúdo e presença digital alinhados ao sistema de marca.',
  },
]

const workItems = [
  { name: 'Projeto Alpha', tag: 'Branding' },
  { name: 'Projeto Beta', tag: 'Consultoria' },
  { name: 'Projeto Gamma', tag: 'Digital' },
]

onUnmounted(() => {
  delete document.body.dataset.landing
  delete document.body.dataset.landingV6
})
</script>

<template>
  <div class="landing-page landing-v6">
    <section class="hero hero--grid hero--v6">
      <InstancedGridBackgroundV5
        ref="gridBgRef"
        :lighting="lighting"
        low-power
        @stats="perfStats = $event"
        @ready="onGridReady"
      />
      <PerfMonitor :stats="perfStats" />
      <div class="hero__vignette hero__vignette--grid" aria-hidden />

      <nav class="hero__nav">
        <RouterLink to="/" class="hero__nav-link">Índice</RouterLink>
        <RouterLink to="/landing" class="hero__nav-link">v1</RouterLink>
        <RouterLink to="/v2" class="hero__nav-link">v2</RouterLink>
        <RouterLink to="/v3" class="hero__nav-link">v3</RouterLink>
        <RouterLink to="/v4" class="hero__nav-link">v4</RouterLink>
        <RouterLink to="/v5" class="hero__nav-link">v5</RouterLink>
      </nav>

      <a href="#" class="hero__brand-pill" aria-label="Fracto">
        <FractoLogo :size="22" decorative />
      </a>

      <div class="hero__stage">
        <div class="hero__isotipo">
          <HeroGlbSlot
            :default-model="ISOTIPO_ANIM_GLB"
            transparent
            chromeless
            low-power
          />
        </div>

        <div class="hero__content">
          <h1 class="hero__headline">
            Somos um <strong>Núcleo de Inteligência Criativa</strong> que atua como parceira
            estratégica em branding, consultoria e comunicação digital
          </h1>

          <div class="hero__actions">
            <LandingButton href="#contato">Comece um projeto</LandingButton>
            <LandingButton href="#trabalho" variant="outline">Conheça nosso portfólio</LandingButton>
          </div>
        </div>
      </div>
    </section>

    <GridLightDock
      :lighting="lighting"
      :grid="gridConfig"
      @update:lighting="onLightingUpdate"
      @update:grid="onUpdateGrid"
      @apply-grid="onApplyGrid"
    />

    <section id="sobre" class="section section--white section--about">
      <div class="section__inner section__inner--end">
        <SectionBadge label="Sobre nós" />
        <h2 class="section__title">
          Desconstruímos marcas e discursos para entender o que realmente importa
        </h2>
        <p class="section__body">
          Consultoria de marketing digital que quebra a complexidade do seu negócio para
          construir um sistema de marca simples e estratégico, posicionando sua marca com
          clareza e intenção.
        </p>
      </div>
    </section>

    <section id="trabalho" class="section section--white">
      <div class="section__inner">
        <SectionBadge label="Nosso trabalho" />
        <h2 class="section__title section__title--compact">
          Marcas que ganham forma quando a estratégia encontra a execução
        </h2>

        <ul class="work-grid">
          <li v-for="item in workItems" :key="item.name" class="work-card">
            <div class="work-card__visual" aria-hidden />
            <div class="work-card__meta">
              <span class="work-card__tag">{{ item.tag }}</span>
              <h3>{{ item.name }}</h3>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section id="servicos" class="section section--surface">
      <div class="section__inner">
        <SectionBadge label="Nossos serviços" />
        <h2 class="section__title section__title--compact">
          Um núcleo integrado para construir e sustentar sua marca
        </h2>

        <ul class="services-grid">
          <li v-for="service in services" :key="service.title" class="service-card">
            <h3>{{ service.title }}</h3>
            <p>{{ service.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section id="contato" class="section section--white section--cta">
      <div class="section__inner section__inner--center">
        <h2 class="section__title section__title--compact">
          Vamos fragmentar o complexo e montar o essencial?
        </h2>
        <LandingButton href="mailto:contato@fracto.br">Comece um projeto</LandingButton>
      </div>
    </section>

    <footer class="landing-footer">
      <FractoLogo :size="48" />
      <p>© {{ new Date().getFullYear() }} Fracto. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<style scoped>
.landing-v6 .hero--grid {
  background: #000;
}

.hero--v6 .hero__stage {
  position: relative;
  z-index: 3;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  pointer-events: none;
}

.hero--v6 .hero__isotipo {
  position: relative;
  flex: 1 1 auto;
  min-height: min(68vh, 720px);
  width: 100%;
  pointer-events: auto;
}

.hero--v6 .hero__content {
  flex-shrink: 0;
  position: relative;
  z-index: 4;
  margin-top: 0;
  padding-top: 0.25rem;
  pointer-events: none;
}

.hero--v6 .hero__actions {
  pointer-events: auto;
}

.hero__vignette--grid {
  background:
    radial-gradient(ellipse 65% 50% at 50% 42%, transparent 0%, rgba(0, 0, 0, 0.35) 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, transparent 50%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, transparent 25%);
}

.hero__nav {
  position: absolute;
  top: clamp(1rem, 3vw, 1.5rem);
  right: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem 1rem;
}

.hero__nav-link {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
}

.hero__nav-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow: hidden;
}

.hero__vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.hero__brand-pill {
  position: relative;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: clamp(1.25rem, 3vw, 2rem) auto 0;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  text-decoration: none;
  color: #fff;
}

.hero__content {
  position: relative;
  z-index: 3;
  margin-top: auto;
  padding: 2rem clamp(1.5rem, 5vw, 4rem) clamp(2.5rem, 6vw, 4.5rem);
  max-width: 52rem;
  pointer-events: none;
}

.hero__headline {
  margin: 0 0 2rem;
  font-size: clamp(1.65rem, 3.8vw, 2.75rem);
  font-weight: 500;
  line-height: 1.22;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 40px rgba(0, 0, 0, 0.85);
}

.hero__headline strong {
  font-weight: 600;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  pointer-events: auto;
}

.section {
  padding: clamp(4rem, 10vw, 7rem) clamp(1.5rem, 5vw, 4rem);
}

.section--white {
  background: #fff;
}

.section--surface {
  background: var(--fracto-surface);
}

.section__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.section__inner--end {
  margin-left: auto;
  max-width: 36rem;
}

.section__inner--center {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.section--about {
  min-height: min(85vh, 900px);
  display: flex;
  align-items: center;
}

.section__title {
  margin: 1.25rem 0 1rem;
  font-size: clamp(1.85rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.section__title--compact {
  max-width: 22ch;
}

.section__body {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--fracto-muted);
  max-width: 36rem;
}

.work-grid {
  list-style: none;
  margin: 2.5rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.work-card {
  border-radius: 16px;
  overflow: hidden;
  background: #f0f0f0;
}

.work-card__visual {
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%);
}

.work-card__meta {
  padding: 1rem 1.15rem 1.25rem;
}

.work-card__tag {
  font-size: 0.72rem;
  color: var(--fracto-coral);
  font-weight: 600;
}

.work-card h3 {
  margin: 0.35rem 0 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.services-grid {
  list-style: none;
  margin: 2.5rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.service-card {
  padding: 1.75rem;
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.service-card h3 {
  margin: 0 0 0.65rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.service-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--fracto-muted);
}

.section--cta .section__title--compact {
  max-width: 28ch;
  text-align: center;
}

.landing-footer {
  padding: 2.5rem clamp(1.5rem, 5vw, 4rem);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.landing-footer p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--fracto-muted);
}

@media (max-width: 720px) {
  .section__inner--end {
    margin-left: 0;
    max-width: none;
  }

  .section--about {
    min-height: auto;
  }

  .hero__actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
