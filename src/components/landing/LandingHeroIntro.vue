<script setup lang="ts">
import { RouterLink } from 'vue-router'
import FractoLogo from '../FractoLogo.vue'

withDefaults(
  defineProps<{
    logoSize?: number | string
  }>(),
  {
    logoSize: 40,
  },
)
</script>

<template>
  <div class="hero-intro">
    <RouterLink to="/landing" class="hero-intro__logo" aria-label="Fracto">
      <FractoLogo :size="logoSize" decorative />
    </RouterLink>

    <div class="hero-intro__copy">
      <slot />
    </div>
  </div>
</template>
