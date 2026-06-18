<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import AssetShowcaseBlock, { type ShowcaseKind } from '../components/AssetShowcaseBlock.vue'
import FractoLogo from '../components/FractoLogo.vue'
import LandingButton from '../components/landing/LandingButton.vue'
import SectionBadge from '../components/landing/SectionBadge.vue'
import '../styles/landing.css'

const VIDEO_SRC = '/video/loop-fracto.mp4'
const VIDEO_DOWNLOAD_NAME = 'Loop - Fracto 3D - Compactado.mp4'

type ShowcaseItem = {
  assetId: string
  kind: ShowcaseKind
  badge: string
  title: string
  description: string
  previewTo: string
  theme: 'dark' | 'light'
}

const showcases: ShowcaseItem[] = [
  {
    assetId: 'background-grid-black',
    kind: 'grid-dark',
    badge: 'Hero',
    title: 'Grid background black',
    description:
      'Grade interactiva em fundo preto — reacção à luz do cursor, ideal para heroes e rows de destaque no WordPress.',
    previewTo: '/grid-background-black',
    theme: 'dark',
  },
  {
    assetId: 'logo-01-black',
    kind: 'logo-black',
    badge: 'Isotipo',
    title: 'Logo Fracto',
    description:
      'Isotipo 3D animado com cubos pretos e accent coral — widget para secções Sobre nós em fundo claro.',
    previewTo: '/logo-fracto',
    theme: 'light',
  },
  {
    assetId: 'logo-01-light',
    kind: 'logo-light',
    badge: 'Isotipo',
    title: 'Logo Fracto (claro)',
    description:
      'Variante em cubos claros para blocos com fundo escuro — mesma animação, contraste invertido.',
    previewTo: '/logo-fracto-light',
    theme: 'dark',
  },
  {
    assetId: 'magic-cube-v8',
    kind: 'cube-v1',
    badge: 'Cubo mágico',
    title: 'Cubo mágico v1',
    description:
      'Hero com isotipo em recomposição — a metáfora Fracto de desconstruir para reconstruir com estratégia.',
    previewTo: '/cubo-magico',
    theme: 'light',
  },
  {
    assetId: 'magic-cube-v2',
    kind: 'cube-v2',
    badge: 'Cubo mágico',
    title: 'Cubo mágico v2',
    description:
      'Narrativa dinâmica com menos ruído e mais estratégia — giros, fragmentos e pausa até a essência voltar ao centro.',
    previewTo: '/cubo-magico-2',
    theme: 'light',
  },
  {
    assetId: 'magic-cube-v8-light',
    kind: 'cube-v1-light',
    badge: 'Cubo mágico',
    title: 'Cubo mágico v1 (claro)',
    description:
      'Mesma mensagem de Sobre nós para blocos com fundo escuro — alinhado ao site fracto.com.br.',
    previewTo: '/cubo-magico-light',
    theme: 'dark',
  },
  {
    assetId: 'magic-cube-v2-light',
    kind: 'cube-v2-light',
    badge: 'Cubo mágico',
    title: 'Cubo mágico v2 (claro)',
    description:
      'Narrativa expandida do cubo para fundos escuros — Inteligência Criativa Fracto em contraste invertido.',
    previewTo: '/cubo-magico-light-2',
    theme: 'dark',
  },
]

onMounted(() => {
  document.body.dataset.presentation = ''
})

onUnmounted(() => {
  delete document.body.dataset.presentation
})
</script>

<template>
  <div class="presentation landing-page">
    <nav class="presentation-nav">
      <RouterLink to="/" class="presentation-nav__link">Índice</RouterLink>
      <a href="#activos" class="presentation-nav__link">Activos</a>
    </nav>

    <section class="presentation-hero" aria-label="Vídeo de apresentação">
      <video
        class="presentation-hero__video"
        :src="VIDEO_SRC"
        autoplay
        muted
        loop
        playsinline
      />
      <div class="presentation-hero__fade" aria-hidden="true" />

      <a
        :href="VIDEO_SRC"
        :download="VIDEO_DOWNLOAD_NAME"
        class="presentation-video-download"
        aria-label="Descarregar vídeo Loop - Fracto 3D - Compactado"
      >
        <span class="presentation-video-download__icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 2.5V11.5M9 11.5L5.5 8M9 11.5L12.5 8"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3.5 14.5H14.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span class="presentation-video-download__label">Download</span>
      </a>
    </section>

    <section class="presentation-intro">
      <div class="presentation-intro__inner">
        <RouterLink to="/home" class="presentation-intro__logo" aria-label="Fracto">
          <FractoLogo :size="44" decorative />
        </RouterLink>

        <h1 class="presentation-intro__headline">
          Somos um <strong>Núcleo de Inteligência Criativa</strong> que atua como parceira
          estratégica em branding, consultoria e comunicação digital
        </h1>

        <div class="presentation-intro__actions">
          <LandingButton href="#activos">Ver activos 3D</LandingButton>
        </div>
      </div>
    </section>

    <section id="activos" class="presentation-activos" aria-label="Widgets exportados">
      <div class="presentation-activos__lead">
        <SectionBadge label="Pipeline WordPress" />
        <h2 class="presentation-activos__title">
          Sete widgets 3D exportados e prontos para produção
        </h2>
        <p class="presentation-activos__body">
          Cada secção abaixo corresponde a um bundle standalone no child theme Fracto —
          carregado sob demanda via shortcode ou fundo de row no WPBakery.
        </p>
      </div>
    </section>

    <AssetShowcaseBlock
      v-for="item in showcases"
      :key="item.assetId"
      v-bind="item"
    />

    <footer class="presentation-footer">
      <p>Guilherme Leal</p>
    </footer>
  </div>
</template>

<style scoped>
.presentation {
  background: #000;
  color: #fff;
}

.presentation-nav {
  position: fixed;
  top: clamp(1rem, 3vw, 1.5rem);
  right: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 30;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem 1rem;
}

.presentation-nav__link {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
}

.presentation-nav__link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.presentation-hero {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  background: #000;
}

.presentation-hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.presentation-hero__fade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.18) 0%, transparent 22%),
    linear-gradient(to bottom, transparent 52%, #000 100%);
}

.presentation-intro {
  position: relative;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: min(88vh, 820px);
  padding: clamp(4.5rem, 11vw, 7.5rem) clamp(1.5rem, 5vw, 4rem);
  text-align: center;
}

.presentation-intro__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2rem, 5vw, 3rem);
  width: min(100%, 40rem);
}

.presentation-intro__logo {
  display: inline-flex;
  line-height: 0;
  text-decoration: none;
  filter: drop-shadow(0 2px 16px rgba(0, 0, 0, 0.45));
}

.presentation-intro__headline {
  margin: 0;
  font-size: clamp(1.55rem, 3.4vw, 2.35rem);
  font-weight: 500;
  line-height: 1.24;
  letter-spacing: -0.03em;
  color: #fff;
}

.presentation-intro__headline strong {
  font-weight: 600;
  color: var(--fracto-brand);
}

.presentation-intro__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.presentation-activos {
  background: #000;
  padding: clamp(3rem, 8vw, 5rem) clamp(1.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 2.5rem);
}

.presentation-activos__lead {
  max-width: 40rem;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.presentation-activos__title {
  margin: 0;
  font-size: clamp(1.65rem, 3.6vw, 2.5rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.035em;
  color: #fff;
}

.presentation-activos__body {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.62);
  max-width: 36rem;
}

.presentation-footer {
  padding: 2.5rem clamp(1.5rem, 5vw, 4rem);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  background: #000;
}

.presentation-footer p {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.02em;
}

.presentation-video-download {
  position: absolute;
  bottom: clamp(1.5rem, 4vw, 2.5rem);
  left: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem 0.5rem 0.65rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow:
    0 0 0 1px rgba(245, 94, 29, 0.08),
    0 0 18px rgba(245, 94, 29, 0.14);
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.presentation-video-download:hover {
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(245, 94, 29, 0.28);
  background: rgba(0, 0, 0, 0.48);
  box-shadow:
    0 0 0 1px rgba(245, 94, 29, 0.16),
    0 0 22px rgba(245, 94, 29, 0.22);
  transform: translateY(-1px);
}

.presentation-video-download__icon {
  display: grid;
  place-items: center;
  width: 1.55rem;
  height: 1.55rem;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(245, 94, 29, 0.35);
  box-shadow: 0 0 10px rgba(245, 94, 29, 0.18);
}

.presentation-video-download:hover .presentation-video-download__icon {
  border-color: rgba(245, 94, 29, 0.55);
  box-shadow: 0 0 14px rgba(245, 94, 29, 0.28);
}

.presentation-video-download__label {
  padding-right: 0.1rem;
}
</style>
