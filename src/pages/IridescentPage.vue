<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { mountIridescentScene } from '../three/iridescentScene'

const host = ref<HTMLElement | null>(null)
let handle: ReturnType<typeof mountIridescentScene> | null = null

onMounted(() => {
  if (host.value) handle = mountIridescentScene(host.value)
})

onUnmounted(() => {
  handle?.dispose()
})
</script>

<template>
  <div class="iridescent">
    <aside class="iridescent__panel">
      <h1>MeshPhysicalMaterial</h1>
      <p>Cubo com <code>iridescenceIOR</code> oscilando e rotação contínua — Three.js puro (sem React).</p>
      <dl>
        <dt>color</dt>
        <dd>#f63404</dd>
        <dt>iridescenceIOR</dt>
        <dd>1.52 ± 0.35</dd>
        <dt>fog</dt>
        <dd>#de5d17</dd>
      </dl>
    </aside>
    <div ref="host" class="iridescent__canvas" />
  </div>
</template>

<style scoped>
.iridescent {
  display: grid;
  grid-template-columns: minmax(240px, 300px) 1fr;
  min-height: calc(100vh - 52px);
}

.iridescent__panel {
  padding: 2rem 1.25rem;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.iridescent__panel h1 {
  font-size: 1.25rem;
  margin: 0 0 0.75rem;
}

.iridescent__panel p {
  font-size: 0.88rem;
  color: #888;
  line-height: 1.55;
}

.iridescent__panel code {
  color: #f63404;
  font-size: 0.85em;
}

.iridescent__panel dl {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.35rem 1rem;
}

.iridescent__panel dt {
  color: #666;
}

.iridescent__panel dd {
  margin: 0;
  color: #de5d17;
  font-family: ui-monospace, monospace;
}

.iridescent__canvas {
  min-height: calc(100vh - 52px);
}

@media (max-width: 768px) {
  .iridescent {
    grid-template-columns: 1fr;
  }
  .iridescent__canvas {
    min-height: 60vh;
  }
}
</style>
