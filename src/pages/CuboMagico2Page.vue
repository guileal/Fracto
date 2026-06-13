<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import MagicCubeControlPanel from '../components/MagicCubeControlPanel.vue'
import {
  DEFAULT_MAGIC_CUBE_2_CONFIG,
  MAGIC_CUBE_2_VIEW_DEFAULTS,
  MAGIC_CUBE_V1_BEVEL_RADIUS,
  type MagicCubeConfig,
} from '../lib/magicCube2Config'
import { MagicCubeV2Scene } from '../three/MagicCubeV2Scene'
import '../styles/landing.css'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cubeConfig = ref<MagicCubeConfig>({ ...DEFAULT_MAGIC_CUBE_2_CONFIG })
let scene: MagicCubeV2Scene | null = null

onMounted(() => {
  if (!canvasRef.value) return
  scene = new MagicCubeV2Scene(canvasRef.value, cubeConfig.value)
})

function onCubeConfigUpdate(partial: Partial<MagicCubeConfig>) {
  cubeConfig.value = {
    ...cubeConfig.value,
    ...partial,
    cubeMaterial: { ...cubeConfig.value.cubeMaterial, ...partial.cubeMaterial },
    accentMaterial: { ...cubeConfig.value.accentMaterial, ...partial.accentMaterial },
  }
  scene?.applyConfig(cubeConfig.value)
}

onBeforeUnmount(() => {
  scene?.dispose()
  scene = null
})
</script>

<template>
  <div class="page8">
    <nav class="page8__nav">
      <RouterLink to="/" class="page8__nav-link">Índice</RouterLink>
      <RouterLink to="/cubo-magico" class="page8__nav-link">Cubo v1</RouterLink>
      <RouterLink to="/logo-fracto-light" class="page8__nav-link">Logo</RouterLink>
    </nav>

    <section class="page8__layout">
      <div class="page8__text">
        <p class="page8__badge">Cubo mágico 4×4×4 — v2</p>
        <h1 class="page8__title">
          Fragmentado, pivot infinito e 8 giros antes da explosão
        </h1>
        <p class="page8__body">
          Versão evoluída: laterais glitchy com laranjas extra, rotação contínua do pivot,
          sequência longa de fatias — cinza <strong>#CFCFCF</strong>, laranja
          <strong>#F72F00</strong>, mesmos materiais do v1. Widget WP
          <strong>magic-cube-v2</strong>.
        </p>
      </div>

      <div class="page8__canvas-wrap">
        <canvas ref="canvasRef" class="page8__canvas" aria-hidden="true" />
      </div>
    </section>

    <MagicCubeControlPanel
      :config="cubeConfig"
      :apply="onCubeConfigUpdate"
      :default-config="DEFAULT_MAGIC_CUBE_2_CONFIG"
      :view-defaults="MAGIC_CUBE_2_VIEW_DEFAULTS"
      :default-bevel="MAGIC_CUBE_V1_BEVEL_RADIUS"
      variant="v2"
    />
  </div>
</template>

<style scoped>
.page8 {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  padding-bottom: 4.5rem;
  background: var(--fracto-site-bg, #121212);
  color: #f2f2f4;
  font-family:
    'DM Sans',
    system-ui,
    -apple-system,
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

.page8__nav {
  position: absolute;
  top: clamp(1rem, 3vw, 1.5rem);
  right: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 5;
  display: flex;
  gap: 1rem;
}

.page8__nav-link {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
}

.page8__nav-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

.page8__layout {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 100vh;
  min-height: 100svh;
}

.page8__text,
.page8__canvas-wrap {
  flex: 1 1 50%;
  min-width: 0;
}

.page8__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.25rem;
  padding: clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 3.5rem);
  max-width: 36rem;
}

.page8__badge {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #f05a28;
}

.page8__title {
  margin: 0;
  font-size: clamp(1.75rem, 3.4vw, 2.65rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.page8__body {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.58);
  max-width: 32rem;
}

.page8__body strong {
  color: #f05a28;
  font-weight: 600;
}

.page8__canvas-wrap {
  position: relative;
  min-height: 320px;
}

.page8__canvas {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
}

@media (max-width: 900px) {
  .page8__layout {
    flex-direction: column;
  }

  .page8__canvas-wrap {
    order: -1;
    flex: none;
    min-height: min(52vh, 420px);
  }

  .page8__text {
    flex: none;
    max-width: none;
    padding-top: 0;
    padding-bottom: 2.5rem;
  }
}
</style>
