<script setup lang="ts">
import type { PerfStats } from '../lib/perfMonitor'

defineProps<{
  stats: PerfStats | null
}>()
</script>

<template>
  <div v-if="stats" class="perf" aria-live="polite">
    <span class="perf__title">Perf</span>
    <span>{{ stats.fps }} fps</span>
    <span>{{ stats.frameMs }} ms</span>
    <span>{{ stats.instances }} inst</span>
    <span>{{ stats.triangles.toLocaleString() }} tri</span>
    <span>{{ stats.drawCalls }} draw</span>
  </div>
</template>

<style scoped>
.perf {
  position: fixed;
  bottom: 1.35rem;
  right: 1.25rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0.65rem;
  font-family: ui-monospace, monospace;
  font-size: 0.68rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(0, 0, 0, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(8px);
  pointer-events: none;
  user-select: none;
}

.perf__title {
  font-weight: 700;
  color: var(--fracto-brand-soft);
  margin-bottom: 0.1rem;
}
</style>
