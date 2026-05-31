<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, shallowRef, toRaw, watch } from 'vue'
import {
  DEFAULT_GRID_CONFIG,
  MOBILE_GRID_CONFIG,
  type GridConfig,
} from '../lib/gridConfig'
import type { SceneLightingConfig } from '../lib/gridLighting'
import type { PerfStats } from '../lib/perfMonitor'
import type { InstancedGridHandle } from '../three/instancedGridScene'
import { createInstancedGridSceneV5 } from '../three/instancedGridSceneV5'
import type { InstancedGridOptions } from '../three/instancedGridScene'

const emit = defineEmits<{
  stats: [PerfStats]
  ready: [InstancedGridHandle]
}>()

const props = defineProps<{
  cols?: number
  rows?: number
  lighting?: SceneLightingConfig
  lowPower?: boolean
  theme?: 'dark' | 'light'
  cubeColor?: string
}>()

const host = ref<HTMLElement | null>(null)
const handle = shallowRef<InstancedGridHandle | null>(null)

function cloneLighting(config: SceneLightingConfig): SceneLightingConfig {
  return structuredClone(toRaw(config))
}

function defaultGridSize(): GridConfig {
  if (!host.value) return { ...DEFAULT_GRID_CONFIG }
  const narrow = host.value.clientWidth < 768
  return {
    cols: props.cols ?? (narrow ? MOBILE_GRID_CONFIG.cols : DEFAULT_GRID_CONFIG.cols),
    rows: props.rows ?? (narrow ? MOBILE_GRID_CONFIG.rows : DEFAULT_GRID_CONFIG.rows),
  }
}

function mountScene(cols: number, rows: number) {
  if (!host.value) return

  const savedLighting = props.lighting ?? handle.value?.getLighting()
  const savedCubeColor = props.cubeColor ?? handle.value?.getCubeColor?.()
  handle.value?.dispose()

  const pointerTarget = host.value.closest('.hero--grid') as HTMLElement | null

  const options: InstancedGridOptions = {
    cols,
    rows,
    lighting: savedLighting ? cloneLighting(savedLighting) : undefined,
    onStats: (stats) => emit('stats', stats),
    lowPower: props.lowPower,
    pointerTarget: pointerTarget ?? undefined,
    theme: props.theme,
    cubeColor: savedCubeColor,
  }

  handle.value = createInstancedGridSceneV5(host.value, options)
  emit('ready', handle.value)
}

function rebuildGrid(cols: number, rows: number) {
  mountScene(cols, rows)
}

onMounted(async () => {
  await nextTick()
  const { cols, rows } = defaultGridSize()
  mountScene(cols, rows)
})

onUnmounted(() => {
  handle.value?.dispose()
  handle.value = null
})

function setLighting(config: SceneLightingConfig) {
  handle.value?.setLighting(cloneLighting(config))
}

function setCubeColor(color: string) {
  handle.value?.setCubeColor?.(color)
}

watch(
  () => props.cubeColor,
  (color) => {
    if (color && handle.value) setCubeColor(color)
  },
)

watch(
  () => props.theme,
  () => {
    if (!host.value) return
    const { cols, rows } = defaultGridSize()
    mountScene(cols, rows)
  },
)

defineExpose({
  setLighting,
  setCubeColor,
  getLighting: () => handle.value?.getLighting(),
  getCubeColor: () => handle.value?.getCubeColor?.(),
  rebuildGrid,
  getGridSize: (): GridConfig => ({
    cols: handle.value?.getCols() ?? DEFAULT_GRID_CONFIG.cols,
    rows: handle.value?.getRows() ?? DEFAULT_GRID_CONFIG.rows,
  }),
})
</script>

<template>
  <div
    ref="host"
    class="grid-bg"
    :class="{ 'grid-bg--light': theme === 'light' }"
    aria-hidden
  />
</template>

<style scoped>
.grid-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #000;
}

.grid-bg--light {
  background: #fff;
}

.grid-bg :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
