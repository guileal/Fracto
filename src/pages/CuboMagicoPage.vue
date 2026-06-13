<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import MagicCubeControlPanel from '../components/MagicCubeControlPanel.vue'
import {
  DEFAULT_MAGIC_CUBE_CONFIG,
  MAGIC_CUBE_V1_BEVEL_RADIUS,
  MAGIC_CUBE_VIEW_DEFAULTS,
  type MagicCubeConfig,
} from '../lib/magicCubeConfig'
import { MagicCubeV8Scene } from '../three/MagicCubeV8Scene'
import '../styles/landing.css'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cubeConfig = ref<MagicCubeConfig>({ ...DEFAULT_MAGIC_CUBE_CONFIG })
let scene: MagicCubeV8Scene | null = null

onMounted(() => {
  if (!canvasRef.value) return
  scene = new MagicCubeV8Scene(canvasRef.value, cubeConfig.value)
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
  <div class="page8 page8--light">
    <nav class="page8__nav">
      <RouterLink to="/" class="page8__nav-link">Índice</RouterLink>
      <RouterLink to="/cubo-magico-light" class="page8__nav-link">Light v1</RouterLink>
      <RouterLink to="/cubo-magico-2" class="page8__nav-link">Cubo v2</RouterLink>
      <RouterLink to="/logo-fracto" class="page8__nav-link">Logo</RouterLink>
    </nav>

    <section class="page8__layout">
      <div class="page8__text">
        <p class="page8__badge">Sobre nós</p>
        <h1 class="page8__title">
          Desconstruímos marcas e discursos para entender o que realmente importa
        </h1>
        <p class="page8__body">
          Consultoria de marketing digital que quebra a complexidade do seu negócio para
          construir um sistema de marca coerente e estratégico, posicionando sua marca com
          clareza e intenção. O cubo remonta o isotipo Fracto — peças em movimento até
          restar só o que faz sentido para a sua estratégia.
        </p>
      </div>

      <div class="page8__canvas-wrap">
        <canvas ref="canvasRef" class="page8__canvas" aria-hidden="true" />
      </div>
    </section>

    <MagicCubeControlPanel
      :config="cubeConfig"
      :apply="onCubeConfigUpdate"
      :default-config="DEFAULT_MAGIC_CUBE_CONFIG"
      :view-defaults="MAGIC_CUBE_VIEW_DEFAULTS"
      :default-bevel="MAGIC_CUBE_V1_BEVEL_RADIUS"
      variant="v1"
    />
  </div>
</template>

<style scoped>
.page8 {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  padding-bottom: 4.5rem;
  font-family:
    'DM Sans',
    system-ui,
    -apple-system,
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

.page8--light {
  background: #fff;
  color: var(--fracto-black, #111);
}

.page8__nav {
  position: absolute;
  top: clamp(1rem, 3vw, 1.5rem);
  right: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 5;
  display: flex;
  gap: 1rem;
}

.page8--light .page8__nav-link {
  font-size: 0.78rem;
  color: rgba(0, 0, 0, 0.35);
  text-decoration: none;
}

.page8--light .page8__nav-link:hover {
  color: rgba(0, 0, 0, 0.75);
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

.page8--light .page8__body {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--fracto-muted, rgba(0, 0, 0, 0.58));
  max-width: 32rem;
}

.page8--light .page8__body strong {
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
