<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const showAppHeader = computed(() => !route.meta.bare)
</script>

<template>
  <header v-if="showAppHeader" class="app-header">
    <RouterLink to="/" class="brand">Fracto</RouterLink>
    <nav>
      <RouterLink to="/">Índice</RouterLink>
      <RouterLink to="/landing">Landing</RouterLink>
      <RouterLink to="/v2">Landing v2</RouterLink>
      <RouterLink to="/v3">Landing v3</RouterLink>
      <RouterLink to="/v4">Landing v4</RouterLink>
      <RouterLink to="/viewer">Viewer</RouterLink>
      <RouterLink to="/iridescent">Iridescent</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>
