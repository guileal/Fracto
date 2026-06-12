<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import LandingButton from '../components/landing/LandingButton.vue'
import SectionBadge from '../components/landing/SectionBadge.vue'
import { DEFAULT_FRACTO_LOGO_LIGHT_CONFIG } from '../lib/fractoLogoConfig'
import { FractoLogoScene } from '../three/FractoLogoScene'
import '../styles/landing.css'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: FractoLogoScene | null = null

onMounted(() => {
  if (!canvasRef.value) return
  scene = new FractoLogoScene(canvasRef.value, DEFAULT_FRACTO_LOGO_LIGHT_CONFIG)
})

onBeforeUnmount(() => {
  scene?.dispose()
  scene = null
})
</script>

<template>
  <div class="logo-light landing-page">
    <nav class="logo-light__nav">
      <RouterLink to="/" class="logo-light__nav-link">Índice</RouterLink>
      <RouterLink to="/logo-fracto" class="logo-light__nav-link">Logo preto</RouterLink>
    </nav>

    <section class="logo-light__section">
      <div class="logo-light__text">
        <SectionBadge label="Sobre nós" />
        <h1 class="logo-light__title">
          Desconstruímos marcas e discursos para entender o que realmente importa
        </h1>
        <p class="logo-light__body">
          Consultoria de marketing digital que quebra a complexidade do seu negócio para
          construir um sistema de marca simples e estratégico, posicionando sua marca com
          clareza e intenção.
        </p>
        <LandingButton href="#contato">Comece um projeto</LandingButton>
      </div>

      <div class="logo-light__canvas-wrap">
        <canvas ref="canvasRef" class="logo-light__canvas" aria-hidden="true" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.logo-light {
  min-height: 100svh;
  background: var(--fracto-site-bg, #121212);
  color: #f5f5f5;
}

.logo-light__nav {
  position: fixed;
  top: clamp(1rem, 3vw, 1.5rem);
  right: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 5;
  display: flex;
  gap: 1rem;
}

.logo-light__nav-link {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
}

.logo-light__nav-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

.logo-light__section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  min-height: 100svh;
}

.logo-light__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(1rem, 2.5vw, 1.35rem);
  width: min(100%, 38rem);
  padding: clamp(5rem, 10vw, 7rem) clamp(1.5rem, 5vw, 3.5rem);
}

.logo-light__canvas-wrap {
  position: relative;
  align-self: stretch;
  min-height: min(100svh, 760px);
  background: transparent;
}

.logo-light__title {
  margin: 0;
  font-size: clamp(1.85rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.logo-light__body {
  margin: 0;
  font-size: clamp(1rem, 1.6vw, 1.05rem);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.62);
}

.logo-light__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@media (min-width: 900px) and (max-width: 1180px) {
  .logo-light__section {
    grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
    padding-block: clamp(2rem, 6vh, 3.5rem);
  }

  .logo-light__text {
    padding: clamp(1rem, 3vh, 2rem) clamp(1.25rem, 3vw, 2rem);
  }

  .logo-light__title {
    font-size: clamp(1.65rem, 3.1vw, 2.35rem);
  }

  .logo-light__canvas-wrap {
    min-height: min(88svh, 680px);
  }
}

@media (max-width: 899px) {
  .logo-light__section {
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

  .logo-light__canvas-wrap {
    order: -1;
    flex: 0 0 auto;
    width: min(100%, 28rem);
    min-height: clamp(260px, 36svh, 380px);
    max-height: none;
  }

  .logo-light__text {
    flex: 0 1 auto;
    width: min(100%, 38rem);
    margin: 0;
    padding: 0;
  }

  .logo-light__title {
    font-size: clamp(1.55rem, 6.5vw, 2.1rem);
  }
}
</style>
