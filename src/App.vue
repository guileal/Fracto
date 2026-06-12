<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import FractoLogoCorner from './components/FractoLogoCorner.vue'

const route = useRoute()
const showAppHeader = computed(() => !route.meta.bare)
const showLogoCorner = computed(() => !route.meta.bare)
</script>

<template>
  <header v-if="showAppHeader" class="app-header">
    <nav>
      <RouterLink to="/">Índice</RouterLink>
    </nav>
  </header>
  <RouterView />
  <FractoLogoCorner v-if="showLogoCorner" />
</template>
