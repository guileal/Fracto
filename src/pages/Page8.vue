<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { MagicCubeV8Scene } from '../three/MagicCubeV8Scene'
import '../styles/landing.css'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: MagicCubeV8Scene | null = null
const resolving = ref(false)

onMounted(() => {
  if (!canvasRef.value) return
  scene = new MagicCubeV8Scene(canvasRef.value)
})

onBeforeUnmount(() => {
  scene?.dispose()
  scene = null
})

async function onResolveShape() {
  if (!scene || resolving.value) return
  resolving.value = true
  try {
    await scene.resolveNextShape()
  } finally {
    resolving.value = false
  }
}
</script>

<template>
  <div class="page8">
    <nav class="page8__nav">
      <RouterLink to="/" class="page8__nav-link">Índice</RouterLink>
      <RouterLink to="/v7" class="page8__nav-link">v7</RouterLink>
    </nav>

    <section class="page8__layout">
      <div class="page8__text">
        <p class="page8__badge">Cubo mágico 4×4×4</p>
        <h1 class="page8__title">
          Mecânica real de fatias para formar o isotipo Fracto
        </h1>
        <p class="page8__body">
          Casca oca com 56 peças e seis isotipos na face frontal (iso02–iso06 +
          isotipo): branco perolado, laranja <strong>#ff7300</strong> e células vazias.
        </p>
        <button
          type="button"
          class="page8__cta"
          :disabled="resolving"
          @click="onResolveShape"
        >
          {{ resolving ? 'Girando…' : 'Resolver Forma' }}
        </button>
      </div>

      <div class="page8__canvas-wrap">
        <canvas ref="canvasRef" class="page8__canvas" aria-hidden="true" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.page8 {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  background: #0a0a0e;
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
  color: #ff7300;
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
  color: #ff7300;
  font-weight: 600;
}

.page8__cta {
  align-self: flex-start;
  margin-top: 0.5rem;
  padding: 0.85rem 1.6rem;
  border: none;
  border-radius: 999px;
  background: #ff7300;
  color: #0a0a0e;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition:
    background 0.2s ease,
    opacity 0.2s ease;
}

.page8__cta:hover:not(:disabled) {
  background: #ff8c33;
}

.page8__cta:disabled {
  opacity: 0.55;
  cursor: wait;
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
