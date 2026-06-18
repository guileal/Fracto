<script setup lang="ts">
import { RouterLink } from 'vue-router'

const activePages = [
  {
    to: '/home',
    title: 'Landing de apresentação',
    description:
      'Home final com vídeo no hero e showcase dos 8 ativos gráficos exportados para WordPress.',
    tag: 'Landing',
    assetId: null,
  },
  {
    to: '/grid-background-black',
    title: 'Grid background black',
    description:
      'Grade interactiva em fundo preto — preview do widget WP background-grid-black.',
    tag: 'Widget WP',
    assetId: 'background-grid-black',
  },
  {
    to: '/logo-fracto',
    title: 'Logo Fracto',
    description: 'Isotipo 3D animado — preview do widget WP logo-01-black.',
    tag: 'Widget WP',
    assetId: 'logo-01-black',
  },
  {
    to: '/logo-fracto-light',
    title: 'Logo Fracto (claro)',
    description:
      'Isotipo com cubos #cfcfcf — preview do widget WP logo-01-light (fundo escuro).',
    tag: 'Widget WP',
    assetId: 'logo-01-light',
  },
  {
    to: '/cubo-magico',
    title: 'Cubo mágico',
    description:
      'Hero com isotipo em recomposição — copy e fundo claro alinhados ao site fracto.com.br.',
    tag: 'Widget WP',
    assetId: 'magic-cube-v8',
  },
  {
    to: '/cubo-magico-2',
    title: 'Cubo mágico v2',
    description:
      'Versão dinâmica da metáfora Fracto — menos ruído, mais estratégia — fundo claro.',
    tag: 'Widget WP',
    assetId: 'magic-cube-v2',
  },
  {
    to: '/cubo-magico-light',
    title: 'Cubo mágico (claro)',
    description:
      'Mesma mensagem de Sobre nós para blocos com fundo escuro — como no site Fracto.',
    tag: 'Widget WP',
    assetId: 'magic-cube-v8-light',
  },
  {
    to: '/cubo-magico-light-2',
    title: 'Cubo mágico v2 (claro)',
    description:
      'Narrativa expandida do cubo para fundos escuros — Inteligência Criativa Fracto.',
    tag: 'Widget WP',
    assetId: 'magic-cube-v2-light',
  },
  {
    to: '/block-divider',
    title: 'Divisor de blocos',
    description:
      'Transição pixelada preto/branco — blocos formam com piscar tech no scroll (40% até entrar no viewport).',
    tag: 'Widget WP',
    assetId: 'block-divider',
  },
]

const backupPages = [
  {
    to: '/backup/landing',
    title: 'Landing fracto.br (v1)',
    description: 'Hero 3D em cubos, seções Sobre, Trabalho, Serviços e CTAs.',
  },
  {
    to: '/backup/v2',
    title: 'Landing v2',
    description: 'Background customizável (YouTube, Vimeo ou imagem) + modelo 3D transparente.',
  },
  {
    to: '/backup/v3',
    title: 'Landing v3',
    description:
      'Parede preta de quadrados em InstancedMesh — grade encaixada, oscilação senoidal e reação ao mouse.',
  },
  {
    to: '/backup/v4',
    title: 'Landing v4',
    description:
      'Grade 3D com luz difusa do mouse — slider de intensidade, cor livre, grade por atalho e bolha de referência.',
  },
  {
    to: '/backup/v6',
    title: 'Landing v6',
    description: 'Fundo da v5 + isotipo animado em GLB em tela cheia sobre o título.',
  },
  {
    to: '/backup/viewer',
    title: 'Viewer GLB',
    description: 'Scroll que scruba a timeline Summary de modelos .glb exportados do Blender.',
  },
  {
    to: '/backup/iridescent',
    title: 'Lab iridescente',
    description: 'Demo de material iridescente com Three.js.',
  },
]
</script>

<template>
  <div class="index">
    <header class="index__header">
      <p class="index__lead">Preview Vue dos assets 3D Fracto + protótipos arquivados.</p>
    </header>

    <section class="index__section">
      <h2 class="index__section-title">Ativos</h2>
      <p class="index__section-lead">Páginas alinhadas com widgets WordPress ou pipeline de export.</p>
      <ul class="index__list">
        <li v-for="page in activePages" :key="page.to">
          <RouterLink :to="page.to" class="index__card">
            <div class="index__card-top">
              <h3>{{ page.title }}</h3>
              <span class="index__tag">{{ page.tag }}</span>
            </div>
            <p>{{ page.description }}</p>
            <span class="index__path">{{ page.to }}</span>
            <span v-if="page.assetId" class="index__asset">WP: {{ page.assetId }}</span>
            <span v-else-if="page.tag === 'Landing'" class="index__asset">/home · /landing</span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section class="index__section">
      <h2 class="index__section-title">Backup</h2>
      <p class="index__section-lead">Protótipos antigos — não exportados para WordPress.</p>
      <ul class="index__list">
        <li v-for="page in backupPages" :key="page.to">
          <RouterLink :to="page.to" class="index__card index__card--backup">
            <div class="index__card-top">
              <h3>{{ page.title }}</h3>
              <span class="index__tag index__tag--muted">Backup</span>
            </div>
            <p>{{ page.description }}</p>
            <span class="index__path">{{ page.to }}</span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.index {
  min-height: 100vh;
  padding: clamp(2rem, 6vw, 4rem) clamp(1.25rem, 4vw, 2.5rem);
  max-width: 720px;
  margin: 0 auto;
}

.index__header {
  margin-bottom: 2.5rem;
}

.index__lead {
  margin: 0;
  color: #888;
  font-size: 0.95rem;
  line-height: 1.5;
}

.index__section {
  margin-bottom: 2.75rem;
}

.index__section-title {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fracto-brand-soft);
}

.index__section-lead {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: #777;
}

.index__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.index__card {
  display: block;
  padding: 1.15rem 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  text-decoration: none;
  color: inherit;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
}

.index__card--backup {
  opacity: 0.88;
}

.index__card:hover {
  border-color: var(--fracto-brand-border);
  background: var(--fracto-brand-dim);
  transform: translateY(-2px);
}

.index__card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
}

.index__card h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.index__tag {
  flex-shrink: 0;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--fracto-brand-soft);
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: var(--fracto-brand-dim);
}

.index__tag--muted {
  color: #888;
  background: rgba(255, 255, 255, 0.06);
}

.index__card p {
  margin: 0 0 0.65rem;
  font-size: 0.88rem;
  line-height: 1.55;
  color: #9a9a9a;
}

.index__path {
  display: block;
  font-size: 0.78rem;
  font-family: ui-monospace, monospace;
  color: #666;
}

.index__asset {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.72rem;
  font-family: ui-monospace, monospace;
  color: #555;
}
</style>
