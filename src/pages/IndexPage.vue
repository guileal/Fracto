<script setup lang="ts">
import { RouterLink } from 'vue-router'

const pages = [
  {
    to: '/landing',
    title: 'Landing fracto.br',
    description: 'Hero 3D em cubos, seções Sobre, Trabalho, Serviços e CTAs.',
    tag: 'Produção',
  },
  {
    to: '/v2',
    title: 'Landing v2',
    description: 'Background customizável (YouTube, Vimeo ou imagem) + modelo 3D transparente.',
    tag: 'Experimento',
  },
  {
    to: '/v3',
    title: 'Landing v3',
    description:
      'Parede preta de quadrados em InstancedMesh — grade encaixada, oscilação senoidal e reação ao mouse.',
    tag: 'Experimento',
  },
  {
    to: '/v4',
    title: 'Landing v4',
    description:
      'Grade 3D com luz difusa do mouse — slider de intensidade, cor livre, grade por atalho e bolha de referência.',
    tag: 'Experimento',
  },
  {
    to: '/v5',
    title: 'Landing v5',
    description:
      'Logotipo Fracto integrado na grade — acende perto do mouse, piscadas estilizadas e quadrados aleatórios em branco e laranja.',
    tag: 'Experimento',
  },
  {
    to: '/v6',
    title: 'Landing v6',
    description:
      'Fundo da v5 + isotipo animado em GLB em tela cheia sobre o título.',
    tag: 'Experimento',
  },
  {
    to: '/viewer',
    title: 'Viewer GLB',
    description: 'Scroll que scruba a timeline Summary de modelos .glb exportados do Blender.',
    tag: 'Ferramenta',
  },
  {
    to: '/iridescent',
    title: 'Lab iridescente',
    description: 'Demo de material iridescente com Three.js.',
    tag: 'Lab',
  },
]
</script>

<template>
  <div class="index">
    <header class="index__header">
      <p class="index__lead">Índice das páginas do projeto Vue + Three.js</p>
    </header>

    <ul class="index__list">
      <li v-for="page in pages" :key="page.to">
        <RouterLink :to="page.to" class="index__card">
          <div class="index__card-top">
            <h2>{{ page.title }}</h2>
            <span class="index__tag">{{ page.tag }}</span>
          </div>
          <p>{{ page.description }}</p>
          <span class="index__path">{{ page.to }}</span>
        </RouterLink>
      </li>
    </ul>
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

.index__card h2 {
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

.index__card p {
  margin: 0 0 0.65rem;
  font-size: 0.88rem;
  line-height: 1.55;
  color: #9a9a9a;
}

.index__path {
  font-size: 0.78rem;
  font-family: ui-monospace, monospace;
  color: #666;
}
</style>
