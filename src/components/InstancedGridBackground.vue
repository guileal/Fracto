<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { DEFAULT_GRID_CONFIG, type GridConfig } from '../lib/gridConfig'
import type { SceneLightingConfig } from '../lib/gridLighting'
import type { PerfStats } from '../lib/perfMonitor'
import {
  createInstancedGridScene,
  type InstancedGridHandle,
  type InstancedGridOptions,
} from '../three/instancedGridScene'

const emit = defineEmits<{
  stats: [PerfStats]
  ready: [InstancedGridHandle]
}>()

const props = defineProps<{
  cols?: number
  rows?: number
  lighting?: SceneLightingConfig
}>()

const host = ref<HTMLElement | null>(null)
const handle = shallowRef<InstancedGridHandle | null>(null)

function defaultGridSize(): GridConfig {
  if (!host.value) return { ...DEFAULT_GRID_CONFIG }
  const narrow = host.value.clientWidth < 768
  return {
    cols: props.cols ?? (narrow ? 11 : DEFAULT_GRID_CONFIG.cols),
    rows: props.rows ?? (narrow ? 8 : DEFAULT_GRID_CONFIG.rows),
  }
}

function mountScene(cols: number, rows: number) {
  if (!host.value) return
  const savedLighting = handle.value?.getLighting() ?? props.lighting
  handle.value?.dispose()
  const options: InstancedGridOptions = {
    cols,
    rows,
    lighting: savedLighting,
    onStats: (stats) => emit('stats', stats),
  }
  handle.value = createInstancedGridScene(host.value, options)
  emit('ready', handle.value)
}

function rebuildGrid(cols: number, rows: number) {
  mountScene(cols, rows)
}

onMounted(() => {
  const { cols, rows } = defaultGridSize()
  mountScene(cols, rows)
})

onUnmounted(() => {
  handle.value?.dispose()
  handle.value = null
})

function setLighting(config: SceneLightingConfig) {
  handle.value?.setLighting(config)
}

defineExpose({
  setLighting,
  getLighting: () => handle.value?.getLighting(),
  rebuildGrid,
  getGridSize: (): GridConfig => ({
    cols: handle.value?.getCols() ?? DEFAULT_GRID_CONFIG.cols,
    rows: handle.value?.getRows() ?? DEFAULT_GRID_CONFIG.rows,
  }),
})
</script>

<template>
  <div ref="host" class="grid-bg" aria-hidden />
</template>

<style scoped>
.grid-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000;
}

.grid-bg :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
