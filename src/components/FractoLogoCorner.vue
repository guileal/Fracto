<script setup lang="ts">
import { RouterLink } from 'vue-router'
import FractoLogo from './FractoLogo.vue'
</script>

<template>
  <RouterLink to="/landing" class="fracto-logo-corner" aria-label="Fracto">
    <FractoLogo :size="32" decorative />
  </RouterLink>
</template>

<style scoped>
.fracto-logo-corner {
  position: fixed;
  top: clamp(1rem, 3vw, 1.5rem);
  left: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 10000;
  line-height: 0;
  text-decoration: none;
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.45));
}
</style>
