<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import HeroCubesScene from '../components/HeroCubesScene.vue'
import LandingButton from '../components/landing/LandingButton.vue'
import SectionBadge from '../components/landing/SectionBadge.vue'
import '../styles/landing.css'

const services = [
  {
    title: 'Branding',
    text: 'Identidade, posicionamento e narrativa de marca com clareza estratégica.',
  },
  {
    title: 'Consultoria',
    text: 'Diagnóstico, arquitetura de discurso e direção para decisões de comunicação.',
  },
  {
    title: 'Comunicação digital',
    text: 'Campanhas, conteúdo e presença digital alinhados ao sistema de marca.',
  },
]

const workItems = [
  { name: 'Projeto Alpha', tag: 'Branding' },
  { name: 'Projeto Beta', tag: 'Consultoria' },
  { name: 'Projeto Gamma', tag: 'Digital' },
]

onMounted(() => {
  document.body.dataset.landing = ''
})

onUnmounted(() => {
  delete document.body.dataset.landing
})
</script>

<template>
  <div class="landing-page">
    <section class="hero">
      <HeroCubesScene />
      <div class="hero__vignette" aria-hidden />

      <div class="hero__content">
        <h1 class="hero__headline">
          Somos um <strong>Núcleo de Inteligência Criativa</strong> que atua como parceira
          estratégica em branding, consultoria e comunicação digital
        </h1>

        <div class="hero__actions">
          <LandingButton href="#contato">Comece um projeto</LandingButton>
          <LandingButton href="#trabalho" variant="outline">Conheça nosso portfólio</LandingButton>
        </div>
      </div>
    </section>

    <section id="sobre" class="section section--white section--about">
      <div class="section__inner section__inner--end">
        <SectionBadge label="Sobre nós" />
        <h2 class="section__title">
          Desconstruímos marcas e discursos para entender o que realmente importa
        </h2>
        <p class="section__body">
          Consultoria de marketing digital que quebra a complexidade do seu negócio para
          construir um sistema de marca simples e estratégico, posicionando sua marca com
          clareza e intenção.
        </p>
      </div>
    </section>

    <section id="trabalho" class="section section--white">
      <div class="section__inner">
        <SectionBadge label="Nosso trabalho" />
        <h2 class="section__title section__title--compact">
          Marcas que ganham forma quando a estratégia encontra a execução
        </h2>

        <ul class="work-grid">
          <li v-for="item in workItems" :key="item.name" class="work-card">
            <div class="work-card__visual" aria-hidden />
            <div class="work-card__meta">
              <span class="work-card__tag">{{ item.tag }}</span>
              <h3>{{ item.name }}</h3>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section id="servicos" class="section section--surface">
      <div class="section__inner">
        <SectionBadge label="Nossos serviços" />
        <h2 class="section__title section__title--compact">
          Um núcleo integrado para construir e sustentar sua marca
        </h2>

        <ul class="services-grid">
          <li v-for="service in services" :key="service.title" class="service-card">
            <h3>{{ service.title }}</h3>
            <p>{{ service.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section id="contato" class="section section--white section--cta">
      <div class="section__inner section__inner--center">
        <h2 class="section__title section__title--compact">
          Vamos fragmentar o complexo e montar o essencial?
        </h2>
        <LandingButton href="mailto:contato@fracto.br">Comece um projeto</LandingButton>
      </div>
    </section>

    <footer class="landing-footer">
      <p>© {{ new Date().getFullYear() }} Fracto. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  background: #fff;
}

/* —— Hero —— */
.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #000;
  color: #fff;
  overflow: hidden;
}

.hero__vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(0, 0, 0, 0.35) 70%),
    linear-gradient(to top, rgba(0, 0, 0, 0.92) 0%, transparent 42%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, transparent 18%);
}

.hero__content {
  position: relative;
  z-index: 3;
  margin-top: auto;
  padding: 2rem clamp(1.5rem, 5vw, 4rem) clamp(2.5rem, 6vw, 4.5rem);
  max-width: 52rem;
  pointer-events: none;
}

.hero__headline {
  margin: 0 0 2rem;
  font-size: clamp(1.65rem, 3.8vw, 2.75rem);
  font-weight: 500;
  line-height: 1.22;
  letter-spacing: -0.03em;
}

.hero__headline strong {
  font-weight: 600;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  pointer-events: auto;
}

/* —— Sections —— */
.section {
  padding: clamp(4rem, 10vw, 7rem) clamp(1.5rem, 5vw, 4rem);
}

.section--white {
  background: #fff;
}

.section--surface {
  background: var(--fracto-surface);
}

.section__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.section__inner--end {
  margin-left: auto;
  max-width: 36rem;
  text-align: left;
}

.section__inner--center {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.section--about {
  min-height: min(85vh, 900px);
  display: flex;
  align-items: center;
}

.section__title {
  margin: 1.25rem 0 1rem;
  font-size: clamp(1.85rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.section__title--compact {
  max-width: 22ch;
}

.section__body {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--fracto-muted);
  max-width: 36rem;
}

/* —— Work —— */
.work-grid {
  list-style: none;
  margin: 2.5rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.work-card {
  border-radius: 16px;
  overflow: hidden;
  background: #f0f0f0;
}

.work-card__visual {
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%);
}

.work-card__meta {
  padding: 1rem 1.15rem 1.25rem;
}

.work-card__tag {
  font-size: 0.72rem;
  color: var(--fracto-coral);
  font-weight: 600;
}

.work-card h3 {
  margin: 0.35rem 0 0;
  font-size: 1.05rem;
  font-weight: 600;
}

/* —— Services —— */
.services-grid {
  list-style: none;
  margin: 2.5rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.service-card {
  padding: 1.75rem;
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.service-card h3 {
  margin: 0 0 0.65rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.service-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--fracto-muted);
}

.section--cta .section__title--compact {
  max-width: 28ch;
  text-align: center;
}

/* —— Footer —— */
.landing-footer {
  padding: 2.5rem clamp(1.5rem, 5vw, 4rem);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  text-align: center;
}

.landing-footer p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--fracto-muted);
}

@media (max-width: 720px) {
  .section__inner--end {
    margin-left: 0;
    max-width: none;
  }

  .section--about {
    min-height: auto;
  }

  .hero__actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
