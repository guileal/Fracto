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
      <RouterLink to="/landing">Landing</RouterLink>
      <RouterLink to="/v2">Landing v2</RouterLink>
      <RouterLink to="/v3">Landing v3</RouterLink>
      <RouterLink to="/v4">Landing v4</RouterLink>
      <RouterLink to="/v5">Landing v5</RouterLink>
      <RouterLink to="/v6">Landing v6</RouterLink>
      <RouterLink to="/v7">Landing v7</RouterLink>
      <RouterLink to="/v8">Landing v8</RouterLink>
      <RouterLink to="/viewer">Viewer</RouterLink>
      <RouterLink to="/iridescent">Iridescent</RouterLink>
    </nav>
  </header>
  <RouterView />
  <FractoLogoCorner v-if="showLogoCorner" />
</template>
