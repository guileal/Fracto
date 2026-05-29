<template>
  <div class="hero-grid" aria-hidden>
    <div v-for="n in 64" :key="n" class="hero-grid__cell" />
  </div>
</template>

<style scoped>
.hero-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  pointer-events: none;
  opacity: 0.35;
}

.hero-grid__cell {
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.01);
}

/* Destaque laranja — eco do isotipo */
.hero-grid__cell:nth-child(10) {
  background: var(--fracto-brand-dim);
  border-color: var(--fracto-brand-border);
}

.hero-grid__cell:nth-child(18),
.hero-grid__cell:nth-child(26) {
  background: rgba(255, 255, 255, 0.03);
}
</style>
