<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import HeroGlbSlot from '../components/HeroGlbSlot.vue'
import PageBackgroundPicker from '../components/PageBackgroundPicker.vue'
import { usePageBackground } from '../composables/usePageBackground'

const {
  src,
  embedUrl,
  showEmbed,
  showVideo,
  showImage,
  backdropStyle,
  setFromUrl,
  setFromFile,
  clear,
} = usePageBackground()

onMounted(() => {
  document.body.dataset.landingV2 = ''
})

onUnmounted(() => {
  delete document.body.dataset.landingV2
  clear()
})
</script>

<template>
  <div class="landing-v2">
    <div class="landing-v2__backdrop" aria-hidden>
      <iframe
        v-if="showEmbed && embedUrl"
        class="landing-v2__embed"
        :src="embedUrl"
        title="Background"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerpolicy="no-referrer"
        tabindex="-1"
      />

      <video
        v-else-if="showVideo && src"
        class="landing-v2__video"
        :src="src"
        autoplay
        muted
        loop
        playsinline
      />

      <div v-else-if="showImage" class="landing-v2__image" :style="backdropStyle" />
    </div>

    <header class="landing-v2__header">
      <RouterLink to="/landing" class="landing-v2__logo-link">
        <img src="/logo-fracto.png" alt="Fracto" class="landing-v2__logo" width="120" height="auto" />
      </RouterLink>

      <div class="landing-v2__header-actions">
        <PageBackgroundPicker
          @apply-url="setFromUrl"
          @apply-file="setFromFile"
          @clear="clear"
        />
        <RouterLink to="/landing" class="landing-v2__link">v1</RouterLink>
        <RouterLink to="/viewer" class="landing-v2__link">Viewer</RouterLink>
      </div>
    </header>

    <main class="landing-v2__main">
      <div class="landing-v2__copy">
        <p class="landing-v2__eyebrow">Engenharia modular</p>
        <h1 class="landing-v2__headline">
          Fragmente o complexo.<br />
          <span>Monte o essencial.</span>
        </h1>
        <p class="landing-v2__lead">
          Cole um link do YouTube, Vimeo ou de uma imagem — o fundo incorpora automaticamente.
        </p>
      </div>

      <div class="landing-v2__stage">
        <HeroGlbSlot transparent chromeless />
      </div>
    </main>
  </div>
</template>

<style scoped>
.landing-v2 {
  position: relative;
  min-height: 100vh;
  color: #f2f2f2;
  overflow: hidden;
}

.landing-v2__backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: #000;
}

.landing-v2__backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.42);
  pointer-events: none;
}

.landing-v2__embed {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 56.25vw;
  min-height: 100vh;
  min-width: 177.78vh;
  transform: translate(-50%, -50%);
  border: none;
  z-index: 0;
}

.landing-v2__video,
.landing-v2__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.landing-v2__video {
  object-fit: cover;
}

.landing-v2__image {
  background-color: #000;
}

.landing-v2__header {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem clamp(1.25rem, 4vw, 2.5rem);
}

.landing-v2__logo-link {
  display: block;
  line-height: 0;
}

.landing-v2__logo {
  width: min(120px, 32vw);
  height: auto;
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.5));
}

.landing-v2__header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.landing-v2__link {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
}

.landing-v2__link:hover {
  color: var(--fracto-brand-soft);
}

.landing-v2__main {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: minmax(260px, 0.95fr) 1.05fr;
  align-items: center;
  min-height: calc(100vh - 5rem);
  padding: 1rem clamp(1.25rem, 4vw, 2.5rem) 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.landing-v2__copy {
  max-width: 30rem;
  padding-right: 1rem;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.75);
}

.landing-v2__eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--fracto-brand);
}

.landing-v2__headline {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.landing-v2__headline span {
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
}

.landing-v2__lead {
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.72);
}

.landing-v2__stage {
  position: relative;
  min-height: min(72vh, 720px);
  height: 100%;
}

@media (max-width: 900px) {
  .landing-v2__main {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .landing-v2__stage {
    order: -1;
    min-height: 52vh;
  }

  .landing-v2__copy {
    padding-right: 0;
  }
}
</style>
