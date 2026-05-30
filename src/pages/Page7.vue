<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import LandingButton from '../components/landing/LandingButton.vue'
import SectionBadge from '../components/landing/SectionBadge.vue'
import { MagicCubeScene } from '../three/MagicCubeScene'
import '../styles/landing.css'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: MagicCubeScene | null = null

onMounted(() => {
  if (!canvasRef.value) return
  scene = new MagicCubeScene(canvasRef.value)
})

onBeforeUnmount(() => {
  scene?.dispose()
  scene = null
})
</script>

<template>
  <div class="page7 landing-page">
    <nav class="page7__nav">
      <RouterLink to="/" class="page7__nav-link">Índice</RouterLink>
      <RouterLink to="/v5" class="page7__nav-link">v5</RouterLink>
    </nav>

    <section class="page7__section">
      <div class="page7__text">
        <SectionBadge label="Sobre nós" />
        <h1 class="page7__title">
          Desconstruímos marcas e discursos para entender o que realmente importa
        </h1>
        <p class="page7__body">
          Consultoria de marketing digital que quebra a complexidade do seu negócio para
          construir um sistema de marca simples e estratégico, posicionando sua marca com
          clareza e intenção.
        </p>
        <LandingButton href="#contato">Comece um projeto</LandingButton>
      </div>

      <div class="page7__canvas-wrap">
        <canvas ref="canvasRef" class="page7__canvas" aria-hidden="true" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.page7 {
  min-height: 100vh;
  min-height: 100dvh;
  background: #fff;
  color: var(--fracto-black);
}

.page7__nav {
  position: absolute;
  top: clamp(1rem, 3vw, 1.5rem);
  right: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 5;
  display: flex;
  gap: 1rem;
}

.page7__nav-link {
  font-size: 0.78rem;
  color: rgba(0, 0, 0, 0.35);
  text-decoration: none;
}

.page7__nav-link:hover {
  color: rgba(0, 0, 0, 0.75);
}

.page7__section {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 100vh;
  min-height: 100dvh;
}

.page7__text {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.25rem;
  padding: clamp(5rem, 10vw, 7rem) clamp(1.5rem, 5vw, 4rem);
  max-width: 36rem;
}

.page7__title {
  margin: 0;
  font-size: clamp(1.85rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.page7__body {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--fracto-muted);
  max-width: 36rem;
}

.page7__canvas-wrap {
  flex: 1 1 50%;
  position: relative;
  min-height: 320px;
  background: transparent;
}

.page7__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 900px) {
  .page7__section {
    flex-direction: column;
  }

  .page7__text {
    flex: none;
    max-width: none;
    padding-bottom: 2rem;
  }

  .page7__canvas-wrap {
    flex: 1;
    min-height: min(50vh, 480px);
  }
}
</style>
