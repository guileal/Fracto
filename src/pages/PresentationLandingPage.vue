<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AssetShowcaseBlock from '../components/AssetShowcaseBlock.vue'
import BlockDivider from '../components/BlockDivider.vue'
import FractoLogo from '../components/FractoLogo.vue'
import LandingButton from '../components/landing/LandingButton.vue'
import SectionBadge from '../components/landing/SectionBadge.vue'
import { WP_ASSETS_CATALOG, WP_ASSET_COUNT } from '../lib/wpAssetsCatalog'
import { computeHeroVideoFrame, mobileHeroHeight } from '../lib/videoHeroFrame'
import '../styles/landing.css'

const VIDEO_SRC = '/video/loop-fracto.mp4'
const VIDEO_DOWNLOAD_NAME = 'Loop - Fracto 3D - Compactado.mp4'

const logoSize = ref(44)
const videoFrameStyle = ref<Record<string, string>>({})
const heroSectionStyle = ref<Record<string, string>>({})

function syncPresentationLayout() {
  logoSize.value = window.innerWidth < 720 ? 36 : 44
  syncVideoFrame()
}

function syncVideoFrame() {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  const isMobile = viewportWidth < 720
  const frameHeight = isMobile ? mobileHeroHeight(viewportHeight) : viewportHeight
  const { width, height } = computeHeroVideoFrame(viewportWidth, frameHeight)

  heroSectionStyle.value = isMobile
    ? {
        height: `${frameHeight}px`,
        minHeight: `${frameHeight}px`,
      }
    : {}

  videoFrameStyle.value = {
    width: `${width}px`,
    height: `${height}px`,
  }
}

function onViewportChange() {
  syncPresentationLayout()
}

onMounted(() => {
  document.body.dataset.presentation = ''
  syncPresentationLayout()
  window.addEventListener('resize', onViewportChange, { passive: true })
  window.visualViewport?.addEventListener('resize', onViewportChange)
})

onUnmounted(() => {
  delete document.body.dataset.presentation
  window.removeEventListener('resize', onViewportChange)
  window.visualViewport?.removeEventListener('resize', onViewportChange)
})
</script>

<template>
  <div class="presentation landing-page">
    <nav class="presentation-nav">
      <RouterLink to="/" class="presentation-nav__link">Índice</RouterLink>
      <a href="#guia" class="presentation-nav__link">Guia WP</a>
      <a href="#ativos" class="presentation-nav__link">Ativos</a>
    </nav>

    <section
      class="presentation-hero"
      :style="heroSectionStyle"
      aria-label="Vídeo de apresentação"
    >
      <div class="presentation-hero__media" aria-hidden="true">
        <video
          class="presentation-hero__video"
          :style="videoFrameStyle"
          :src="VIDEO_SRC"
          autoplay
          muted
          loop
          playsinline
        />
      </div>
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
          <FractoLogo :size="logoSize" decorative />
        </RouterLink>

        <h1 class="presentation-intro__headline">
          Somos um <strong>Núcleo de Inteligência Criativa</strong> que atua como parceira
          estratégica em branding, consultoria e comunicação digital
        </h1>

        <div class="presentation-intro__actions">
          <LandingButton href="#ativos">Ver ativos gráficos</LandingButton>
          <LandingButton href="#guia" variant="outline">Como usar no WordPress</LandingButton>
        </div>
      </div>
    </section>

    <section id="guia" class="presentation-guide" aria-label="Guia WordPress">
      <div class="presentation-guide__inner">
        <SectionBadge label="Para quem edita o site" />
        <h2 class="presentation-guide__title">Como inserir os ativos no WPBakery</h2>
        <p class="presentation-guide__lead">
          Todos os elementos estão na categoria <strong>Fracto Widgets</strong> no Add Element.
          Cada um carrega só o JavaScript necessário — a página não fica pesada.
        </p>

        <ol class="presentation-guide__steps">
          <li>
            <strong>Elemento WPBakery</strong> — Add Element → Fracto Widgets → escolha o widget
            (ex.: Background 3D, Logo, Divisor de blocos).
          </li>
          <li>
            <strong>Fundo de row</strong> — na row, aba Background →
            <em>Fracto — Fundo da marca</em> (só widgets 3D de fundo e logo).
          </li>
          <li>
            <strong>Classe CSS</strong> — aba Advanced → Extra Class Name, ex.:
            <code>fracto-background-grid-black</code>.
          </li>
        </ol>

        <p class="presentation-guide__note">
          Em cada ativo abaixo há instruções específicas: quando usar, onde colocar e o shortcode
          exacto.
        </p>
      </div>
    </section>

    <section id="ativos" class="presentation-activos" aria-label="Ativos exportados">
      <div class="presentation-activos__lead">
        <SectionBadge label="Pipeline WordPress" />
        <h2 class="presentation-activos__title">
          {{ WP_ASSET_COUNT }} ativos gráficos prontos para produção
        </h2>
        <p class="presentation-activos__body">
          Sete widgets 3D interactivos e um divisor de blocos com animação no scroll — todos no
          child theme <code>Fracto</code>, carregados sob demanda.
        </p>
      </div>
    </section>

    <template v-for="asset in WP_ASSETS_CATALOG" :key="asset.assetId">
      <AssetShowcaseBlock :asset="asset" />

      <div
        v-if="asset.assetId === 'magic-cube-v2-light'"
        class="presentation-divider-transition"
        aria-hidden="true"
      >
        <BlockDivider variant="default" :complete-at="0.4" />
      </div>
    </template>

    <footer class="presentation-footer">
      <p>Guilherme Leal — Fracto</p>
      <p class="presentation-footer__dev">
        Referência técnica (desenvolvedor): <code>wordpress/ASSETS.md</code>
      </p>
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

.presentation-hero__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.presentation-hero__video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: block;
  object-fit: cover;
  object-position: center center;
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

.presentation-guide {
  background: #0a0a0a;
  padding: clamp(3rem, 8vw, 5rem) clamp(1.5rem, 5vw, 4rem);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.presentation-guide__inner {
  max-width: 42rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.presentation-guide__title {
  margin: 0;
  font-size: clamp(1.5rem, 3.2vw, 2.1rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.presentation-guide__lead {
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.68);
}

.presentation-guide__lead strong {
  color: #fff;
  font-weight: 600;
}

.presentation-guide__steps {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.78);
}

.presentation-guide__steps code {
  font-family: ui-monospace, monospace;
  font-size: 0.82rem;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
}

.presentation-guide__note {
  margin: 0.5rem 0 0;
  font-size: 0.88rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.5);
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

.presentation-activos__body code {
  font-family: ui-monospace, monospace;
  font-size: 0.88em;
}

.presentation-divider-transition {
  --fracto-block-size: clamp(18px, 3.25vw, 42px);
  position: relative;
  z-index: 6;
  width: 100%;
  margin-top: calc(var(--fracto-block-size) * -2);
  margin-bottom: calc(var(--fracto-block-size) * -0.5);
  background: #fff;
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

.presentation-footer__dev {
  margin-top: 0.5rem !important;
  font-size: 0.75rem !important;
  opacity: 0.7;
}

.presentation-footer__link {
  color: var(--fracto-brand);
  text-decoration: none;
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

@media (max-width: 720px) {
  .presentation-nav {
    top: calc(0.85rem + env(safe-area-inset-top, 0px));
    right: calc(1rem + env(safe-area-inset-right, 0px));
    gap: 0.85rem;
  }

  .presentation-nav__link {
    font-size: 0.72rem;
    padding: 0.35rem 0;
  }

  .presentation-hero__fade {
    background:
      linear-gradient(to bottom, rgba(0, 0, 0, 0.28) 0%, transparent 18%),
      linear-gradient(to bottom, transparent 48%, #000 100%);
  }

  .presentation-video-download {
    left: 50%;
    bottom: calc(1.15rem + env(safe-area-inset-bottom, 0px));
    transform: translateX(-50%);
    padding: 0.45rem 0.75rem 0.45rem 0.55rem;
    font-size: 0.68rem;
  }

  .presentation-video-download:hover {
    transform: translateX(-50%) translateY(-1px);
  }

  .presentation-intro {
    min-height: auto;
    padding: calc(2.75rem + env(safe-area-inset-top, 0px)) 1.25rem 2.5rem;
  }

  .presentation-intro__inner {
    gap: 1.65rem;
    width: 100%;
  }

  .presentation-intro__headline {
    font-size: clamp(1.28rem, 5.8vw, 1.75rem);
    line-height: 1.28;
    text-wrap: balance;
  }

  .presentation-intro__actions {
    width: 100%;
    flex-direction: column;
  }

  .presentation-intro__actions :deep(.landing-btn) {
    width: 100%;
    justify-content: center;
    font-size: 0.88rem;
  }

  .presentation-guide {
    padding: 2.25rem 1.25rem;
  }

  .presentation-activos {
    padding: 2.25rem 1.25rem 1.5rem;
  }

  .presentation-activos__lead {
    gap: 0.75rem;
  }

  .presentation-activos__title {
    font-size: clamp(1.35rem, 6vw, 1.85rem);
    text-wrap: balance;
  }

  .presentation-activos__body {
    font-size: 0.92rem;
    line-height: 1.65;
  }

  .presentation-footer {
    padding: 2rem 1.25rem calc(2rem + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 380px) {
  .presentation-video-download__label {
    display: none;
  }

  .presentation-video-download {
    padding: 0.55rem;
  }
}
</style>
