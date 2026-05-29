<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createHeroCubesScene } from '../three/heroCubesScene'

const host = ref<HTMLElement | null>(null)
let dispose: (() => void) | null = null

onMounted(() => {
  if (!host.value) return
  dispose = createHeroCubesScene(host.value)
})

onUnmounted(() => {
  dispose?.()
  dispose = null
})
</script>

<template>
  <div ref="host" class="hero-cubes" aria-hidden />
</template>

<style scoped>
.hero-cubes {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-cubes :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
