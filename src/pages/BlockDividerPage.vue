<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BlockDivider from '../components/BlockDivider.vue'
import { BLOCK_DIVIDER_VARIANTS } from '../lib/blockDivider/patterns'

const variant = ref('default')
const completeAt = ref(0.4)

const variants = BLOCK_DIVIDER_VARIANTS
</script>

<template>
  <div class="divider-demo">
    <header class="divider-demo__nav">
      <RouterLink to="/" class="divider-demo__back">← Índice</RouterLink>
      <div class="divider-demo__controls">
        <label>
          Variante
          <select v-model="variant">
            <option v-for="v in variants" :key="v.id" :value="v.id">
              {{ v.label }}
            </option>
          </select>
        </label>
        <label>
          Formação aos
          <input v-model.number="completeAt" type="range" min="0.15" max="0.9" step="0.05" />
          {{ Math.round(completeAt * 100) }}%
        </label>
      </div>
    </header>

    <section class="divider-demo__hero">
      <p class="divider-demo__eyebrow">Hero preto</p>
      <h1>Desconstruímos marcas e discursos</h1>
      <p class="divider-demo__lead">
        Faz scroll — os blocos formam a transição com piscar rápido até a secção entrar no
        viewport.
      </p>
    </section>

    <BlockDivider :variant="variant" :complete-at="completeAt" />

    <section class="divider-demo__body">
      <p class="divider-demo__eyebrow">Secção branca</p>
      <h2>Conteúdo abaixo do divisor</h2>
      <p>
        Shortcode WP: <code>[fracto_block_divider variant="{{ variant }}"]</code>
      </p>
      <div class="divider-demo__spacer" aria-hidden="true" />
    </section>
  </div>
</template>

<style scoped>
.divider-demo {
  min-height: 200vh;
  font-family: system-ui, sans-serif;
}

.divider-demo__nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: rgb(0 0 0 / 72%);
  backdrop-filter: blur(8px);
}

.divider-demo__back {
  color: #fff;
  text-decoration: none;
  font-size: 0.875rem;
}

.divider-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: #fff;
  font-size: 0.8rem;
}

.divider-demo__controls label {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.divider-demo__controls select {
  color: #111;
}

.divider-demo__hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 5rem 1.5rem 3rem;
  color: #fff;
  background: #000;
  text-align: center;
}

.divider-demo__hero h1 {
  margin: 0.5rem 0;
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 600;
  line-height: 1.15;
}

.divider-demo__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.55;
}

.divider-demo__lead {
  max-width: 36rem;
  margin: 1rem auto 0;
  font-size: 1rem;
  line-height: 1.55;
  opacity: 0.78;
}

.divider-demo__body {
  padding: 3rem 1.5rem 6rem;
  color: #111;
  background: #fff;
  text-align: center;
}

.divider-demo__body h2 {
  margin: 0.5rem 0 1rem;
  font-size: clamp(1.25rem, 3vw, 2rem);
}

.divider-demo__body code {
  font-size: 0.85rem;
}

.divider-demo__spacer {
  height: 80vh;
}
</style>

<style src="../styles/blockDivider.css"></style>
